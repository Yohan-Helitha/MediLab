# MediLab Admin Module - API Documentation

## Overview
Admin APIs provide dashboard metrics and staff user listings.

## Base URLs
- Local (default): `http://localhost:5000/api/admin`
- Deployed backend (Render): `https://medilab-l74h.onrender.com/api/admin`

## Authentication
All endpoints require JWT authentication and staff role `Admin`.

**Header**
```
Authorization: Bearer <ADMIN_STAFF_TOKEN>
Content-Type: application/json
```

## Endpoints

### 1) Admin overview (dashboard)
**GET** `/overview?windowHours=24&limit=3`

**Auth:** Admin

**Query params**
- `windowHours` (optional): how far back to consider “recent” items (default 24)
- `limit` (optional): number of recent items per section (default 3, max 10)

**Response (200)**
```json
{
  "metrics": {
    "totalRevenue": 0,
    "totalBookings": 0,
    "totalUsers": 0,
    "lowStockItems": 0
  },
  "recent": {
    "bookings": [
      {
        "id": "<booking_id>",
        "title": "BK-ABCD - Patient Name",
        "status": "PENDING",
        "timestamp": "2026-04-11T10:00:00.000Z"
      }
    ],
    "payments": [
      {
        "id": "<tx_id>",
        "title": "Invoice for BK-ABCD",
        "status": "PAID",
        "timestamp": "2026-04-11T10:00:00.000Z"
      }
    ],
    "lowStock": [
      {
        "id": "<equipment_id>",
        "title": "Gloves",
        "status": "Low stock",
        "timestamp": "2026-04-11T10:00:00.000Z",
        "meta": {
          "availableQuantity": 3,
          "minimumThreshold": 10
        }
      }
    ],
    "users": [
      {
        "id": "<auth_id>",
        "title": "User Name",
        "status": "Admin",
        "timestamp": "2026-04-11T10:00:00.000Z"
      }
    ]
  },
  "windowHours": 24,
  "generatedAt": "2026-04-11T10:00:00.000Z"
}
```

---

### 2) List staff users
**GET** `/users?role=Admin`

**Auth:** Admin

**Query params**
- `role` (optional): e.g. `Admin`, `Doctor`, `Staff`, or `All`

**Response (200)**
```json
{
  "items": [
    {
      "fullName": "Dr. Sarah Smith",
      "gender": "Female",
      "contactNumber": "+94712345679",
      "email": "sarah.smith@medilab.com",
      "role": "Doctor"
    }
  ]
}
```

## Example cURL

```bash
curl -X GET "http://localhost:5000/api/admin/overview" \
  -H "Authorization: Bearer <ADMIN_STAFF_TOKEN>"
```
