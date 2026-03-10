# Support Tickets — Merchant Dashboard

A full-stack **MERN** application for merchants to create, view, and manage support inquiries.

## Tech Stack (MERN)

- **M**ongoDB — database (via Mongoose)
- **E**xpress — Node.js API
- **R**eact — frontend (Vite)
- **N**ode.js — runtime

Additional: **TypeScript** (backend + frontend, **shared types** in `backend/shared/`), Tailwind CSS, Docker Compose, request validation (express-validator), centralized error handling, health/readiness endpoints, API tests (Jest + supertest).

## Project Structure

```
Task/
├── docker-compose.yml       # One-command run: MongoDB + backend + frontend
├── backend/
│   ├── shared/              # Shared TypeScript types (Ticket, Priority, Status)
│   ├── src/
│   │   ├── config/          # Constants, DB connection
│   │   ├── errors/          # AppError for consistent API errors
│   │   ├── middleware/      # errorHandler, validation (express-validator)
│   │   ├── models/          # Mongoose Ticket model
│   │   ├── services/        # Business logic
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── routes/          # API routes
│   │   ├── app.ts           # Express app (exported for server + tests)
│   │   └── index.ts         # Server entry (connects DB, then listens)
│   ├── __tests__/           # API tests (Jest + supertest)
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # API client (tickets) — uses shared types
│   │   ├── components/      # BoardView, TicketCard, modals, etc. (TSX)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## How to Run

### Option 1: Docker (recommended — one command)

From the project root:

```bash
docker compose up --build
```

- **MongoDB:** `localhost:27017`
- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:4173 (open in browser)

Stop with `Ctrl+C` or `docker compose down`.

### Option 2: Local (Node + MongoDB)

**Prerequisites:** Node.js 18+, MongoDB running locally or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

**Backend**

```bash
cd backend
cp .env.example .env   # optional: set MONGODB_URI
npm install
npm run dev
```

API: http://localhost:3001

**Frontend** (second terminal)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173 (proxies `/api` to backend).

**Backend tests** (requires MongoDB):

```bash
cd backend
npm test
```

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Liveness: always 200, `{ "status": "ok" }`. |
| `GET`  | `/ready`  | Readiness: 200 when MongoDB connected, 503 otherwise. `{ "status", "mongodb" }`. |
| `POST` | `/api/tickets` | Create ticket. Body: `{ "subject", "message", "priority" }`. Priority: `Low`, `Medium`, `High`. |
| `GET`  | `/api/tickets` | List all tickets (newest first). |
| `PATCH`| `/api/tickets/:id` | Update ticket. Body: at least one of `{ "status", "subject", "message", "priority" }`. Status: `NEW`, `INVESTIGATING`, `RESOLVED`. |

### Response shapes

- **Success:** Ticket object(s) as JSON (e.g. `{ id, subject, message, priority, status, createdAt, updatedAt }`).
- **Error:** `{ "error": "string" }` with appropriate HTTP status (400 validation, 404 not found, 500 server error).

Validation errors (missing/invalid fields) return `400` and a single `error` message.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port. |
| `MONGODB_URI` | `mongodb://localhost:27017/support-tickets` | MongoDB connection string. |
| `VITE_API_BASE_URL` | (none) | Frontend: base URL for API when not using dev proxy (e.g. Docker preview: `http://localhost:3001`). |

## Architectural Choices

1. **Layered backend** — Routes → Controllers → Services → Models. Controllers pass errors to `next()`; centralized error middleware returns `{ error }` and status code. Services use `AppError(message, statusCode)` for consistent handling.

2. **Request validation** — express-validator on routes (create + patch). Validation failures go through the same error handler and return 400.

3. **App vs server** — `app.js` exports the Express app (no `listen`). `index.js` connects to MongoDB then calls `app.listen()`. This allows tests to use `supertest(app)` without starting the server.

4. **Health and readiness** — `/health` for liveness; `/ready` checks `mongoose.connection.readyState` for readiness (e.g. Kubernetes probes).

5. **Frontend** — Vanilla CSS with theme variables; Jira-style board (Kanban), drag-and-drop, modals, search, mobile-friendly. API base URL configurable via `VITE_API_BASE_URL` for Docker/production.

## Scope for Improvements

- **Authentication / authorization** — Protect routes, role-based access (e.g. merchant vs support).
- **Filtering and pagination** — Query params for status, priority, date range; cursor or page-based list.
- **TypeScript** — Backend and frontend are now TypeScript with shared types in `backend/shared/`.
- **More tests** — Frontend unit/integration (e.g. React Testing Library), E2E (Playwright/Cypress).
- **Logging and observability** — Structured logs, request IDs, optional APM.
- **Rate limiting and security** — Helmet, rate-limit middleware, input sanitization.

## Deliverables

- **Repo:** Ready to commit or zip. No secrets; use `.env` and `.env.example` as needed.
- **Run:** Docker Compose or local Node + MongoDB as above.
- **Tests:** `npm test` in `backend/` runs API tests (Jest + supertest).
