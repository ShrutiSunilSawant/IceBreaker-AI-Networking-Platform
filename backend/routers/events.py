import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import hashlib
from sqlalchemy.orm import Session

from models.database import get_db, Event, Profile
from utils.groq_client import generate_event_prep

router = APIRouter(prefix="/events", tags=["events"])


class EventCreate(BaseModel):
    name: str
    date: str
    organizer_email: EmailStr
    location: Optional[str] = None
    description: Optional[str] = None
    duration_hours: Optional[float] = 3.0
    min_pool_size: Optional[int] = 10


class EventResponse(BaseModel):
    id: str
    name: str
    date: str
    location: Optional[str]
    description: Optional[str]
    duration_hours: float
    min_pool_size: int
    active: bool
    organizer_email: Optional[str]


def to_response(event) -> EventResponse:
    return EventResponse(
        id=event.id,
        name=event.name,
        date=event.date.isoformat(),
        location=event.location,
        description=event.description,
        duration_hours=event.duration_hours or 3.0,
        min_pool_size=event.min_pool_size,
        active=event.active,
        organizer_email=event.organizer_email,
    )


def make_organizer_token(email: str, event_id: str) -> str:
    return hashlib.sha256(f"{email}:{event_id}:organizer".encode()).hexdigest()


@router.get("/", response_model=list[EventResponse])
async def list_events(db: Session = Depends(get_db)):
    events = db.query(Event).filter_by(active=True).order_by(Event.date.asc()).all()
    return [to_response(e) for e in events]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return to_response(event)


@router.get("/{event_id}/prep")
async def get_event_prep(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    prep = generate_event_prep(
        event_name=event.name,
        description=event.description or "",
        date=event.date.isoformat(),
        location=event.location or "",
    )
    return {"event_id": event_id, "prep": prep}


@router.get("/{event_id}/stats")
async def get_event_stats(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    registered = db.query(Profile).filter_by(event_id=event_id).count()
    return {
        "event_id": event_id,
        "registered": registered,
        "min_pool_size": event.min_pool_size,
        "matching_open": registered >= event.min_pool_size,
    }


@router.post("/", response_model=dict)
async def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    existing = db.query(Event).filter(
        Event.name == payload.name,
        Event.active == True
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"An active event named '{payload.name}' already exists."
        )

    event_id = payload.name.lower().replace(" ", "_")[:40] + "_" + str(uuid.uuid4())[:8]
    organizer_token = make_organizer_token(payload.organizer_email, event_id)

    event = Event(
        id=event_id,
        name=payload.name,
        date=datetime.fromisoformat(payload.date),
        location=payload.location,
        description=payload.description,
        duration_hours=payload.duration_hours or 3.0,
        min_pool_size=payload.min_pool_size or 10,
        active=True,
        organizer_email=payload.organizer_email,
        organizer_token=organizer_token,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        **to_response(event).model_dump(),
        "organizer_token": organizer_token,
        "manage_url": f"/manage-event/{event_id}?token={organizer_token}",
    }


@router.post("/{event_id}/end")
async def end_event(event_id: str, organizer_token: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if event.organizer_token != organizer_token:
        raise HTTPException(status_code=403, detail="Not authorized.")
    event.active = False
    db.commit()
    return {"message": "Event ended."}


@router.delete("/{event_id}")
async def cancel_event(event_id: str, organizer_token: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if event.organizer_token != organizer_token:
        raise HTTPException(status_code=403, detail="Not authorized.")
    db.delete(event)
    db.commit()
    return {"message": "Event cancelled and deleted."}


@router.patch("/{event_id}/deactivate")
async def deactivate_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    event.active = False
    db.commit()
    return {"message": "Event deactivated."}