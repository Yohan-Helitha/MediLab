# Test Type API Endpoint Documentation — MediLab

This document covers the **Test Type** endpoints (diagnostic test definitions) implemented in the backend.

**Backend base path:** `apps/backend`  
**Base URL (local):** `http://localhost:5000`  
**All routes are prefixed with:** `/api`

Module covered here:
- Test Types: `/api/test-types`

---

## Authentication

Protected endpoints require a valid JWT in the header:
- Header: `Authorization: Bearer <token>`

Role requirement for protected endpoints in this module:
- Middleware: `authenticate` + `isStaff`
- Meaning: token must represent a **health officer/staff user** with role **`Staff`**

Public endpoints:
- Most `GET` endpoints are public in this module.

---

## Data model (TestType)

Stored fields in MongoDB (from `apps/backend/src/modules/test/testType.model.js`):
- `name` (string, unique)
- `code` (string, unique, uppercase)
- `category` (enum)
- `description` (string)
- `entryMethod` (enum: `form|upload`)
- `discriminatorType` (enum)
- `isRoutineMonitoringRecommended` (boolean)
- `recommendedFrequency` (required if routine monitoring enabled)
- `recommendedFrequencyInDays` (required if routine monitoring enabled)
- `specificParameters` (object)
- `reportTemplate` (required if `entryMethod=form`)
- `isActive` (boolean)
- `createdAt`, `updatedAt`

Allowed `category` values:
- `Blood Chemistry`, `Hematology`, `Imaging`, `Cardiology`, `Clinical Pathology`, `Other`

Allowed `discriminatorType` values:
- `BloodGlucose`, `Hemoglobin`, `BloodPressure`, `Pregnancy`, `XRay`, `ECG`, `Ultrasound`, `AutomatedReport`

---

## 1) Create a Test Type
- **Method:** `POST`
- **Path:** `/api/test-types`
- **Auth:** Staff only

Request body (JSON) — required by validation:
- `name` (string)
- `code` (string)
- `category` (string)
- `entryMethod` (`form` or `upload`)
- `discriminatorType` (string)
- `description` (string)

Additional fields accepted by the model (not explicitly validated):
- `isRoutineMonitoringRecommended`, `recommendedFrequency`, `recommendedFrequencyInDays`, `specificParameters`, `reportTemplate`, `isActive`

Example request:
```bash
curl -X POST "http://localhost:5000/api/test-types" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -d "{
    \"name\": \"Fasting Blood Sugar\",
    \"code\": \"FBS\",
    \"category\": \"Hematology\",
    \"entryMethod\": \"form\",
    \"discriminatorType\": \"BloodGlucose\",
    \"description\": \"Measures blood glucose after fasting.\",
    \"reportTemplate\": \"templates/blood-glucose.json\",
    \"isRoutineMonitoringRecommended\": true,
    \"recommendedFrequency\": \"quarterly\",
    \"recommendedFrequencyInDays\": 90,
    \"specificParameters\": { \"fastingRequired\": true, \"fastingHours\": 8 }
  }"
```

Success response:
- **Status:** `201`
- **Body:** TestType document

---

## 2) List all Test Types
- **Method:** `GET`
- **Path:** `/api/test-types`
- **Auth:** Public
- **Query params (optional):**
  - `category` (string) — case-insensitive match

Example:
```bash
curl "http://localhost:5000/api/test-types?category=Hematology"
```

Success response:
- **Status:** `200`
- **Body:** Array of TestType documents

---

## 3) Get Test Type by id
- **Method:** `GET`
- **Path:** `/api/test-types/:id`
- **Auth:** Public

---

## 4) Update Test Type
- **Method:** `PUT`
- **Path:** `/api/test-types/:id`
- **Auth:** Staff only

Example:
```bash
curl -X PUT "http://localhost:5000/api/test-types/<TEST_TYPE_ID>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -d "{\"description\":\"Updated description\",\"isActive\":true}"
```

Success response:
- **Status:** `200`
- **Body:** Updated TestType document

---

## 5) Soft delete (mark inactive)
- **Method:** `PATCH`
- **Path:** `/api/test-types/:id/soft-delete`
- **Auth:** Staff only

Success response:
```json
{ "message": "Test type currently inactive" }
```

---

## 6) Hard delete
- **Method:** `DELETE`
- **Path:** `/api/test-types/:id`
- **Auth:** Staff only

Success response:
```json
{ "message": "Test type deleted successfully" }
```

---

## 7) Filter endpoints

### 7.1 Get by category (path param)
- **Method:** `GET`
- **Path:** `/api/test-types/category/:category`
- **Auth:** Public

### 7.2 Form-based tests
- **Method:** `GET`
- **Path:** `/api/test-types/method/form`
- **Auth:** Public

### 7.3 Upload-based tests
- **Method:** `GET`
- **Path:** `/api/test-types/method/upload`
- **Auth:** Public

### 7.4 Monitoring recommended tests
- **Method:** `GET`
- **Path:** `/api/test-types/monitoring/recommended`
- **Auth:** Public

Implementation note (current code):
- The monitoring filter queries `isMonitoringRecommended`, but the model field is `isRoutineMonitoringRecommended`.
- If this endpoint returns empty unexpectedly, align the stored field/query in code or data.
