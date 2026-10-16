import os
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import hashlib
from sqlalchemy.orm import Session

from models.database import get_db, Event, Profile
from utils.groq_client import generate_event_prep
from utils.moderation import moderate_event

# Simple in-process rate limit for event creation: 1 per IP per hour.
# Redis-backed per-endpoint limiting can be added later; this covers the common case.
import time
_event_creation_log: dict[str, float] = {}
_EVENT_CREATE_INTERVAL = int(os.getenv("EVENT_CREATE_INTERVAL_SECONDS", 3600))

router = APIRouter(prefix="/events", tags=["events"])


class EventCreate(BaseModel):
    name: str
    date: str
    end_time: Optional[str] = None
    organizer_email: EmailStr
    location: Optional[str] = None
    description: Optional[str] = None
    duration_hours: Optional[float] = 3.0
    min_pool_size: Optional[int] = 2


class EventResponse(BaseModel):
    id: str
    name: str
    date: str
    end_time: Optional[str]
    location: Optional[str]
    description: Optional[str]
    duration_hours: float
    min_pool_size: int
    active: bool
    organizer_email: Optional[str]


def to_response(event) -> EventResponse:
    # derive duration_hours from end_time when available
    start = event.date
    end = event.end_time
    if end and start:
        derived_hours = (end - start).total_seconds() / 3600
    else:
        derived_hours = event.duration_hours or 3.0
    return EventResponse(
        id=event.id,
        name=event.name,
        date=event.date.isoformat(),
        end_time=event.end_time.isoformat() if event.end_time else None,
        location=event.location,
        description=event.description,
        duration_hours=derived_hours,
        min_pool_size=event.min_pool_size,
        active=event.active,
        organizer_email=event.organizer_email,
    )


def make_organizer_token(email: str, event_id: str) -> str:
    return hashlib.sha256(f"{email}:{event_id}:organizer".encode()).hexdigest()


@router.get("/", response_model=list[EventResponse])
async def list_events(db: Session = Depends(get_db)):
    from datetime import timedelta
    now = datetime.utcnow()
    events = db.query(Event).filter_by(active=True).order_by(Event.date.asc()).all()
    def event_cutoff(e):
        if e.end_time:
            return e.end_time + timedelta(hours=1)
        return e.date + timedelta(hours=(e.duration_hours or 3) + 1)
    visible = [e for e in events if event_cutoff(e) > now]
    return [to_response(e) for e in visible]


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
    if event.prep_cache:
        import json
        return {"event_id": event_id, "prep": json.loads(event.prep_cache)}
    prep = generate_event_prep(
        event_name=event.name,
        description=event.description or "",
        date=event.date.isoformat(),
        location=event.location or "",
    )
    import json
    event.prep_cache = json.dumps(prep)
    db.commit()
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
async def create_event(payload: EventCreate, request: Request, db: Session = Depends(get_db)):
    # Rate limit: 1 event creation per IP per hour
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    last = _event_creation_log.get(client_ip, 0)
    if now - last < _EVENT_CREATE_INTERVAL:
        wait = int(_EVENT_CREATE_INTERVAL - (now - last))
        raise HTTPException(
            status_code=429,
            detail=f"You can only create one event per hour. Please wait {wait} seconds.",
        )

    # Auto-moderate event content before saving
    passed, reason = moderate_event(
        name=payload.name,
        description=payload.description or "",
        location=payload.location or "",
    )
    if not passed:
        raise HTTPException(
            status_code=422,
            detail=f"Event did not pass content review: {reason}",
        )

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

    start_dt = datetime.fromisoformat(payload.date)
    end_dt = datetime.fromisoformat(payload.end_time) if payload.end_time else None
    derived_hours = (end_dt - start_dt).total_seconds() / 3600 if end_dt else (payload.duration_hours or 3.0)

    event = Event(
        id=event_id,
        name=payload.name,
        date=start_dt,
        end_time=end_dt,
        location=payload.location,
        description=payload.description,
        duration_hours=derived_hours,
        min_pool_size=payload.min_pool_size or 2,
        active=True,
        organizer_email=payload.organizer_email,
        organizer_token=organizer_token,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    _event_creation_log[client_ip] = time.time()

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