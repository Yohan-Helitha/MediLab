# Testing Instruction Report — Inventory Module (MediLab)

**Module:** Inventory (Backend + Frontend)  
**Repo type:** Monorepo
- Backend: `apps/backend` (Node.js + Express + MongoDB + Jest + Supertest + Artillery)
- Frontend: `apps/web` (React + Vite + Vitest + React Testing Library)

**Date:** April 2026

---

## 1. Testing environment configuration (Inventory)

### 1.1 Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB (Atlas or local)

### 1.2 Environment variables
Backend loads env vars from the **repo root** `.env`.

Minimum backend config for inventory tests:
- `DATABASE_URL`
- `DATABASE_URL_TEST` (recommended)
- `JWT_SECRET`

Reference: `apps/backend/src/config/environment.js`, `apps/backend/src/config/db.js`.

---

## 2. Backend unit tests (Inventory)

### 2.1 Install dependencies
```bash
npm -C apps/backend install
```

### 2.2 Run Inventory service tests
Inventory tests currently include:
- `apps/backend/src/modules/inventory/inventory.service.test.js`

Run inventory unit/service tests:
```bash
npm -C apps/backend test -- src/modules/inventory/inventory.service.test.js
```

---

## 3. Backend integration tests (Inventory)

### 3.1 Integration test file
- `apps/backend/src/modules/inventory/inventory.routes.int.test.js`

### 3.2 Run inventory route integration tests
```bash
npm -C apps/backend test -- src/modules/inventory/inventory.routes.int.test.js
```

---

## 4. Frontend tests (Inventory)

### 4.1 Install dependencies
```bash
npm -C apps/web install
```

### 4.2 Run inventory module tests
Inventory critical flow test:
- `apps/web/tests/inventory/inventory.create.test.jsx`

Run only inventory test:
```bash
npm -C apps/web run test -- tests/inventory/inventory.create.test.jsx
```

Run all frontend tests:
```bash
npm -C apps/web test
```

---

## 5. Performance testing (Inventory)

### 5.1 Start backend
```bash
npm -C apps/backend run dev
```

### 5.2 Run Artillery suites
From `apps/backend`:
```bash
cd apps/backend
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

Important:
- `api.performance.config.yaml` currently targets `http://localhost:3000`; adjust to your backend port if needed (commonly `5000`).

### 5.3 Inventory-specific load testing
There is no inventory-specific Artillery scenario committed yet.
For grading against “various loads” requirement, extend an existing Artillery config with inventory routes.

---

## 6. Optional: API-level integration testing via Postman
```bash
npx newman run medilab-booking-inventory.postman_collection.json
```

(Requires backend running and the collection variables set correctly.)
