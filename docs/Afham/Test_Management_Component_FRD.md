# Functional Requirements Document

## Lab Operations & Communication Management Module

**Project:** Rural Health Diagnostic Test Management System  
**Component Owner:** [Your Name]  
**SDG Goal:** Good Health and Well-being  
**Version:** 1.0  
**Date:** February 11, 2026

---

## 1. Component Overview

### 1.1 Purpose

This module manages the lifecycle of diagnostic test results, from sample collection through result delivery. It handles result entry/upload, validation workflows, automated notifications, and routine checkup reminders for patients in rural health centers.

### 1.2 Scope

- Test result data entry using validated forms
- Manual report file uploads for imaging/complex tests
- Test status tracking through workflow stages
- Automated patient notifications via SMS and email
- Routine checkup reminder subscriptions

### 1.3 Integration Points

- **Booking/Appointment Module:** Retrieves booking details, patient information
- **Patient Management Module:** Accesses patient profiles, contact information
- **Test Catalog Module:** Retrieves test type configurations, form schemas, reference ranges
- **Health Center Module:** Accesses center details for report auto-population
- **Third-Party APIs:** Twilio (SMS), SendGrid/NodeMailer (Email)

---

## 2. User Roles & Permissions

### 2.1 Lab Staff / Health Center Admin

- Primary actor for result entry and status updates
- Can create, read, update, and delete test results
- Can upload result files
- Can mark tests through workflow stages
- Can release results to patients
- Can view all results for their health center
- Can view notification logs

### 2.2 Patient

- Can view only their own released results
- Can download result reports
- Can subscribe/unsubscribe to routine checkup reminders
- Receives notifications (read-only)

### 2.3 System Administrator

- Full access to all features
- Can view system-wide notification logs
- Can configure test type settings
- Can manage reminder configurations

---

## 3. Functional Requirements

### 3.1 Test Results Management (Core CRUD)

#### FR-3.1.1: Create Test Results via Form Entry

**Description:** Lab technicians shall be able to enter test results using predefined, validated forms for applicable test types.

**Preconditions:**

- Valid booking exists with status "processing" or later
- Test type is configured for form-based entry
- User is authenticated as Lab Staff or higher

**Flow:**

1. System displays booking details with patient information (auto-populated)
2. System loads test-specific form based on test type configuration
3. System auto-populates: Patient name, ID, age, sex, center details, date/time, technician name
4. Lab staff enters required test values in validated fields
5. System validates input in real-time (range checks, required fields, format validation)
6. Lab staff can add optional observations/remarks
7. Lab staff clicks "Release Report" button
8. System performs final validation of all required fields
9. System saves structured data to database
10. System generates PDF report using template
11. System stores PDF and updates booking status to "released"
12. System sends notifications to patient (SMS and Email)

**Validation Rules:**

- Numeric fields: Min/max range validation per test type
- Required fields: Cannot submit if empty
- Reference range indicators: Auto-flag values outside normal ranges
- Dependent field validation: (e.g., differential count must sum to 100%)
- Sample quality checks (if applicable)

**Success Criteria:**

- All required fields validated successfully
- Data saved to database with complete information
- PDF report generated and stored
- Booking status updated to "released"
- Patient notified via SMS and Email
- Result immediately visible to patient

**Applicable Test Types (Phase 1):**

- Blood Glucose (Fasting/Random)
- Hemoglobin Test
- Blood Pressure
- Pregnancy Test

**Data Fields per Test Type:**

**Blood Glucose:**

- Glucose Level (mg/dL) - Range: 40-600, Required
- Sample Quality (Dropdown: Good/Hemolyzed/Lipemic) - Required
- Method Used (Dropdown: Glucometer/Lab Analyzer) - Required
- Fasting Duration (hours) - Range: 0-24
- Remarks (Text)

**Hemoglobin:**

- Hemoglobin Level (g/dL) - Range: 3-25, Required
- Method (Dropdown: Hemoglobinometer/Automated Analyzer)
- Sample Quality (Dropdown: Good/Hemolyzed/Clotted)
- Remarks (Text)

**Blood Pressure:**

- Systolic BP (mmHg) - Range: 60-250, Required
- Diastolic BP (mmHg) - Range: 40-150, Required
- Pulse Rate (bpm) - Range: 40-200, Required
- Patient Position (Dropdown: Sitting/Standing/Lying)
- Remarks (Text)

**Pregnancy Test:**

- Result (Dropdown: Positive/Negative) - Required
- Test Type (Dropdown: Urine Strip/Blood hCG)
- Remarks (Text)

---

#### FR-3.1.2: Create Test Results via File Upload

**Description:** Lab technicians shall be able to upload pre-generated or scanned test result files for tests that produce reports externally.

**Preconditions:**

- Valid booking exists
- Test type allows file upload
- User is authenticated as Lab Staff or higher

**Flow:**

1. System displays booking details
2. Lab staff clicks "Upload Report"
3. System displays upload form with auto-populated patient/center details
4. Lab staff selects 1-5 files (PDF, JPEG, PNG, DICOM)
5. Lab staff adds observations/interpretation notes (optional)
6. Lab staff clicks "Release Report" button
7. System validates file types and sizes
8. System uploads and stores files
9. System creates test result record with file references
10. System updates booking status to "released"
11. System sends notifications to patient (SMS and Email)

**File Constraints:**

- Allowed types: PDF, JPEG, PNG, DICOM
- Maximum files per result: 5
- Maximum file size: 10MB per file
- Total upload size: 50MB per result

**Applicable Test Types:**

- X-Ray
- ECG
- Ultrasound
- Automated blood test reports (PDF from machines)

**Success Criteria:**

- Files uploaded and stored securely
- Database record created with file metadata
- Booking status updated to "released"
- Patient notified via SMS and Email
- Patient can immediately access and download files
- Original filenames preserved for reference

---

#### FR-3.1.3: Read/View Test Results

**Description:** Authorized users shall be able to view test results based on their role.

**Lab Staff/Admin View:**

- List all test results for their health center
- Filter by: Date range, patient name, test type, technician
- Search by patient ID or booking ID
- Sort by date, patient name
- View full result details including structured data and files
- Download result PDFs

**Patient View:**

- List only their own released test results
- Filter by: Date range, test type
- Download result PDFs
- View result history timeline

**Response Data:**

- Result ID, booking details, patient info (role-based)
- Test type and name
- Result data (structured/uploaded files)
- Release date and time
- Lab staff name (who entered the result)
- Generated PDF link (if form-based)
- Uploaded file links (if file-based)

---

#### FR-3.1.4: Update Test Results

**Description:** Lab staff shall be able to update released test results when corrections are needed.

**Permissions:**

- Lab Staff / Health Center Admin only
- System Administrator

**Allowed Updates:**

- Update result data values
- Replace uploaded files
- Update observations/remarks
- Add supplementary files

**Update Constraints:**

- Cannot change patient or booking reference
- Cannot change test type
- Must re-validate all data on update
- PDF regenerated if form data changed
- Original release date preserved
- Update timestamp recorded

**Notifications:**

- No automatic notifications sent on update
- Lab staff can manually notify patient if needed

---

#### FR-3.1.5: Delete Test Results

**Description:** Lab staff shall be able to delete test results when necessary (e.g., incorrect booking, duplicate entry, test cancellation). System supports both soft deletion (recommended) and hard deletion (admin-only) approaches.

**Permissions:**

- Lab Staff (any health officer role) - Soft delete only
- System Administrator - Both soft delete and hard delete

**Deletion Types:**

**Primary Method: Soft Delete (Recommended)**

- Result marked as deleted in database (`isDeleted: true`)
- Record remains in database for audit trail
- Deletion reason and metadata stored permanently
- Result hidden from normal queries and patient view
- Can be recovered by administrator if needed
- Maintains full audit compliance

**Secondary Method: Hard Delete (Admin-Only)**

- Result permanently removed from database
- Associated files permanently deleted from storage
- Cannot be recovered after deletion
- Used only for true data cleanup scenarios
- Deletion details logged to system logs before removal

**Soft Delete Flow (Primary):**

1. Lab staff selects result to delete
2. System requests confirmation and reason
3. Lab staff provides deletion reason (required, minimum 10 characters)
4. System displays warning: "This result will be marked as deleted. It will no longer be visible but will remain in the database for audit purposes."
5. Lab staff confirms deletion
6. System updates result record:
   - Sets `isDeleted = true`
   - Records `deletedAt` timestamp
   - Records `deletedBy` (user ID)
   - Stores `deleteReason`
7. Result hidden from patient view and normal queries
8. Booking status optionally reverted to "processing" to allow re-entry

**Hard Delete Flow (Admin-Only):**

1. System administrator selects result for permanent deletion
2. System requests confirmation and reason
3. Admin provides deletion reason (required, minimum 10 characters)
4. System displays strong warning: "PERMANENT DELETION: This action cannot be undone. The result and all associated data will be permanently removed from the database."
5. Admin confirms permanent deletion
6. System logs deletion details (result ID, admin ID, reason, timestamp) to system logs
7. System permanently deletes result record from database
8. System permanently deletes associated PDF files from storage
9. Result completely removed from system
10. Booking status reverted to "processing" if applicable

**Data Fields (Added to TestResult Model):**

- `isDeleted` (Boolean, default: false) - Soft deletion flag
- `deletedAt` (Date) - Timestamp of deletion
- `deletedBy` (ObjectId, ref: 'HealthOfficer') - User who performed deletion
- `deleteReason` (String, min: 10 chars) - Mandatory reason for deletion

**Constraints:**

- Deletion reason mandatory (minimum 10 characters)
- Requires confirmation dialog
- Soft delete: Can be recovered by administrator
- Hard delete: Cannot be undone once deleted
- All normal queries automatically filter out soft-deleted results (`isDeleted: false`)
- Hard delete requires System Administrator role only
- Deletion metadata preserved permanently for audit purposes (soft delete)

---

### 3.2 Test Status Workflow Management

#### FR-3.2.1: Update Test Status

**Description:** System shall track test progress through defined workflow stages.

**Status Values:**

1. `sample_received` - Sample collected from patient
2. `processing` - Test being conducted
3. `released` - Results available to patient

**Lab Staff Actions:**

- Can update from `sample_received` → `processing`
- Can update from `processing` → `released` (when result is entered and released)

**Status Change Triggers:**

- `sample_received`: Manual update when patient arrives and sample is collected
- `processing`: Manual update when test begins
- `released`: Auto-set when lab staff releases result (after form submission or file upload)

**Notifications Triggered:**

- `sample_received`: No notification
- `processing`: No notification
- `released`: **Mandatory notification** to patient via SMS and Email

---

#### FR-3.2.2: View Status History

**Description:** Users shall be able to view complete status history for a test.

**Information Displayed:**

- Status name
- Changed by (user name and role)
- Timestamp
- Duration in each status

**Access:**

- Lab staff: All tests in their center
- Patients: Their own tests only
- Display as timeline or table

---

### 3.3 Notification Service (Third-Party API Integration)

#### FR-3.3.1: Send Result Ready Notifications

**Description:** System shall automatically send notifications when test results are released.

**Trigger:** Test status changed to "Released"

**Notification Channels:**

1. **SMS via Twilio API**
2. **Email via SendGrid/NodeMailer**

**Patient receives both SMS and Email (if both provided during registration)**

**SMS Template:**

```
Rural Health Alert: Your [Test Name] results are now ready.
Login to view your report: [App URL]
- [Health Center Name]
```

**Email Template:**

```
Subject: Your Test Results are Ready

Dear [Patient Name],

Your [Test Name] conducted on [Test Date] at [Health Center Name]
is now ready for viewing.

Please login to your account to view and download your report:
[Login Link]

Test Details:
- Test: [Test Name]
- Date Conducted: [Date]
- Health Center: [Center Name]

For questions, contact: [Center Phone]

Best regards,
[Health Center Name] Laboratory
```

**Notification Data:**

- Patient contact (phone, email from user profile)
- Test name
- Test date
- Health center details
- Link to login/view result

**Error Handling:**

- If SMS fails: Log error, retry once, continue with email
- If email fails: Log error, retry once
- Both failed: Alert admin, flag for manual contact

---

#### FR-3.3.2: Send Reminder Notifications for Unviewed Results

**Description:** System shall send reminder notifications if patient hasn't viewed results within specified time.

**Trigger:**

- Automated job runs daily
- Checks for results with status "Released"
- Patient hasn't viewed result within 3 days of release

**Reminder Message (SMS):**

```
Reminder: Your [Test Name] results from [Center Name] are still
pending. Please login to view: [URL]
```

**Frequency:**

- First reminder: 3 days after release
- Second reminder: 7 days after release
- No more reminders after 2nd

**Stop Conditions:**

- Patient views the result
- 2 reminders already sent
- Patient opts out of reminders

---

#### FR-3.3.3: View Notification Logs

**Description:** Authorized staff shall be able to view history of sent notifications.

**Access:** Lab Staff, Health Center Admin, System Admin

**Log Information:**

- Notification ID
- Patient (name/ID)
- Type (result_ready, reminder, status_update)
- Channel (SMS, Email)
- Sent timestamp
- Status (sent, failed)
- Error message (if failed)
- Message content (truncated)

**Filtering:**

- Date range
- Patient
- Notification type
- Status (sent/failed)
- Channel

**Use Cases:**

- Verify patient was notified
- Debug failed notifications
- Audit communication with patients

---

### 3.4 Routine Checkup Reminder Management

#### FR-3.4.1: Subscribe to Routine Checkup Reminders

**Description:** Patients shall be able to subscribe to routine checkup reminders for applicable tests.

**Trigger:**

- Patient views a released test result
- Test type is marked as `isRoutineMonitoringRecommended = true`
- System displays subscription prompt

**Prompt Message:**

```
💡 Routine Monitoring Recommended

[Test Name] should be monitored regularly for better health management.

Recommended Frequency: [Monthly/Quarterly/Biannually/Annually]

Would you like to receive reminders for your next checkup?

[Yes, Remind Me]  [No, Thanks]
```

**Test Types Supporting Reminders:**

- Blood Glucose: Monthly (for diabetic/pre-diabetic results)
- Hemoglobin: Quarterly (for anemic patients)
- Blood Pressure: Monthly (for hypertensive patients)
- Lipid Profile: Quarterly/Biannually
- Other chronic condition tests as configured

**Subscription Flow:**

1. Patient clicks "Yes, Remind Me"
2. System creates reminder subscription with:
   - Patient ID
   - Test type ID
   - Frequency (from test type configuration)
   - Last test date (current result date)
   - Next reminder date (calculated based on frequency)
   - Status: Active
3. Confirmation message shown
4. Patient receives first reminder on calculated date

**Frequency Calculation:**

- Monthly: Last test date + 30 days
- Quarterly: Last test date + 90 days
- Biannually: Last test date + 180 days
- Annually: Last test date + 365 days

---

#### FR-3.4.2: View Active Reminder Subscriptions

**Description:** Patients shall be able to view their active routine checkup reminders.

**Location:** Patient profile/settings section

**Information Displayed:**

- Test name
- Frequency
- Last test date
- Next reminder date
- Status (Active/Inactive)
- Option to unsubscribe

**Features:**

- List all subscriptions
- See upcoming reminders (sorted by date)

---

#### FR-3.4.3: Unsubscribe from Reminders

**Description:** Patients shall be able to unsubscribe from routine checkup reminders.

**Methods:**

1. From reminder subscription list (patient settings)
2. From reminder notification itself (unsubscribe link)

**Flow:**

1. Patient clicks "Unsubscribe"
2. System confirms: "Are you sure you want to stop receiving reminders for [Test Name]?"
3. Patient confirms
4. System marks subscription as inactive
5. No future reminders sent
6. Confirmation message shown

**Data Retention:**

- Subscription record marked as inactive
- Patient can re-subscribe later

---

#### FR-3.4.4: Send Routine Checkup Reminders

**Description:** System shall automatically send routine checkup reminders based on active subscriptions.

**Trigger:**

- Automated job runs daily (e.g., 8 AM)
- Checks for subscriptions where `nextReminderDate = Today`
- Sends reminders to eligible patients

**Reminder Message (SMS):**

```
Health Reminder: It's time for your routine [Test Name] checkup.
Last test: [Date]
Book your appointment: [App URL]
- [System Name]
```

**Email Template:**

```
Subject: Routine Checkup Reminder - [Test Name]

Dear [Patient Name],

This is a friendly reminder for your routine [Test Name] checkup.

Your last test was on: [Last Test Date]
Recommended frequency: [Frequency]

Please book an appointment at your nearest health center through
our app: [Booking URL]

Regular monitoring is important for maintaining good health.

To stop these reminders: [Unsubscribe Link]

Stay healthy!
[System Name]
```

**After Sending:**

- Update `nextReminderDate` to next occurrence (e.g., +30 days for monthly)
- Log notification sent
- Continue cycle until patient unsubscribes or books a test

**Smart Features:**

- If patient books and completes the same test: Update `lastTestDate`, reset reminder cycle from new date
- Temporarily pause if patient has pending booking for same test

---

## 4. Non-Functional Requirements

### 4.1 Performance

- PDF generation: < 2 seconds per report
- File upload: Support 10MB files within 30 seconds
- Notification sending: < 5 seconds after status change
- Form validation: Real-time (< 500ms response)
- Result retrieval: < 1 second for list view, < 2 seconds for detail view

### 4.2 Security

- Role-based access control (RBAC) enforced on all endpoints
- Patient data encryption at rest
- File uploads scanned for malware
- Secure file storage with access controls
- JWT-based authentication
- HTTPS for all API calls
- Third-party API keys stored in environment variables
- Deletion actions logged in system logs

### 4.3 Data Validation

- All form inputs validated on both client and server side
- File type validation based on MIME type and extension
- File size limits enforced
- Required field validation
- Numeric range validation per test type
- Reference range highlighting (abnormal values)

### 4.4 Reliability

- Failed notifications retried once automatically
- SMS/Email service fallback (if one fails, ensure other works)
- Database transaction rollback on errors
- File upload with chunk support for large files
- Scheduled job monitoring for reminder automation

### 4.5 Usability

- Responsive design for mobile and desktop access
- Clear error messages with guidance
- Confirmation dialogs for critical actions (especially delete)
- Loading indicators for async operations
- Toast/snackbar notifications for user feedback
- Real-time form validation with helpful messages

### 4.6 Scalability

- Support 100+ concurrent users
- Handle 1000+ test results per day
- Notification queue system for bulk sending
- Pagination for result lists (20 items per page)
- Database indexing on frequently queried fields

---

## 5. API Endpoints (Summary)

### Test Results

- `POST /api/results/form` - Create and release result via form entry
- `POST /api/results/upload` - Create and release result via file upload
- `GET /api/results` - List results (role-based, with filters)
- `GET /api/results/:id` - Get single result details
- `PUT /api/results/:id` - Update result
- `DELETE /api/results/:id` - Delete result permanently
- `GET /api/results/:id/download` - Download result PDF

### Test Status

- `PUT /api/results/:id/status` - Update test status
- `GET /api/results/:id/status-history` - Get status history

### Notifications

- `POST /api/notifications/send` - Manual notification trigger
- `GET /api/notifications/logs` - Get notification logs (admin)
- `GET /api/notifications/logs/:patientId` - Patient-specific logs

### Reminders

- `POST /api/reminders/subscribe` - Subscribe to routine reminders
- `GET /api/reminders/subscriptions` - Get user's subscriptions
- `DELETE /api/reminders/subscriptions/:id` - Unsubscribe
- `POST /api/reminders/send` - Manual reminder send (admin/testing)

---

## 6. Dependencies on Other Modules

### 6.1 Booking/Appointment Module

**Required Data:**

- Booking ID
- Patient ID
- Test type ID
- Appointment date/time
- Booking status

**Required Functionality:**

- Query bookings by ID
- Update booking status when result is released

### 6.2 Patient Management Module

**Required Data:**

- Patient name, age, sex
- Patient ID
- Contact information (phone, email)
- Patient medical history (optional, for context)

**Required Functionality:**

- Query patient details by ID
- Verify patient consent for notifications

### 6.3 Test Catalog Module

**Required Data:**

- Test name, category
- Test type configuration (form-based or upload)
- Form schema with field definitions
- Reference ranges
- Reminder configuration (frequency, eligibility)
- Report template path

**Required Functionality:**

- Query test type by ID
- Retrieve form schema for dynamic form generation
- Query tests supporting routine monitoring

### 6.4 Health Center Module

**Required Data:**

- Health center name
- Address, contact information
- Logo (for report header)

**Required Functionality:**

- Query center details by ID for report auto-population

---

## 7. Out of Scope

The following features are **NOT** included in this component:

❌ Appointment booking (handled by Booking module)  
❌ Patient registration (handled by Patient Management module)  
❌ Test catalog management (handled by Test Catalog module)  
❌ Payment processing for tests  
❌ Doctor prescriptions management  
❌ Health center onboarding  
❌ Advanced analytics/reporting dashboards  
❌ Integration with lab machines (outside project scope)  
❌ Telemedicine or doctor consultation features  
❌ Multilingual support (English only for MVP)  
❌ Mobile app (web application only)  
❌ DICOM viewer for medical images  
❌ AI-based result interpretation

---

## 8. Acceptance Criteria

### 8.1 Form-Based Result Entry

✅ Lab tech can enter results using validated forms  
✅ All validation rules enforced (ranges, required fields)  
✅ Patient and center details auto-populated  
✅ PDF report generated automatically  
✅ Result saved with correct status  
✅ Patient notified if status = "Released"

### 8.2 File Upload

✅ Lab tech can upload 1-5 files per result  
✅ File size and type validation working  
✅ Uploaded files stored and accessible  
✅ Result viewable by patient after release

### 8.3 CRUD Operations

✅ Create: Both form and upload methods working  
✅ Read: List and detail views with proper filtering  
✅ Update: Result data and files can be corrected  
✅ Delete: Permanent deletion with mandatory reason and confirmation

### 8.4 Notifications

✅ SMS sent via Twilio successfully  
✅ Email sent successfully  
✅ Notifications triggered on status change  
✅ Failed notifications logged  
✅ Notification logs viewable by admin

### 8.5 Routine Reminders

✅ Subscription prompt shown for eligible tests  
✅ Patient can subscribe with one click  
✅ Automated reminders sent on schedule  
✅ Patient can view and unsubscribe  
✅ Reminder cycle updates after new test

### 8.6 Workflow

✅ Status transitions follow defined rules (sample_received → processing → released)  
✅ Status history tracked and viewable  
✅ Notifications automatically sent when result is released

---

## 9. Testing Requirements

### 9.1 Unit Testing

- All validation functions (numeric ranges, required fields)
- PDF generation logic
- Date calculation for reminders
- Status transition rules
- File upload validation

### 9.2 Integration Testing

- End-to-end result creation flow (form → database → PDF → notification)
- File upload and retrieval
- Third-party API calls (Twilio, SendGrid)
- Inter-module data fetching (patient, booking, test type)
- Notification sending and logging

### 9.3 Performance Testing (Artillery.io)

- Concurrent result creation (10 simultaneous users)
- File upload under load
- Notification sending (bulk reminders)
- API response times under stress

---

## 10. Deliverables

1. **Source Code**
   - Backend API (Express.js/Node.js)
   - MongoDB schemas and models
   - Controllers, services, routes
   - Validation middleware
   - Third-party API integration
   - Automated jobs (reminder scheduler)

2. **PDF Report Templates**
   - At least 4 test type templates (Glucose, Hemoglobin, BP, Pregnancy)
   - Professional medical report layout

3. **API Documentation**
   - Swagger/Postman collection
   - All endpoints documented with request/response examples

4. **Testing Suite**
   - Unit tests (Jest/Mocha)
   - Integration tests
   - Performance test scripts (Artillery)
   - Test coverage report

5. **Documentation**
   - This FRD
   - Technical design document (optional)
   - Deployment guide
   - User manual for lab technicians

---

## 11. Timeline & Milestones

**Evaluation 1 (February 27, 2026):**

- Form-based result entry (2 test types: Blood Glucose, Hemoglobin)
- File upload functionality
- Complete CRUD operations (including permanent delete)
- Status workflow (sample_received → processing → released)
- Notification service setup and integration (SMS + Email)
- Basic unit and integration testing

**Evaluation 2 (April 12, 2026):**

- Complete form-based entry (4 test types: add Blood Pressure, Pregnancy Test)
- Routine checkup reminder subscription system
- Comprehensive testing (unit, integration, performance)
- Performance optimization
- Full API documentation (Swagger)
- Complete user documentation
- Deployment to cloud platforms

---

## 12. Assumptions

1. Patient contact information (phone, email) available in Patient Management module
2. Booking system provides necessary booking details
3. Test types pre-configured in Test Catalog module
4. Twilio and SendGrid accounts provided for API integration
5. File storage infrastructure available (local or cloud)
6. PDF generation library available (e.g., PDFKit, Puppeteer)
7. Automated job scheduler available (node-cron, Agenda)

---

## 13. Risks & Mitigation

| Risk                                       | Impact              | Mitigation                                                |
| ------------------------------------------ | ------------------- | --------------------------------------------------------- |
| Third-party API downtime (Twilio/SendGrid) | Notifications fail  | Implement retry mechanism, fallback channel, queue system |
| Large file uploads slow performance        | Poor UX             | Implement chunked uploads, file size limits, compression  |
| PDF generation bottleneck                  | Slow response times | Generate PDFs asynchronously, cache templates             |
| Form schema complexity for tests           | Development delay   | Start with simple tests, add complex ones incrementally   |
| Inter-module dependency delays             | Integration issues  | Mock data for independent testing, clear API contracts    |

---

## Approval

**Prepared by:** [Your Name]  
**Date:** February 11, 2026

**Review & Approval:**

- [ ] Team Member 2 (Booking Module)
- [ ] Team Member 3 (Patient Management)
- [ ] Team Member 4 (Test Catalog Module)
- [ ] Project Supervisor

---

**Next Steps:**

1. Review and finalize this FRD with team
2. Design database schema
3. Create API endpoint specifications
4. Begin implementation with priority features
5. Set up development environment and third-party API accounts
