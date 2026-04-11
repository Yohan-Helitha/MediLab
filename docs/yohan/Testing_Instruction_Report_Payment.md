# Testing Instruction Report — Payment Module (PayHere) (MediLab)

**Module:** Payment / PayHere (Backend + Frontend)  
**Repo type:** Monorepo
- Backend: `apps/backend` (Node.js + Express + MongoDB + Jest + Supertest + Artillery)
- Frontend: `apps/web` (React + Vite + Vitest + React Testing Library)

**Date:** April 2026

---

## 1. Testing environment configuration (Payment)

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

PayHere config (from `docs/yohan/PAYHERE_INTEGRATION.md` and `apps/backend/src/modules/payment/payhere.controller.js`):
- `MERCHANT_ID`
- `MERCHANT_SECRET`
- `APP_URL` (backend public URL, e.g. `http://localhost:5000`)
- `FRONTEND_URL` (frontend URL, e.g. `http://localhost:5173`)

Optional:
- `PAYHERE_CHECKOUT_URL` (defaults to PayHere sandbox)
- `PAYHERE_CURRENCY` (default `LKR`)
- `PAYHERE_COUNTRY` (default `Sri Lanka`)

Local testing note:
- PayHere must reach `APP_URL/api/payments/payhere/notify`. For localhost, use a tunnel (e.g. ngrok) and set `APP_URL` to the public URL.

---

## 2. Backend unit tests (Payment)

### 2.1 Current state
There are currently **no dedicated Jest `*.test.js` files** under `apps/backend/src/modules/payment/`.

### 2.2 How to run unit tests once added
If/when you add unit tests for `payhere.service.js` (hash + md5 signature validation), run:
```bash
npm -C apps/backend test -- src/modules/payment
```

---

## 3. Backend integration testing setup and execution (Payment)

### 3.1 Endpoints under test
Mounted at: `/api/payments/payhere`
- `POST /api/payments/payhere/checkout` (patient-authenticated)
- `POST /api/payments/payhere/notify` (webhook; no auth)

### 3.2 Practical integration validation (recommended)
Because the real PayHere notify callback is server-to-server, the most reliable local workflow is:
1) Run booking checkout test coverage (booking module tests cover creating the checkout payload)
2) Validate finance recording logic (finance module tests cover recording payments)

Run relevant backend tests:
```bash
npm -C apps/backend test -- src/modules/booking/__tests__/booking.integration.test.js
npm -C apps/backend test -- src/modules/finance/finance.service.test.js
```

### 3.3 Manual notify simulation
You can simulate notify by posting a form-encoded body to your backend notify endpoint (requires correct `md5sig`).
For full details, see: `docs/yohan/PAYHERE_INTEGRATION.md`.

---

## 4. Frontend tests (Payment)

### 4.1 Install dependencies
```bash
npm -C apps/web install
```

### 4.2 Run payment-related frontend tests
PayHere checkout is exercised as part of booking flow tests:
- `apps/web/tests/booking/booking.create.test.jsx` (mocks PayHere checkout creation)

Run the booking test:
```bash
npm -C apps/web run test -- tests/booking/booking.create.test.jsx
```

---

## 5. Performance testing (Payment)

There is no payment-specific Artillery scenario committed yet.

### 5.1 Start backend
```bash
npm -C apps/backend run dev
```

### 5.2 Run existing Artillery config (baseline)
From `apps/backend`:
```bash
cd apps/backend
npx artillery run src/modules/__tests__/api.performance.config.yaml
```

Notes:
- Update `config.target` as needed (backend commonly runs on `http://localhost:5000`).
- For a payment-specific load test, extend the Artillery flows with `POST /api/payments/payhere/checkout` (requires auth token + a valid booking).

---

## 6. Optional: API-level integration testing via Postman
```bash
npx newman run MediLab.postman_collection.json
```

(Requires backend running + collection variables configured.)
