import hashlib
from datetime import timedelta

from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session

from agents.graph import icebreaker_graph
from models.schemas import ProfileInput, ProfileResponse
from models.database import get_db, Profile, Event
from utils.redis_client import check_rate_limit, set_user_active
from utils.security import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _windows_overlap(start_a, end_a, start_b, end_b) -> bool:
    return start_a < end_b and start_b < end_a


def _check_time_conflict(db: Session, email: str, event: "Event"):
    email_hash = hashlib.sha256(email.encode()).hexdigest()
    new_start = event.date
    new_end = event.date + timedelta(hours=event.duration_hours or 3.0)

    other_registrations = (
        db.query(Profile, Event)
        .join(Event, Profile.event_id == Event.id)
        .filter(
            Profile.email_hash == email_hash,
            Profile.event_id != event.id,
            Profile.active == True,
            Event.active == True,
        )
        .all()
    )

    for _, other_event in other_registrations:
        other_start = other_event.date
        other_end = other_event.date + timedelta(hours=other_event.duration_hours or 3.0)
        if _windows_overlap(new_start, new_end, other_start, other_end):
            raise HTTPException(
                status_code=409,
                detail=(
                    f"You're already registered for '{other_event.name}' "
                    f"at {other_event.date.strftime('%Y-%m-%d %H:%M')}, which overlaps "
                    f"with '{event.name}' at {event.date.strftime('%Y-%m-%d %H:%M')}. "
                    "Please choose a non-overlapping event."
                ),
            )


@router.post("/", response_model=ProfileResponse)
async def submit_profile(
    payload: ProfileInput,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = request.client.host
    if not check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment.")

    event = db.query(Event).filter_by(id=payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    _check_time_conflict(db, payload.email, event)

    initial_state = {
        "raw_input": payload.model_dump(),
        "event_id": payload.event_id,
        "user_id": "",
        "sanitized_profile": {},
        "validation_passed": False,
        "validation_error": None,
        "is_duplicate": False,
        "moderation_passed": False,
        "moderation_reason": None,
        "embedding": None,
        "qdrant_id": None,
        "stored": False,
        "candidate_profiles": [],
        "matched_profile": None,
        "match_score": None,
        "pool_size": 0,
        "pool_ready": False,
        "icebreaker_questions": [],
        "retry_count": 0,
        "quality_score": None,
        "quality_passed": False,
        "questions_are_unique": False,
        "final_output": None,
        "feedback_rating": None,
        "match_id": None,
    }

    result = icebreaker_graph.invoke(initial_state, config={"run_until": "embed_and_store"})

    if result.get("final_output", {}).get("error"):
        raise HTTPException(status_code=400, detail=result["final_output"]["error"])

    set_user_active(result["user_id"], payload.event_id, active=True)

    return ProfileResponse(
        user_id=result["user_id"],
        stored=result["stored"],
        message="Profile registered successfully.",
    )


@router.patch("/{user_id}/deactivate")
async def deactivate_profile(
    user_id: str,
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["sub"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    set_user_active(user_id, event_id, active=False)

    from utils.qdrant_client import deactivate_profile as qdrant_deactivate
    qdrant_deactivate(user_id, event_id)

    return {"message": "Profile marked as inactive."}


@router.delete("/{user_id}")
async def delete_profile(
    user_id: str,
    event_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter_by(user_id=user_id, event_id=event_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    db.delete(profile)
    db.commit()

    from utils.qdrant_client import deactivate_profile as qdrant_deactivate
    qdrant_deactivate(user_id, event_id)

    set_user_active(user_id, event_id, active=False)

    return {"message": "Unregistered successfully."}