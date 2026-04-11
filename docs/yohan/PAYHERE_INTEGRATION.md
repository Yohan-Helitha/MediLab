# PayHere Integration (Backend + Frontend)

This project uses **PayHere Checkout** by submitting a form to PayHere’s hosted checkout page.

## Environment variables
Already present in the root `.env`:
- `MERCHANT_ID` (PayHere merchant id)
- `MERCHANT_SECRET` (PayHere merchant secret)
- `APP_URL` (backend public URL, e.g. `http://localhost:5000`)
- `FRONTEND_URL` (frontend URL, e.g. `http://localhost:5173`)

Optional (not required)
- `PAYHERE_CHECKOUT_URL`
  - default: `https://sandbox.payhere.lk/pay/checkout`
  - set to live URL when you go production
- `PAYHERE_CURRENCY` (default `LKR`)
- `PAYHERE_COUNTRY` (default `Sri Lanka`)

## Backend endpoints added
Mounted at: `/api/payments/payhere`

### 1) Create checkout payload (patient-authenticated)
`POST /api/payments/payhere/checkout`

Body:
```json
{ "bookingId": "<Booking._id>" }
```

Response:
```json
{
  "checkoutUrl": "https://sandbox.payhere.lk/pay/checkout",
  "fields": {
    "merchant_id": "...",
    "return_url": "...",
    "cancel_url": "...",
    "notify_url": "...",
    "order_id": "<Booking._id>",
    "items": "Test Name",
    "currency": "LKR",
    "amount": "2500.00",
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "phone": "...",
    "address": "...",
    "city": "...",
    "country": "Sri Lanka",
    "hash": "<server-generated>"
  }
}
```

Implementation:
- Controller: `apps/backend/src/modules/payment/payhere.controller.js`
- Route: `apps/backend/src/modules/payment/payhere.routes.js`

Where the amount comes from (no guessing)
- Amount is derived from `LabTest.price` using:
  - `LabTest.findOne({ labId: booking.healthCenterId, diagnosticTestId: booking.diagnosticTestId })`

If there is no `LabTest` row, checkout returns:
- `404 Price not configured for this lab/test...`

### 2) Notify/webhook handler (no auth)
`POST /api/payments/payhere/notify`

Purpose
- PayHere calls this server endpoint after payment processing.
- This handler:
  1. Validates the PayHere MD5 signature (`md5sig`) using `MERCHANT_SECRET`.
  2. Records the payment into the finance module (creates `FinanceTransaction`).
  3. Updates the booking payment status to `PAID` for successful payments.

Implementation
- Controller: `apps/backend/src/modules/payment/payhere.controller.js`
- Signature logic: `apps/backend/src/modules/payment/payhere.service.js`

Signature formulas
- Checkout `hash` generation uses the common PayHere MD5 formula.
- Notify signature validation uses the common PayHere `md5sig` formula.

Important: PayHere may update these rules between versions.
- If you see signature mismatch in sandbox, compare with the **official PayHere docs** and adjust `payhere.service.js`.

## Frontend: how checkout is launched
From: `apps/web/src/pages/BookingCreatePage.jsx`
- Create booking: `POST /api/bookings`
- Ask backend for PayHere payload: `POST /api/payments/payhere/checkout`
- Submit a hidden HTML form to PayHere `checkoutUrl`

## Local testing note (notify_url)
PayHere must reach your backend `notify_url`.
- If your backend runs on localhost, PayHere cannot call it.

Solution (typical for university projects)
1. Use a tunnel tool (e.g. ngrok)
2. Expose your backend:
   - Public URL: `https://<your-subdomain>.ngrok-free.app`
3. Update `.env`:
   - `APP_URL=https://<your-ngrok-url>`
4. Restart backend

Then notify URL becomes:
- `https://<your-ngrok-url>/api/payments/payhere/notify`

## Where the finance record happens
- Notify handler calls: `recordPayment(...)`
- Service: `apps/backend/src/modules/finance/finance.service.js`
- Model: `apps/backend/src/modules/finance/financeTransaction.model.js`
