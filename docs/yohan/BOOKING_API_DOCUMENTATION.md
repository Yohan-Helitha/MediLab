# MediLab Booking Module - API Documentation

**Module Owner:** Booking (Yohan)

## Overview
Booking APIs manage diagnostic test bookings for patients and health officers.

## Base URLs
- Local (default): `http://localhost:5000/api/bookings`
- Deployed backend (Render): `https://medilab-l74h.onrender.com/api/bookings`

## Authentication
All endpoints in this module require a JWT access token.

**Header**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Roles / Access**
- Patient-only endpoints require `req.user.userType === "patient"`.
- Health-officer endpoints require `req.user.userType ∈ {"healthOfficer", "staff"}`.
- Some endpoints additionally require staff role `Admin`.

## Data Model (Booking)
The booking object is a MongoDB document with these fields (main ones):

- `patientProfileId` (ObjectId, required)
- `patientNameSnapshot` (string, required)
- `patientPhoneSnapshot` (string, required)
- `healthCenterId` (ObjectId, required)
- `diagnosticTestId` (ObjectId, required)
- `testNameSnapshot` (string, required)
- `centerNameSnapshot` (string, required)
- `bookingDate` (date, required)
- `timeSlot` (string, optional)
- `bookingType` (`PRE_BOOKED | WALK_IN`, required)
- `queueNumber` (number, optional)
- `estimatedWaitTimeMinutes` (number, optional)
- `priorityLevel` (`NORMAL | ELDERLY | PREGNANT | URGENT`, default `NORMAL`)
- `status` (`PENDING | CANCELLED | COMPLETED | NO_SHOW`, default `PENDING`)
- `paymentStatus` (`UNPAID | PAID`, default `UNPAID`)
- `paymentMethod` (`CASH | ONLINE`, optional)
- `allergyFlag` (boolean)
- `chronicConditionFlag` (boolean)
- `createdBy` (ObjectId, required)
- `isActive` (boolean, default `true`)
- `createdAt`, `updatedAt`

## Endpoints

### 1) Create booking
**POST** `/`

**Auth:** Patient

**Request body**
```json
{
  "patientProfileId": "<member_object_id>",
  "healthCenterId": "<lab_object_id>",
  "diagnosticTestId": "<test_type_object_id>",
  "bookingDate": "2026-04-11",
  "bookingType": "PRE_BOOKED",
  "timeSlot": "09:00-10:00",
  "priorityLevel": "NORMAL",
  "paymentMethod": "ONLINE"
}
```

**Validation**
- `patientProfileId`, `healthCenterId`, `diagnosticTestId`: required, must be valid Mongo ObjectIds
- `bookingDate`: required, ISO 8601
- `bookingType`: required, one of `PRE_BOOKED`, `WALK_IN`

**Response (201)**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "<booking_id>",
    "patientProfileId": "<member_id>",
    "healthCenterId": "<lab_id>",
    "diagnosticTestId": "<test_type_id>",
    "bookingDate": "2026-04-11T00:00:00.000Z",
    "bookingType": "PRE_BOOKED",
    "queueNumber": null,
    "paymentStatus": "UNPAID",
    "status": "PENDING",
    "isActive": true
  }
}
```

**Error responses**
- `400` validation error: `{ "errors": [ ... ] }`
- `400` domain error (e.g., patient not found): `{ "message": "..." }`

---

### 2) List all bookings
**GET** `/`

**Auth:** Health officer

**Response (200)**
```json
{
  "message": "Bookings fetched successfully",
  "bookings": {
    "bookings": ["<booking>", "..."],
    "total": 123,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3) Get bookings by patient
**GET** `/patient/:patientProfileId`

**Auth:** Patient

**Path params**
- `patientProfileId`: Member (patient) ObjectId

**Response (200)** same shape as list.

---

### 4) Get bookings by health center
**GET** `/center/:healthCenterId`

**Auth:** Patient OR Health officer

---

### 5) Get bookings by date
**GET** `/date/:bookingDate`

**Auth:** Patient OR Health officer

**Path params**
- `bookingDate`: ISO date string (e.g. `2026-04-11`)

---

### 6) Get bookings by createdBy
**GET** `/createdBy/:createdBy`

**Auth:** Health officer

---

### 7) Get bookings by status
**GET** `/status/:status`

**Auth:** Patient OR Health officer

**Path params**
- `status`: booking status

**Note on allowed values:**
- Persisted by schema: `PENDING | CANCELLED | COMPLETED | NO_SHOW`
- The route validation layer currently accepts additional values, but the DB schema may reject them during updates.

---

### 8) Get bookings by type
**GET** `/type/:type`

**Auth:** Patient OR Health officer

**Path params**
- `type`: `PRE_BOOKED | WALK_IN`

---

### 9) Update booking
**PUT** `/:id`

**Auth:** Patient OR Health officer

**Request body (all optional)**
```json
{
  "bookingDate": "2026-04-12",
  "timeSlot": "10:00-11:00",
  "bookingType": "WALK_IN",
  "priorityLevel": "URGENT",
  "status": "COMPLETED",
  "paymentStatus": "PAID",
  "paymentMethod": "CASH"
}
```

**Notes**
- If a booking transitions to `WALK_IN` or is set to `COMPLETED` and has no `queueNumber`, the service assigns the next queue number.
- Schema-enforced enums take precedence over validation middleware.

**Response (200)**
```json
{
  "message": "Booking updated successfully",
  "booking": "<booking>"
}
```

**Error responses**
- `404` if booking not found (or inactive)
- `400` validation error / domain error

---

### 10) Soft delete booking
**DELETE** `/:id`

**Auth:** Patient OR Health officer

**Behavior**
- Sets `isActive = false`.

**Response (200)**
```json
{
  "message": "Booking deleted successfully",
  "booking": "<booking>"
}
```

---

### 11) Hard delete booking
**DELETE** `/:id/hard`

**Auth:** Health officer with role `Admin`

**Response (200)**
```json
{
  "message": "Booking permanently deleted successfully"
}
```

## Example cURL

### Create booking (patient)
```bash
curl -X POST "http://localhost:5000/api/bookings" \
  -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientProfileId": "<member_object_id>",
    "healthCenterId": "<lab_object_id>",
    "diagnosticTestId": "<test_type_object_id>",
    "bookingDate": "2026-04-11",
    "bookingType": "PRE_BOOKED"
  }'
```

### List bookings (health officer)
```bash
curl -X GET "http://localhost:5000/api/bookings" \
  -H "Authorization: Bearer <STAFF_TOKEN>"
```
