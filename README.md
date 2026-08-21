# C2C Engine — Conflict to Currency

**Geopolitical risk intelligence for people who can't afford to be last to know.**

C2C Engine ingests live geopolitical news, scores it for sentiment and risk using a fine-tuned FinBERT model, maps it against portfolio exposure, and surfaces it as real-time incidents, risk maps, and causal chains — all in one dashboard.

[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-149eca?logo=react&logoColor=white)](./frontend)
[![Backend](https://img.shields.io/badge/backend-Spring%20Boot-6DB33F?logo=springboot&logoColor=white)](./backend)
[![AI Engine](https://img.shields.io/badge/AI%20engine-FastAPI%20%2B%20ONNX-009688?logo=fastapi&logoColor=white)](./ai-engine)
[![License](https://img.shields.io/badge/license-personal%20project-lightgrey)](#license)

---

## Contents

- [Live](#live)
- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Auth](#auth)
- [Deployment notes](#deployment-notes)
- [Roadmap / known limitations](#roadmap--known-limitations)
- [License](#license)

---

## Live

- **App:** https://c2-c-engine-of7j.vercel.app
- **Backend API:** https://c2c-engine-1.onrender.com

> The API is a private backend for the app above, not a public API — most routes require a signed-in session.

---

## What it does

- **Real-time incident feed** — ingests geopolitical news and scores each item for sentiment and risk.
- **Risk scoring** — FinBERT-driven sentiment analysis feeding a trained risk classifier (LOW / MEDIUM / HIGH / CRITICAL).
- **Exposure mapping** — cross-references incidents against portfolio holdings to flag what's actually at risk.
- **Causal chains / knowledge graph** — traces how one event cascades into others.
- **Risk map, analytics, and portfolio views** — six dashboard sections covering the full picture.
- **Full account system** — email/password auth, Google Sign-In, forgot/reset password, all behind real JWT-secured API routes.

---

## Architecture

```
+-------------------+      +-------------------+      +------------------------+
|  React frontend    | ---> |  Spring Boot API   | ---> |  FastAPI AI engine      |
|  (Vite, Tailwind)  |      |  (Postgres, JWT)   |      |  (FinBERT ONNX +        |
|  Vercel             |      |  Render             |      |   risk classifier)     |
+-------------------+      +-------------------+      +------------------------+
```

- **Frontend** talks only to the Spring Boot API — it never calls the AI engine or a news API directly.
- **Backend** owns auth, persistence (Postgres), and orchestration — it calls the AI engine internally to score incoming incidents, and calls a news API to ingest new ones on a schedule.
- **AI engine** is a stateless scoring service: text in, sentiment + risk level out. Runs FinBERT as a quantized ONNX graph (no PyTorch/transformers at runtime) to stay inside free-tier memory limits.

The exact request/response shapes between all three services are locked in [`CONTRACT.md`](./CONTRACT.md) — check there before changing any inter-service payload.

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS, Axios, Recharts, react-force-graph, react-simple-maps |
| Backend | Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, JWT (jjwt), Maven |
| AI Engine | FastAPI, ONNX Runtime, Hugging Face Tokenizers, scikit-learn, FinBERT (quantized to INT8 ONNX) |
| Auth | Custom JWT issuance + bcrypt password hashing, Google Sign-In (Google Identity Services) |
| Deployment | Vercel (frontend), Render (backend + Postgres), Hugging Face Hub (model weights) |

---

## Project structure

```
C2C-Engine/
├── frontend/     React app — landing/login/auth + the 6-page dashboard
├── backend/      Spring Boot API — auth, persistence, orchestration
├── ai-engine/    FastAPI service — FinBERT sentiment + risk scoring
├── CONTRACT.md   Locked API contract between all three services
└── C2C_Team_Roadmap.md
```

---

## Getting started

You need all three services running locally for the full experience. The frontend will render with partial/mocked dashboard data if the backend or AI engine are down, but **auth requires the backend** — nothing behind `/dashboard` works without it.

### Prerequisites

- Node.js 18+
- Java 25 (Eclipse Temurin recommended) + Maven — make sure `JAVA_HOME` points at your JDK 25 install
- Python 3.11
- PostgreSQL 15 (local instance, or point at your Render Postgres)

### 1. AI engine (`/ai-engine`)

```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Place model files before running (not shipped in this repo):
- FinBERT ONNX files → `app/ml_artifacts/finbert_model/`
- Risk classifier files → `app/ml_artifacts/risk_classifier/`

```bash
uvicorn app.main:app --reload --port 8000
```

Docs at `http://localhost:8000/docs`. See [`ai-engine/README.md`](./ai-engine/README.md) for details.

### 2. Backend (`/backend`)

Copy the example config and fill in your local Postgres credentials:

```bash
cd backend
copy src\main\resources\application.properties.example src\main\resources\application.properties
```

Set these environment variables (or edit `application.properties` directly for local dev):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | e.g. `jdbc:postgresql://localhost:5432/c2c_db` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | your local Postgres credentials |
| `JWT_SECRET` | random 32+ character string that signs auth tokens |
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud Console, for Google Sign-In |
| `NEWSAPI_KEY` | key for the news ingestion job |
| `PYTHON_SERVICE_BASEURL` | defaults to `http://localhost:8000` |

```bash
mvnw spring-boot:run
```

Runs on `http://localhost:8080`.

### 3. Frontend (`/frontend`)

```bash
cd frontend
npm install
```

`.env.development` needs:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

```bash
npm run dev
```

Runs on `http://localhost:5173`.

---

## Auth

Real, working JWT auth — not a mock.

| Endpoint | What it does |
|---|---|
| `POST /api/auth/register` | Creates an account (bcrypt-hashed password), returns a JWT |
| `POST /api/auth/login` | Validates credentials, returns a JWT |
| `GET /api/auth/me` | Confirms a token is valid, returns the associated email |
| `POST /api/auth/forgot-password` | Generates a reset token (see note below) |
| `POST /api/auth/reset-password` | Consumes a valid, unexpired token to set a new password |
| `POST /api/auth/google` | Verifies a Google Identity Services ID token, creates the account on first sign-in, returns a JWT |

How it fits together on the frontend:

- The JWT is stored client-side and attached automatically to every subsequent API request (see `frontend/src/services/api.js`).
- `/dashboard` and all its sub-routes are gated by `AppLayout.jsx` — no valid token, no access, straight redirect to `/login`.
- Every route other than `/api/auth/**` on the backend requires a valid token (`SecurityConfig.java`).

---

## Deployment notes

- **Frontend → Vercel.** Auto-deploys on push to `main`. Set `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` in Vercel's environment variables to match production.
- **Backend → Render.** Auto-deploys on push. Required env vars: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `NEWSAPI_KEY`, `PYTHON_SERVICE_BASEURL`.
- **Google OAuth** requires the deployed frontend URL to be added under "Authorized JavaScript origins" in Google Cloud Console, alongside `localhost:5173` for local dev.
- **AI engine memory:** FinBERT runs as an INT8-quantized ONNX graph (hosted on Hugging Face Hub) specifically to fit inside Render's free-tier RAM limit — the runtime has no `torch`/`transformers` dependency, only `onnxruntime` + `tokenizers`.

---

## Roadmap / known limitations

- **Forgot password is in test mode.** No SMTP service is wired up yet, so `/api/auth/forgot-password` returns the reset link directly in the API response instead of emailing it. Next step there: Spring Mail + an SMTP provider (Gmail app password or SendGrid).
- **Google-created accounts** get an unguessable random password hash under the hood — they can only sign in via Google unless they later run the reset-password flow to set a real one.
- No refresh-token rotation yet — the JWT is long-lived (24h by default) rather than short-lived-plus-refresh. Fine at current scale, worth revisiting before wider usage.

---

## License

Personal/portfolio project — not currently licensed for reuse.
