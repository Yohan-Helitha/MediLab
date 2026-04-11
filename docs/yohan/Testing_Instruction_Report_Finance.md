# Testing Instruction Report — Finance Module (MediLab)

**Module:** Finance / Payments recording (Backend + Frontend)  
**Repo type:** Monorepo
- Backend: `apps/backend` (Node.js + Express + MongoDB + Jest + Supertest + Artillery)
- Frontend: `apps/web` (React + Vite + Vitest + React Testing Library)

**Date:** April 2026

---

## 1. Testing environment configuration (Finance)

### 1.1 Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB (Atlas or local)

### 1.2 Environment variables
Backend loads env vars from the **repo root** `.env`.

Minimum backend config for finance tests:
- `DATABASE_URL`
- `DATABASE_URL_TEST` (recommended)
- `JWT_SECRET`

Frontend:
- `VITE_API_BASE_URL` only needed when running the app against a live backend

Reference: `apps/backend/src/config/environment.js`, `apps/backend/src/config/db.js`.

---

## 2. Backend unit tests (Finance)

### 2.1 Install dependencies
```bash
npm -C apps/backend install
```

### 2.2 Run Finance service tests
Finance tests currently include:
- `apps/backend/src/modules/finance/finance.service.test.js`

Run finance unit/service tests:
```bash
npm -C apps/backend test -- src/modules/finance/finance.service.test.js
```

Note on naming:
- The backend script `test:unit` only runs files matching `unit.test.js`.
- Some finance tests are named `*.service.test.js`, so run them by explicit path (as above).

---

## 3. Backend integration tests (Finance)

### 3.1 Integration test file
- `apps/backend/src/modules/finance/finance.routes.int.test.js`

### 3.2 Run Finance route integration tests
```bash
npm -C apps/backend test -- src/modules/finance/finance.routes.int.test.js
```

If you see DB-related failures:
- Confirm `DATABASE_URL_TEST` is set
- Confirm MongoDB is reachable

---

## 4. Frontend tests (Finance)

### 4.1 Install dependencies
```bash
npm -C apps/web install
```

### 4.2 Run finance module tests
Finance critical flow test:
- `apps/web/tests/finance/finance.create.test.jsx`

Run only finance test:
```bash
npm -C apps/web run test -- tests/finance/finance.create.test.jsx
```

Run all frontend tests:
```bash
npm -C apps/web test
```

---

## 5. Performance testing (Finance)

### 5.1 Start backend
```bash
npm -C apps/backend run dev
```

### 5.2 Run Artillery suites
From `apps/backend`:
```bash
cd apps/backend
npm run perf:test
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

Notes:
- `npm run perf:test` runs `perf/test-management-perf.yml` (not finance-specific).
- `api.performance.config.yaml` is an Artillery config; update `config.target` if needed.

### 5.3 Finance-specific load testing
There is no finance-specific Artillery scenario committed yet.
Recommended approach:
- Duplicate an existing Artillery YAML and add finance flows (e.g., list payments, record cash payment).


