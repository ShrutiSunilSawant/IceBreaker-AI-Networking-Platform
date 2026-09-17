from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models.database import create_tables
from routers import profiles, matches, feedback, auth, events

app = FastAPI(
    title="Icebreaker Bot API",
    description="Multi-agent networking assistant with semantic matching and personalized question generation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(profiles.router)
app.include_router(matches.router)
app.include_router(feedback.router)


@app.on_event("startup")
async def startup():
    create_tables()


@app.get("/health")
async def health():
    return {"status": "ok"}
