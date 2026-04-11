# MediLab Payment Module (PayHere) - API Documentation

## Overview
These endpoints support PayHere online payments for patient bookings.

## Base URLs
- Local (default): `http://localhost:5000/api/payments/payhere`
- Deployed backend (Render): `https://medilab-l74h.onrender.com/api/payments/payhere`

## Authentication
- `POST /checkout` requires JWT authentication and patient role.
- `POST /notify` is a PayHere webhook and does **not** require JWT.

## Environment Variables
- `MERCHANT_ID` (required for real payments)
- `MERCHANT_SECRET` (required for real payments)
- `PAYHERE_CHECKOUT_URL` (optional; defaults to PayHere sandbox checkout)
- `PAYHERE_CURRENCY` (optional; defaults to `LKR`)
- `APP_URL` (backend base URL, used to build `notify_url`)
- `FRONTEND_URL` (used to build `return_url` / `cancel_url`)

## Endpoints

### 1) Create a PayHere checkout payload
**POST** `/checkout`

**Auth:** Patient

**Request headers**
```
Authorization: Bearer <PATIENT_TOKEN>
Content-Type: application/json
```

**Request body**
```json
{
  "bookingId": "<booking_object_id>"
}
```

**Behavior**
- Validates the booking exists and is active.
- Ensures the authenticated patient owns the booking.
- Looks up the configured price for `(labId, diagnosticTestId)` using `LabTest`.
- Returns a `checkoutUrl` and a `fields` object ready to POST to PayHere.

**Response (200)**
```json
{
  "checkoutUrl": "https://sandbox.payhere.lk/pay/checkout",
  "fields": {
    "merchant_id": "<merchant_id>",
    "return_url": "<frontend>/payments/payhere/return?...",
    "cancel_url": "<frontend>/payments/payhere/return?...",
    "notify_url": "<backend>/api/payments/payhere/notify",

    "order_id": "<booking_id>",
    "items": "<test_name>",
    "currency": "LKR",
    "amount": "1500.00",

    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "phone": "...",

    "hash": "<server_generated_hash>"
  }
}
```

**Error responses**
- `400` missing bookingId: `{ "message": "bookingId is required" }`
- `403` booking not owned by patient
- `404` booking not found / inactive
- `404` price not configured for lab/test

---

### 2) PayHere notify webhook
**POST** `/notify`

**Auth:** None (PayHere -> backend)

**Content type**
- PayHere usually sends `application/x-www-form-urlencoded`.

**Expected fields (common)**
- `order_id`
- `status_code`
- `payhere_amount` (or `amount`)
- `payhere_currency` (or `currency`)
- `md5sig`
- optional: `payment_id`

**Behavior**
- Validates `md5sig` using merchant secret.
- Records a finance transaction via `recordPayment()`.
  - If `status_code == "2"` -> `PAID`
  - Otherwise -> `FAILED`

**Response**
- Always responds with text (`OK`, `Invalid signature`, or `Error`) and typically HTTP 200.

## Example cURL

### Checkout payload (patient)
```bash
curl -X POST "http://localhost:5000/api/payments/payhere/checkout" \
  -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"<booking_id>"}'
```
