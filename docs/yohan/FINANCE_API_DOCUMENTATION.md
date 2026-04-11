# MediLab Finance Module - API Documentation

## Overview
Finance APIs provide admin-only financial reporting and payment recording. This module also exposes a gateway callback endpoint used for online payments.

## Base URLs
- Local (default): `http://localhost:5000/api/finance`
- Deployed backend (Render): `https://medilab-l74h.onrender.com/api/finance`

## Authentication
All endpoints are **admin-only** (JWT + role `Admin`) except the gateway callback.

**Header**
```
Authorization: Bearer <ADMIN_STAFF_TOKEN>
Content-Type: application/json
```

## Endpoints

## Online payment gateway callback
### 1) Record an online payment (gateway -> server)
**POST** `/payments/online/callback`

**Auth:** No JWT.

**Optional security header**
If `PAYMENT_GATEWAY_WEBHOOK_SECRET` is set on the server, the callback requires:
```
x-gateway-secret: <PAYMENT_GATEWAY_WEBHOOK_SECRET>
```

**Request body**
```json
{
  "bookingId": "<booking_object_id>",
  "amount": 1500,
  "paymentReference": "PAYHERE-12345"
}
```

**Response (200)**
```json
{
  "message": "Online payment callback processed",
  "transaction": "<finance_transaction>",
  "booking": "<updated_booking>"
}
```

**Error responses**
- `401` if secret header is required and missing/invalid
- `400` if required fields are missing

---

## Admin-only endpoints

### 2) Record a cash payment
**POST** `/payments/cash`

**Auth:** Admin

**Request body**
```json
{
  "bookingId": "<booking_object_id>",
  "amount": 1500,
  "notes": "Optional note"
}
```

**Response (201)**
```json
{
  "message": "Cash payment recorded successfully",
  "transaction": "<finance_transaction>",
  "booking": "<updated_booking>"
}
```

---

### 3) Get finance summary
**GET** `/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Auth:** Admin

**Query params**
- `startDate` (optional, ISO 8601). Defaults to first day of current month.
- `endDate` (optional, ISO 8601). Defaults to now.

**Response (200)**
```json
{
  "totalRevenue": 150000,
  "totalPaid": 150000,
  "totalTransactions": 80,
  "pendingPayments": 10,
  "pendingCount": 10,
  "revenueByMethod": {
    "CASH": { "amount": 50000, "count": 30 },
    "ONLINE": { "amount": 100000, "count": 50 }
  }
}
```

---

### 4) Revenue by center
**GET** `/revenue-by-center?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Auth:** Admin

**Response (200)**
```json
{
  "items": [
    {
      "centerId": "<lab_id>",
      "centerName": "Padaviya Lab",
      "totalRevenue": 120000,
      "paidCount": 40
    }
  ]
}
```

---

### 5) Recent payments
**GET** `/recent-payments?limit=10`

**Auth:** Admin

**Response (200)**
```json
{
  "items": [
    {
      "transactionId": "<tx_id>",
      "bookingId": "<booking_id>",
      "patientName": "...",
      "testName": "...",
      "centerName": "...",
      "amount": 1500,
      "paymentMethod": "ONLINE",
      "paymentStatus": "PAID",
      "paymentReference": "PAYHERE-12345",
      "createdAt": "2026-04-11T10:00:00.000Z"
    }
  ]
}
```

---

### 6) List payments
**GET** `/payments?paymentMethod=CASH|ONLINE&limit=5000`

**Auth:** Admin

**Response (200)** same shape as recent payments (`items`).

---

### 7) List unpaid bookings
**GET** `/unpaid-bookings?paymentMethod=CASH|ONLINE&limit=5000`

**Auth:** Admin

**Response (200)**
```json
{
  "items": [
    {
      "bookingId": "<booking_id>",
      "patientName": "...",
      "testName": "...",
      "centerName": "...",
      "bookingDate": "2026-04-11T00:00:00.000Z",
      "paymentMethod": null,
      "paymentStatus": "UNPAID",
      "createdAt": "2026-04-11T10:00:00.000Z",
      "price": 1500
    }
  ]
}
```

## Example cURL

```bash
curl -X GET "http://localhost:5000/api/finance/summary?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer <ADMIN_STAFF_TOKEN>"
```
