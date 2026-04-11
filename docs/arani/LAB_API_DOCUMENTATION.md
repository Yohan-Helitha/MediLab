# Lab Operations API Endpoint Documentation — MediLab

This document covers the **Lab Operations** API endpoints implemented in the backend.

**Backend base path:** `apps/backend`  
**Base URL (local):** `http://localhost:5000`  
**All routes are prefixed with:** `/api`

Modules covered here:
- Labs: `/api/labs`
- Lab-specific tests (assign Test Types to a Lab): `/api/lab-tests`
- Test Instructions (per Test Type + language): `/api/test-instructions`

---

## Authentication

Protected endpoints require a valid JWT in the header:
- Header: `Authorization: Bearer <token>`

Role requirement for protected endpoints in this module:
- Middleware: `authenticate` + `isStaff`
- Meaning: token must represent a **health officer/staff user** with role **`Staff`**

Validation errors format (when `handleValidationErrors` triggers):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "type": "field", "msg": "...", "path": "...", "location": "body" }
  ]
}
```

---

## 1) Labs API — `/api/labs`

### 1.1 Create lab
- **Method:** `POST`
- **Path:** `/api/labs`
- **Auth:** Staff only (`Bearer` token required)
- **Request body (JSON):**
  - Required: `name` (string, 3–200 chars)
  - Optional: `addressLine1`, `addressLine2`, `district`, `province`, `latitude`, `longitude`, `phoneNumber`, `email`, `operatingHours`, `operationalStatus`, `isActive`, `createdBy`

Example request:
```bash
curl -X POST "http://localhost:5000/api/labs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -d "{
    \"name\": \"MediLab - Anuradhapura\",
    \"addressLine1\": \"No 12, Main Road\",
    \"district\": \"Anuradhapura\",
    \"province\": \"North Central\",
    \"phoneNumber\": \"0712345678\",
    \"email\": \"lab@example.com\",
    \"operationalStatus\": \"OPEN\",
    \"operatingHours\": [
      { \"day\": \"Monday\", \"openTime\": \"08:00\", \"closeTime\": \"16:00\" }
    ]
  }"
```

Success response:
- **Status:** `201`
- **Body:** Lab document

Error responses:
- **Status:** `400` (validation or duplicate lab)

---

### 1.2 List labs
- **Method:** `GET`
- **Path:** `/api/labs`
- **Auth:** Public
- **Query params (optional):**
  - `name` (string) — case-insensitive partial match

Example:
```bash
curl "http://localhost:5000/api/labs?name=medi"
```

Success response:
- **Status:** `200`
- **Body:** Array of Lab documents

---

### 1.3 Get lab by id
- **Method:** `GET`
- **Path:** `/api/labs/:id`
- **Auth:** Public

Example:
```bash
curl "http://localhost:5000/api/labs/<LAB_ID>"
```

Success response:
- **Status:** `200`
- **Body:** Lab document

Error responses:
- **Status:** `404` if not found

---

### 1.4 Update lab (full update)
- **Method:** `PUT`
- **Path:** `/api/labs/:id`
- **Auth:** Staff only
- **Body:** Same shape as create (uses the same validation)

Example:
```bash
curl -X PUT "http://localhost:5000/api/labs/<LAB_ID>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -d "{\"name\":\"MediLab - Anuradhapura (Updated)\",\"operationalStatus\":\"MAINTENANCE\"}"
```

Success response:
- **Status:** `200`
- **Body:** Updated Lab document

---

### 1.5 Delete lab (hard delete)
- **Method:** `DELETE`
- **Path:** `/api/labs/:id`
- **Auth:** Staff only

Example:
```bash
curl -X DELETE "http://localhost:5000/api/labs/<LAB_ID>" \
  -H "Authorization: Bearer <STAFF_TOKEN>"
```

Success response:
- **Status:** `200`
- **Body:**
```json
{ "message": "Lab deleted successfully" }
```

---

### 1.6 Update lab operational status
- **Method:** `PATCH`
- **Path:** `/api/labs/:id/status`
- **Auth:** Staff only
- **Body (JSON):**
```json
{ "status": "OPEN" }
```

Allowed values:
- `OPEN` | `CLOSED` | `HOLIDAY` | `MAINTENANCE`

Success response:
- **Status:** `200`
- **Body:** Updated Lab document

---

## 2) Lab Tests API — `/api/lab-tests`

A **LabTest** is an assignment of a Test Type (diagnostic test) to a specific Lab, including lab-specific price/availability.

### 2.1 Create lab-test assignment
- **Method:** `POST`
- **Path:** `/api/lab-tests`
- **Auth:** Staff only
- **Body (JSON):**
  - Required: `labId`, `diagnosticTestId`, `price`, `estimatedResultTimeHours`
  - Optional: `availabilityStatus`, `dailyCapacity`, `isActive`

Example:
```bash
curl -X POST "http://localhost:5000/api/lab-tests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -d "{
    \"labId\": \"<LAB_ID>\",
    \"diagnosticTestId\": \"<TEST_TYPE_ID>\",
    \"price\": 2500,
    \"estimatedResultTimeHours\": 24,
    \"availabilityStatus\": \"AVAILABLE\",
    \"dailyCapacity\": 25
  }"
```

Success response:
- **Status:** `201`
- **Body:** LabTest document

Error responses:
- **Status:** `400` if already assigned (duplicate `(labId, diagnosticTestId)`)

---

### 2.2 Update lab-test availability status
- **Method:** `PATCH`
- **Path:** `/api/lab-tests/:id/status`
- **Auth:** Staff only
- **Body (JSON):**
```json
{ "status": "UNAVAILABLE" }
```

Allowed values:
- `AVAILABLE` | `UNAVAILABLE` | `TEMPORARILY_SUSPENDED`

Success response:
- **Status:** `200`
- **Body:** Updated LabTest

---

### 2.3 Update lab-test details
- **Method:** `PATCH`
- **Path:** `/api/lab-tests/:id`
- **Auth:** Staff only
- **Body (JSON):** Any of
  - `price`, `estimatedResultTimeHours`, `dailyCapacity`, `availabilityStatus`, `isActive`

Success response:
- **Status:** `200`
- **Body:** Updated LabTest

---

### 2.4 Delete lab-test assignment
- **Method:** `DELETE`
- **Path:** `/api/lab-tests/:id`
- **Auth:** Staff only

Success response:
- **Status:** `204` (no response body)

---

### 2.5 List tests assigned to a lab
- **Method:** `GET`
- **Path:** `/api/lab-tests/lab/:labId`
- **Auth:** Public
- **Response:** array of LabTests (populated `diagnosticTestId`)

Example:
```bash
curl "http://localhost:5000/api/lab-tests/lab/<LAB_ID>"
```

---

### 2.6 Filter lab-tests by availability status
- **Method:** `GET`
- **Path:** `/api/lab-tests/status?status=AVAILABLE`
- **Auth:** Public

---

### 2.7 Search lab-tests by diagnostic test name
- **Method:** `GET`
- **Path:** `/api/lab-tests/search?name=<partial>`
- **Auth:** Public

---

### 2.8 Get availability status for a lab-test
- **Method:** `GET`
- **Path:** `/api/lab-tests/:id/availability`
- **Auth:** Public

Success response:
```json
{ "availabilityStatus": "AVAILABLE" }
```

---

## 3) Test Instructions API — `/api/test-instructions`

Test instructions are stored per **Test Type** (diagnostic test) and language.

### 3.1 Create test instructions
- **Method:** `POST`
- **Path:** `/api/test-instructions`
- **Auth:** Staff only
- **Body (JSON):**
  - Required: `diagnosticTestId`
  - Optional: `preTestInstructions` (string[]), `postTestInstructions` (string[]), `languageCode` (`en|si|ta`), `isActive`, `createdBy`

Example:
```bash
curl -X POST "http://localhost:5000/api/test-instructions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -d "{
    \"diagnosticTestId\": \"<TEST_TYPE_ID>\",
    \"languageCode\": \"en\",
    \"preTestInstructions\": [\"Fast for 8 hours\"],
    \"postTestInstructions\": [\"Drink water after sample collection\"]
  }"
```

Success response:
- **Status:** `201`
- **Body:** TestInstruction document

Business rule:
- If instructions already exist for the given test type, the service throws an error with message:
  - `Instructions already exist for this test. Please edit the existing record instead of creating a new one.`

---

### 3.2 List all test instructions
- **Method:** `GET`
- **Path:** `/api/test-instructions`
- **Auth:** Public
- **Query params (optional):**
  - `testName` (string) — filters by linked TestType name (case-insensitive)
  - `instructions` (string) — matches pre or post instruction content
  - `languageCode` (`en|si|ta`)

---

### 3.3 Get instructions by test type id
- **Method:** `GET`
- **Path:** `/api/test-instructions/test-type/:testTypeId`
- **Auth:** Public

---

### 3.4 Get instructions by diagnostic test id (same underlying field)
- **Method:** `GET`
- **Path:** `/api/test-instructions/diagnostic-test/:diagnosticTestId`
- **Auth:** Public

Success response:
- **Status:** `200`
- **Body:** Array of TestInstruction documents

---

### 3.5 Get instructions by language
- **Method:** `GET`
- **Path:** `/api/test-instructions/language/:testTypeId?language=en`
- **Auth:** Public

Notes:
- Query param key is `language` (the service uses it as a language code).

---

### 3.6 Get instruction by id
- **Method:** `GET`
- **Path:** `/api/test-instructions/:id`
- **Auth:** Public

---

### 3.7 Update instructions
- **Method:** `PUT`
- **Path:** `/api/test-instructions/:id`
- **Auth:** Staff only

---

### 3.8 Delete instructions
- **Method:** `DELETE`
- **Path:** `/api/test-instructions/:id`
- **Auth:** Staff only

Success response:
```json
{ "message": "Test instructions are deleted successfully" }
```
