from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import os
import uuid

from models.database import SessionLocal, Match, Question
from models.schemas import MatchResponse, WaitingResponse, MatchedPerson
from utils.redis_client import check_rate_limit
from utils.security import get_current_user
from utils.qdrant_client import search_similar_profiles, get_collection_count, get_profile_embedding, get_profile_text
from utils.groq_client import generate_questions, score_questions

router = APIRouter(prefix="/matches", tags=["matches"])

MIN_POOL_SIZE = int(os.getenv("MIN_POOL_SIZE", 2))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", 2))
TOP_N = 5
NUM_QUESTIONS = 5


class MatchRequest(BaseModel):
    user_id: str
    event_id: str


def parse_profile_text(text: str) -> dict:
    result = {"name": "", "role": "", "company": None, "what_you_do": "", "looking_for": ""}
    try:
        if " is a " in text:
            parts = text.split(" is a ", 1)
            result["name"] = parts[0].strip()
            rest = parts[1]
            if " at " in rest.split(".")[0]:
                role_company = rest.split(".")[0]
                role_parts = role_company.split(" at ", 1)
                result["role"] = role_parts[0].strip()
                result["company"] = role_parts[1].strip()
            else:
                result["role"] = rest.split(".")[0].strip()
        if "They work on " in text:
            work = text.split("They work on ", 1)[1]
            result["what_you_do"] = work.split(".")[0].strip()
        if "They are looking for " in text:
            looking = text.split("They are looking for ", 1)[1]
            result["looking_for"] = looking.split(".")[0].strip()
    except Exception:
        result["name"] = text[:40]
    return result


@router.post("/")
async def find_match(
    payload: MatchRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    ip = request.client.host
    if not check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many requests.")

    if current_user["sub"] != payload.user_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    # Check pool size
    count = get_collection_count(event_id=payload.event_id)
    if count < MIN_POOL_SIZE:
        return WaitingResponse(
            waiting=True,
            pool_size=count,
            needed=MIN_POOL_SIZE - count,
            message=f"Matching opens when {MIN_POOL_SIZE} people have signed up. {MIN_POOL_SIZE - count} more needed."
        )

    # Fetch user's stored embedding
    embedding = get_profile_embedding(payload.user_id, payload.event_id)
    if not embedding:
        raise HTTPException(status_code=404, detail="Profile not found. Please register first.")

    # Get user's own profile text for question generation
    profile_a_text = get_profile_text(payload.user_id, payload.event_id)

    # Find top N candidates
    candidates = search_similar_profiles(
        embedding=embedding,
        event_id=payload.event_id,
        exclude_user_id=payload.user_id,
        top_k=TOP_N,
    )

    if not candidates:
        raise HTTPException(status_code=404, detail="No other profiles found in this event yet.")

    # Diversity rerank — penalize scores above 0.97 (too similar)
    # This is used only for ordering, not for display percentage
    reranked = []
    for c in candidates:
        score = c["score"]
        penalty = max(0, (score - 0.97) * 10)
        adjusted = score - penalty
        reranked.append({**c, "adjusted_score": adjusted})
    reranked.sort(key=lambda x: x["adjusted_score"], reverse=True)

    # Normalize raw scores within pool range for display
    # Best match shows 95-98%, worst in top 5 shows 60-65%
    raw_scores = [c["score"] for c in reranked[:TOP_N]]
    min_score = min(raw_scores)
    max_score = max(raw_scores)
    score_range = max_score - min_score if max_score != min_score else 0.1

    # Generate questions for every candidate in the top N, not just the best match
    top_matches = []
    candidate_questions = []
    for c in reranked[:TOP_N]:
        parsed = parse_profile_text(c["metadata"].get("profile_text", ""))

        raw = c["score"]
        if score_range > 0:
            normalized = (raw - min_score) / score_range
        else:
            normalized = 1.0
        pct = int(60 + normalized * 38)
        pct = max(60, min(98, pct))

        profile_b_text = c["metadata"].get("profile_text", "")
        questions = []
        for attempt in range(MAX_RETRIES + 1):
            questions = generate_questions(profile_a_text, profile_b_text, num_questions=NUM_QUESTIONS)
            score = score_questions(profile_a_text, profile_b_text, questions)
            if score >= 0.7 or attempt == MAX_RETRIES:
                break
        candidate_questions.append(questions)

        top_matches.append(MatchedPerson(
            name=parsed["name"],
            role=parsed["role"],
            company=parsed["company"],
            what_you_do=parsed["what_you_do"],
            looking_for=parsed["looking_for"],
            match_score=round(c["score"], 3),
            match_percentage=pct,
            questions=questions,
        ))

    best = reranked[0]
    best_questions = candidate_questions[0]

    # Save match and questions to database
    db = SessionLocal()
    try:
        match_id = str(uuid.uuid4())

        match = Match(
            id=match_id,
            user_a_id=payload.user_id,
            user_b_id=best["metadata"].get("user_id", ""),
            event_id=payload.event_id,
        )
        db.add(match)

        for q_text in best_questions:
            existing = db.query(Question).filter_by(
                event_id=payload.event_id,
                question_text=q_text
            ).first()
            if not existing:
                db.add(Question(
                    id=str(uuid.uuid4()),
                    match_id=match_id,
                    event_id=payload.event_id,
                    question_text=q_text,
                ))

        db.commit()
    finally:
        db.close()

    return MatchResponse(
        match_id=match_id,
        top_matches=top_matches,
        questions=best_questions,
    )