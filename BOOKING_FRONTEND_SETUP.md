# Booking Module (Frontend) – Setup & Flow

## What was added
- A patient booking page: `/bookings/new`
- Booking + PayHere API client: `apps/web/src/api/bookingApi.js`
- PayHere return page (after redirect): `/payments/payhere/return`
- “Book Test” button now opens the booking page from the lab test list

## How the booking UI works
### 1) Patient chooses a test
- Go to: `Health Centers` → pick a lab → choose a test → click **Book Test**
- This comes from:
  - Labs: `GET /api/labs`
  - Lab tests (includes price): `GET /api/lab-tests/lab/:labId`

### 2) Booking form
Page: `apps/web/src/pages/BookingCreatePage.jsx`

**Auto-filled client details (read-only)**
- `full_name`, `contact_number`, `email`
- Source: `AuthContext.user.profile` (this is the backend `Member` document)

**Manually filled booking details**
- `bookingType`: `PRE_BOOKED` or `WALK_IN`
- `bookingDate`: required
- `timeSlot`: optional (free text)
- `priorityLevel`: optional
- `paymentMethod`: `ONLINE (PayHere)` or `CASH`

### 3) Booking creation request
The form submits:
- `POST /api/bookings`

Payload shape (important fields)
```json
{
  "patientProfileId": "<Member._id>",
  "healthCenterId": "<Lab._id>",
  "diagnosticTestId": "<TestType._id>",
  "bookingDate": "YYYY-MM-DD",
  "timeSlot": "09:00 - 10:00",
  "bookingType": "PRE_BOOKED",
  "priorityLevel": "NORMAL",
  "paymentMethod": "ONLINE"
}
```

Notes
- `patientProfileId` must be the **Member** Mongo ObjectId (not `Auth._id`).
- The backend snapshots patient/test/center names internally.

## Where to edit if you want changes
- Booking UI: `apps/web/src/pages/BookingCreatePage.jsx`
- Book button behavior: `apps/web/src/pages/LabDetailsPage.jsx`
- Routes: `apps/web/src/routes/AppRoutes.jsx`

## Common issues
- “Price not shown”
  - Price comes from `LabTest.price`. If a lab doesn’t have that test assigned, price will be missing.
- “Booking page redirects back to health centers”
  - It happens if you open `/bookings/new` directly (it expects router state from the lab page).
