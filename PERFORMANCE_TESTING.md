# Performance Testing (Critical)

This document defines **critical performance tests** for MediLab (frontend + backend) and a repeatable workflow to detect slowdowns before/after deployments.

## Scope (what “critical” means)
Focus on user-visible and revenue/booking-impacting flows:
- Health Centers list (`/health-centers`) — initial load + search
- Lab details (`/labs/:labId`) — lab + tests load
- Booking create (`/bookings/new`) — create booking + PayHere checkout initiation
- Auth flows — patient login/register (time-to-interactive after login)

## Environments
- **Local**: fastest iteration; not representative of network/infra.
- **Staging/Preview** (recommended for load tests): Vercel preview + Render staging if available.
- **Production**: only run **light** smoke tests unless you have explicit approval.

Suggested URLs (adjust as needed):
- Frontend: `https://medilab.dev`
- Backend: `https://medilab-l74h.onrender.com`

## Success targets (baseline)
### Frontend (Core Web Vitals)
Measure on mobile (slow 4G / mid-tier device profile) and desktop:
- **LCP** ≤ 2.5s (good), ≤ 4.0s (needs improvement)
- **INP** ≤ 200ms (good), ≤ 500ms (needs improvement)
- **CLS** ≤ 0.10

### Frontend (page-level)
- `/health-centers` should show first usable content quickly (avoid “blank page” perception)
- Search interactions should feel immediate (no UI freeze > 100–200ms)

### Backend (API)
Targets should be tracked per endpoint under load:
- **p50 latency** < 300ms
- **p95 latency** < 1000ms
- **error rate** < 1% under expected load

## Quick diagnostics (when a page feels slow)
Before deeper testing:
1. Check browser DevTools:
   - **Network**: slow endpoint? long TTFB? large payload?
   - **Console**: runtime errors, retries, CORS issues
   - **Performance**: long tasks (JS main thread blocked)
2. Check backend logs (Render) for timeouts / DB errors.
3. Confirm frontend `VITE_API_BASE_URL` points to the correct backend.

## Frontend performance testing
### 1) Lighthouse (local)
Run from Chrome DevTools → Lighthouse.
- Run **Mobile** + **Desktop**
- Capture: Performance score, LCP/INP/CLS, “Largest Contentful Paint element”, JS bundle impact.

Record results in the table below.

### 2) Lighthouse CI (optional, repeatable)
If you want CI enforcement later:
- Use `@lhci/cli` and run against a deployed preview URL.
- Fail builds only on **regressions** rather than absolute scores.

### 3) Bundle size sanity
Vite build warnings about large chunks (>500kB) can correlate with slow initial load.
- Track `dist/assets/*.js` gzip sizes.
- Prefer splitting rarely-used pages via route-based code splitting.

## Backend performance testing
Two common approaches:
- **autocannon** (Node) for quick single-endpoint tests
- **k6** for scenario-based, repeatable load tests

### 1) Smoke test (safe)
Run a low-rate test first (avoids accidental overload):
- 1–5 virtual users
- 1–2 minutes
- Confirm: 0 errors, stable latency.

### 2) Load test (expected traffic)
Simulate normal usage:
- ramp to expected concurrent users
- hold 5–15 minutes
- watch p95 latency and error rate

### 3) Stress test (find breaking point)
Only on staging:
- ramp beyond expected load
- stop when error rate rises or latency explodes

## Critical endpoints to test
### Public (no auth)
- `GET /api/labs` (Health Centers list)
- `GET /api/labs/:id` (Lab details)
- `GET /api/lab-tests/lab/:labId` (Tests for lab)

### Patient (auth)
- `POST /api/bookings`
- `GET /api/bookings/patient/:patientProfileId`
- `POST /api/payments/payhere/checkout`

## Example k6 plan (template)
Use k6 if you want consistent results across runs.

Minimal scenario ideas:
- Scenario A: Health Centers browsing
  - `GET /api/labs`
  - for a sample labId: `GET /api/lab-tests/lab/:labId`
- Scenario B: Booking creation (staging only)
  - login → `POST /api/bookings` → `POST /api/payments/payhere/checkout`

Notes:
- Booking creation requires valid IDs (patientProfileId, healthCenterId, diagnosticTestId).
- For performance testing, prefer seeded test data and dedicated test accounts.

## Database considerations (MongoDB)
If API latency spikes under load, check:
- Missing indexes (e.g., lookups by `healthCenterId`, `patientProfileId`, `bookingDate`)
- Over-populating documents (large populates per request)
- N+1 query patterns

## Reporting template (fill for each run)
### Run metadata
- Date/time:
- Environment: Local / Preview / Production
- Frontend URL:
- Backend URL:
- Commit/branch:

### Frontend results
| Page | Device | LCP | INP | CLS | Notes |
|------|--------|-----|-----|-----|-------|
| /health-centers | Mobile |  |  |  |  |
| /labs/:id | Mobile |  |  |  |  |

### Backend results
| Endpoint | Scenario | RPS | p50 | p95 | Error % | Notes |
|----------|----------|-----|-----|-----|---------|-------|
| GET /api/labs | Browse |  |  |  |  |  |

## What to do when it’s slow
- Frontend slow + big JS: consider route-based code splitting, reduce heavy dependencies on initial route.
- Frontend slow + API slow: optimize backend endpoints (pagination, indexes, reduce populate).
- Backend slow only under load: check DB saturation, connection pooling, Render plan limits.

## Safety
- Avoid running stress/soak tests on production without approval.
- Prefer Preview/Staging for heavier load.
