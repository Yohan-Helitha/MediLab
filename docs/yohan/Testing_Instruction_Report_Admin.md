# Testing Instruction Report — Admin Module (MediLab)

**Module:** Admin (Backend + Frontend)  
**Repo type:** Monorepo
- Backend: `apps/backend` (Node.js + Express + MongoDB + Jest + Supertest + Artillery)
- Frontend: `apps/web` (React + Vite + Vitest + React Testing Library)

**Date:** April 2026

---

## 1. Testing environment configuration (Admin)

### 1.1 Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB (Atlas or local)

### 1.2 Environment variables
Backend loads env vars from the **repo root** `.env`.

Minimum backend config:
- `DATABASE_URL`
- `DATABASE_URL_TEST` (recommended)
- `JWT_SECRET`

Reference: `apps/backend/src/config/environment.js`, `apps/backend/src/config/db.js`.

---

## 2. Backend unit tests (Admin)

### 2.1 Install dependencies
```bash
npm -C apps/backend install
```

### 2.2 Run Admin unit tests
Admin unit tests:
- `apps/backend/src/modules/admin/admin.service.unit.test.js`

Run:
```bash
npm -C apps/backend test -- src/modules/admin/admin.service.unit.test.js
```

---

## 3. Backend integration tests (Admin)

### 3.1 Integration test file
- `apps/backend/src/modules/admin/__tests__/admin.users.integration.test.js`

### 3.2 Run integration tests
```bash
npm -C apps/backend test -- src/modules/admin/__tests__/admin.users.integration.test.js
```

---

## 4. Frontend tests (Admin)

### 4.1 Install dependencies
```bash
npm -C apps/web install
```

### 4.2 Run admin-related page tests
Admin-related page tests under `apps/web/src/pages/__tests__/` include:
- `LabManagementPage.test.jsx`
- `TestManagementPage.test.jsx`
- `TestAvailabilityPage.test.jsx`

Run a specific test file:
```bash
npm -C apps/web run test -- src/pages/__tests__/LabManagementPage.test.jsx
```

Or run the whole frontend test suite:
```bash
npm -C apps/web test
```

---

## 5. Performance testing (Admin)

### 5.1 Start backend
```bash
npm -C apps/backend run dev
```

### 5.2 Run included performance suites
From `apps/backend`:
```bash
cd apps/backend
npm run perf:test
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

Notes:
- `npm run perf:test` runs `perf/test-management-perf.yml` (admin-adjacent, not a full admin suite).
- Update `src/modules/__tests__/api.performance.config.yaml` `config.target` to match your backend port if needed.

---

## 6. Optional: API-level integration testing via Postman
```bash
npx newman run MediLab.postman_collection.json
```

(Requires backend running + collection variables configured.)
