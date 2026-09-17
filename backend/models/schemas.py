from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class ProfileInput(BaseModel):
    name: str
    email: EmailStr
    role: str
    company: Optional[str] = None
    what_you_do: str
    looking_for: str
    interests: Optional[str] = None
    event_id: str
    consent: bool

    @field_validator("consent")
    @classmethod
    def must_consent(cls, v):
        if not v:
            raise ValueError("You must agree to the terms to participate.")
        return v

    @field_validator("name", "role", "what_you_do", "looking_for")
    @classmethod
    def no_empty_strings(cls, v):
        if not v or not v.strip():
            raise ValueError("This field cannot be empty.")
        return v.strip()


class MatchRequest(BaseModel):
    user_id: str
    event_id: str


class FeedbackInput(BaseModel):
    match_id: str
    user_id: str
    rating: int

    @field_validator("rating")
    @classmethod
    def valid_rating(cls, v):
        if v not in [0, 1]:
            raise ValueError("Rating must be 0 (bad) or 1 (good).")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileResponse(BaseModel):
    user_id: str
    stored: bool
    message: str


class MatchedPerson(BaseModel):
    name: str
    role: str
    company: Optional[str]
    what_you_do: str
    looking_for: str
    match_score: float
    match_percentage: int
    questions: list[str]


class MatchResponse(BaseModel):
    match_id: str
    top_matches: list[MatchedPerson]
    questions: list[str]


class WaitingResponse(BaseModel):
    waiting: bool
    pool_size: int
    needed: int
    message: str


class ErrorResponse(BaseModel):
    error: str