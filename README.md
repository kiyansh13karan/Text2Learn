```markdown
# 🎓 Text2Learn — Scalable RAG-Based AI Learning Platform

> Transform any topic into a fully structured, personalized course using LLMs, Retrieval-Augmented Generation, semantic search, async job processing, and automated quality evaluation.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [System Architecture](#-system-architecture)
- [How It Works — End to End](#-how-it-works--end-to-end)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Clean Architecture](#-clean-architecture)
- [Core Components](#-core-components)
- [API Documentation](#-api-documentation)
- [Features](#-features)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Scalability Design](#-scalability-design)
- [Architecture Decisions](#-architecture-decisions)
- [CI/CD](#-cicd)

---

## 📌 Overview

Text2Learn is a **production-style AI generation pipeline** — not a chatbot, not an LLM wrapper.

A user provides a topic, difficulty level, learning goal, duration, and style. The system generates a complete, structured course with modules, lessons, code examples, quizzes, and a revision sheet — personalized to exactly what they asked for.

The engineering focus is on **reliability, quality, and scalability** around a slow and unpredictable external AI API.

---

## ❌ Problem Statement

When learning a new topic:

- Content is scattered across platforms with no structure
- There is no personalized roadmap for your specific goal
- LLMs give raw text answers — not structured learning paths
- No quiz integration to test understanding
- No revision sheet to consolidate learning
- No consistency across sessions

**Example:**

> "Learn Docker for backend development in 2 hours"

ChatGPT gives paragraphs. It does NOT:
- Structure modules in logical order
- Define prerequisites
- Adjust difficulty to your level
- Create a revision cheat sheet
- Generate a quiz
- Ensure factual accuracy
- Ground output in trusted material

---

## ✅ Solution

Text2Learn takes:

```json
{
  "topic": "Docker for Backend Developers",
  "difficulty": "Beginner",
  "goal": "Deploy Node.js app in Docker",
  "duration": "2 hours",
  "style": "Practical"
}
```

And generates:

```
✅ Structured modules in logical learning order
✅ Detailed lessons with text and code examples
✅ YouTube video suggestions per lesson
✅ Auto-generated quiz (MCQs with instant feedback)
✅ Final revision cheat sheet
✅ Hinglish narration support
✅ PDF export
✅ Multi-language translation
✅ Public course sharing
```

Using:

```
✅ Gemini API          — Course generation and evaluation
✅ RAG Pipeline        — Retrieval-Augmented Generation
✅ Embeddings          — Semantic search and similarity
✅ ChromaDB            — Vector database for context retrieval
✅ BullMQ + Redis      — Async job queue processing
✅ Redis Cache         — Two-level caching strategy
✅ LLM Evaluator       — Automated quality scoring and retry
✅ PostgreSQL          — Persistent structured storage
✅ JWT Authentication  — Secure user sessions
✅ YouTube Data API    — Relevant video integration
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│                   POST /api/generate                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                            │
│           ┌─────────────┬─────────────────┐                    │
│           │ Auth Check  │  Rate Limiting   │                    │
│           │ (JWT Token) │  (Redis Counter) │                    │
│           └─────────────┴─────────────────┘                    │
│                    Express.js API                               │
│              Returns jobId immediately                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ push job
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REDIS (BullMQ Queue)                          │
│                                                                 │
│    [job1] → [job2] → [job3] → [job4] → [job5]                 │
│                                                                 │
│    Status: WAITING → ACTIVE → COMPLETED / FAILED               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ worker picks job
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WORKER SERVICE                              │
│                                                                 │
│   Step 1 → Check Cache (Redis)                                 │
│   Step 2 → Convert topic to Embedding                          │
│   Step 3 → Query ChromaDB (RAG retrieval)                      │
│   Step 4 → Build Structured Prompt                             │
│   Step 5 → Call Gemini API                                     │
│   Step 6 → Validate JSON Schema                                │
│   Step 7 → LLM Quality Evaluation                              │
│   Step 8 → Store Result + Update Cache                         │
└────┬──────────────┬──────────────┬──────────────┬──────────────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│  REDIS  │  │ CHROMADB │  │ GEMINI   │  │ POSTGRESQL   │
│  Cache  │  │ VectorDB │  │   API    │  │   Storage    │
└─────────┘  └──────────┘  └──────────┘  └──────────────┘
```

---

## 🔄 How It Works — End to End

### Step 1 — User Submits Request

```json
{
  "topic": "Docker for Backend Developers",
  "difficulty": "Beginner",
  "goal": "Deploy Node.js app in Docker",
  "duration": "2 hours",
  "style": "Practical"
}
```

### Step 2 — API Layer

- Validates input fields
- Checks JWT authentication
- Applies rate limiting via Redis counter
- Creates job record in PostgreSQL
- Pushes job to BullMQ queue
- **Immediately returns jobId** — does not wait for generation

### Step 3 — Worker Processing Pipeline

```
Worker picks job from queue
        │
        ▼
STEP 1: Check Redis cache
        hash(topic + difficulty + goal + duration)
        HIT  → return cached course immediately
        MISS → continue pipeline
        │
        ▼
STEP 2: Convert topic to embedding vector
        "Docker for Node.js" → [0.23, 0.87, 0.12, ...]
        │
        ▼
STEP 3: RAG retrieval from ChromaDB
        Query top-3 most similar document chunks
        Retrieve as text context
        │
        ▼
STEP 4: Build structured prompt
        System instruction + RAG chunks + user params + JSON schema
        │
        ▼
STEP 5: Call Gemini API
        Temperature: 0.3 | Max tokens: defined | Timeout: 30s
        FAIL → exponential backoff retry (1s → 2s → 4s, max 3x)
        │
        ▼
STEP 6: Validate JSON schema
        Check all required fields present
        INVALID → retry with stricter prompt
        │
        ▼
STEP 7: LLM Quality Evaluation
        Second Gemini call scores:
        - Structure (1-10)
        - Clarity (1-10)
        - Difficulty match (1-10)
        - Quiz quality (1-10)
        Score < 7 → refine and retry (max 2 cycles)
        Score ≥ 7 → accept
        │
        ▼
STEP 8: Store + cache
        Save to PostgreSQL
        Cache in Redis (TTL: 7 days)
        Update job status → COMPLETED
```

### Step 4 — Client Polling

```
Client polls GET /api/job/:id
        │
        ├── status: "processing" → keep polling
        │
        └── status: "completed"  → fetch course
```

---

## 💻 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI component library |
| Lucide React | Icon library |
| React Router v6 | Client-side routing |
| html2canvas + jsPDF | PDF export |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime |
| Express.js | HTTP framework |
| PostgreSQL | Persistent relational storage |
| Prisma ORM | Database query layer |
| Redis | Queue backend + caching + rate limiting |
| BullMQ | Async job queue processing |
| ChromaDB | Vector database for RAG |
| Google Gemini API | LLM for generation + evaluation |
| YouTube Data API v3 | Video suggestions per lesson |
| JWT | Authentication |

### Infrastructure

| Technology | Purpose |
|---|---|
| Render | Backend hosting |
| Vercel | Frontend hosting |
| Neon | Serverless PostgreSQL |
| GitHub Actions | CI/CD pipeline |
| Docker | Containerization |

---

## 📁 Project Structure

```
text2learn/
│
├── client/                              # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── CourseCard.tsx
│   │   │   ├── LessonViewer.tsx
│   │   │   ├── QuizComponent.tsx
│   │   │   └── RevisionSheet.tsx
│   │   ├── pages/                       # Route-level pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── GenerateCourse.tsx
│   │   │   ├── CourseView.tsx
│   │   │   └── SharedCourse.tsx
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/                         # API client, utilities
│   │   └── types/                       # TypeScript types
│   ├── public/
│   ├── index.html
│   └── vite.config.ts
│
├── server/                              # Node.js + Express backend
│   ├── src/
│   │   │
│   │   ├── domain/                      # Layer 1 — Core business logic
│   │   │   ├── entities/
│   │   │   │   ├── Course.ts            # Course entity + business rules
│   │   │   │   ├── Module.ts
│   │   │   │   ├── Lesson.ts
│   │   │   │   ├── Quiz.ts
│   │   │   │   └── Job.ts               # Job entity + state machine
│   │   │   └── rules/
│   │   │       ├── courseRules.ts
│   │   │       └── jobRules.ts
│   │   │
│   │   ├── application/                 # Layer 2 — Use cases + interfaces
│   │   │   ├── usecases/
│   │   │   │   ├── GenerateCourse.ts    # Main generation orchestrator
│   │   │   │   ├── GetJobStatus.ts
│   │   │   │   ├── EvaluateCourse.ts    # LLM quality evaluation
│   │   │   │   └── CacheLookup.ts
│   │   │   └── interfaces/
│   │   │       ├── IJobRepository.ts
│   │   │       ├── ICourseRepository.ts
│   │   │       ├── ILLMService.ts       # LLM contract (not Gemini-specific)
│   │   │       ├── IVectorDB.ts         # Vector DB contract
│   │   │       ├── ICacheService.ts
│   │   │       └── IEmbeddingService.ts
│   │   │
│   │   ├── interfaces/                  # Layer 3 — Adapters
│   │   │   ├── http/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── courseRoutes.ts
│   │   │   │   │   ├── jobRoutes.ts
│   │   │   │   │   └── authRoutes.ts
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── CourseController.ts
│   │   │   │   │   ├── JobController.ts
│   │   │   │   │   └── AuthController.ts
│   │   │   │   └── middleware/
│   │   │   │       ├── authMiddleware.ts
│   │   │   │       └── rateLimitMiddleware.ts
│   │   │   ├── queue/
│   │   │   │   ├── producers/
│   │   │   │   │   └── CourseJobProducer.ts
│   │   │   │   └── consumers/
│   │   │   │       └── CourseJobConsumer.ts
│   │   │   └── validators/
│   │   │       └── generateCourseValidator.ts
│   │   │
│   │   ├── infrastructure/              # Layer 4 — Concrete implementations
│   │   │   ├── database/
│   │   │   │   └── postgres/
│   │   │   │       ├── PostgresCourseRepository.ts
│   │   │   │       ├── PostgresJobRepository.ts
│   │   │   │       └── migrations/
│   │   │   ├── cache/
│   │   │   │   └── RedisCacheService.ts
│   │   │   ├── llm/
│   │   │   │   └── GeminiLLMService.ts
│   │   │   ├── vectordb/
│   │   │   │   └── ChromaVectorDB.ts
│   │   │   ├── embedding/
│   │   │   │   └── GeminiEmbeddingService.ts
│   │   │   └── queue/
│   │   │       └── BullMQQueueService.ts
│   │   │
│   │   └── main/                        # Composition root
│   │       ├── app.ts
│   │       ├── container.ts             # Dependency injection wiring
│   │       └── server.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── tsconfig.json
│
├── docker-compose.yml
├── render.yaml
├── vercel.json
├── DEPLOYMENT.md
├── DEPLOYMENT_CHECKLIST.md
└── README.md
```

---

## 🧹 Clean Architecture

Text2Learn follows clean architecture with four layers. **Dependencies point inward only** — inner layers never know about outer layers.

```
┌─────────────────────────────────────────────────────────┐
│                    LAYER 4                              │
│              INFRASTRUCTURE                             │
│     GeminiLLMService, PostgresCourseRepository,        │
│     RedisCacheService, ChromaVectorDB, BullMQ          │
├─────────────────────────────────────────────────────────┤
│                    LAYER 3                              │
│              INTERFACE ADAPTERS                         │
│     CourseController, JobController,                    │
│     CourseJobConsumer, CourseJobProducer               │
├─────────────────────────────────────────────────────────┤
│                    LAYER 2                              │
│               APPLICATION LAYER                         │
│     GenerateCourse, EvaluateCourse,                    │
│     GetJobStatus, ILLMService, IVectorDB               │
├─────────────────────────────────────────────────────────┤
│                    LAYER 1                              │
│                 DOMAIN LAYER                            │
│     Course, Module, Lesson, Quiz, Job                  │
│     Business rules — zero external dependencies        │
└─────────────────────────────────────────────────────────┘

         ↑ Dependencies ALWAYS point inward ↑
```

### What This Means in Practice

| Change | Files Affected |
|---|---|
| Swap Gemini → GPT-4 | Only `infrastructure/llm/` |
| Swap PostgreSQL → MongoDB | Only `infrastructure/database/` |
| Add GraphQL API | Only add `interfaces/graphql/` |
| Change quiz business rule | Only `domain/entities/Quiz.ts` |
| Add new use case | Only `application/usecases/` |

---

## ⚙️ Core Components

### 1. Async Job Processing — BullMQ

LLM calls take 5–30 seconds. The API never blocks.

```
Request arrives
      │
      ▼
API validates + creates job
      │
      ▼
Job pushed to BullMQ queue → jobId returned to client immediately
      │
      ▼
Worker processes in background
      │
      ▼
Client polls status endpoint until COMPLETED
```

**Job lifecycle:**

```
WAITING → ACTIVE → COMPLETED
                 → FAILED → retry (max 3x, exponential backoff)
                          → DEAD (dead-letter queue)
```

---

### 2. RAG Pipeline — Retrieval-Augmented Generation

Without RAG: model relies on internal training data — outdated, hallucination-prone.

With RAG: model gets real, trusted context injected before generation.

```
OFFLINE — Document Ingestion:
Trusted Docs → Chunking (~500 tokens) → Embedding → ChromaDB

ONLINE — Query Time:
User Topic → Embedding → ChromaDB similarity search
           → Top-3 chunks retrieved
           → Injected into Gemini prompt as context
           → Grounded, accurate course generated
```

---

### 3. Two-Level Caching

```
Level 1 — Exact Hash Cache:
hash(topic + difficulty + goal + duration) → Redis lookup
HIT  → return immediately (zero LLM cost)
MISS → continue to Level 2

Level 2 — Semantic Similarity Cache:
Convert query to embedding
Compare against cached query embeddings
Cosine similarity > 0.95 → return cached course

WHY:
"Learn Docker basics" and "Docker introduction for beginners"
→ Different strings, same intent → same cached response
→ Saves redundant LLM calls
```

Cache TTL: 7 days for generated courses.

---

### 4. LLM Quality Evaluation

Every generated course is scored by a second LLM evaluation prompt before being saved.

```
Scores:
- Structure (1-10):        Are modules logically ordered?
- Clarity (1-10):          Is content clear for the difficulty level?
- Difficulty match (1-10): Matches requested level?
- Quiz quality (1-10):     Questions test real understanding?
- Completeness (1-10):     Covers the stated goal?

Score ≥ 7 → Accept and store
Score < 7 → Identify weak areas → Refine → Re-evaluate
Still failing after 2 cycles → Store with quality warning flag
```

---

### 5. Failure Handling

| Failure | Detection | Response |
|---|---|---|
| Gemini timeout | 30s timeout wrapper | Retry with backoff |
| Gemini rate limit | 429 status code | Exponential backoff + queue delay |
| Invalid JSON returned | Schema validation | Retry with stricter prompt |
| Partial generation | Missing required fields | Retry or fill defaults |
| Worker crash | Stalled job detection | Re-queue automatically |
| Redis down | Connection error | Fallback to direct processing |
| PostgreSQL write failure | DB error | Retry queue + alert |
| Evaluator fails | Evaluator error | Skip evaluation, flag course |
| Max retries exceeded | 3 consecutive failures | Dead-letter queue + alert |

---

### 6. Prompt Engineering

Every Gemini call uses a four-section structured prompt.

```
Section 1 — System instruction:
  "Return ONLY valid JSON. No markdown. No explanation."

Section 2 — RAG context:
  Retrieved document chunks injected as trusted reference.

Section 3 — User parameters:
  Topic, difficulty, goal, duration, style.

Section 4 — Output schema:
  Exact JSON structure the model must follow.

Token budget per call:
  System instruction : ~100 tokens
  RAG chunks         : ~1500 tokens (3 × 500)
  User parameters    : ~100 tokens
  Output schema      : ~200 tokens
  ─────────────────────────────────
  Total input        : ~1900 tokens
  Max output         : ~3000 tokens
```

Prompt injection defense: user input is sanitized and wrapped in safe context before being included in any prompt.

---

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Course Generation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate/course` | Submit generation job, returns jobId |
| GET | `/api/job/:jobId` | Poll job status and fetch result when complete |

### Course Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | Get user's courses (supports `?q=search`) |
| GET | `/api/courses/:id` | Get specific course |
| DELETE | `/api/courses/:id` | Delete course |
| POST | `/api/courses/:id/share` | Generate public share link |
| POST | `/api/courses/:id/translate` | Translate course (`?language=hi`) |
| GET | `/api/courses/share/:shareId` | Get shared course (no auth required) |

### YouTube

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/youtube/search` | Search YouTube videos for a lesson topic |

---

## 🎯 Features

### Core Generation

- ✅ **AI Course Generation** — Full structured course from any topic
- ✅ **Structured Modules** — Logically ordered learning sequence
- ✅ **Detailed Lessons** — Rich content with headings, paragraphs, code blocks
- ✅ **Code Examples** — Language-specific, runnable examples per lesson
- ✅ **Auto-Generated Quizzes** — MCQs with instant feedback
- ✅ **Revision Sheet** — One-page cheat sheet per course
- ✅ **Prerequisites** — Auto-detected based on topic and difficulty

### AI Pipeline

- ✅ **RAG Retrieval** — Trusted context injected before generation
- ✅ **Semantic Embeddings** — Cosine similarity search for relevant content
- ✅ **LLM Quality Evaluation** — Automated scoring and retry
- ✅ **Async Job Processing** — Non-blocking pipeline with status tracking
- ✅ **Two-Level Caching** — Exact hash + semantic similarity cache
- ✅ **Failure Recovery** — Exponential backoff, dead-letter queue, schema validation

### User Features

- ✅ **YouTube Integration** — Relevant video per lesson via YouTube Data API
- ✅ **Hinglish Narration** — Text-to-speech in Hinglish
- ✅ **PDF Export** — Download any lesson as PDF
- ✅ **Multi-Language Translation** — Hindi, Spanish, French, German
- ✅ **Course Sharing** — Public links, no login required to view
- ✅ **Search Functionality** — Real-time search across saved courses
- ✅ **User Authentication** — Secure JWT-based auth
- ✅ **Course Management** — Save, revisit, and delete courses
- ✅ **Dark Theme** — Modern dark interface

---

## 🔐 Environment Variables

### Backend — `server/.env`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/text2learn

# Authentication
JWT_SECRET=your-super-secure-secret-key

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Video
YOUTUBE_API_KEY=your-youtube-api-key

# Cache and Queue
REDIS_URL=redis://localhost:6379

# Vector Database
CHROMA_URL=http://localhost:8000

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLIENT_URL=http://localhost:5173
```

---

## 🚀 Getting Started

### Prerequisites

```
Node.js 18+
PostgreSQL
Redis
Python 3.8+ (for ChromaDB)
Google Gemini API key
YouTube Data API key
```

### Installation

**1. Clone the repository**

```bash
git clone <repository-url>
cd text2learn
```

**2. Start ChromaDB**

```bash
pip install chromadb
chroma run --host localhost --port 8000
```

**3. Start Redis**

```bash
docker run -d -p 6379:6379 redis:alpine
```

**4. Setup Backend**

```bash
cd server
npm install
cp .env.example .env
# Fill in all environment variables
npx prisma generate
npx prisma db push
npm run dev
```

**5. Setup Frontend**

```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

**6. Using Docker Compose (Recommended)**

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, ChromaDB, backend, and frontend together.

---

## 📦 Deployment

### Backend — Render

```
Build command : cd server && npm install && npx prisma generate
Start command : cd server && npm start
```

Add all backend environment variables in Render dashboard.

### Frontend — Vercel

```
Root directory : client
Framework      : Vite
```

Add `VITE_API_URL` pointing to your Render backend URL.

### Database — Neon

```
1. Create project on neon.tech
2. Copy connection string
3. Append ?sslmode=require
4. Set as DATABASE_URL in Render environment variables
```

### Production Environment Variables

**Backend (Render):**

```env
DATABASE_URL=postgresql://...neon.tech/db?sslmode=require
JWT_SECRET=your-super-secure-secret
GEMINI_API_KEY=AIza...
YOUTUBE_API_KEY=AIza...
REDIS_URL=redis://...
CHROMA_URL=https://...
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=5000
```

**Frontend (Vercel):**

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_CLIENT_URL=https://your-app.vercel.app
```

---

## 📈 Scalability Design

### Scale Calculation

```
1M users/day × 2 generations    = 2M jobs/day
2M / 86,400 seconds             = ~23 jobs/second average
Peak load (3x multiplier)       = ~70 jobs/second
Average LLM call latency        = 10 seconds
Concurrent workers needed       = 70 × 10 = 700 at peak
```

### Architecture at Scale

```
Load Balancer (AWS ALB)
→ Stateless API servers     (horizontal auto-scale)
→ Redis BullMQ queue        (distributed)
→ Worker pool               (scale on queue depth)
→ PostgreSQL                (primary + read replicas)
→ Redis cluster             (cache + rate limiting)
→ ChromaDB                  (sharded vector index)
→ Gemini API pool           (key rotation + circuit breaker)
```

### Bottlenecks and Mitigations

| Bottleneck | Mitigation |
|---|---|
| Gemini API rate limits | API key rotation + circuit breaker |
| Queue depth spike | Auto-scale workers based on queue depth |
| PostgreSQL write throughput | PgBouncer connection pooling + read replicas |
| Redis memory pressure | Redis cluster + eviction policies |
| ChromaDB query latency | HNSW approximate nearest neighbour index + sharding |
| Repeated topic LLM cost | Two-level caching (exact hash + semantic similarity) |

### Cost Optimization

```
Caching        : 30-40% repeated topics → 30-40% reduction in LLM calls
Token budgeting: Compressed prompts → ~20% token reduction per call
Model tiering  : Simple topics → smaller cheaper Gemini model
Key rotation   : Multiple API keys → no single rate limit ceiling
```

---

## 🛠️ Development

### Run Tests

```bash
# All backend tests
cd server && npm test

# Domain layer — pure unit tests, no mocks needed
npm run test:domain

# Application layer — mocked interfaces
npm run test:application

# Infrastructure layer — integration tests
npm run test:infrastructure

# Frontend
cd client && npm test
```

### Code Quality

```bash
npm run lint
npm run type-check
npm run format
```

---

## 🔄 CI/CD

```
Push to main branch
        │
        ▼
GitHub Actions triggered
        │
        ├── Type check  (tsc --noEmit)
        ├── Lint        (eslint)
        └── Run tests   (jest)
        │
        ▼
All checks pass
        │
        ├── Auto-deploy backend  → Render
        └── Auto-deploy frontend → Vercel
```

CI/CD workflow file: `.github/workflows/deploy.yml`

---

## 🏛️ Architecture Decisions

| Decision | Alternative Considered | Reason for Choice |
|---|---|---|
| BullMQ + Redis | Kafka | Simpler ops, sufficient for current scale, built-in retry and DLQ |
| RAG over fine-tuning | Fine-tuning Gemini | Faster knowledge updates, lower cost, transparent retrieval |
| PostgreSQL | MongoDB | ACID transactions, structured relational data, JSONB for flexibility |
| ChromaDB | Pinecone | Self-hosted, no external vector DB dependency |
| Async polling | WebSockets | Simpler implementation, stateless, scales easily |
| Two-level cache | Single cache layer | Semantic cache catches similar-intent duplicate requests |
| Forced JSON output | Free text | Parseable, storable, validatable, directly UI-renderable |
| LLM evaluator | Manual QA | Automated quality control that scales with volume |
| Clean architecture | MVC | Swappable infrastructure, independently testable layers |
| JWT authentication | Session-based auth | Stateless, works across multiple API servers behind load balancer |

---

## 📄 Additional Documentation

| File | Purpose |
|---|---|
| `DEPLOYMENT.md` | Full step-by-step deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Pre-deployment checklist |
| `render.yaml` | Render service configuration |
| `vercel.json` | Vercel deployment configuration |
| `docker-compose.yml` | Local full-stack Docker setup |
| `.github/workflows/deploy.yml` | CI/CD automation |

---

*Text2Learn — Built as a production-style AI generation pipeline with reliability, cost control, and scalability as core design principles.*
```
