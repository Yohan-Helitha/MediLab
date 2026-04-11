# Testing Instruction Report — Lab Module (MediLab)

**Module:** Lab Operations (Labs + Lab Tests + Test Instructions)  
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
Backend loads env vars from the **repo root** `.env` (see `apps/backend/src/config/environment.js`).

Minimum backend test configuration:
- `DATABASE_URL`
- `DATABASE_URL_TEST` — recommended for running Jest tests safely
- `JWT_SECRET`

Database safety behavior:
- During Jest runs, backend prefers `DATABASE_URL_TEST`.
- If `DATABASE_URL_TEST` is missing, it attempts to derive a safe `_test` DB name from `DATABASE_URL`.
- If it cannot derive safely, it errors instead of risking writes.

Reference: `apps/backend/src/config/db.js`.

Frontend configuration:
- `VITE_API_BASE_URL` is only needed when running the web app against a live backend.
- Frontend unit tests use mocks where needed.

---

## 2. Backend testing (Jest)

### 2.1 Install dependencies
```bash
npm -C apps/backend install
```

### 2.2 Unit/service tests (Lab module)
The lab module currently includes service-level tests:
- `apps/backend/src/modules/lab/lab.service.test.js`
- `apps/backend/src/modules/lab/labTest.service.test.js`
- `apps/backend/src/modules/lab/testInstruction.service.test.js`

Run them individually:
```bash
npm -C apps/backend test -- src/modules/lab/lab.service.test.js
npm -C apps/backend test -- src/modules/lab/labTest.service.test.js
npm -C apps/backend test -- src/modules/lab/testInstruction.service.test.js
```

Run all lab module tests:
```bash
npm -C apps/backend test -- src/modules/lab
```

Note on naming:
- Some backend npm scripts use `--testPathPattern=unit.test.js`, but these lab tests are named `*.service.test.js`. Running by explicit path (as above) is the reliable approach.

---

## 3. Backend integration testing setup and execution (Jest + Supertest)

Integration test files:
- `apps/backend/src/modules/lab/lab.routes.int.test.js`
- `apps/backend/src/modules/lab/labTest.routes.int.test.js`
- `apps/backend/src/modules/lab/testInstruction.routes.int.test.js`

Run integration tests:
```bash
npm -C apps/backend test -- src/modules/lab/lab.routes.int.test.js
npm -C apps/backend test -- src/modules/lab/labTest.routes.int.test.js
npm -C apps/backend test -- src/modules/lab/testInstruction.routes.int.test.js
```

If you see timeouts or DB contention, run serially:
```bash
npm -C apps/backend test -- src/modules/lab --runInBand
```

---

## 4. Frontend testing (Vitest)

### 4.1 Install dependencies
```bash
npm -C apps/web install
```

### 4.2 Run lab-related UI tests
Existing lab/test-management UI tests live in:
- `apps/web/src/pages/__tests__/LabManagementPage.test.jsx`
- `apps/web/src/pages/__tests__/TestManagementPage.test.jsx`
- `apps/web/src/pages/__tests__/TestAvailabilityPage.test.jsx`

Run a specific test file:
```bash
npm -C apps/web run test -- src/pages/__tests__/LabManagementPage.test.jsx
```

Run all frontend tests:
```bash
npm -C apps/web test
```

---

## 5. Performance testing setup and execution

This repo uses Artillery for “various loads” testing.

### 5.1 Install (already included in backend devDependencies)
```bash
npm -C apps/backend install
```

### 5.2 Start the backend
```bash
npm -C apps/backend run dev
```

### 5.3 Run existing Artillery suites (baseline)
From `apps/backend`:
```bash
cd apps/backend
npm run perf:test
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

Important:
- `src/modules/__tests__/api.performance.config.yaml` currently targets `http://localhost:3000`. If your backend runs on `http://localhost:5000`, update the `config.target` value before running.

### 5.4 Lab-specific load testing
There is no lab-dedicated Artillery YAML committed yet.
To performance test Lab endpoints (`/api/labs`, `/api/lab-tests`, `/api/test-instructions`), duplicate an existing Artillery config and add flows for those routes.
