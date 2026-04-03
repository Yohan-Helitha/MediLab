# MediLab

Medical Laboratory Management System

## Deployment (University Requirement)

This repo is a monorepo:
- Backend: `apps/backend` (Express.js / Node.js)
- Frontend: `apps/web` (React + Vite)

### Recommended easiest platforms
- Backend: **Render** (simple Node service, GitHub auto-deploy)
- Frontend: **Vercel** (best default support for Vite + env vars)

You can use Railway/Netlify instead, but Render+Vercel is usually the least friction.

---

## Backend deployment (Render)

### 1) Prepare
- Make sure MongoDB Atlas (or any public MongoDB) is reachable from Render.
- Confirm `apps/backend/package.json` has:
	- `start`: `node src/server.js`

### 2) Create the Render service
1. Go to Render → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings (important for monorepo):
	 - **Root Directory**: `apps/backend`
	 - **Build Command**: `npm install`
	 - **Start Command**: `npm start`

Render will provide `PORT` automatically.

### 3) Set backend environment variables (Render)
Set these in Render → Service → **Environment** (do not commit secrets):

Required
- `NODE_ENV` = `production`
- `DATABASE_URL` = your MongoDB connection string
- `JWT_SECRET` = a strong random string

Required for PayHere flow
- `MERCHANT_ID` = your PayHere Merchant ID
- `MERCHANT_SECRET` = your PayHere Merchant Secret
- `APP_URL` = `https://<your-render-backend-url>`
- `FRONTEND_URL` = `https://<your-vercel-frontend-url>`

Optional
- `PAYHERE_CHECKOUT_URL` (default is sandbox)
	- sandbox: `https://sandbox.payhere.lk/pay/checkout`
	- live: (set to PayHere live checkout URL when moving to production)
- `PAYHERE_CURRENCY` (default `LKR`)
- `PAYHERE_COUNTRY` (default `Sri Lanka`)

### 4) Verify backend
- Health endpoint: `GET <BACKEND_URL>/api/health`
- PayHere notify endpoint should be reachable publicly:
	- `POST <BACKEND_URL>/api/payments/payhere/notify`

---

## Frontend deployment (Vercel)

### 1) Create the Vercel project
1. Go to Vercel → **New Project** → import this GitHub repo
2. Configure:
	 - **Root Directory**: `apps/web`
	 - Framework preset: Vite (Vercel usually detects automatically)
	 - Build command: `npm run build`
	 - Output directory: `dist`

### 2) Set frontend environment variables (Vercel)
Required
- `VITE_API_BASE_URL` = `https://<your-render-backend-url>`

This is used by `apps/web/src/api/client.js`.

### 3) Verify frontend
- Open the deployed frontend URL
- Patient flow: Health Centers → Lab → Book Test

---

## Live URLs (fill after deployment)
- Backend API: `<BACKEND_URL>`
- Frontend app: `<FRONTEND_URL>`

## Deployment evidence (screenshots)
Add screenshots to your submission (or link them here):
- Render service “Deploy succeeded” screen
- Vercel “Deployment ready” screen
- A browser screenshot showing the live frontend
- A screenshot of `GET /api/health` response from the live backend
