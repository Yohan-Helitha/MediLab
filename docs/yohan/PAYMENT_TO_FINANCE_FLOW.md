# Payment → Finance Recording Flow

## Goal
After a patient completes online payment (PayHere), the system should:
- Create a finance transaction (for reporting/admin dashboards)
- Mark the booking as `PAID`

## Data sources (verified from repo)
### Booking
- Model: `apps/backend/src/modules/booking/booking.model.js`
- Payment fields:
  - `paymentStatus`: `UNPAID` | `PAID`
  - `paymentMethod`: `CASH` | `ONLINE`

### Finance transaction
- Model: `apps/backend/src/modules/finance/financeTransaction.model.js`
- Fields include:
  - `bookingId` (ref Booking)
  - `centerId` (ref Lab)
  - `amount`
  - `paymentMethod`: `CASH` | `ONLINE`
  - `paymentStatus`: `UNPAID` | `PAID` | `FAILED` | `REFUNDED`
  - `paymentReference` (PayHere payment id)

## How online payments are recorded (PayHere)
1. Patient creates booking
   - `POST /api/bookings`

2. Patient redirects to PayHere checkout
   - `POST /api/payments/payhere/checkout` (server generates `hash`)

3. PayHere calls notify URL
   - `POST /api/payments/payhere/notify`

4. Backend verifies signature
   - If signature invalid → ignores recording

5. Backend records transaction + updates booking
   - Calls `recordPayment({ bookingId, amount, paymentMethod: 'ONLINE', status: 'PAID', ... })`
   - Implemented in: `apps/backend/src/modules/finance/finance.service.js`

What `recordPayment()` does (important)
- Creates a `FinanceTransaction` row
- Updates booking:
  - sets `paymentMethod` to `ONLINE`
  - sets `paymentStatus` to `PAID` when transaction status is `PAID`

## How cash payments are recorded
There is already an admin endpoint:
- `POST /api/finance/payments/cash`

It uses the same `recordPayment()` service internally.

## Admin view
Finance dashboards use:
- `GET /api/finance/summary`
- `GET /api/finance/recent-payments`
- `GET /api/finance/payments`

These routes are admin-protected.

## Notes for marking / demo
- The key requirement is: "online payment → finance transaction + booking marked PAID".
- For a successful demo, ensure:
  - Lab test has a price (`LabTest.price`)
  - Backend notify URL is reachable by PayHere (use ngrok for local)
