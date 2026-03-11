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

**Summary:** Layered backend (routes → controllers → services → models), Joi validation, centralized error handling, health/ready endpoints, and a polished frontend with status/priority badges, loading/error states, and ticket status update in the UI.
