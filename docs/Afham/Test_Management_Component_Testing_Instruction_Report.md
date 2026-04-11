# Test Result Management Component — Testing Instruction Report

> This report covers unit testing, integration testing, and environment configuration for the **Result** and **Notification** modules of the Test Management Component.
> For performance testing, see the repository-level [`PERFORMANCE_TESTING.md`](../../PERFORMANCE_TESTING.md). The scenarios that belong to this component are identified in [Section 4](#4-performance-testing-reference) below.

---

## 1. Testing Environment Configuration

### 1.1 Prerequisites

- **Node.js v18 or later** — required for `--experimental-vm-modules` ESM support used by Jest.
- **npm v8 or later**
- A reachable **MongoDB** instance (Atlas cluster or local `mongod`). The test runner automatically redirects to a separate test database — see [Section 1.3](#13-test-database-isolation).

Install all backend dependencies from `apps/backend/`:

```bash
cd apps/backend
npm install
```

### 1.2 Environment Variables

Create a `.env` file at the repository root (`MediLab/.env`). The backend config at `src/config/environment.js` resolves it from that location automatically.

The following variables must be present for tests to run:

| Variable              | Required for tests | Description                                                                                        |
| --------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | **Yes**            | MongoDB connection string. The test runner derives a `_test` database from this — see Section 1.3. |
| `JWT_SECRET`          | **Yes**            | Secret used to sign and verify JWTs. Integration tests generate tokens with this value.            |
| `TWILIO_ACCOUNT_SID`  | No                 | **Mocked in integration tests.** Only needed for real notification dispatch outside tests.         |
| `TWILIO_AUTH_TOKEN`   | No                 | **Mocked in integration tests.**                                                                   |
| `TWILIO_PHONE_NUMBER` | No                 | **Mocked in integration tests.**                                                                   |
| `SENDGRID_API_KEY`    | No                 | **Mocked in integration tests.**                                                                   |
| `SENDGRID_FROM_EMAIL` | No                 | **Mocked in integration tests.**                                                                   |

> **Twilio and SendGrid are fully mocked in all integration tests.** The mock setup is declared at the top of `notification.integration.test.js` using `jest.mock()`. Real credentials are never invoked during the test suite. If these variables are absent, a warning is logged at startup but all tests still complete normally.

### 1.3 Test Database Isolation

The backend uses automatic test database isolation in `src/config/db.js`:

- When `JEST_WORKER_ID` is set (i.e., Jest is running), or when `NODE_ENV` equals `test`, `connectDB()` derives a safe test database name by appending `_test` to the database name in `DATABASE_URL`.
- Example: if `DATABASE_URL` points to `/mediLab`, tests connect to `/mediLab_test`.
- You can override this completely by setting `DATABASE_URL_TEST` to a separate connection string.
- You do **not** need to set `NODE_ENV=test` manually — `JEST_WORKER_ID` alone triggers the switch.

Each integration test file manages its own `beforeAll` / `afterAll` lifecycle. Seeded test documents are created before each suite and removed after, so repeated runs leave the test database clean.

### 1.4 Jest Configuration

Jest is configured in `apps/backend/jest.config.cjs`:

```js
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {},
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 60000,
};
```

Key points:

- `transform: {}` disables Babel. The project uses native ESM (`"type": "module"` in `package.json`), so no transpilation is needed or applied.
- `testTimeout: 60000` allows up to 60 seconds per individual test case, which accommodates MongoDB round-trips in integration tests.
- All `npm run test:*` scripts invoke Jest via `node --experimental-vm-modules node_modules/jest/bin/jest.js`. **Do not invoke `jest` directly** without this flag — ESM imports will fail.

### 1.5 Available npm Scripts

Run from `apps/backend/`:

| Script                     | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| `npm run test:unit`        | All unit tests across all modules (matches `*.unit.test.js`)               |
| `npm run test:integration` | All integration tests across all modules (matches `*.integration.test.js`) |
| `npm test`                 | All test files                                                             |
| `npm run test:coverage`    | All tests with a coverage report                                           |

---

## 2. Unit Testing

Unit tests run fully isolated from the database and external services. All Mongoose models and third-party service clients are mocked. No environment variables beyond a working Node.js installation are needed.

### 2.1 How to Run

**All unit tests for this component (both modules):**

```bash
cd apps/backend
npm run test:unit
```

**Single file — direct invocation:**

```bash
cd apps/backend

# Result module — validation
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  src/modules/result/__tests__/result.validation.unit.test.js --no-coverage

# Result module — service
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  src/modules/result/__tests__/result.service.unit.test.js --no-coverage

# Notification module — validation
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  src/modules/notification/__tests__/notification.validation.unit.test.js --no-coverage

# Notification module — service
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  src/modules/notification/__tests__/notification.service.unit.test.js --no-coverage
```

---

### 2.2 Result Module — `result.validation.unit.test.js`

**File:** `src/modules/result/__tests__/result.validation.unit.test.js`

Tests every `express-validator` middleware chain exported from `result.validation.js`. A lightweight runner builds a fake `req` object, runs each middleware, and asserts on `validationResult(req)`. No database, no HTTP server.

| Describe block                  | What is tested                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `idParamValidation`             | `:id` route param must be a valid MongoId                                                                                                     |
| `patientIdParamValidation`      | `:patientId` route param must be a valid MongoId                                                                                              |
| `healthCenterIdParamValidation` | `:healthCenterId` route param must be a valid MongoId                                                                                         |
| `submitResultValidation`        | Required base fields: `bookingId`, `patientProfileId`, `testTypeId`, `healthCenterId`, `enteredBy`                                            |
| `bloodGlucoseValidation`        | Blood glucose discriminator fields: glucose level, unit, clinical context                                                                     |
| `hemoglobinValidation`          | Hemoglobin discriminator fields: `hemoglobinLevel`, `unit`, `sampleQuality`, `method`, `patientCondition`, `referenceRange`, `interpretation` |
| `bloodPressureValidation`       | Systolic, diastolic, pulse — presence and numeric range                                                                                       |
| `updateStatusValidation`        | `currentStatus` must be a valid enum value; `changedBy` is required                                                                           |
| `markViewedValidation`          | `viewedBy` and `viewerRole` are required                                                                                                      |
| `softDeleteValidation`          | `deletedBy` is required                                                                                                                       |
| `hardDeleteValidation`          | `confirmedBy` is required                                                                                                                     |
| `updateResultValidation`        | Optional update fields are correctly type-checked                                                                                             |
| `resultQueryFiltersValidation`  | Query params `currentStatus`, `page`, `limit` — coercion and bounds                                                                           |
| `xrayValidation`                | X-ray discriminator fields                                                                                                                    |
| `pregnancyValidation`           | Pregnancy ultrasound discriminator fields                                                                                                     |
| `ecgValidation`                 | ECG discriminator fields                                                                                                                      |
| `automatedReportValidation`     | Automated report discriminator fields                                                                                                         |

---

### 2.3 Result Module — `result.service.unit.test.js`

**File:** `src/modules/result/__tests__/result.service.unit.test.js`

Tests all service functions in `result.service.js`. Mongoose models are mocked using `jest.unstable_mockModule` combined with dynamic `await import()` — the required pattern for ESM default exports under `--experimental-vm-modules`. A `chainMock` helper produces a thenable Mongoose query chain supporting `.populate()`, `.sort()`, `.limit()`, `.skip()` chaining while resolving with caller-supplied mock data.

| Describe block                 | What is tested                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `createTestResult`             | Creates a discriminator document; rejects with 409-equivalent on duplicate booking |
| `findTestResultById`           | Finds by ID with populated fields; returns `null` for a missing ID                 |
| `findResultsByPatient`         | Paginated query by `patientProfileId`                                              |
| `findResultByBooking`          | Returns a single result by `bookingId`                                             |
| `updateResultStatus`           | Appends a status history entry; validates allowed status values                    |
| `updateTestResult`             | Updates result fields; asserts ownership                                           |
| `addViewedByEntry`             | Pushes a `viewedBy` object to the result document                                  |
| `findUnviewedResultsByPatient` | Filters results not yet viewed by the patient                                      |
| `findResultsByHealthCenter`    | Paginated query by `healthCenterId` with optional `currentStatus` filter           |
| `findAllResultsAdmin`          | Admin paginated query; supports `includeDeleted` flag                              |
| `findResultsByTestType`        | Filters results by `testTypeId`                                                    |
| `softDeleteTestResult`         | Sets `isDeleted: true` and records `deletedBy`                                     |
| `hardDeleteTestResult`         | Permanently removes the document from the collection                               |

---

### 2.4 Notification Module — `notification.validation.unit.test.js`

**File:** `src/modules/notification/__tests__/notification.validation.unit.test.js`

Tests every `express-validator` chain exported from `notification.validation.js`, using the same lightweight runner pattern as the result validation tests.

| Describe block                       | What is tested                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `idParamValidation`                  | `:id` route param must be a valid MongoId                                                                                                 |
| `patientIdParamValidation`           | `:patientId` route param must be a valid MongoId                                                                                          |
| `subscriptionIdParamValidation`      | `:subscriptionId` route param must be a valid MongoId                                                                                     |
| `sendResultReadyValidation`          | `resultId`, `patientProfileId`, `recipientPhone` required and valid                                                                       |
| `notificationHistoryQueryValidation` | Query filters: `type`, `status`, `page`, `limit` — type coercion and allowed values                                                       |
| `failedNotificationsQueryValidation` | Query filters for the failed notifications list                                                                                           |
| `subscribeValidation`                | `testTypeId` required and valid MongoId; `recommendedFrequency` must match allowed enum strings; `lastTestDate` must not be in the future |
| `updateSubscriptionValidation`       | Same rules as `subscribeValidation` but all fields optional; future `lastTestDate` is rejected                                            |
| `sendHardCopyReadyValidation`        | `resultId` and `patientProfileId` required                                                                                                |
| `sendRoutineReminderValidation`      | `subscriptionId` required and must be a valid MongoId                                                                                     |

---

### 2.5 Notification Module — `notification.service.unit.test.js`

**File:** `src/modules/notification/__tests__/notification.service.unit.test.js`

Tests all 16 service functions in `notification.service.js`. Mongoose models (`NotificationLog`, `ReminderSubscription`) and the external service clients (`config/twilio.js`, `config/sendgrid.js`) are mocked using `jest.unstable_mockModule`.

| Describe block                | What is tested                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `createNotificationLog`       | Creates a log document with channel, type, and initial status                                |
| `findNotificationsByPatient`  | Paginated query by `patientProfileId` with optional `type` / `status` filters                |
| `findNotificationById`        | Finds by ID; returns `null` for a missing document                                           |
| `findAllNotifications`        | Admin paginated query across all patients                                                    |
| `findFailedNotifications`     | Filters logs by `status: "failed"`                                                           |
| `updateNotificationStatus`    | Updates the `status` field of a log document                                                 |
| `sendResultReadyNotification` | Dispatches WhatsApp (via mocked Twilio) and email (via mocked SendGrid); creates a log entry |
| `sendUnviewedResultReminder`  | Sends a reminder for results not yet viewed by the patient                                   |
| `findUnviewedResults`         | Queries results where patient has not viewed and `currentStatus` is `released`               |
| `resendNotification`          | Fetches a failed log and re-dispatches the notification                                      |
| `sendRoutineCheckupReminder`  | Sends a checkup reminder via mocked clients                                                  |
| `createSubscription`          | Creates a `ReminderSubscription` document                                                    |
| `findSubscriptionsByPatient`  | Query by `patientProfileId`                                                                  |
| `findSubscriptionById`        | Finds a subscription by ID                                                                   |
| `deactivateSubscription`      | Sets `isActive: false` on the subscription                                                   |
| `findSubscriptionsDueToday`   | Finds subscriptions whose next reminder date is today or in the past                         |

---

## 3. Integration Testing

Integration tests boot the full Express application (`src/app.js`), connect to a dedicated test MongoDB database, seed required documents in `beforeAll`, send real HTTP requests via `supertest`, and clean up in `afterAll`. They test the complete request → validation → controller → service → database round-trip.

### 3.1 Prerequisites

- `DATABASE_URL` must be set in `.env` (see [Section 1.2](#12-environment-variables)).
- `JWT_SECRET` must be set in `.env`.
- External services (Twilio, SendGrid) are **automatically mocked** at the top of the notification integration test file — real credentials are not needed.
- Use `--runInBand` to force serial execution. Running integration tests in parallel causes MongoDB connection contention between suites.

### 3.2 How to Run

**All integration tests for this component:**

```bash
cd apps/backend
npm run test:integration -- --runInBand
```

**Only this component's two integration test files:**

```bash
cd apps/backend
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  --testPathPattern="result.integration|notification.integration" \
  --runInBand --no-coverage
```

**Single file:**

```bash
cd apps/backend

# Result module
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  src/modules/result/__tests__/result.integration.test.js \
  --runInBand --no-coverage

# Notification module
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  src/modules/notification/__tests__/notification.integration.test.js \
  --runInBand --no-coverage
```

> **If `DATABASE_URL` is not set**, both integration suites are automatically skipped via `describe.skip` — they report as skipped, not failed.

---

### 3.3 Result Module — `result.integration.test.js`

**File:** `src/modules/result/__tests__/result.integration.test.js`
**Expected result: 31 / 31 passing**

**`beforeAll` seeds:** one HealthOfficer (`Lab_Technician` role), one HealthOfficer (`Admin` role), one Member (patient), one Lab, one TestType, one Booking. A second Booking and the result documents are created during test execution. All seeded documents are removed in `afterAll`.

| Endpoint                                          | Key test cases                                                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/results`                               | 401 no token; 403 patient cannot submit; 422 missing required fields; 201 valid hemoglobin result created; 409 duplicate result for same booking |
| `GET /api/results/admin`                          | 403 lab technician cannot access admin endpoint; 401 unauthenticated; 200 paginated list; 200 with `includeDeleted=true`                         |
| `GET /api/results/:id`                            | 401 no token; 422 invalid MongoId format; 404 valid ObjectId that does not exist; 200 health officer retrieves result                            |
| `GET /api/results/:id/status-history`             | 200 health officer retrieves status history array                                                                                                |
| `GET /api/results/health-center/:healthCenterId`  | 403 patient cannot access; 200 health officer retrieves paginated list                                                                           |
| `GET /api/results/patient/:patientId`             | 401 no token; 200 health officer retrieves patient results                                                                                       |
| `PATCH /api/results/:id/status`                   | 403 patient cannot update status; 422 invalid status value; 200 health officer releases result                                                   |
| `PATCH /api/results/:id/mark-printed`             | 401 no token; 200 printed flag set                                                                                                               |
| `PATCH /api/results/:id/mark-collected`           | 401 no token; 200 collected flag set                                                                                                             |
| `GET /api/results/uncollected`                    | 401 no token; 200 uncollected results list                                                                                                       |
| `DELETE /api/results/:id` (soft delete)           | 401 no token; 403 patient cannot delete; 200 soft deleted; 404 already deleted                                                                   |
| `DELETE /api/results/:id/permanent` (hard delete) | 403 lab technician cannot hard-delete; 200 admin permanently deletes                                                                             |

---

### 3.4 Notification Module — `notification.integration.test.js`

**File:** `src/modules/notification/__tests__/notification.integration.test.js`
**Expected result: 32 / 33 passing — 1 intentional failure (see known bug below)**

**`beforeAll` seeds:** one HealthOfficer, one Member (patient), one Lab, one TestType, one Booking, one released HemoglobinResult (required for the result-ready notification test). Twilio and SendGrid are mocked so no real messages are dispatched. All seeded documents are removed in `afterAll`.

| Endpoint                                                  | Key test cases                                                                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/notifications/send/result-ready`               | 401 no token; 403 patient cannot send; 422 missing required fields; 200 notification sent                                                                                      |
| `GET /api/notifications/`                                 | 401 no token; 403 patient cannot access all notifications; 200 health officer reads paginated list                                                                             |
| `GET /api/notifications/patient/:patientId`               | 401 no token; 200 patient history retrieved; 422 invalid patientId                                                                                                             |
| `GET /api/notifications/failed`                           | 403 patient cannot access; 200 health officer reads failed list                                                                                                                |
| `GET /api/notifications/:id`                              | 404 valid ObjectId not found; 422 invalid MongoId                                                                                                                              |
| `POST /api/notifications/:id/resend`                      | 404 notification not found; 403 patient cannot resend                                                                                                                          |
| `POST /api/notifications/subscriptions`                   | 401 no token; 403 health officer cannot subscribe (patient-only); 422 missing required fields; 201 patient creates subscription; 409 duplicate subscription for same test type |
| `GET /api/notifications/subscriptions/patient/:patientId` | 200 subscription list retrieved                                                                                                                                                |
| `GET /api/notifications/subscriptions/:id`                | 404 not found; 422 invalid MongoId; 200 retrieves subscription                                                                                                                 |
| `PUT /api/notifications/subscriptions/:id`                | 200 updates subscription; **400 future `lastTestDate` rejected** ← intentional failure                                                                                         |
| `DELETE /api/notifications/subscriptions/:id`             | 401 no token; 200 subscription deactivated                                                                                                                                     |
| `POST /api/notifications/send/hard-copy-ready`            | 401 no token; 422 missing fields; 200 notification sent                                                                                                                        |
| `POST /api/notifications/send/routine-reminder`           | 401 no token; 422 invalid subscriptionId; 200 reminder sent                                                                                                                    |

#### Known Application Code Bug — `PUT /api/notifications/subscriptions/:id`

The test case `"400/422 — future lastTestDate is rejected"` **intentionally fails** and documents a confirmed bug in the application code.

**Location:** `src/modules/notification/notification.controller.js` → function `updateSubscription` (approx. line 434)

**Root cause:** The controller applies `updateSubscriptionValidation` middleware (which correctly flags a future `lastTestDate`), but never calls `validationResult(req)` to read those errors. As a result, the request proceeds, the invalid date is saved, and the controller returns `200 OK` instead of `400`.

**Proof it is an application bug, not a test bug:** `notification.validation.unit.test.js` has a passing test (`updateSubscriptionValidation — "rejects future lastTestDate"`) that confirms the middleware rule fires correctly at the validation layer.

**Fix required** — add the following block at the start of `updateSubscription` in `notification.controller.js`:

```js
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors.array(),
  });
}
```

---

## 4. Performance Testing Reference

Performance testing for this component is defined in the repository-level document:

**[`PERFORMANCE_TESTING.md`](../../PERFORMANCE_TESTING.md)** — located at `MediLab/PERFORMANCE_TESTING.md`

The Artillery scenario file for this component is at:

```
apps/backend/perf/test-management-perf.yml
```

Run from `apps/backend/`:

```bash
npm run perf:test
```

The following scenarios in that file belong to this component:

| Scenario name                              | Module              | Auth required                                                                                         |
| ------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------- |
| Lab tech browses health-center results     | Result module       | Yes — `LAB_TECH_TOKEN`, `HEALTH_CENTER_ID`                                                            |
| Lab technician submits and releases result | Result module       | Yes — `LAB_TECH_TOKEN`, `LAB_TECH_ID`, `BOOKING_ID`, `TEST_TYPE_ID`, `HEALTH_CENTER_ID`, `PATIENT_ID` |
| Admin fetch all results                    | Result module       | Yes — `ADMIN_TOKEN`                                                                                   |
| Patient notification history               | Notification module | Yes — `PATIENT_TOKEN`, `PATIENT_ID`                                                                   |

The remaining scenarios in the same file ("Browse test types", "Browse labs list", "API health check") belong to the Test Type & Lab module.

Refer to `PERFORMANCE_TESTING.md` → **"4) Artillery load test for Test Management Component APIs"** for the full list of required environment variables, load phase configuration, and how to interpret Artillery output.
