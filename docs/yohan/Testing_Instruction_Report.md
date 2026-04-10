# Testing Instruction Report — MediLab

**Project:** MediLab (Medical Laboratory Management System)  
**Repo type:** Monorepo  
- Backend: `apps/backend` (Node.js + Express + MongoDB + Jest + Supertest + Artillery)  
- Frontend: `apps/web` (React + Vite + Vitest + React Testing Library)

**Date:** April 2026

---

## 1. Testing Environment Configuration

### 1.1 Prerequisites

- Node.js: 18+ recommended
- npm: 9+ recommended
- MongoDB: Atlas or local MongoDB

### 1.2 Environment variables

Backend loads env vars from the **repo root** `.env` (see `apps/backend/src/config/environment.js`).

Minimum backend test configuration:
- `DATABASE_URL` — used for dev/prod runs
- `DATABASE_URL_TEST` — recommended for running Jest tests safely
- `JWT_SECRET`

Frontend configuration:
- `VITE_API_BASE_URL` — only needed when running the app against a live backend (frontend unit tests mock APIs where needed)

---

## 2. Backend Testing (Jest)

### 2.1 Install dependencies

```bash
npm -C apps/backend install
```

### 2.2 Unit tests

Run unit tests (pattern-based):

```bash
npm -C apps/backend run test:unit
```

### 2.3 Integration tests

Run integration tests (pattern-based):

```bash
npm -C apps/backend run test:integration
```

### 2.4 Module-scoped test runs (optional)

```bash
npm -C apps/backend run test:auth
npm -C apps/backend run test:patient
```

### 2.5 Notes on database safety

When Jest runs, the backend tries to use `DATABASE_URL_TEST`.
- If `DATABASE_URL_TEST` is not set, it attempts to derive a safe test database name from `DATABASE_URL` by appending `_test`.
- If it cannot derive safely, it will error instead of risking writes to a real DB.

Implementation reference: `apps/backend/src/config/db.js`.

---

## 3. Backend Performance Testing

This repo has **two** performance-testing approaches:

1) **Artillery load tests (recommended for “various loads” requirement)**  
2) **Jest “performance” tests (quick concurrency checks in CI/dev)**

### 3.1 Artillery (load testing)

#### Install (already included in backend devDependencies)

```bash
npm -C apps/backend install
```

#### Start the backend

In one terminal:

```bash
npm -C apps/backend run dev
```

#### Run the included Artillery suites

In another terminal (run from `apps/backend` so relative paths work):

```bash
cd apps/backend

# Test Management component perf suite (script)
npm run perf:test

# Auth load test
npx artillery run artillery-auth.yml

# Patient load test
npx artillery run artillery-patient.yml
```

What these tests cover:
- **Various loads** using phased traffic patterns (warm-up → ramp-up → peak → cool-down)
- **Simultaneous requests** driven by Artillery’s virtual users and `arrivalRate`
- Reported metrics include latency percentiles (p50/p95), request rate, and error rate

Artifacts generated:
- `apps/backend/reports/artillery-auth-results.json`
- `apps/backend/reports/artillery-patient-results.json`

#### Additional Artillery config

There is also an Artillery config under:
- `apps/backend/src/modules/__tests__/api.performance.config.yaml`

Run:

```bash
cd apps/backend
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

### 3.2 Jest-based performance tests

Run Jest performance tests:

```bash
npm -C apps/backend run test:performance
```

Notes:
- `apps/backend/tests/auth/auth.performance.test.js` contains explicit concurrency tests using `Promise.all(...)` (e.g., concurrent registrations/logins/token checks).
- `apps/backend/src/modules/__tests__/api.performance.test.js` exists but currently references undefined helpers/constants (so it may require cleanup before it can be used reliably in CI).

---

## 4. Frontend Testing (Vitest)

### 4.1 Install dependencies

```bash
npm -C apps/web install
```

### 4.2 Run all frontend tests

```bash
npm -C apps/web test
```

### 4.3 Run module tests under `apps/web/tests/` (critical flows)

```bash
npm -C apps/web run test -- \
  tests/booking/booking.create.test.jsx \
  tests/inventory/inventory.create.test.jsx \
  tests/finance/finance.create.test.jsx
```

### 4.4 Coverage (optional)

```bash
npm -C apps/web run test:coverage
```

---

## 5. Performance Testing Requirement Mapping

Requirement: “Evaluate the API’s performance under various loads and ensure it can handle multiple requests simultaneously without significant latency.”

How this repo satisfies it:
- Artillery suites use multiple phases (warm-up/ramp/peak) which test various load levels.
- Jest performance tests validate concurrent behavior at fixed concurrency levels.

For grading, prefer reporting results from Artillery runs (latency percentiles + error rate) because it more directly matches “various loads” evaluation.

---

## 6. Troubleshooting

- Backend `npm run dev` exits immediately
  - Ensure `DATABASE_URL` and `JWT_SECRET` are set
  - Ensure MongoDB Atlas IP allowlist/network access is configured
- Artillery failures on auth endpoints
  - Confirm backend is running on the same `target` URL in the YAML (`http://localhost:5000` by default)
- PayHere notify endpoint cannot be tested locally
  - Use a tunnel (ngrok) and set `APP_URL` to the public URL

---

## 7. References (existing docs in repo)

- Full setup guide: `MEDILAB_COMPLETE_SETUP_GUIDE.md`
- More testing docs: `files/lakni/tests/TESTING_INSTRUCTION_REPORT.md`, `TEST_EXECUTION_GUIDE.md`, `TEST_QUICKSTART.md`
- Performance notes: `PERFORMANCE_TESTING.md`
