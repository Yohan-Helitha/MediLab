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
- Frontend (Vercel): `https://medi-bz1hqvtzb-yohan-helithas-projects.vercel.app/`

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
