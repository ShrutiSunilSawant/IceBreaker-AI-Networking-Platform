import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv()

from models.database import create_tables
from routers import profiles, matches, feedback, auth, events, users

app = FastAPI(
    title="Icebreaker Bot API",
    description="Multi-agent networking assistant with semantic matching and personalized question generation.",
    version="1.0.0",
)

_allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
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


# Serve built React frontend — only if the dist folder exists (production build)
_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(_dist, "assets")), name="assets")

    @app.get("/favicon.svg", include_in_schema=False)
    async def favicon_svg():
        return FileResponse(os.path.join(_dist, "favicon.svg"), media_type="image/svg+xml")

    @app.get("/favicon.png", include_in_schema=False)
    async def favicon():
        return FileResponse(os.path.join(_dist, "favicon.png"))

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        index = os.path.join(_dist, "index.html")
        return FileResponse(index)
