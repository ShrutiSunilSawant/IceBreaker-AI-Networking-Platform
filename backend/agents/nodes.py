import hashlib
import re
import uuid
from typing import Any

from agents.state import IcebreakerState
from utils.embedder import embed_text
from utils.qdrant_client import store_profile, search_similar_profiles, get_collection_count
from utils.moderation import moderate_profile
from utils.groq_client import generate_questions, score_questions
from models.database import SessionLocal, Profile, Match, Question


# ─── Validation ───────────────────────────────────────────────────────────────

MIN_CHARS = 30
MAX_CHARS = 500
REQUIRED_FIELDS = ["name", "role", "what_you_do", "looking_for"]


def validation_node(state: IcebreakerState) -> IcebreakerState:
    raw = state["raw_input"]

    for field in REQUIRED_FIELDS:
        if field not in raw or not raw[field].strip():
            return {**state, "validation_passed": False, "validation_error": f"Missing field: {field}"}

    for field in ["what_you_do", "looking_for"]:
        if len(raw[field].strip()) < MIN_CHARS:
            return {
                **state,
                "validation_passed": False,
                "validation_error": f"Field '{field}' is too short. Please add at least {MIN_CHARS} characters."
            }
        if len(raw[field].strip()) > MAX_CHARS:
            return {
                **state,
                "validation_passed": False,
                "validation_error": f"Field '{field}' exceeds {MAX_CHARS} characters."
            }

    sanitized = {
        field: raw[field].strip()[:MAX_CHARS]
        for field in REQUIRED_FIELDS + ["company", "interests"]
        if field in raw
    }

    user_id = hashlib.sha256(
        (raw.get("email", "") + state["event_id"]).encode()
    ).hexdigest()
    email_hash = hashlib.sha256(raw.get("email", "").encode()).hexdigest()

    return {
        **state,
        "validation_passed": True,
        "validation_error": None,
        "sanitized_profile": sanitized,
        "user_id": user_id,
        "email_hash": email_hash,
    }


# ─── Duplicate Check ──────────────────────────────────────────────────────────

def duplicate_check_node(state: IcebreakerState) -> IcebreakerState:
    db = SessionLocal()
    try:
        existing = db.query(Profile).filter_by(
            user_id=state["user_id"],
            event_id=state["event_id"]
        ).first()
        return {**state, "is_duplicate": existing is not None}
    finally:
        db.close()


# ─── Moderation ───────────────────────────────────────────────────────────────

def moderation_node(state: IcebreakerState) -> IcebreakerState:
    profile_text = " ".join(state["sanitized_profile"].values())
    passed, reason = moderate_profile(profile_text)
    return {**state, "moderation_passed": passed, "moderation_reason": reason}


# ─── Embed and Store ──────────────────────────────────────────────────────────

def embed_and_store_node(state: IcebreakerState) -> IcebreakerState:
    profile = state["sanitized_profile"]

    company = profile.get('company')
    interests = profile.get('interests')
    company_part = f"at {company}" if company else ""
    interests_part = f"Outside work they enjoy {interests}." if interests else ""
    
    profile_text = (
        f"{profile.get('name')} is a {profile.get('role')} {company_part}. "
        f"They work on {profile.get('what_you_do')}. "
        f"They are looking for {profile.get('looking_for')}. "
        f"{interests_part}"
        ).strip()

    embedding = embed_text(profile_text)
    qdrant_id = str(uuid.uuid4())

    store_profile(
        qdrant_id=qdrant_id,
        embedding=embedding,
        metadata={
            "user_id": state["user_id"],
            "event_id": state["event_id"],
            "profile_text": profile_text,
            "active": True,
        }
    )

    db = SessionLocal()
    try:
        db_profile = Profile(
            id=qdrant_id,
            user_id=state["user_id"],
            event_id=state["event_id"],
            qdrant_id=qdrant_id,
            email_hash=state["email_hash"],
        )
        db.add(db_profile)
        db.commit()
    finally:
        db.close()

    return {**state, "embedding": embedding, "qdrant_id": qdrant_id, "stored": True}


# ─── Pool Check ───────────────────────────────────────────────────────────────

import os
MIN_POOL_SIZE = int(os.getenv("MIN_POOL_SIZE", 10))


def pool_check_node(state: IcebreakerState) -> IcebreakerState:
    count = get_collection_count(event_id=state["event_id"])
    return {
        **state,
        "pool_size": count,
        "pool_ready": count >= MIN_POOL_SIZE,
    }


# ─── Matching ─────────────────────────────────────────────────────────────────

def matching_node(state: IcebreakerState) -> IcebreakerState:
    candidates = search_similar_profiles(
        embedding=state["embedding"],
        event_id=state["event_id"],
        exclude_user_id=state["user_id"],
        top_k=10,
    )

    if not candidates:
        return {**state, "matched_profile": None, "match_score": None}

    # Diversity rerank: penalize candidates too similar (score > 0.97)
    # We want interesting overlap, not identical profiles
    reranked = []
    for c in candidates:
        score = c["score"]
        penalty = max(0, (score - 0.97) * 10)
        adjusted = score - penalty
        reranked.append({**c, "adjusted_score": adjusted})

    reranked.sort(key=lambda x: x["adjusted_score"], reverse=True)
    best = reranked[0]

    return {
        **state,
        "candidate_profiles": candidates,
        "matched_profile": best["metadata"],
        "match_score": best["adjusted_score"],
    }


# ─── Question Generation ──────────────────────────────────────────────────────

def question_gen_node(state: IcebreakerState) -> IcebreakerState:
    profile_a = " ".join(state["sanitized_profile"].values())
    profile_b = state["matched_profile"].get("profile_text", "")

    questions = generate_questions(profile_a, profile_b)
    retry_count = state.get("retry_count", 0)

    return {**state, "icebreaker_questions": questions, "retry_count": retry_count + 1}


# ─── Quality Check ────────────────────────────────────────────────────────────

MAX_RETRIES = int(os.getenv("MAX_RETRIES", 2))


def quality_check_node(state: IcebreakerState) -> IcebreakerState:
    profile_a = " ".join(state["sanitized_profile"].values())
    profile_b = state["matched_profile"].get("profile_text", "")
    questions = state["icebreaker_questions"]

    score = score_questions(profile_a, profile_b, questions)
    passed = score >= 0.7 or state["retry_count"] >= MAX_RETRIES

    return {**state, "quality_score": score, "quality_passed": passed}


# ─── Repetition Check ─────────────────────────────────────────────────────────

def repetition_check_node(state: IcebreakerState) -> IcebreakerState:
    db = SessionLocal()
    try:
        questions = state["icebreaker_questions"]

        for q in questions:
            existing = db.query(Question).filter(
                Question.event_id == state["event_id"],
                Question.question_text == q
            ).first()
            if existing:
                return {**state, "questions_are_unique": False}

        return {**state, "questions_are_unique": True}
    finally:
        db.close()


# ─── Output ───────────────────────────────────────────────────────────────────

def output_node(state: IcebreakerState) -> IcebreakerState:
    db = SessionLocal()
    try:
        match_id = str(uuid.uuid4())
        match = Match(
            id=match_id,
            user_a_id=state["user_id"],
            user_b_id=state["matched_profile"].get("user_id"),
            event_id=state["event_id"],
        )
        db.add(match)

        for q_text in state["icebreaker_questions"]:
            question = Question(
                id=str(uuid.uuid4()),
                match_id=match_id,
                event_id=state["event_id"],
                question_text=q_text,
            )
            db.add(question)

        db.commit()

        return {
            **state,
            "match_id": match_id,
            "final_output": {
                "match_id": match_id,
                "matched_with": state["matched_profile"].get("profile_text"),
                "questions": state["icebreaker_questions"],
                "match_score": state["match_score"],
            }
        }
    finally:
        db.close()


# ─── Feedback ─────────────────────────────────────────────────────────────────

def feedback_node(state: IcebreakerState) -> IcebreakerState:
    # Feedback is written via a separate API endpoint, not in graph
    # This node just passes through
    return state


# ─── Error Nodes ──────────────────────────────────────────────────────────────

def error_node(state: IcebreakerState) -> IcebreakerState:
    return {
        **state,
        "final_output": {
            "error": state.get("validation_error") or state.get("moderation_reason") or "An error occurred."
        }
    }


def waiting_node(state: IcebreakerState) -> IcebreakerState:
    return {
        **state,
        "final_output": {
            "waiting": True,
            "pool_size": state["pool_size"],
            "needed": MIN_POOL_SIZE - state["pool_size"],
            "message": f"Matching opens when {MIN_POOL_SIZE} people have signed up. {MIN_POOL_SIZE - state['pool_size']} more needed."
        }
    }
