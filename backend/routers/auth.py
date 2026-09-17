from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import hashlib
import os

from models.schemas import TokenResponse
from utils.security import create_token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    event_id: str


@router.post("/token", response_model=TokenResponse)
async def get_token(payload: LoginRequest):
    """
    Issue a JWT for a user based on their email and event.
    In production, this would verify against a registration list or OTP flow.
    """
    user_id = hashlib.sha256(
        (payload.email + payload.event_id).encode()
    ).hexdigest()

    token = create_token(user_id=user_id, event_id=payload.event_id)

    return TokenResponse(access_token=token)
