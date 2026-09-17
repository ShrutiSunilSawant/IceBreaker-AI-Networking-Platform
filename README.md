# IceBreaker — AI Networking Platform

An AI-powered networking matchmaking platform that connects attendees at professional events and generates personalized conversation starters using semantic vector search and large language models.

> Built entirely on free and open-source tools. Zero API cost.

---

## Features

- **Semantic Matching** — Matches attendees using 384-dim vector embeddings and cosine similarity (Qdrant)
- **Top 5 Matches** — Returns the five most compatible people per attendee with match percentage scores
- **AI Conversation Starters** — Generates 5 personalized icebreaker questions per match using Llama 3.1 8B
- **Multi-Event Registration** — Users can register for multiple events; same-time conflict detection built in
- **Content Moderation** — Every profile reviewed by LLM before storage
- **Event Management** — Organizers can create, manage, and end events
- **Privacy-First** — Raw emails never stored; SHA-256 hashes used throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | FastAPI + Uvicorn |
| Agent Orchestration | LangGraph |
| Vector Database | Qdrant |
| Relational Database | PostgreSQL 15 |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) — local, free |
| LLM | Groq API — Llama 3.1 8B Instant (free tier) |
| Cache / Rate Limiting | Redis |
| Auth | JWT (HS256) |
| Infrastructure | Docker Compose |

---

## Project Structure

```
icebreaker/
├── backend/
│   ├── agents/
│   │   ├── graph.py          # LangGraph pipeline definition
│   │   ├── nodes.py          # All 13 agent nodes
│   │   └── state.py          # IcebreakerState TypedDict
│   ├── models/
│   │   ├── database.py       # SQLAlchemy ORM models
│   │   └── schemas.py        # Pydantic request/response schemas
│   ├── routers/
│   │   ├── profiles.py       # Profile intake + conflict detection
│   │   ├── matches.py        # Semantic matching + question gen
│   │   ├── events.py         # Event CRUD
│   │   ├── feedback.py       # Thumbs up/down ratings
│   │   └── auth.py           # JWT token issuance
│   ├── utils/
│   │   ├── embedder.py       # Local sentence-transformers inference
│   │   ├── groq_client.py    # Question generation + quality scoring
│   │   ├── qdrant_client.py  # Vector store operations
│   │   ├── moderation.py     # LLM content moderation
│   │   ├── redis_client.py   # Rate limiting
│   │   └── security.py       # JWT helpers
│   ├── main.py               # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── MatchCard.jsx     # Match cards + question modal
│       │   ├── ProfileForm.jsx   # Profile submission form
│       │   ├── FeedbackBar.jsx   # Thumbs up/down UI
│       │   ├── EventPrep.jsx     # Event prep guide
│       │   └── PoolStatus.jsx    # Pool size indicator
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Events.jsx
│       │   ├── Register.jsx
│       │   ├── Match.jsx
│       │   ├── CreateEvent.jsx
│       │   ├── ManageEvent.jsx
│       │   ├── MyEvents.jsx
│       │   └── Login.jsx
│       └── utils/
│           ├── api.js            # Axios API client
│           └── auth.js           # JWT token helpers
├── docker-compose.yml
├── .env.example
└── REPORT.md
```

---

## Agent Pipeline

```
[validation] → [duplicate_check] → [moderation] → [embed_and_store]
                                                          │
                                                    [pool_check]
                                                    ↙         ↘
                                              [waiting]    [matching]
                                                                │
                                                        [question_gen] ←──┐
                                                                │          │ retry
                                                        [quality_check]    │
                                                                │ fail ────┘
                                                      [repetition_check]
                                                                │
                                                           [output] → [feedback]
```

---

## Setup

### Prerequisites
- Docker Desktop running
- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/ShrutiSunilSawant/IceBreaker-AI-Networking-Platform.git
cd IceBreaker-AI-Networking-Platform
```

### 2. Configure environment

```bash
cp .env.example backend/.env
# Open backend/.env and fill in:
# - GROQ_API_KEY
# - JWT_SECRET (generate with: python3 -c "import secrets; print(secrets.token_hex(64))")
```

### 3. Start infrastructure

```bash
docker-compose up -d
```

### 4. Install dependencies

```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

### 5. Run

```bash
# Backend (terminal 1)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8001

# Frontend (terminal 2)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/profiles/` | Register profile + trigger pipeline |
| POST | `/matches/` | Get top 5 matches + conversation starters |
| GET | `/events/` | List all active events |
| POST | `/events/` | Create a new event |
| GET | `/events/{id}/prep` | AI-generated event prep guide |
| POST | `/auth/token` | Get JWT token |
| POST | `/feedback/` | Submit match rating |

---

## Safety & Privacy

- JWT authentication on every protected endpoint
- SHA-256 email hashing — raw PII never stored
- Prompt injection guardrails via XML-tagged profile content
- LLM content moderation on every profile before storage
- Per-IP rate limiting (30 req/min) via Redis
- Duplicate registration detection per event
- Minimum pool size gate before matching opens
- Same-time event conflict detection across events
- Consent checkbox required on registration

---

## License

MIT
