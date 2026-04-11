# MediLab Inventory Module - API Documentation

## Overview
Inventory APIs manage equipment stock and equipment requirements per test type.

## Base URLs
- Local (default): `http://localhost:5000/api/inventory`
- Deployed backend (Render): `https://medilab-l74h.onrender.com/api/inventory`

## Authentication
All endpoints require JWT authentication.

**Header**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Roles / Access**
- Most inventory admin endpoints require a health officer token with role `Admin`.
- Equipment deduction/reservation endpoints require a health officer token.

## Endpoints

### 1) Inventory stock overview
**GET** `/stock`

**Auth:** Health officer role `Admin`

**Response (200)**
```json
{
  "items": [
    {
      "_id": "<stock_id>",
      "equipmentId": {
        "_id": "<equipment_id>",
        "name": "Gloves",
        "type": "CONSUMABLE"
      },
      "availableQuantity": 100,
      "reservedQuantity": 20,
      "minimumThreshold": 10,
      "healthCenterId": null,
      "healthCenterName": null,
      "createdAt": "2026-04-11T10:00:00.000Z",
      "updatedAt": "2026-04-11T10:05:00.000Z"
    }
  ]
}
```

---

### 2) Reserve equipment for a booking (after completion)
**POST** `/deduct-after-completion/:bookingId`

**Auth:** Health officer

**Behavior**
- Reserves equipment for the booking based on `TestEquipmentRequirement`.
- Idempotent: if equipment was already reserved for the booking, it will not reserve again.

**Response (200)**
```json
{
  "message": "Equipment reserved for completed booking",
  "reservedItems": [
    { "equipmentId": "<equipment_id>", "quantity": 2 }
  ]
}
```

**Error responses**
- `400` if booking not found, stock missing, or insufficient quantity.

---

### 3) Restock equipment
**POST** `/restock`

**Auth:** Health officer role `Admin`

**Request body**
```json
{
  "equipmentId": "<equipment_object_id>",
  "quantity": 25
}
```

**Validation**
- `equipmentId`: required, valid ObjectId
- `quantity`: required, integer > 0

**Response (200)**
```json
{
  "message": "Equipment restocked successfully",
  "stock": {
    "_id": "<stock_id>",
    "equipmentId": "<equipment_id>",
    "availableQuantity": 125,
    "reservedQuantity": 0
  }
}
```

---

## Test Equipment Requirements (Admin configuration)

### 4) List requirements for a test type
**GET** `/requirements?testTypeId=<testTypeId>`

**Auth:** Health officer role `Admin`

**Query params**
- `testTypeId` (required)

**Response (200)**
```json
{
  "items": [
    {
      "_id": "<requirement_id>",
      "testTypeId": "<test_type_id>",
      "equipmentId": {
        "_id": "<equipment_id>",
        "name": "Syringe",
        "type": "CONSUMABLE",
        "description": "...",
        "isActive": true
      },
      "quantityPerTest": 1,
      "isActive": true
    }
  ]
}
```

---

### 5) Create requirement
**POST** `/requirements`

**Auth:** Health officer role `Admin`

**Request body**
```json
{
  "testTypeId": "<test_type_object_id>",
  "equipmentId": "<equipment_object_id>",
  "quantityPerTest": 1,
  "isActive": true
}
```

**Response (201)**
```json
{
  "message": "Test equipment requirement created successfully",
  "requirement": "<requirement>"
}
```

---

### 6) Update requirement
**PUT** `/requirements/:id`

**Auth:** Health officer role `Admin`

**Request body** same as create.

**Response (200)**
```json
{
  "message": "Test equipment requirement updated successfully",
  "requirement": "<requirement>"
}
```

---

### 7) Deactivate requirement
**DELETE** `/requirements/:id`

**Auth:** Health officer role `Admin`

**Behavior**
- Soft-deactivates by setting `isActive=false`.

**Response (200)**
```json
{
  "message": "Test equipment requirement deactivated successfully",
  "requirement": "<requirement>"
}
```

## Example cURL

```bash
curl -X POST "http://localhost:5000/api/inventory/restock" \
  -H "Authorization: Bearer <ADMIN_STAFF_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"equipmentId":"<equipment_id>","quantity":10}'
```
