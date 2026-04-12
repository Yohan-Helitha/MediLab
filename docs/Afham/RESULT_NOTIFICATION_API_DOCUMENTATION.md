# Result & Notification API Documentation (Test Management Component)

This document describes the API endpoints for the **Result** and **Notification** modules.

- Result base path: `/api/results`
- Notification base path: `/api/notifications`

## Base URL

- Local: `http://localhost:5000/api`
- Deployed (Render): `https://medilab-l74h.onrender.com/api`

## Authentication

Most endpoints require a JWT Bearer token:

```http
Authorization: Bearer <token>
```

Role checks used by these modules:
- **Patient**: can only access their own records (enforced by middleware and/or controller checks)
- **Health Officer (staff)**: can access operational endpoints (create/update results, send notifications, view logs)
- **Admin**: can access admin-only result listing and permanent delete

## Response shape (common)

Most endpoints respond with:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Validation errors usually return HTTP `400` with an `errors` array.

---

# 1) Result API (`/api/results`)

## 1.1 Upload a result file (Cloudinary)

**POST** `/api/results/upload-file`

- Auth: Required
- Role: Health Officer
- Content-Type: `multipart/form-data`
- Field name: `file`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`
- Max size: 20 MB

**Response (200)**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileName": "report.pdf",
    "filePath": "https://res.cloudinary.com/...",
    "fileSize": 123456,
    "mimeType": "application/pdf"
  }
}
```

How it’s used:
- For upload-based result types, call this endpoint first.
- Then include the returned object(s) inside `uploadedFiles[]` when submitting the test result.

## 1.2 Submit a new test result

**POST** `/api/results`

- Auth: Required
- Role: Health Officer

**Body (base fields)**

```json
{
  "bookingId": "<mongoId>",
  "patientProfileId": "<mongoId>",
  "testTypeId": "<mongoId>",
  "healthCenterId": "<mongoId>",
  "enteredBy": "<mongoId>",
  "observations": "optional notes",
  "currentStatus": "pending | released"
}
```

Notes:
- The server looks up `testTypeId` to determine which discriminator schema applies.
- If the booking already has a result, you will receive **409**.
- The related booking is updated to `COMPLETED` after successful submission.

**Upload-based discriminator requirements** (when the test type discriminator is one of: `XRay`, `ECG`, `Ultrasound`, `AutomatedReport`):

- `uploadedFiles` must be a non-empty array
- Maximum files:
  - `XRay`: 5
  - `ECG`: 3
  - `Ultrasound`: 5
  - `AutomatedReport`: 1 (PDF only)

Each entry in `uploadedFiles[]` must include:

```json
{
  "fileName": "...",
  "filePath": "https://...",
  "fileSize": 123,
  "mimeType": "image/png | application/pdf"
}
```

Additional required fields:
- `XRay`: `bodyPart`, `clinicalIndication`, `views[]`, `findings`, `impression`, `interpretation`
- `ECG`: `ecgType`, `clinicalIndication`, `findings`, `interpretation`
- `Ultrasound`: `studyType`, `clinicalIndication`, `findings`, `impression`, `interpretation`
- `AutomatedReport`: `testPanelName`, `testCategory`, `sampleType`, `sampleCollectionTime`, `analysisCompletedTime` (+ PDF upload)

**Response (201)**

```json
{
  "success": true,
  "message": "Test result submitted successfully",
  "data": {
    "_id": "<resultId>",
    "bookingId": "<bookingId>",
    "currentStatus": "pending"
  }
}
```

**Response (409)**

```json
{
  "success": false,
  "message": "Test result already exists for this booking"
}
```

## 1.3 Get a test result by ID

**GET** `/api/results/:id`

- Auth: Required
- Patient access: only if it belongs to them **and** status is `released`

**Response (200)** returns the result document (populated fields may be included).

## 1.4 Get test results for a patient (with filters)

**GET** `/api/results/patient/:patientId?status=&testTypeId=&startDate=&endDate=&limit=&page=`

- Auth: Required
- Patient access: only their own `:patientId`
- Important: if the caller is a patient, the server forces `status=released`

Query validations:
- `status`: `pending | released`
- `startDate`, `endDate`: ISO8601
- `testTypeId`: MongoId
- `limit`: 1–100
- `page`: >= 1

## 1.5 Get unviewed results for a patient

**GET** `/api/results/patient/:patientId/unviewed`

- Auth: Required
- Role: Patient (own results)

## 1.6 Get result by booking ID

**GET** `/api/results/booking/:bookingId`

- Auth: Required
- Role: Health Officer

## 1.7 Get results by health center (with filters)

**GET** `/api/results/health-center/:healthCenterId?status=&testTypeId=&startDate=&endDate=&limit=&page=`

- Auth: Required
- Role: Health Officer

## 1.8 Get results by test type

**GET** `/api/results/test-type/:testTypeId`

- Auth: Required
- Role: Health Officer

## 1.9 Download the generated PDF report

**GET** `/api/results/:id/download`

- Auth: Required
- Patient access: only their own result and only if `released`
- Server rule: PDF is only available when `currentStatus` is `released`

**Success:** streams a PDF with `Content-Disposition: attachment`.

## 1.10 Download a specific uploaded file (by index)

**GET** `/api/results/:id/file/:fileIndex`

- Auth: Required
- Patient access: only their own result and only if `released`

**Success:** streams the stored file with `Content-Disposition: attachment`.

## 1.11 Get status history (+ hard copy history)

**GET** `/api/results/:id/status-history`

- Auth: Required
- Patient access: only their own result and only if `released`

**Response (200)**

```json
{
  "success": true,
  "message": "Status history retrieved successfully",
  "data": {
    "resultId": "<resultId>",
    "bookingId": "<bookingId>",
    "currentStatus": "released",
    "statusHistory": [{ "status": "released", "changedAt": "..." }],
    "hardCopyCollection": {
      "isPrinted": true,
      "printedAt": "...",
      "isCollected": false
    },
    "hardCopyHistory": [{ "event": "printed", "timestamp": "..." }]
  }
}
```

## 1.12 Update result data

**PUT** `/api/results/:id`

- Auth: Required
- Role: Health Officer
- Protected fields cannot be modified (e.g. `patientProfileId`, `bookingId`, `testTypeId`, `releasedAt`, `_id`, discriminator key fields).

## 1.13 Update result status (and auto-send “result ready” notification)

**PATCH** `/api/results/:id/status`

- Auth: Required
- Role: Health Officer

**Body**

```json
{
  "status": "pending | released",
  "changedBy": "<mongoId>"
}
```

Notes:
- When `status` becomes `released`, the backend fires a **non-blocking** “result ready” notification (WhatsApp + Email where possible).

## 1.14 Mark result as viewed

**PATCH** `/api/results/:id/mark-viewed`

- Auth: Required
- Role: Patient

**Body**

```json
{ "userId": "<mongoId>" }
```

Patients can only mark their own results as viewed.

## 1.15 Hard copy workflow

### Mark as printed (and notify patient)

**PATCH** `/api/results/:id/mark-printed`

- Auth: Required
- Role: Health Officer

Response message indicates notification was attempted (notification failures do not fail the request).

### Mark as collected

**PATCH** `/api/results/:id/mark-collected`

- Auth: Required
- Role: Health Officer

### List printed-but-uncollected reports

**GET** `/api/results/uncollected?centerId=&daysThreshold=`

- Auth: Required
- Role: Health Officer

Query:
- `centerId` (optional): MongoId
- `daysThreshold` (optional): integer >= 1

## 1.16 Admin listing

**GET** `/api/results/admin?healthCenterId=&status=&startDate=&endDate=&includeDeleted=&limit=&page=`

- Auth: Required
- Role: Admin

## 1.17 Delete results

### Soft delete (recommended)

**DELETE** `/api/results/:id`

- Auth: Required
- Role: Health Officer

**Body**

```json
{ "deleteReason": "Minimum 10 characters..." }
```

### Permanent delete

**DELETE** `/api/results/:id/permanent`

- Auth: Required
- Role: Admin

**Body**

```json
{ "deleteReason": "Minimum 10 characters..." }
```

---

# 2) Notification API (`/api/notifications`)

This module sends notifications (WhatsApp/SMS/Email depending on configuration) and stores a notification log.

Notification enums:
- `type`: `result_ready`, `unviewed_result_reminder`, `routine_checkup_reminder`, `hard_copy_ready_for_pickup`, `hard_copy_collection_reminder`
- `channel`: `sms`, `email`, `whatsapp`
- `status`: `sent`, `failed`

## 2.1 Send “result ready” notification

**POST** `/api/notifications/send/result-ready`

- Auth: Required
- Role: Health Officer

**Body**

```json
{
  "testResult": { "_id": "<resultId>" },
  "patient": {
    "_id": "<patientId>",
    "fullName": "Patient Name (optional)",
    "contactNumber": "07XXXXXXXX (optional)",
    "email": "patient@example.com (optional)"
  },
  "testType": { "_id": "<testTypeId>", "name": "Blood Glucose" },
  "healthCenter": { "name": "Center Name" }
}
```

Rules:
- The result **must** be `released`; otherwise the API returns `400`.

**Response (200)**

```json
{
  "success": true,
  "message": "Result ready notification sent",
  "data": {
    "whatsapp": { "success": true },
    "email": { "success": true }
  }
}
```

## 2.2 Send unviewed-result reminders (bulk)

**POST** `/api/notifications/send/unviewed-reminder`

- Auth: Required
- Role: Health Officer

**Body (optional)**

```json
{ "daysThreshold": 3, "maxReminders": 2 }
```

**Response (200)**

```json
{
  "success": true,
  "message": "Unviewed result reminders sent",
  "data": { "totalFound": 10, "sent": 8, "failed": 2 }
}
```

## 2.3 Send routine checkup reminder (single subscription)

**POST** `/api/notifications/send/routine-reminder`

- Auth: Required
- Role: Health Officer

**Body**

```json
{ "subscriptionId": "<subscriptionId>" }
```

## 2.4 Send “hard copy ready” notification

**POST** `/api/notifications/send/hard-copy-ready`

- Auth: Required
- Role: Health Officer

**Body**

```json
{ "resultId": "<resultId>" }
```

Rule:
- The result must have `hardCopyCollection.isPrinted=true` or the API returns `400`.

## 2.5 Send uncollected hard copy reminders (bulk)

**POST** `/api/notifications/send/hard-copy-reminder`

- Auth: Required
- Role: Health Officer

**Body (optional)**

```json
{ "daysThreshold": 3, "maxReminders": 2 }
```

## 2.6 Resend a failed notification

**POST** `/api/notifications/:id/resend`

- Auth: Required
- Role: Health Officer

Rules:
- Only notifications with `status=failed` can be resent.

## 2.7 Notification logs

### List logs (staff)

**GET** `/api/notifications?limit=50&status=&type=&channel=`

- Auth: Required
- Role: Health Officer

### Get failed logs (staff)

**GET** `/api/notifications/failed?limit=50`

- Auth: Required
- Role: Health Officer

### Get a log by ID (staff)

**GET** `/api/notifications/:id`

- Auth: Required
- Role: Health Officer

### Get a patient’s notification history

**GET** `/api/notifications/patient/:patientId?type=&channel=&status=&startDate=&endDate=`

- Auth: Required
- Patient access: only their own `:patientId` (enforced in controller)
- Staff access: can view any patient history

Query validations:
- `type`: one of the known notification types
- `channel`: `sms | email | whatsapp`
- `status`: `sent | failed`
- `startDate`, `endDate`: ISO8601

## 2.8 Reminder subscriptions (patients)

### Subscribe

**POST** `/api/notifications/subscriptions`

- Auth: Required
- Role: Patient

**Body**

```json
{
  "patientProfileId": "<patientId>",
  "testTypeId": "<testTypeId>",
  "lastTestDate": "2026-04-01"
}
```

Rule:
- Patients can only create subscriptions for themselves.

### Unsubscribe

**DELETE** `/api/notifications/subscriptions/:id`

- Auth: Required
- Role: Patient

### List subscriptions for a patient

**GET** `/api/notifications/subscriptions/patient/:patientId`

- Auth: Required
- Role: Patient (own `:patientId`)

### Get subscription by ID

**GET** `/api/notifications/subscriptions/:id`

- Auth: Required
- Role: Patient (must own the subscription)

### Update subscription

**PUT** `/api/notifications/subscriptions/:id`

- Auth: Required
- Role: Patient (must own the subscription)

**Body**

```json
{ "lastTestDate": "2026-04-01" }
```
