# Icebreaker Bot

A multi-agent networking assistant that matches attendees at events and generates personalized conversation starters.

## Stack

- **Frontend**: React + Vite
- **Backend**: FastAPI
- **Vector DB**: Qdrant
- **Embeddings**: sentence-transformers (local, free)
- **LLM**: Groq + Llama 3.1 8B (free tier)
- **Database**: PostgreSQL
- **Cache / Rate Limiting**: Redis
- **Agent Orchestration**: LangGraph

## Project Structure

```
icebreaker/
  backend/
    agents/
      graph.py              # LangGraph graph definition
      nodes.py              # All agent nodes
      state.py              # IcebreakerState schema
    models/
      schemas.py            # Pydantic models
      database.py           # PostgreSQL connection + ORM models
    routers/
      profiles.py           # Profile intake endpoints
      matches.py            # Matching endpoints
      feedback.py           # Feedback endpoints
      auth.py               # JWT auth endpoints
    utils/
      embedder.py           # sentence-transformers embedding
      qdrant_client.py      # Qdrant connection + helpers
      redis_client.py       # Redis connection + rate limiting
      moderation.py         # Groq content moderation
      security.py           # JWT + hashing utils
    main.py                 # FastAPI app entry point
    requirements.txt
  frontend/
    src/
      components/
        ProfileForm.jsx     # Profile submission form
        MatchCard.jsx       # Match + questions display
        FeedbackBar.jsx     # Thumbs up/down feedback
        PoolStatus.jsx      # Pool size indicator
      pages/
        Home.jsx
        Register.jsx
        Match.jsx
      utils/
        api.js              # Axios API calls
        auth.js             # JWT token helpers
      App.jsx
      main.jsx
      index.css
    index.html
    package.json
    vite.config.js
  docker-compose.yml        # Qdrant + PostgreSQL + Redis
  .env.example
```

## Setup

### 1. Clone and install

```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in GROQ_API_KEY, JWT_SECRET, DATABASE_URL
```

### 4. Run

```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```

## Safety Features

- JWT auth on every endpoint
- Email hashing (no raw PII stored)
- Prompt injection guardrails via XML-tagged prompts
- Groq-powered content moderation on profile intake
- Rate limiting via Redis
- Duplicate detection per event
- Minimum pool size gating before matching opens
- Consent checkbox on registration
- Auto profile deletion after event ends

## Agent Flow

```
profile_intake -> validation -> duplicate_check -> moderation -> embed_and_store
                                                                      |
                                                               match trigger
                                                                      |
                                                              pool_check -> matching -> question_gen -> quality_check -> repetition_check -> output -> feedback
```
