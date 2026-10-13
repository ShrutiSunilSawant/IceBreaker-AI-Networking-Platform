import os
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, field_validator
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models.database import get_db, User
from utils.security import create_token, get_current_user

router = APIRouter(prefix="/users", tags=["users"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

RESET_TOKEN_EXPIRY_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRY_MINUTES", 30))

# In-memory store for password reset tokens: {token: (email, expires_at)}
# In production this should be Redis or a DB table
_reset_tokens: dict[str, tuple[str, datetime]] = {}


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str

    @field_validator("password")
    @classmethod
    def strong_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("display_name")
    @classmethod
    def non_empty_name(cls, v):
        if not v.strip():
            raise ValueError("Display name cannot be empty.")
        return v.strip()


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class UpdateSettingsRequest(BaseModel):
    display_name: str | None = None
    current_password: str | None = None
    new_password: str | None = None


@router.post("/signup", response_model=dict)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=payload.email.lower()).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email.lower(),
        password_hash=pwd.hash(payload.password),
        display_name=payload.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user_id=user.id, event_id="__platform__")
    return {"access_token": token, "display_name": user.display_name, "email": user.email}


@router.post("/signin", response_model=dict)
async def signin(payload: SigninRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=payload.email.lower()).first()
    if not user or not pwd.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_token(user_id=user.id, event_id="__platform__")
    return {"access_token": token, "display_name": user.display_name, "email": user.email}


@router.get("/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"id": user.id, "email": user.email, "display_name": user.display_name, "created_at": user.created_at.isoformat()}


@router.patch("/settings", response_model=dict)
async def update_settings(
    payload: UpdateSettingsRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter_by(id=current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.display_name is not None:
        user.display_name = payload.display_name.strip()

    if payload.new_password:
        if not payload.current_password or not pwd.verify(payload.current_password, user.password_hash):
            raise HTTPException(status_code=401, detail="Current password is incorrect.")
        if len(payload.new_password) < 8:
            raise HTTPException(status_code=422, detail="New password must be at least 8 characters.")
        user.password_hash = pwd.hash(payload.new_password)

    db.commit()
    return {"message": "Settings updated.", "display_name": user.display_name}


@router.post("/forgot-password", response_model=dict)
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=payload.email.lower()).first()
    if user:
        token = str(uuid.uuid4())
        expires = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
        _reset_tokens[token] = (user.email, expires)
        # In production: send email with reset link containing the token
        # For now the token is returned in the response (dev only)
        if os.getenv("ENV", "development") == "development":
            return {"message": "Reset link generated.", "dev_token": token}
    # Always return 200 to avoid email enumeration
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", response_model=dict)
async def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    entry = _reset_tokens.get(payload.token)
    if not entry:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    email, expires = entry
    if datetime.utcnow() > expires:
        del _reset_tokens[payload.token]
        raise HTTPException(status_code=400, detail="Reset token has expired.")

    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = pwd.hash(payload.new_password)
    db.commit()
    del _reset_tokens[payload.token]
    return {"message": "Password reset successfully."}
