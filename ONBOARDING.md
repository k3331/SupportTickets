# Ready to Add or Change Features

Follow this plan to get from "new to the repo" to "can add/change features confidently." **Total: ~1–2 days** (or a few hours if you skim and do one small change).

---

## Phase 1: Run & click (15–30 min)

1. **Run the app**
   ```bash
   docker compose up --build
   ```
   Open http://localhost:4173 (frontend) and http://localhost:3001/health (backend).

2. **Use the app**
   - Create a ticket (top-right **Create** → fill form → Submit).
   - See it on the board (To Do column).
   - Drag a card to another column (status updates).
   - Use the **⋮** menu on a card → **Edit** (change subject/message/priority) → **Save**.
   - Use the search box above the board (filter by subject/message/id).

3. **Run without Docker (optional but useful for dev)**
   - **Backend:** Terminal 1 — `cd backend && npm install && npm run dev` (needs MongoDB on localhost or set `MONGODB_URI` in `.env`).
   - **Frontend:** Terminal 2 — `cd frontend && npm install && npm run dev` → http://localhost:5173 (proxies `/api` to 3001).
   - **Tests:** `cd backend && npm test` (runs build then Jest).

---

## Phase 2: One flow end-to-end (45–60 min)

Trace **“Create ticket”** from UI to DB and back.

1. **Frontend**
   - **Entry:** `frontend/src/App.tsx` — “Create” button sets `createOpen` → `<CreateTicketModal />`.
   - **Modal:** `frontend/src/components/CreateTicketModal.tsx` — renders `<TicketForm />`.
   - **Form:** `frontend/src/components/TicketForm.tsx` — `createTicket()` from API, then `onCreated()` to close and refresh.
   - **API client:** `frontend/src/api/tickets.ts` — `createTicket(data)` → `POST /api/tickets` with `CreateTicketBody` (see shared types).

2. **Shared types**
   - **File:** `backend/shared/types.ts`
   - Defines `Ticket`, `CreateTicketBody`, `Priority`, `Status`. Same types are used by backend and frontend (frontend resolves `shared` via `vite.config.js` alias).

3. **Backend**
   - **Routes:** `backend/src/routes/ticketRoutes.ts` — `POST '/'` → `createTicketValidation`, `handleValidationErrors`, `ticketController.createTicket`.
   - **Validation:** `backend/src/middleware/validation.ts` — `createTicketValidation` (subject, message, priority) and `handleValidationErrors` (400 on failure).
   - **Controller:** `backend/src/controllers/ticketController.ts` — `createTicket(req, res, next)` → `ticketService.createTicket(req.body)` → `201` + JSON.
   - **Service:** `backend/src/services/ticketService.ts` — validates and calls repository.
   - **Model:** `backend/src/models/Ticket.ts` — Mongoose schema and `createTicket()` that writes to MongoDB.

4. **After create**
   - Modal closes, `onCreated()` runs → `fetchTickets()` in `App.tsx` → `GET /api/tickets` → list refreshes, new ticket appears on the board.

**Takeaway:** Request flows **Route → Validation → Controller → Service → Model**. Errors go to **errorHandler** (see `app.ts`). Types live in **shared/types.ts**.

---

## Phase 3: Key files to skim (30–45 min)

| What | Where | Why |
|------|--------|-----|
| App entry & routing | `backend/src/app.ts`, `backend/src/index.ts` | How routes and error handler are wired; server starts after DB connect. |
| Error handling | `backend/src/errors/AppError.ts`, `backend/src/middleware/errorHandler.ts` | All API errors become `{ error: string }` + status. |
| Board & cards | `frontend/src/components/BoardView.tsx`, `TicketCard.tsx` | How tickets are grouped by status, drag-and-drop, card menu (Edit / Move). |
| Edit flow | `frontend/src/components/EditTicketModal.tsx` | Uses `updateTicket(id, { subject, message, priority })`; same PATCH as “Move to” (status). |
| Docker | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` | What runs where; backend builds TS to `dist/`, frontend builds with `VITE_API_BASE_URL`. |
| Tests | `backend/__tests__/api/tickets.test.js` | Tests hit compiled app in `dist/`; pattern for adding new endpoint tests. |

---

## Phase 4: Practice feature (1–2 hours)

Do **one** small change so you’re sure you can add/change features.

### Option A: Add a “description” field to tickets

1. **Shared types** (`backend/shared/types.ts`)
   - Add `description?: string` to `Ticket`, `CreateTicketBody`, and `UpdateTicketBody` (optional for create/update if you want it backward-compatible).

2. **Backend**
   - **Model:** `backend/src/models/Ticket.ts` — add `description: { type: String, trim: true }` to the schema (optional).
   - **Validation:** `backend/src/middleware/validation.ts` — add optional `body('description').optional().trim()` to create and patch validations if you want it validated.
   - **Service:** `backend/src/services/ticketService.ts` — in `createTicket` and `updateTicket`, allow `description` and pass it through.

3. **Frontend**
   - **Create form:** `frontend/src/components/TicketForm.tsx` — add state and a text field for `description`, include it in `createTicket()` payload.
   - **Edit modal:** `frontend/src/components/EditTicketModal.tsx` — add state and field for `description`, include in `updateTicket()` payload.
   - **Card:** `frontend/src/components/TicketCard.tsx` — show `ticket.description` (e.g. under message or in a tooltip).

4. **Test**
   - In `backend/__tests__/api/tickets.test.js` add a test: create ticket with `description`, then PATCH it; assert response includes `description`.

### Option B: New endpoint `GET /api/tickets/:id`

1. **Backend**
   - **Model:** `getTicketById(id)` already exists in `backend/src/models/Ticket.ts`.
   - **Service:** Add `getTicket(id)` in `backend/src/services/ticketService.ts` that returns one ticket or throws `AppError('Ticket not found', 404)`.
   - **Controller:** Add `getTicket(req, res, next)` in `backend/src/controllers/ticketController.ts` (read `req.params.id`, call service, `res.json(ticket)` or `next(err)`).
   - **Routes:** In `backend/src/routes/ticketRoutes.ts` add `router.get('/:id', ticketController.getTicket)` (order: put it *after* `GET '/'` so `/` is not treated as `:id`).
   - **Validation (optional):** Add `param('id').isMongoId()` and use `handleValidationErrors` for that route.

2. **Frontend**
   - In `frontend/src/api/tickets.ts` add `getTicket(id): Promise<Ticket>` → `fetch(\`${API_BASE}/${id}\`)` and return `res.json()`.
   - Use it somewhere (e.g. open a “Detail” view or prefill edit modal from `getTicket` when you only have `id`).

3. **Test**
   - In `__tests__/api/tickets.test.js`: create a ticket, then `GET /api/tickets/:id` and assert status 200 and body; then `GET /api/tickets/invalid-id` and assert 400 or 404.

---

## Cheat sheet

| I want to… | Look at / change |
|------------|-------------------|
| Change API request/response shape | `backend/shared/types.ts`, then controllers + services + frontend `api/tickets.ts` and components. |
| Add a new API endpoint | `ticketRoutes.ts` → `ticketController.ts` → `ticketService.ts` (and model if needed). Add test in `__tests__/api/tickets.test.js`. |
| Add validation for a field | `backend/src/middleware/validation.ts` (create or patch validations). |
| Change board columns | `BoardView.tsx` — `COLUMNS` and the `byStatus` grouping. |
| Add UI state or a new component | `App.tsx` for global state; new component under `frontend/src/components/`, use shared types from `shared/types`. |
| Run backend tests | `cd backend && npm test` (builds then runs Jest). |

---

## When you’re ready

- **Add a feature:** Start from types in `shared/types.ts`, then backend (model → service → controller → route + validation), then frontend (API client → components), then test.
- **Change behavior:** Find the flow (e.g. “Edit” → `EditTicketModal` → `updateTicket` → PATCH route → service → model) and edit the layer that owns that behavior.

If you tell me the **exact feature** you want (e.g. “description field” or “GET by id”), I can outline the minimal list of files and code changes next.
