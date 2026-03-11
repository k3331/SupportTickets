# Support Tickets System

A full-stack application for creating, viewing, and managing support tickets with a Kanban-style board, status workflow, and priority indicators.

## Features

- **Create support tickets** — Subject, message, and priority (Low / Medium / High)
- **View tickets dashboard** — Kanban board with columns: To Do → In Progress → Done
- **Update ticket status** — Inline dropdown and drag-and-drop (NEW → INVESTIGATING → RESOLVED)
- **Priority indicators** — Visual badges: High (red), Medium (yellow), Low (green)
- **Status color indicators** — NEW (blue), INVESTIGATING (amber), RESOLVED (green)
- **Search tickets** — Filter by subject, message, or ID
- **Loading & error states** — Spinner while loading, error message with Retry when fetch fails
- **Total ticket count** — Displayed above the board
- **Sort by newest** — Tickets ordered by creation date (newest first)
- **Created date** — Shown on each card in a readable format

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, Vite, TypeScript
- **Database:** MongoDB (Mongoose)
- **Validation:** Joi (create/patch schemas)
- **Styling:** Tailwind CSS
- **API tests:** Jest + supertest

## Architecture

### Overview

The app is a **three-tier SPA**: browser → REST API → MongoDB. The frontend is a single-page React app that talks to the Express backend; the backend owns all persistence and business rules.

- **Client:** React 18, Vite, TypeScript. Local component state (no Redux). Fetch API for HTTP; optional proxy in dev so the same origin is used.
- **API:** Express on Node 20. Stateless; no server-side sessions. CORS enabled for cross-origin requests (e.g. Docker frontend on 4173 → backend on 3001).
- **Data:** MongoDB 7. One main collection (tickets). Mongoose for schema, indexes, and timestamps.

### Backend design

- **Layered flow:** `routes` → `controllers` → `services` → `models`. Routes define HTTP surface; controllers parse request/response; services hold business logic and validation; models handle Mongoose and DB access.
- **Validation:** Request bodies and params are validated with **Joi** in middleware (`validateJoi`) before controllers run. Invalid payloads return 400 with a single `{ error }` message.
- **Errors:** Controllers and services use `next(err)` or throw `AppError` (with status code). A single **errorHandler** middleware normalizes all errors to JSON `{ error: string }` and the right status (400, 404, 500).
- **Health:** `/health` is a simple liveness check. `/ready` reflects MongoDB connectivity (503 if disconnected) for orchestration/load balancers.
- **Shared types:** `backend/shared` holds TypeScript types and constants (e.g. `PRIORITIES`, `STATUSES`, `Ticket`) used by both backend and frontend so API contracts stay in one place.

### Frontend design

- **SPA:** Single entry (`main.tsx` → `App.tsx`). No router; one main view (board).
- **State:** React `useState` / `useCallback` in `App.tsx` for tickets, filters, search, modals, and toasts. No global store.
- **Data flow:** `App` fetches tickets (with optional `status`/`priority` query params), passes data and callbacks into `BoardView` and modals. Updates (create, patch) trigger a refetch.
- **Filtering:** Status and priority are sent as query params to the API (server-side). Search is client-side over the current result set for instant feedback.
- **Styling:** Tailwind with a small set of semantic CSS variables (e.g. `--color-bg`, `--color-accent`) for theming (dark/light).

### Data model

- **Ticket:** `id`, `subject`, `message`, `priority` (Low | Medium | High), `status` (NEW | INVESTIGATING | RESOLVED), `createdAt`, `updatedAt`. IDs are MongoDB ObjectIds exposed as strings.
- **Indexes:** `createdAt` descending for list ordering. No compound indexes yet; sufficient for small/medium datasets.

### Docker

- **Services:** `mongo`, `backend`, `frontend`. Backend and frontend are built from their own Dockerfiles; frontend build uses **repo root** as context so it can copy `backend/shared` and resolve the `shared` alias during Vite build.
- **Backend:** Multi-stage-style: install deps, copy source, build TypeScript, then production run with `node dist/src/index.js`. MongoDB connection retries with backoff until the DB is ready.
- **Frontend:** Builds with Vite; serves static assets via `vite preview`. `VITE_API_BASE_URL` is set at build time so the built app knows the API origin (e.g. `http://localhost:3001`).

### Design choices

| Choice | Rationale |
|--------|------------|
| Joi for validation | Schema-based, reusable, and keeps validation out of controllers. |
| Single error middleware | Consistent API error shape and status codes from one place. |
| Shared `backend/shared` | One source of truth for types and enums; frontend aliases it via Vite/tsconfig. |
| Server-side status/priority filters | Reduces payload and keeps filtering consistent; search stays client-side for responsiveness. |
| No auth in this repo | Focus on ticket CRUD and board UX; auth can be added later (e.g. JWT middleware). |

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # optional: set MONGODB_URI, PORT
npm install
npm run dev
```

**Server:** http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**App:** http://localhost:5173 (proxies `/api` to backend when using Vite dev server)

### Docker (one command)

From the project root:

```bash
docker compose up --build
```

**Important:** Use `--build` so image includes your latest code. Plain `docker compose up` reuses existing images, so code changes won’t appear until you rebuild.

- Backend API: http://localhost:3001  
- Frontend: http://localhost:4173 (preview)  
- MongoDB: localhost:27017  

Stop with `Ctrl+C` or `docker compose down`.

**Development (live reload):** For fast feedback without rebuilding, run only MongoDB in Docker and run backend/frontend locally:

```bash
docker compose up mongo -d
cd backend && npm run dev
cd frontend && npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Create ticket. Body: `{ "subject", "message", "priority" }`. Subject min 5 chars, message min 10. Priority: `Low`, `Medium`, `High`. |
| `GET`  | `/api/tickets` | List all tickets (newest first). |
| `GET`  | `/api/tickets?search=payment` | Search tickets by subject/message. |
| `GET`  | `/api/tickets?status=NEW` | Filter by status (`NEW`, `INVESTIGATING`, `RESOLVED`). |
| `GET`  | `/api/tickets?priority=High` | Filter by priority (`Low`, `Medium`, `High`). |
| `GET`  | `/api/tickets?page=1&limit=10` | Pagination. Response: `{ "tickets", "total" }`. |
| `PATCH`| `/api/tickets/:id` | Update ticket. Body: at least one of `{ "status", "subject", "message", "priority" }`. Status: `NEW`, `INVESTIGATING`, `RESOLVED`. |
| `GET`  | `/health` | Liveness. Returns `{ "status": "ok" }`. |
| `GET`  | `/ready` | Readiness (MongoDB connected). Returns `{ "status", "mongodb" }`. |

### Response shapes

- **Success:** Ticket object(s) as JSON (`id`, `subject`, `message`, `priority`, `status`, `createdAt`, `updatedAt`).
- **Error:** `{ "error": "string" }` with appropriate HTTP status (400 validation, 404 not found, 500 server error).

## Project Structure

```
backend/
  controllers/   # HTTP request handlers (ticketController)
  routes/       # API routes (ticketRoutes)
  services/     # Business logic (ticketService)
  models/       # Mongoose models (Ticket)
  schemas/      # Joi validation schemas (createTicketSchema, patchTicketSchema)
  middleware/   # validateJoi, errorHandler
  shared/       # Shared TypeScript types (Ticket, Priority, Status)
  server: index.ts → app.ts
frontend/
  api/          # API client (tickets)
  components/   # BoardView, TicketCard, StatusBadge, PriorityBadge, modals
  App.tsx, main.tsx
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port. |
| `MONGODB_URI` | `mongodb://localhost:27017/support-tickets` | MongoDB connection string. |
| `VITE_API_BASE_URL` | (none) | Frontend: base URL for API when not using dev proxy (e.g. Docker: `http://localhost:3001`). |

## Backend Tests

Requires MongoDB (local or Atlas). Uses a test DB (e.g. `support-tickets-test`).

```bash
cd backend
npm test
```

---

**Summary:** Full-stack support ticket board with a layered backend (routes → controllers → services → models), Joi validation, centralized error handling, and health/ready endpoints. Frontend: React SPA with server-side status/priority filtering, client-side search, and a Kanban board with status/priority badges, loading/error states, and create/edit/update flows. Types and enums are shared via `backend/shared`; Docker builds the frontend from repo root so that alias resolves correctly.
