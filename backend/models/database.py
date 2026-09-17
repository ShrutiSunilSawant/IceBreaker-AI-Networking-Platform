import os
from datetime import datetime

from sqlalchemy import create_engine, Column, String, Boolean, Integer, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://icebreaker:icebreaker@127.0.0.1:5432/icebreaker")

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String, nullable=True)
    description = Column(String, nullable=True)
    duration_hours = Column(Float, default=3.0)
    organizer_email = Column(String, nullable=True)
    organizer_token = Column(String, nullable=True)
    min_pool_size = Column(Integer, default=10)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    qdrant_id = Column(String, nullable=False)
    email_hash = Column(String, nullable=True, index=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True)
    user_a_id = Column(String, nullable=False)
    user_b_id = Column(String, nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True)
    match_id = Column(String, ForeignKey("matches.id"), nullable=False)
    event_id = Column(String, nullable=False)
    question_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True)
    match_id = Column(String, ForeignKey("matches.id"), nullable=False)
    user_id = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def create_tables():
    Base.metadata.create_all(bind=engine)