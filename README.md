# MediLab — Medical Laboratory Management System

MediLab is a monorepo:
- Backend: `apps/backend` (Node.js + Express + MongoDB)
- Frontend: `apps/web` (React + Vite)

This README is intentionally organized to match the university documentation requirement order:
1) Setup Instructions → 2) API Endpoint Documentation → 3) Deployment Report → 4) Testing Instruction Report.

---

## 1. Setup Instructions

### 1.1 Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas (recommended) or local MongoDB

### 1.2 Install dependencies

```bash
npm -C apps/backend install
npm -C apps/web install
```

### 1.3 Environment variables

Important: the backend loads environment variables from the **repo root** `.env` file (see `apps/backend/src/config/environment.js`).

Create `.env` at the repository root:

```env
# Backend (required)
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=change_me

# Backend (recommended for Jest safety)
# If omitted, the backend derives a safe "_test" database from DATABASE_URL during Jest runs.
DATABASE_URL_TEST=mongodb+srv://<user>:<pass>@<cluster>/<db>_test

# App URLs
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5000

# PayHere (only required if demonstrating online payments)
MERCHANT_ID=
MERCHANT_SECRET=
# PAYHERE_CHECKOUT_URL=https://sandbox.payhere.lk/pay/checkout
# PAYHERE_CURRENCY=LKR
# PAYHERE_COUNTRY=Sri Lanka

# Test Management Component (optional integrations)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=MediLab

GOOGLE_TRANSLATE_API_KEY=

# Cloudinary (optional; used for result uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Frontend API base URL (optional; for local dev create `apps/web/.env`):

```env
VITE_API_BASE_URL=http://localhost:5000
```

Third-party setup (Twilio / SendGrid / Cloudinary): see `docs/Afham/Third_Party_API_Setup_Guide.md`.

### 1.4 Run the app locally

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

### 1.5 (Optional) Seed demo data

If you want ready-made labs, test types, patients, bookings, and inventory for demos:

```bash
node apps/backend/src/seed.js
```

---

## 2. API Endpoint Documentation

### 2.1 Base URLs

- Local default backend base URL: `http://localhost:5000/api` (controlled by `PORT`)
- Deployed backend base URL (Render): `https://medilab-l74h.onrender.com/api`

### 2.2 Authentication

- JWT Bearer tokens are used for protected routes.
- Header format:

```http
Authorization: Bearer <token>
```

Typical access patterns:
- Public routes: most `GET` list/detail endpoints (labs, test types, health check)
- Patient routes: bookings (create/list own), PayHere checkout, patient health profile endpoints
- Staff/Health officer routes: admin dashboards, lab operations, test type management, inventory actions

### 2.3 Complete API documentation by module (request/response formats + examples)

Each document below includes HTTP methods, request/response formats, authentication requirements, and examples.

| Area | Base path (prefix `/api`) | Full documentation |
|---|---|---|
| Auth | `/auth` | `docs/lakni/AUTH_API_DOCUMENTATION.md` |
| Patient (members/households/etc.) | multiple (see doc) | `docs/lakni/PATIENT_API_DOCUMENTATION.md` |
| Labs + Lab Tests + Test Instructions | `/labs`, `/lab-tests`, `/test-instructions` | `docs/arani/LAB_API_DOCUMENTATION.md` |
| Test Types | `/test-types` | `docs/arani/TEST_API_DOCUMENTATION.md` |
| Booking | `/bookings` | `docs/yohan/BOOKING_API_DOCUMENTATION.md` |
| Payments (PayHere) | `/payments/payhere` | `docs/yohan/PAYMENT_API_DOCUMENTATION.md` |
| Finance | `/finance` | `docs/yohan/FINANCE_API_DOCUMENTATION.md` |
| Admin | `/admin` | `docs/yohan/ADMIN_API_DOCUMENTATION.md` |
| Inventory | `/inventory` | `docs/yohan/INVENTORY_API_DOCUMENTATION.md` |

Also included:
- PayHere integration notes: `docs/yohan/PAYHERE_INTEGRATION.md`
- Payment → Finance flow: `docs/yohan/PAYMENT_TO_FINANCE_FLOW.md`
- Postman collection (Test Management component): `docs/Afham/MediLab_Test_Management_COMPLETE.postman_collection.json`

> Note: a few docs use `http://localhost:3000` in examples. The backend default in this repo is `PORT=5000`. If you set `PORT=3000`, those examples will work unchanged.

### 2.4 Minimal API examples (cURL)

Health check:

```bash
curl -X GET http://localhost:5000/api/health
```

List labs (public):

```bash
curl -X GET "http://localhost:5000/api/labs"
```

List test types (public):

```bash
curl -X GET "http://localhost:5000/api/test-types"
```

Patient register:

```bash
curl -X POST "http://localhost:5000/api/auth/patient/register" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","contact_number":"0712345678","password":"SecurePassword@123"}'
```

Create booking (requires JWT):

```bash
curl -X POST "http://localhost:5000/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"patientProfileId":"<member_id>","healthCenterId":"<lab_id>","diagnosticTestId":"<test_type_id>","bookingDate":"2026-04-15","bookingType":"PRE_BOOKED","paymentMethod":"ONLINE"}'
```

PayHere checkout payload (requires JWT):

```bash
curl -X POST "http://localhost:5000/api/payments/payhere/checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"bookingId":"<booking_id>"}'
```

---

## 3. Deployment Report

Deployment report (required): `docs/yohan/Deployment_Report.md`

Recommended platforms (easy for demos):
- Backend: Render (Node Web Service)
- Frontend: Vercel (Vite/React)
- Database: MongoDB Atlas

Monorepo settings:
- Backend Root Directory: `apps/backend` (build: `npm install`, start: `npm start`)
- Frontend Root Directory: `apps/web` (build: `npm run build`, output: `dist`)

Cloud environment variables (minimum):
- Backend: `DATABASE_URL`, `JWT_SECRET`, `APP_URL`, `FRONTEND_URL` (+ PayHere and third-party vars if you demo those features)
- Frontend: `VITE_API_BASE_URL`

Live URLs (update if you re-deploy):
- Backend API: `https://medilab-l74h.onrender.com`
- Frontend app: `https://medilab.dev` (or the Vercel deployment URL)

---

## 4. Testing Instruction Report

Primary testing instruction report: `docs/lakni/tests/TESTING_INSTRUCTION_REPORT.md`

### 4.1 Testing environment configuration

- Backend tests require `DATABASE_URL` and `JWT_SECRET` in the repo root `.env`.
- Recommended: set `DATABASE_URL_TEST` to a dedicated test DB. If not set, the backend derives a safe `*_test` database automatically during Jest runs.
- Frontend tests use Vitest + JSDOM (configured in `apps/web/vitest.config.js`).

### 4.2 How to run unit tests

Backend:

```bash
npm -C apps/backend run test:unit
```

Frontend:

```bash
npm -C apps/web run test
```

### 4.3 Integration testing setup and execution

Backend integration tests:

```bash
npm -C apps/backend run test:integration
```

For component-level integration details (Result + Notification modules):
- `docs/Afham/Test_Management_Component_Testing_Instruction_Report.md`

### 4.4 Performance testing setup and execution

Backend performance tests (Jest tag):

```bash
npm -C apps/backend run test:performance
```

Backend load testing (Artillery):

```bash
npm -C apps/backend run perf:test
```

Artillery scenarios + required env vars/tokens are documented in `PERFORMANCE_TESTING.md`.

### 4.5 Additional testing instruction reports (by module)

- Lab module: `docs/arani/Testing_Instruction_Report_Lab.md`
- Test Type module: `docs/arani/Testing_Instruction_Report_Test.md`
- Admin module: `docs/yohan/Testing_Instruction_Report_Admin.md`
- Booking module: `docs/yohan/Testing_Instruction_Report_Booking.md`
- Finance module: `docs/yohan/Testing_Instruction_Report_Finance.md`
- Inventory module: `docs/yohan/Testing_Instruction_Report_Inventory.md`
- Payment module: `docs/yohan/Testing_Instruction_Report_Payment.md`

