# Testing Instruction Report — Booking Module (MediLab)

**Module:** Booking (Backend + Frontend)  
**Repo type:** Monorepo
- Backend: `apps/backend` (Node.js + Express + MongoDB + Jest + Supertest + Artillery)
- Frontend: `apps/web` (React + Vite + Vitest + React Testing Library)

**Date:** April 2026

---

## 1. Testing environment configuration (Booking)

### 1.1 Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB (Atlas or local)

### 1.2 Environment variables
Backend loads env vars from the **repo root** `.env` via `apps/backend/src/config/environment.js`.

Minimum backend config for booking tests:
- `DATABASE_URL` — base DB URL
- `DATABASE_URL_TEST` — strongly recommended (Jest uses this to avoid touching real data)
- `JWT_SECRET`

Frontend (only needed for running the app, not unit tests):
- `VITE_API_BASE_URL` (optional for unit tests; integration/E2E needs a backend)

Booking + PayHere checkout integration (used by booking flows):
- `MERCHANT_ID`
- `MERCHANT_SECRET`
- `APP_URL` (backend public URL)
- `FRONTEND_URL` (frontend base URL)

Database safety note:
- During Jest runs, backend prefers `DATABASE_URL_TEST`.
- If `DATABASE_URL_TEST` is missing, it attempts to derive a safe test DB name by appending `_test` to the DB name in `DATABASE_URL`.
- If it cannot derive safely, it errors instead of risking writes.

Reference: `apps/backend/src/config/db.js`.

---

## 2. Backend unit tests (Booking)

### 2.1 Install dependencies
```bash
npm -C apps/backend install
```

### 2.2 Run Booking unit tests
Booking unit tests currently live at:
- `apps/backend/src/modules/booking/__tests__/booking.service.unit.test.js`

Run only booking unit tests:
```bash
npm -C apps/backend test -- src/modules/booking/__tests__/booking.service.unit.test.js
```

Run all backend tests (slower):
```bash
npm -C apps/backend run test:all
```

---

## 3. Backend integration tests (Booking)

### 3.1 Integration test file
- `apps/backend/src/modules/booking/__tests__/booking.integration.test.js`

### 3.2 Test database setup
- Set `DATABASE_URL_TEST` to a dedicated test database.
- Ensure your MongoDB user has permissions to create collections.

### 3.3 Run Booking integration tests
```bash
npm -C apps/backend test -- src/modules/booking/__tests__/booking.integration.test.js
```

Notes:
- These tests use `supertest` against the Express `app` and connect to MongoDB.
- If the test suite fails due to timeouts, try serial execution:
```bash
npm -C apps/backend test -- src/modules/booking/__tests__/booking.integration.test.js --runInBand
```

---

## 4. Frontend tests (Booking)

### 4.1 Install dependencies
```bash
npm -C apps/web install
```

### 4.2 Run booking module tests
Booking critical flow test:
- `apps/web/tests/booking/booking.create.test.jsx`

Run only the booking test:
```bash
npm -C apps/web run test -- tests/booking/booking.create.test.jsx
```

Run all frontend tests:
```bash
npm -C apps/web test
```

---

## 5. Performance testing (Booking)

This repo uses Artillery for “various loads” testing.

### 5.1 Install (already in backend devDependencies)
```bash
npm -C apps/backend install
```

### 5.2 Start the backend
```bash
npm -C apps/backend run dev
```

### 5.3 Run existing Artillery suites
From `apps/backend`:
```bash
cd apps/backend
npx artillery run artillery-auth.yml
npx artillery run artillery-patient.yml
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

Important:
- The file `src/modules/__tests__/api.performance.config.yaml` currently targets `http://localhost:3000`.
- If your backend runs on `http://localhost:5000`, update the `config.target` value before running.

### 5.4 Booking-specific load testing
There is no booking-dedicated Artillery YAML committed yet.
To load test booking endpoints, copy an existing Artillery scenario and add flows for booking routes (e.g., `POST /api/bookings`, `GET /api/bookings/...`).

---

## 6. Optional: API-level integration testing via Postman
If you want module integration checks without writing code, run a Postman collection via Newman:
```bash
npx newman run medilab-booking-inventory.postman_collection.json
```

(Requires the backend to be running and the collection variables to match your local URLs.)
