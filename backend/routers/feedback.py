import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from models.schemas import FeedbackInput
from models.database import get_db, Feedback, Match
from utils.security import get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/")
async def submit_feedback(
    payload: FeedbackInput,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["sub"] != payload.user_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    existing = db.query(Feedback).filter_by(
        match_id=payload.match_id,
        user_id=payload.user_id,
    ).first()

    if existing:
        existing.rating = payload.rating
        db.commit()
        return {"message": "Feedback updated."}

    feedback = Feedback(
        id=str(uuid.uuid4()),
        match_id=payload.match_id,
        user_id=payload.user_id,
        rating=payload.rating,
    )
    db.add(feedback)
    db.commit()
    return {"message": "Feedback recorded."}


@router.get("/stats/{event_id}")
async def feedback_stats(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match_ids = [m.id for m in db.query(Match).filter_by(event_id=event_id).all()]

    if not match_ids:
        return {"total": 0, "positive": 0, "negative": 0, "rate": None}

    feedbacks = db.query(Feedback).filter(Feedback.match_id.in_(match_ids)).all()
    total = len(feedbacks)
    positive = sum(1 for f in feedbacks if f.rating == 1)
    negative = total - positive

    return {
        "total": total,
        "positive": positive,
        "negative": negative,
        "rate": round(positive / total, 2) if total > 0 else None,
    }