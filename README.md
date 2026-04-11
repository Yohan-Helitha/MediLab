# MediLab

Medical Laboratory Management System.

This repository is a monorepo:
- Backend: `apps/backend` (Node.js + Express + MongoDB)
- Frontend: `apps/web` (React + Vite)

---

## 1. Quick Start (Local)

### 1.1 Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (recommended)
- MongoDB Atlas (recommended) or local MongoDB

### 1.2 Install dependencies

```bash
npm -C apps/backend install
npm -C apps/web install
```

### 1.3 Environment variables

Important: backend loads environment variables from the **repo root** `.env` file (see `apps/backend/src/config/environment.js`).

Create a `.env` file at the repository root:

```env
# Backend (required)
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=change_me

# Backend (recommended for running Jest safely)
DATABASE_URL_TEST=mongodb+srv://<user>:<pass>@<cluster>/<db>_test

# Frontend URL (used by some backend flows)
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5000

# PayHere (only required if demonstrating online payments)
MERCHANT_ID=
MERCHANT_SECRET=
# PAYHERE_CHECKOUT_URL=https://sandbox.payhere.lk/pay/checkout
# PAYHERE_CURRENCY=LKR
# PAYHERE_COUNTRY=Sri Lanka

# Optional third-party integrations
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=MediLab
GOOGLE_TRANSLATE_API_KEY=
```

Frontend uses `VITE_API_BASE_URL` (set in `apps/web/.env` for local development if you want):

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 1.4 Run the app

Backend:

```bash
npm -C apps/backend run dev
```

Frontend:

```bash
npm -C apps/web run dev
```

Health check:

```bash
curl http://localhost:5000/api/health
```

---

## 2. API Endpoint Documentation (University Requirement)

Base URL (local): `http://localhost:5000/api`

### 2.1 Major route groups

- Auth: `/api/auth`
- Patient: `/api/members`, `/api/households`, `/api/health-details`, `/api/allergies`, `/api/chronic-diseases`, `/api/medications`, `/api/past-medical-history`, `/api/emergency-contacts`, `/api/family-members`, `/api/family-relationships`, `/api/visits`, `/api/referrals`
- Booking: `/api/bookings`
- Inventory: `/api/inventory`, `/api/equipment`
- Finance/Admin: `/api/finance`, `/api/admin`
- Labs/Test Types/Test Instructions: `/api/labs`, `/api/test-types`, `/api/lab-tests`, `/api/test-instructions`
- Payments (PayHere): `/api/payments/payhere`

The full request/response formats, auth requirements, and examples are documented in:
- `files/lakni/AUTH_API_DOCUMENTATION.md`
- `files/lakni/PATIENT_API_DOCUMENTATION.md`
- `docs/yohan/PAYHERE_INTEGRATION.md`
- `docs/yohan/PAYMENT_TO_FINANCE_FLOW.md`

Also included:
- Postman collection: `docs/Afham/MediLab_Test_Management_COMPLETE.postman_collection.json`

### 2.2 Minimal API examples (cURL)

Health check:

```bash
curl -X GET http://localhost:5000/api/health
```

Patient register (PayHere-ready login flow uses patient auth endpoints):

```bash
curl -X POST http://localhost:5000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","contact_number":"0712345678","password":"SecurePassword@123"}'
```

Create booking (requires JWT):

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"patientProfileId":"<Member._id>","healthCenterId":"<Lab._id>","diagnosticTestId":"<TestType._id>","bookingDate":"2026-04-15","bookingType":"PRE_BOOKED","paymentMethod":"ONLINE"}'
```

PayHere checkout payload (requires JWT):

```bash
curl -X POST http://localhost:5000/api/payments/payhere/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"bookingId":"<Booking._id>"}'
```

---

## 3. Deployment (University Requirement)

Recommended easiest platforms:
- Backend: Render
- Frontend: Vercel

Deployment report (required):
- `docs/yohan/Deployment_Report.md`

Quick notes:
- Backend Root Directory: `apps/backend`
- Frontend Root Directory: `apps/web`
- Backend env vars: `DATABASE_URL`, `JWT_SECRET`, `APP_URL`, `FRONTEND_URL` (+ PayHere vars if needed)
- Frontend env vars: `VITE_API_BASE_URL`

Live URLs (update if you re-deploy):
- Backend API: `https://medilab-l74h.onrender.com`
- Frontend app: `https://medi-bz1hqvtzb-yohan-helithas-projects.vercel.app/`

---

## 4. Testing (University Requirement)

Testing instruction report (required):
- `docs/yohan/Testing_Instruction_Report.md`

Quick commands:

```bash
# Backend
npm -C apps/backend run test:unit
npm -C apps/backend run test:integration
npm -C apps/backend run test:performance

# Backend load testing (Artillery)
npm -C apps/backend run perf:test

# Frontend
npm -C apps/web test
```

Additional references:
- `PERFORMANCE_TESTING.md`
- `files/lakni/tests/TESTING.md`
- `files/lakni/tests/TEST_EXECUTION_GUIDE.md`
- `files/lakni/tests/TEST_QUICKSTART.md`

