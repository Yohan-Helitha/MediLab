# Testing Instruction Report — Test Type Module (MediLab)

**Module:** Test Types (Diagnostic test definitions)  
**Repo type:** Monorepo
- Backend: `apps/backend` (Node.js + Express + MongoDB + Jest + Supertest + Artillery)
- Frontend: `apps/web` (React + Vite + Vitest + React Testing Library)

**Date:** April 2026

---

## 1. Testing environment configuration

### 1.1 Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB (Atlas or local)

### 1.2 Environment variables
Backend loads env vars from the **repo root** `.env`.

Minimum backend test configuration:
- `DATABASE_URL`
- `DATABASE_URL_TEST` — recommended
- `JWT_SECRET`

Database safety behavior:
- During Jest runs, backend prefers `DATABASE_URL_TEST`.
- If missing, it attempts to derive a safe `_test` DB name from `DATABASE_URL`.

Reference: `apps/backend/src/config/db.js`.

---

## 2. Backend testing (Jest)

### 2.1 Install dependencies
```bash
npm -C apps/backend install
```

### 2.2 Unit/service tests (Test Type module)
Existing tests:
- `apps/backend/src/modules/test/test.service.test.js`

Run:
```bash
npm -C apps/backend test -- src/modules/test/test.service.test.js
```

Run all tests under the module folder:
```bash
npm -C apps/backend test -- src/modules/test
```

---

## 3. Backend integration testing setup and execution

Integration test file:
- `apps/backend/src/modules/test/test.routes.int.test.js`

Run:
```bash
npm -C apps/backend test -- src/modules/test/test.routes.int.test.js
```

---

## 4. Frontend testing (Vitest)

Frontend test-management UIs are covered by:
- `apps/web/src/pages/__tests__/TestManagementPage.test.jsx`
- `apps/web/src/pages/__tests__/TestAvailabilityPage.test.jsx`

Install + run:
```bash
npm -C apps/web install
npm -C apps/web run test -- src/pages/__tests__/TestManagementPage.test.jsx
```

---

## 5. Performance testing setup and execution

### 5.1 Start backend
```bash
npm -C apps/backend run dev
```

### 5.2 Run existing Artillery suite (baseline)
From `apps/backend`:
```bash
cd apps/backend
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

Important:
- Update `config.target` in the YAML if your backend port is not `3000`.

### 5.3 TestType-specific load testing
There is no committed Artillery scenario dedicated to `/api/test-types` yet.
To benchmark this module, extend the Artillery flows with `GET /api/test-types` and staff-authenticated CRUD routes.
