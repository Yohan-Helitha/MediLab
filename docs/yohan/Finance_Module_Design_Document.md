# MediLab Finance Module Design

This document defines the Finance module for tracking booking payments. It is aligned with the existing `Booking` model and avoids inconsistencies across backend, API, and frontend.

## 1. Goals

- Track all monetary transactions related to lab bookings.
- Support both CASH and ONLINE payments.
- Allow admins to see revenue, payments received, and pending payments.
- Allow staff to mark cash bookings as PAID while keeping ONLINE payments driven by the payment gateway.
- Provide a clear audit trail per booking, per center, and per date range.

## 2. Data Model

### 2.1 FinanceTransaction Schema (MongoDB / Mongoose)

New collection: `FinanceTransaction`.

Fields:

- `bookingId` (ObjectId, ref: `Booking`, required)
  - The booking this transaction belongs to.
- `centerId` (ObjectId, ref: `Lab`, required)
  - Copied from `Booking.healthCenterId` when the transaction is created.
- `amount` (Number, required, min: 0)
  - Monetary value of this transaction in LKR.
- `paymentMethod` (String, enum: `['CASH', 'ONLINE']`, required)
  - Cash at counter or online (via PayHere or another gateway).
- `paymentStatus` (String, enum: `['UNPAID', 'PAID', 'FAILED', 'REFUNDED']`, default: `'UNPAID'`)
  - `UNPAID`: booking created but payment not yet completed.
  - `PAID`: successfully received.
  - `FAILED`: gateway or cash attempt failed.
  - `REFUNDED`: money returned after being paid.
- `receivedBy` (ObjectId, ref: `User`, optional)
  - Staff user who received/confirmed payment (cash) or processed a manual adjustment.
  - For automatic online payments, this can be `null` or a system user.
- `paymentReference` (String, optional)
  - External gateway reference (e.g., PayHere payment ID, transaction ID).
- `notes` (String, optional, max: 500)
  - Optional comment, e.g., reason for refund.
- `createdAt`, `updatedAt` (Date)
  - Standard Mongoose timestamps.

Indexes:

- `{ bookingId: 1 }` — fast lookup of transactions per booking.
- `{ centerId: 1, createdAt: 1 }` — revenue by center over time.
- `{ paymentStatus: 1, paymentMethod: 1 }` — metrics and filtering.

### 2.2 Relationship with Booking

- `Booking.paymentStatus` and `Booking.paymentMethod` remain the single source of truth at booking level.
- `FinanceTransaction` is the detailed log; there may be multiple records per booking (e.g., initial UNPAID record, then a PAID record, or a REFUNDED record).
- Service logic must keep `Booking.paymentStatus` in sync with the latest relevant `FinanceTransaction`.

## 3. Service Layer

Create a `finance.service.js` in the backend Finance module with the following core functions.

### 3.1 recordPayment({ bookingId, amount, paymentMethod, status, receivedBy, paymentReference })

Purpose:

- Record a payment event (cash or online) and update the associated booking.

Behavior:

1. Validate that the booking exists and is `isActive: true`.
2. Derive `centerId` from `booking.healthCenterId`.
3. Create a `FinanceTransaction` with:
   - `bookingId`, `centerId`, `amount`, `paymentMethod`, `paymentStatus: status`, `receivedBy`, `paymentReference`.
4. Update the `Booking` document:
   - `paymentStatus = status === 'PAID' ? 'PAID' : booking.paymentStatus` (only move from UNPAID → PAID or PAID → REFUNDED when appropriate).
   - `paymentMethod = paymentMethod` if provided.
5. Wrap steps 3–4 in a MongoDB transaction (session) to keep them consistent.
6. Return the created `FinanceTransaction` and the updated `Booking` snapshot.

Typical usages:

- **Cash payment at counter**:
  - Called by an authenticated staff/admin when they confirm payment.
  - Parameters: `{ bookingId, amount, paymentMethod: 'CASH', status: 'PAID', receivedBy: userId }`.
- **Online payment success (PayHere callback / webhook)**:
  - Called by payment gateway callback handler.
  - Parameters: `{ bookingId, amount, paymentMethod: 'ONLINE', status: 'PAID', paymentReference }`.
- **Refund**:
  - Optional extension: `{ bookingId, amount, paymentMethod, status: 'REFUNDED', receivedBy }`.

### 3.2 getRevenueByCenter({ startDate, endDate })

Purpose:

- Calculate revenue per lab/center for a given date range.

Behavior:

- Input: `startDate` and `endDate` (inclusive range, required).
- Query `FinanceTransaction` where:
  - `paymentStatus = 'PAID'`.
  - `createdAt` within `[startDate, endDate]`.
- Group by `centerId` and compute:
  - `totalRevenue` = sum of `amount`.
  - `paidCount` = count of transactions.
- Optionally join (`$lookup`) with `Lab` to include `centerName`.
- Return an array:
  - `{ centerId, centerName, totalRevenue, paidCount }`.

### 3.3 getRevenueByDateRange({ startDate, endDate })

Purpose:

- Get overall revenue and counts over a date range, regardless of center.

Behavior:

- Input: `startDate`, `endDate`.
- From `FinanceTransaction` with `paymentStatus = 'PAID'` in date range, compute:
  - `totalRevenue` — total `amount`.
  - `totalTransactions` — count of paid transactions.
  - `revenueByMethod` — breakdown:
    - `CASH`: { amount, count }
    - `ONLINE`: { amount, count }
- For pending metrics, query `Booking` directly:
  - Count bookings with `paymentStatus = 'UNPAID'` within date range.
- Return a summary object used by the Finance dashboard cards.

### 3.4 getRecentPayments({ limit })

Purpose:

- Provide the "Recent Payments" table on the Finance page.

Behavior:

- Input: `limit` (default 10).
- Join `FinanceTransaction` with `Booking` and `Member` to fetch:
  - Booking code / readable id (if stored) or just `_id`.
  - Patient name (`booking.patientNameSnapshot`).
  - Test name (`booking.testNameSnapshot`).
  - Amount, paymentMethod, paymentStatus.
  - Date (`transaction.createdAt`).
- Order by `createdAt` descending and limit.
- Return an array of items matching the UI columns from the screenshot.

## 4. HTTP API (Admin-Only)

Base path: `/api/finance`.

Apply middleware:

- `authenticate` — require JWT.
- `checkRole(['Admin', 'ADMIN'])` — only admin users can access these endpoints.

### 4.1 POST /api/finance/payments/cash

Use case:

- Staff/admin marks a cash booking as paid.

Request body:

- `bookingId` (string, required)
- `amount` (number, required)
- `notes` (string, optional)

Behavior:

- Calls `recordPayment` with `{ bookingId, amount, paymentMethod: 'CASH', status: 'PAID', receivedBy: req.user.id }`.
- Returns:
  - `{ message, transaction, booking }`.

### 4.2 POST /api/finance/payments/online/callback (secured endpoint)

Use case:

- PayHere (or gateway) server-to-server callback for completed online payments.

Notes:

- This endpoint is **not** admin-only in the same way; it must be secured via secret keys / signatures from PayHere.
- The detailed integration is out of scope for this document, but the important part is that on success it calls `recordPayment` with `paymentMethod: 'ONLINE'` and `status: 'PAID'`.

### 4.3 GET /api/finance/summary

Use case:

- Populate top-level Finance dashboard metrics (Total Revenue, Total Payments Received, Pending Payments).

Query parameters:

- `startDate` (ISO string, optional; default: start of current month)
- `endDate` (ISO string, optional; default: now)

Behavior:

- Calls `getRevenueByDateRange({ startDate, endDate })`.
- Also computes:
  - `pendingAmount` — sum of amounts for bookings with `paymentStatus = 'UNPAID'` (optional; if booking stores test price).
  - Or at least `pendingCount` — number of unpaid bookings.
- Response shape (example):
  - `totalRevenue` (number)
  - `totalPaid` (alias of totalRevenue)
  - `pendingPayments` (count or amount)
  - `revenueByMethod` ({ CASH: { amount, count }, ONLINE: { amount, count } })

### 4.4 GET /api/finance/revenue-by-center

Use case:

- Admin wants to see revenue per center (for reports or a future UI chart).

Query parameters:

- `startDate`, `endDate` (ISO strings, optional; defaults like above).

Behavior:

- Calls `getRevenueByCenter` and returns its array result.

### 4.5 GET /api/finance/recent-payments

Use case:

- Populate "Recent Payments" table on Finance page.

Query parameters:

- `limit` (number, optional; default 10, max 50).

Behavior:

- Calls `getRecentPayments({ limit })` and returns the items.

## 5. Frontend Finance Page

The Finance page should be implemented to consume the above APIs.

### 5.1 Metrics Cards

From `GET /api/finance/summary`:

- **Total Revenue** — show `totalRevenue` for the selected period.
- **Total Payments Received** — same as totalRevenue or `revenueByMethod.CASH.amount + revenueByMethod.ONLINE.amount`.
- **Pending Payments** — show `pendingPayments` (count or amount) in yellow badge.

Filters (optional, future):

- Date range picker to change `startDate`/`endDate`.

### 5.2 Recent Payments Table

From `GET /api/finance/recent-payments`:

Columns:

- Booking ID (or booking code)
- Patient Name
- Test Name
- Amount
- Payment Method (CASH / ONLINE)
- Status (PAID / UNPAID / FAILED / REFUNDED)
- Date (formatted from `createdAt`)

### 5.3 Cash Payment Action

Flow for marking a booking as paid in cash:

1. Staff navigates to a booking detail screen or Finance page action.
2. UI opens a modal to confirm cash payment and amount.
3. On confirm, frontend calls `POST /api/finance/payments/cash`.
4. On success, update UI labels:
   - Booking/payment status becomes PAID.
   - Metrics and recent payments automatically reflect the new transaction.

## 6. Status and Consistency Rules

- Booking `paymentStatus` is derived from Finance transactions:
  - If at least one PAID transaction exists for that booking, `paymentStatus` should be PAID.
  - If a REFUNDED transaction covers the full amount, business rules can decide whether to show REFUNDED at booking level (optional extension).
- For CASH:
  - Bookings typically start as `UNPAID`.
  - When `recordPayment` is called with status PAID, set booking `paymentStatus` to PAID.
- For ONLINE:
  - Booking remains UNPAID until gateway confirms success via callback.
  - On success callback, `recordPayment` sets booking to PAID.
- All payment-related changes must go through `recordPayment` (or a thin wrapper) to avoid divergence between `Booking` and `FinanceTransaction`.

## 7. Security and Roles

- All `/api/finance` routes (except the payment gateway callback) must:
  - Require authentication.
  - Restrict to Admin role using the existing `checkRole(['Admin', 'ADMIN'])` middleware.
- The payment gateway callback endpoint must validate gateway signatures/secrets to prevent spoofed payment confirmations.

## 8. Future Extensions (Optional)

- Support partial payments and outstanding balances by allowing multiple PAID transactions per booking and summing amounts.
- Add pagination and filters to the transactions listing (by center, payment method, date range, status).
- Export reports (CSV / PDF) using the existing PDF utilities.

This design can now be used to implement the Finance module (schema, service, routes, and frontend) without conflicting with the current Booking model or overall architecture.