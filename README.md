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



 Auth - `/auth` - `docs/lakni/AUTH_API_DOCUMENTATION.md` 
 Patient -`docs/lakni PATIENT_API_DOCUMENTATION.md` 
 Labs & Test Management `/labs`, `/lab-tests`, `/test-instructions`, `/test-types` - `docs/arani/LAB_API_DOCUMENTATION.md, TEST_API_DOCUMENTATION.md` 
 Booking - `/bookings` - `docs/yohan/BOOKING_API_DOCUMENTATION.md` 
 Payments (PayHere) - `/payments/payhere` - `docs/yohan/PAYMENT_API_DOCUMENTATION.md` 
 Finance - `/finance` - `docs/yohan/FINANCE_API_DOCUMENTATION.md`
 Admin - `/admin` - `docs/yohan/ADMIN_API_DOCUMENTATION.md`
 Inventory - `/inventory` - `docs/yohan/INVENTORY_API_DOCUMENTATION.md`
 Result & Notification - `/results`, `/notifications` - `docs/Afham/RESULT_NOTIFICATION_API_DOCUMENTATION.md`
 
Also included:
- PayHere integration notes: `docs/yohan/PAYHERE_INTEGRATION.md`
- Payment → Finance flow: `docs/yohan/PAYMENT_TO_FINANCE_FLOW.md`
- Postman collection (Test Management component): `docs/Afham/MediLab_Test_Management_COMPLETE.postman_collection.json`

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


# Deployment Report — MediLab

**Project:** MediLab (Medical Laboratory Management System)  
**Repo type:** Monorepo  
- Backend: `apps/backend` (Node.js + Express + MongoDB)  
- Frontend: `apps/web` (React + Vite)  

**Date:** April 2026

---

## 1. Overview

This report documents how MediLab is deployed, the platform configuration used for a monorepo, required environment variables, and the verification steps/evidence expected for the deployment submission.

Recommended deployment (low-friction for university demos):
- **Backend:** Render (Node Web Service)
- **Frontend:** Vercel (Vite/React)
- **Database:** MongoDB Atlas

---

## 2. Live Deployment (Current)

These URLs are based on the latest known deployment details provided during development:
- Backend (Render): `https://medilab-l74h.onrender.com`
- Frontend (Vercel): `https://medilab.dev`

If you re-deploy to a new URL, update this section and the corresponding env vars (`APP_URL`, `FRONTEND_URL`, `VITE_API_BASE_URL`).

---

## 3. Backend Deployment (Render)

### 3.1 Create the Render service

1. Render → **New** → **Web Service**
2. Connect the GitHub repository
3. Configure monorepo settings:
   - **Root Directory:** `apps/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

Backend listens on `PORT` (Render provides it) and defaults to `5000` locally.

### 3.2 Backend environment variables

Important note about `.env` location:
- The backend loads environment variables from the **repo root** `.env` file (see `apps/backend/src/config/environment.js`).
- In cloud deployments, set variables in the platform’s UI instead of committing `.env`.

**Required (minimum for backend to run):**
- `DATABASE_URL` — MongoDB connection string (Atlas recommended)
- `JWT_SECRET` — JWT signing secret

**Recommended:**
- `NODE_ENV=production`
- `FRONTEND_URL=<your vercel url>` (used for CORS and redirects in some flows)
- `APP_URL=<your render backend url>`

**PayHere (required only if demonstrating online payments):**
- `MERCHANT_ID`
- `MERCHANT_SECRET`
- `APP_URL` (public backend URL)
- `FRONTEND_URL` (public frontend URL)
- for to get working sandbox payment portal you will need to get a real domain cause payhere is not allowing to get the `MERCHANT_SECRET` for sub domain. If want to test please search medilab.dev to navigate our deployment.   

**PayHere optional:**
- `PAYHERE_CHECKOUT_URL` (defaults to sandbox)
- `PAYHERE_CURRENCY` (default: `LKR`)
- `PAYHERE_COUNTRY` (default: `Sri Lanka`)

**Third-party APIs (optional; features degrade gracefully in dev):**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`
- `GOOGLE_TRANSLATE_API_KEY`

### 3.3 Verification steps

- Health check:
  - `GET <BACKEND_URL>/api/health`
- PayHere notify endpoint must be publicly reachable for real sandbox callbacks:
  - `POST <BACKEND_URL>/api/payments/payhere/notify`

---

## 4. Frontend Deployment (Vercel)

### 4.1 Create the Vercel project

1. Vercel → **New Project** → import GitHub repo
2. Configure monorepo settings:
   - **Root Directory:** `apps/web`
   - Framework preset: Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4.2 Frontend environment variables

**Required:**
- `VITE_API_BASE_URL=<your render backend url>`

### 4.3 Verification steps

- Load the web app URL
- Verify the web app can reach backend endpoints through `VITE_API_BASE_URL`

---

## 5. Deployment Evidence Checklist (for submission)

Capture screenshots or paste links:
- Render: “Deploy succeeded” screen
- Render: environment variables page (do not show secrets; show names only)
- Vercel: “Deployment ready” screen
- Browser: live frontend
- Browser/Postman: `GET /api/health` response from live backend

---

## 6. Notes for PayHere demo (local vs deployed)

PayHere must reach the backend `notify_url`.
- If backend is running locally on `localhost`, PayHere cannot call the notify endpoint.
- For local-only demos, use an HTTP tunnel (e.g., ngrok) and set:
  - `APP_URL=https://<public-tunnel-url>`

Reference: `PAYHERE_INTEGRATION.md`.


Deployed frontend URL - https://medilab.dev/
Deployed backend URL - https://medilab-l74h.onrender.com

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

