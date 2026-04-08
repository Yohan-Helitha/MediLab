# MediLab Patient Frontend Pages - Documentation

**Author:** Lakni (IT23772922)  
**Version:** 1.0  
**Last Updated:** April 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Patient Pages](#patient-pages)
3. [Account Page](#account-page)
4. [Health Profile Page](#health-profile-page)
5. [Household Registration Page](#household-registration-page)
6. [Emergency Contact Page](#emergency-contact-page)
7. [Family Tree Page](#family-tree-page)
8. [AI Doctor Chat Page](#ai-doctor-chat-page)
9. [Booking Page](#booking-page)
10. [Health Reports Page](#health-reports-page)
11. [Symptom Checker Page](#symptom-checker-page)
12. [Visit Referral Page](#visit-referral-page)
13. [User Flow Diagrams](#user-flow-diagrams)

---

## Overview

The MediLab patient portal provides comprehensive healthcare management tools for patients. The frontend is built with React 18, React Router v7, and Tailwind CSS, offering a modern, responsive user experience across all devices.

### Technology Stack

- **Framework:** React 18
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Axios
- **UI Components:** Custom components + Tailwind
- **Authentication:** JWT tokens stored in localStorage

### Base Patient URLs

```
/patient/account           - User account & profile
/patient/health-profile    - Health information management
/patient/household         - Household member registration
/patient/emergency         - Emergency contacts
/patient/family-tree       - Family relationships
/patient/ai-doctor         - AI medical consultation
/patient/booking           - Appointment booking
/patient/health-reports    - Health reports & history
/patient/symptom-checker   - Symptom analysis tool
/patient/visit-referral    - Visit tracking & referrals
```

---

## Patient Pages

### Page Navigation Structure

```
Patient Portal
├── Account Page
├── Health Profile Page
├── Household Registration Page
├── Emergency Contact Page
├── Family Tree Page
├── AI Doctor Chat Page
├── Booking Page
├── Health Reports Page
├── Symptom Checker Page
└── Visit Referral Page
```

---

## Account Page

**Route:** `/patient/account`  
**Component:** `AccountPage.jsx`

### Purpose

User account management including profile information, password changes, and account settings.

### Features

- **Profile Information Display**
  - Member ID
  - Full name
  - Email address
  - Contact number
  - Account creation date
  - Last login information

- **Password Management**
  - Change password functionality
  - Current password verification
  - New password validation with requirements
  - Confirm password matching

- **Account Settings**
  - Notification preferences
  - Language selection
  - Theme preferences

- **Account Actions**
  - View full profile
  - Download account data
  - Delete account (with confirmation)

### User Workflows

#### Viewing Account Information

1. Navigate to `/patient/account`
2. View all account details on dashboard
3. See member ID and creation date
4. View last login time

#### Changing Password

1. Click "Change Password" button
2. Enter current password
3. Enter new password (must meet requirements)
4. Confirm new password
5. Click "Update Password"
6. See success notification

#### Password Requirements Display

The page displays password requirements:

- ✓ At least 8 characters
- ✓ At least 1 uppercase letter (A-Z)
- ✓ At least 1 lowercase letter (a-z)
- ✓ At least 1 number (0-9)
- ✓ At least 1 special character (@$!%\*?&#)

### API Calls

```javascript
// Fetch user profile
GET /api/auth/profile
Authorization: Bearer <token>

// Change password
POST /api/auth/change-password
{
  "currentPassword": "CurrentPass@123",
  "newPassword": "NewSecurePass@123",
  "confirmPassword": "NewSecurePass@123"
}

// Update account settings
PUT /api/auth/account-settings
{
  "notifications": true,
  "language": "en",
  "theme": "light"
}
```

### Validation Rules

| Field            | Rules                                                           |
| ---------------- | --------------------------------------------------------------- |
| Current Password | Required, non-empty                                             |
| New Password     | 8-100 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |
| Confirm Password | Must match new password exactly                                 |

### Error Handling

- **Invalid Current Password:** "Current password is incorrect"
- **Password Too Weak:** Display specific requirements not met
- **Passwords Don't Match:** "Passwords do not match"
- **API Error:** Display error message with retry option

### Features to Verify

- ✅ Display all user profile information correctly
- ✅ Validate password requirements in real-time
- ✅ Show/hide password toggle
- ✅ Success notification on password change
- ✅ Handle authentication errors
- ✅ Responsive design on mobile/tablet
- ✅ Form validation before submission
- ✅ Loading states during API calls

---

## Health Profile Page

**Route:** `/patient/health-profile`  
**Component:** `HealthProfilePage.jsx`

### Purpose

Comprehensive health information management for the patient and household members.

### Features

- **Health Metrics**
  - Blood type
  - Height (cm)
  - Weight (kg)
  - BMI (calculated)
  - Last checkup date

- **Allergies Management**
  - Add allergy with allergen, severity, reaction, treatment
  - Edit existing allergies
  - Delete allergies
  - View allergy severity (Mild/Moderate/Severe)
  - Search and filter allergies

- **Medications Management**
  - Add medication with dosage, frequency, indication
  - Edit medication details
  - Mark medications as active/inactive
  - Delete medications
  - Track start and end dates

- **Chronic Diseases**
  - Add chronic disease with diagnosis date
  - Track treatment status
  - Disease severity levels
  - Search chronic diseases

- **Medical History**
  - View past medical events
  - Add to medical history
  - Filter by date range

- **Household Member Profiles**
  - View each member's health data
  - Quick access to family member information
  - Health profile inheritance options

### User Workflows

#### Adding an Allergy

1. Click "Add Allergy" button
2. Enter allergen name
3. Select severity (Mild/Moderate/Severe)
4. Describe reaction
5. Specify treatment
6. Click "Save Allergy"
7. View success confirmation
8. See allergy added to list

#### Managing Medications

1. Click "Add Medication" button
2. Enter medication name and dosage
3. Set frequency (Daily, Twice daily, etc.)
4. Add indication
5. Set start date (required)
6. Optional: set end date
7. Add prescribing doctor's name
8. Click "Save Medication"
9. Update or remove as needed

#### Updating Health Metrics

1. Navigate to "Health Metrics" section
2. Enter height in centimeters
3. Enter weight in kilograms
4. View auto-calculated BMI
5. Set last checkup date
6. Click "Update Metrics"

### API Calls

```javascript
// Get Health Details
GET /api/health-details
Authorization: Bearer <token>

// Create Health Details
POST /api/health-details
{
  "member_id": "507f1f77bcf86cd799439011",
  "blood_type": "O+",
  "height": "180",
  "weight": "75"
}

// Get Allergies
GET /api/allergies
Authorization: Bearer <token>

// Create Allergy
POST /api/allergies
{
  "member_id": "507f1f77bcf86cd799439011",
  "allergen": "Penicillin",
  "severity": "Severe",
  "reaction": "Anaphylaxis",
  "treatment": "Epinephrine injection"
}

// Update Allergy
PUT /api/allergies/:id
{
  "severity": "Moderate",
  "reaction": "Updated reaction"
}

// Delete Allergy
DELETE /api/allergies/:id

// Get Medications
GET /api/medications
Authorization: Bearer <token>

// Create Medication
POST /api/medications
{
  "member_id": "507f1f77bcf86cd799439011",
  "medication_name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "indication": "Hypertension",
  "start_date": "2025-01-15"
}

// Update Medication
PUT /api/medications/:id
{
  "dosage": "20mg",
  "end_date": "2026-01-15"
}

// Delete Medication
DELETE /api/medications/:id

// Get Chronic Diseases
GET /api/chronic-diseases
Authorization: Bearer <token>

// Create Chronic Disease
POST /api/chronic-diseases
{
  "member_id": "507f1f77bcf86cd799439011",
  "disease_name": "Type 2 Diabetes",
  "diagnosis_date": "2020-06-15",
  "treatment_status": "Controlled",
  "severity": "Moderate"
}
```

### Validation Rules

| Feature         | Rules                                              |
| --------------- | -------------------------------------------------- |
| Blood Type      | Required, format: A+, A-, B+, B-, AB+, AB-, O+, O- |
| Height          | 50-250 cm                                          |
| Weight          | 5-300 kg                                           |
| Allergen Name   | Required, non-empty                                |
| Severity        | Required, Mild/Moderate/Severe                     |
| Medication Name | Required                                           |
| Dosage          | Required format (e.g., 10mg)                       |
| Frequency       | Required                                           |
| Disease Name    | Required                                           |

### Features to Verify

- ✅ Display health metrics correctly
- ✅ Add/edit/delete allergies
- ✅ Add/edit/delete medications
- ✅ Add/edit/delete chronic diseases
- ✅ BMI calculation is accurate
- ✅ Search and filter allergies by severity
- ✅ Show active/inactive medication status
- ✅ Handle 50+ items in each category
- ✅ Real-time form validation
- ✅ Loading states during API calls
- ✅ Error messages with retry options
- ✅ Success notifications
- ✅ Responsive design on all screen sizes

---

## Household Registration Page

**Route:** `/patient/household`  
**Component:** `HouseholdRegistrationPage.jsx`

### Purpose

Register and manage household members and family information.

### Features

- **Household Information**
  - Household ID (auto-generated)
  - Head of family name
  - Address
  - District
  - Province
  - Phone number
  - Number of members

- **Member Management**
  - Add household members
  - View all members with photos
  - Edit member details
  - Delete members
  - Upload member photos
  - Track member relationships

- **Member Data**
  - Full name
  - Date of birth (auto-calculate age)
  - NIC (optional for <18, required for 18+)
  - Contact number
  - Gender
  - Occupation
  - Photo upload

### User Workflows

#### Creating Household

1. Click "Create Household"
2. Enter head of family name
3. Enter address
4. Select district
5. Select province
6. Enter phone number
7. Click "Create"

#### Adding Household Member

1. Click "Add Member"
2. Enter member's full name
3. Select date of birth
4. System auto-calculates age
5. If age > 18:
   - NIC becomes required
   - Can use old format (9digits+V) or new format (12digits)
6. Alternatively enter "N/A" if NIC not available
7. Enter contact number (10 digits)
8. Select gender
9. Enter occupation (optional)
10. Upload photo (optional, max 10MB)
11. Click "Add Member"

#### Photo Upload

1. Click "Upload Photo" button
2. Select image file (JPG, PNG, JPEG)
3. Max file size: 10MB
4. Crop if needed
5. Click "Upload"
6. See preview in member card

### API Calls

```javascript
// Get Households
GET /api/households
Authorization: Bearer <token>

// Create Household
POST /api/households
{
  "head_of_family": "John Doe",
  "address": "123 Main Street, Colombo 7",
  "district": "Colombo",
  "province": "Western Province",
  "phone_number": "0701234567"
}

// Get Household by ID
GET /api/households/:id
Authorization: Bearer <token>

// Update Household
PUT /api/households/:id
{
  "head_of_family": "Jane Doe",
  "address": "456 Oak Avenue, Colombo 5"
}

// Delete Household
DELETE /api/households/:id

// Get Members
GET /api/members
Authorization: Bearer <token>

// Create Member (with photo)
POST /api/members
Headers: multipart/form-data
{
  "household_id": "ANU-PADGNDIV-00001",
  "full_name": "John Doe",
  "address": "123 Main Street, Colombo 7",
  "contact_number": "0701234567",
  "nic": "199512345678",
  "date_of_birth": "1995-12-15",
  "gender": "Male",
  "occupation": "Engineer",
  "photo": [file]
}

// Get Member by ID
GET /api/members/:id
Authorization: Bearer <token>

// Update Member
PUT /api/members/:id
{
  "full_name": "Jane Doe",
  "address": "456 Oak Avenue, Colombo 5",
  "gender": "Female"
}

// Delete Member
DELETE /api/members/:id
```

### Validation Rules

| Field          | Rules                                                       |
| -------------- | ----------------------------------------------------------- |
| Head of Family | Required, 2-150 chars                                       |
| Address        | Required                                                    |
| District       | Required, dropdown selection                                |
| Province       | Required, dropdown selection                                |
| Phone          | Required, format: 10 digits                                 |
| Member Name    | Required, max 150 chars                                     |
| Contact Number | Required, exactly 10 digits (no symbols)                    |
| NIC            | Conditional - required if age > 18, format: 9V or 12 digits |
| Birth Date     | Required                                                    |
| Gender         | Optional, Male/Female/Other                                 |
| Occupation     | Optional                                                    |
| Photo          | Optional, max 10MB, JPG/PNG/JPEG                            |

### Features to Verify

- ✅ Household creation with all required fields
- ✅ Auto-generate household ID
- ✅ Add members with photo upload
- ✅ NIC validation (age-dependent requirement)
- ✅ Photo upload and display (10MB limit)
- ✅ Age auto-calculation from DOB
- ✅ Contact number validation (10 digits)
- ✅ Edit/delete member functionality
- ✅ Display photo in member card
- ✅ Handle large member lists (100+ members)
- ✅ Form validation and error messages
- ✅ Success notifications
- ✅ Responsive image display

---

## Emergency Contact Page

**Route:** `/patient/emergency`  
**Component:** `EmergencyContactPage.jsx`

### Purpose

Manage emergency contact information for quick access in medical emergencies.

### Features

- **Emergency Contact Management**
  - Name
  - Relationship to patient
  - Phone number
  - Email address (optional)
  - Address (optional)
  - Primary contact designation
  - Priority ordering

- **Contact List**
  - View all emergency contacts
  - Sort by priority
  - Quick edit/delete buttons
  - Search by name
  - Filter by relationship type

- **Relationship Types**
  - Spouse
  - Parent
  - Sibling
  - Child
  - Friend
  - Relative
  - Colleague
  - Other

### User Workflows

#### Adding Emergency Contact

1. Click "Add Emergency Contact"
2. Enter contact name
3. Select relationship
4. Enter phone number
5. Enter email (optional)
6. Enter address (optional)
7. Check "Primary Contact" if applicable
8. Click "Save Contact"

#### Setting Primary Contact

1. Multiple contacts can be marked primary
2. Check checkbox for each primary contact
3. Primary contacts displayed first in list
4. Used for critical emergencies

#### Editing Contact

1. Click edit icon on contact card
2. Update any field
3. Click "Update Contact"
4. See success notification

### API Calls

```javascript
// Get Emergency Contacts
GET /api/emergency-contacts
Authorization: Bearer <token>

// Create Emergency Contact
POST /api/emergency-contacts
{
  "member_id": "507f1f77bcf86cd799439011",
  "contact_name": "Jane Doe",
  "relationship": "Spouse",
  "phone_number": "0701234568",
  "email": "jane@example.com",
  "address": "123 Oak Street",
  "is_primary": true
}

// Get Contact by ID
GET /api/emergency-contacts/:id
Authorization: Bearer <token>

// Update Contact
PUT /api/emergency-contacts/:id
{
  "contact_name": "Jane Smith",
  "relationship": "Spouse",
  "phone_number": "0701234569",
  "is_primary": false
}

// Delete Contact
DELETE /api/emergency-contacts/:id
```

### Validation Rules

| Field        | Rules                        |
| ------------ | ---------------------------- |
| Contact Name | Required, non-empty          |
| Relationship | Required, dropdown           |
| Phone Number | Required, valid format       |
| Email        | Optional, valid email format |
| Address      | Optional                     |

### Features to Verify

- ✅ Add/edit/delete emergency contacts
- ✅ Designate primary contacts
- ✅ Display primary contacts first
- ✅ Search contacts by name
- ✅ Filter by relationship type
- ✅ Phone number format validation
- ✅ Email validation (if provided)
- ✅ Load and display multiple contacts
- ✅ Icon indicators for primary contacts
- ✅ Responsive card layout
- ✅ Quick action buttons

---

## Family Tree Page

**Route:** `/patient/family-tree`  
**Component:** `FamilyTreePage.jsx`

### Purpose

Visualize and manage family relationships and structure.

### Features

- **Family Tree Visualization**
  - Hierarchical display of family members
  - Visual relationship connections
  - Multiple generations support
  - Interactive tree navigation
  - Zoom and pan capabilities

- **Relationship Management**
  - Add family relationships
  - Define relationship types
  - Update relationships
  - Remove relationships
  - Track health status of family members

- **Relationship Types Supported**
  - Parent
  - Child
  - Spouse
  - Sibling
  - Grandparent
  - Grandchild
  - Aunt/Uncle
  - Cousin
  - In-laws

- **Member Health Status**
  - Healthy
  - Has chronic disease
  - Under treatment
  - Deceased
  - Status indicators in tree

### User Workflows

#### Viewing Family Tree

1. Navigate to `/patient/family-tree`
2. See tree with all family members
3. Click on member to view details
4. Hover over relationships to see connection type
5. Use zoom controls to adjust view

#### Adding Family Relationship

1. Click "Add Relationship"
2. Select primary member (usually self)
3. Select or create related member
4. Choose relationship type
5. Enter health status of related member
6. Click "Save Relationship"
7. Tree updates with new connection

#### Editing Relationship

1. Click on relationship line/connection
2. Edit relationship type
3. Update health status
4. Click "Update"

### API Calls

```javascript
// Get Family Members
GET /api/family-members
Authorization: Bearer <token>

// Create Family Member
POST /api/family-members
{
  "primary_member_id": "507f1f77bcf86cd799439011",
  "family_member_id": "507f1f77bcf86cd799439012",
  "relationship": "Spouse",
  "health_status": "Healthy"
}

// Get Family Relationships
GET /api/family-relationships
Authorization: Bearer <token>

// Create Relationship Type
POST /api/family-relationships
{
  "relationship_name": "Spouse",
  "description": "Married partner"
}

// Update Family Member
PUT /api/family-members/:id
{
  "relationship": "Spouse",
  "health_status": "Has chronic disease"
}

// Delete Family Member
DELETE /api/family-members/:id
```

### Features to Verify

- ✅ Display family tree hierarchy correctly
- ✅ Add new family relationships
- ✅ Edit existing relationships
- ✅ Delete relationships
- ✅ Health status indicators
- ✅ Support 30+ family members in tree
- ✅ Zoom and pan functionality
- ✅ Responsive tree layout on mobile
- ✅ Member detail popups
- ✅ Color-coded health status
- ✅ Multi-generation visualization

---

## AI Doctor Chat Page

**Route:** `/patient/ai-doctor`  
**Component:** `AIDoctorChatPage.jsx`

### Purpose

AI-powered medical consultation and symptom analysis.

### Features

- **AI Doctor Chat**
  - Real-time chat interface
  - Medical AI assistant
  - Symptom analysis
  - Health recommendations
  - Chat history persistence
  - Timestamp for each message

- **Chat History**
  - View previous conversations
  - Load saved chats
  - Search chat history
  - Delete conversations
  - Export chat as PDF

- **AI Capabilities**
  - Symptom assessment
  - General health information
  - Medication information
  - Lifestyle recommendations
  - When to see a doctor guidance

### User Workflows

#### Starting AI Doctor Consultation

1. Navigate to `/patient/ai-doctor`
2. See chat interface with greeting
3. Type health concern or symptoms
4. Click "Send" or press Enter
5. AI responds with assessment
6. Continue conversation naturally
7. Chat is saved automatically

#### Saving Consultation

1. Conversation saves automatically
2. Can export as PDF
3. Can share with doctor
4. Accessible in history

#### Using Chat History

1. Click "Chat History" tab
2. See list of previous chats
3. Click to load conversation
4. Search by date or symptom
5. Delete old chats if needed

### API Calls

```javascript
// Send Message to AI
POST /api/ai/chat
{
  "message": "I have been experiencing chest pain",
  "member_id": "507f1f77bcf86cd799439011"
}

// Response:
{
  "success": true,
  "data": {
    "response": "Chest pain can have various causes...",
    "suggestions": [
      "Consult a doctor immediately if severe",
      "Note the duration and intensity",
      "Avoid strenuous activity"
    ],
    "timestamp": "2026-04-06T10:30:00Z"
  }
}

// Get Chat History
GET /api/ai/chat-history
Authorization: Bearer <token>

// Save Chat
POST /api/ai/save-chat
{
  "title": "Chest Pain Consultation",
  "messages": [...]
}

// Export Chat
GET /api/ai/chat/:id/export
Authorization: Bearer <token>
```

### Features to Verify

- ✅ Chat interface responsive and smooth
- ✅ Messages send and receive correctly
- ✅ Timestamps display accurately
- ✅ Chat history loads correctly
- ✅ Auto-save functionality works
- ✅ Search in chat history
- ✅ Delete conversations
- ✅ Export to PDF format
- ✅ Handle 100+ messages in conversation
- ✅ Long response text displays properly
- ✅ Error messages when AI unavailable
- ✅ Loading indicators while waiting for AI

---

## Booking Page

**Route:** `/patient/booking`  
**Component:** `BookingPage.jsx`

### Purpose

Schedule and manage healthcare appointments and bookings.

### Features

- **Available Services**
  - General consultation
  - Specialist appointments
  - Lab tests
  - Health checkups
  - Vaccination

- **Appointment Booking**
  - Select service type
  - Choose date and time
  - Select healthcare provider (if applicable)
  - Add notes/reason for visit
  - Confirm booking

- **Booking Management**
  - View all bookings
  - Upcoming appointments
  - Past appointments
  - Modify booking
  - Cancel booking
  - Get appointment confirmation

- **Booking Status**
  - Scheduled
  - Confirmed
  - In Progress
  - Completed
  - Cancelled

### User Workflows

#### Booking Appointment

1. Navigate to Booking page
2. Select service type
3. Pick date (future dates available)
4. Select time slot
5. Add any notes
6. Confirm booking
7. Receive confirmation details

#### Viewing Bookings

1. See "Upcoming" section with next appointments
2. See "Past" section with completed visits
3. Click on booking for details
4. See provider info, time, location

#### Modifying Booking

1. Click on upcoming booking
2. Click "Reschedule"
3. Select new date/time
4. Confirm change

### API Calls

```javascript
// Get All Bookings
GET /api/bookings
Authorization: Bearer <token>

// Get Booking by ID
GET /api/bookings/:id
Authorization: Bearer <token>

// Create Booking
POST /api/bookings
{
  "member_id": "507f1f77bcf86cd799439011",
  "service_type": "general-consultation",
  "appointment_date": "2026-04-15",
  "appointment_time": "14:30",
  "notes": "Regular checkup"
}

// Update Booking
PUT /api/bookings/:id
{
  "appointment_date": "2026-04-20",
  "appointment_time": "15:00"
}

// Cancel Booking
DELETE /api/bookings/:id
```

### Features to Verify

- ✅ Service type selection
- ✅ Date picker shows future dates only
- ✅ Time slot availability
- ✅ Booking confirmation
- ✅ Display upcoming appointments first
- ✅ Filter bookings by status
- ✅ Modify booking details
- ✅ Cancel bookings with confirmation
- ✅ Show appointment location/provider
- ✅ Email confirmation sent

---

## Health Reports Page

**Route:** `/patient/health-reports`  
**Component:** `HealthReportsPage.jsx`

### Purpose

View and manage health reports, lab results, and medical documents.

### Features

- **Report Types**
  - Lab test results
  - Doctor reports
  - Hospital discharge summaries
  - Health checkup reports
  - Vaccination records

- **Report Management**
  - View all reports
  - Filter by type and date
  - Download reports
  - Share reports
  - Print reports

- **Report Details**
  - Report title
  - Date issued
  - Healthcare provider
  - Report content
  - Test results

### API Calls

```javascript
// Get Health Reports
GET /api/health-reports
Authorization: Bearer <token>

// Get Report by ID
GET /api/health-reports/:id
Authorization: Bearer <token>

// Download Report
GET /api/health-reports/:id/download
Authorization: Bearer <token>
```

---

## Symptom Checker Page

**Route:** `/patient/symptom-checker`  
**Component:** `SymptomCheckerPage.jsx`

### Purpose

Self-assessment tool for understanding potential health conditions based on symptoms.

### Features

- **Symptom Selection**
  - Search symptoms
  - Multiple symptom selection
  - Symptom severity indication
  - Duration of symptoms

- **Assessment Results**
  - Potential conditions
  - Likelihood percentage
  - Recommended actions
  - When to see doctor

### User Workflows

#### Using Symptom Checker

1. Enter or select symptoms
2. Indicate severity (mild/moderate/severe)
3. Set duration
4. Click "Analyze"
5. View potential conditions
6. Get recommendations
7. Option to book doctor appointment

### Features to Verify

- ✅ Symptom search functionality
- ✅ Multiple symptom selection
- ✅ Assessment calculation
- ✅ Display results with percentages
- ✅ Recommendation display
- ✅ Link to booking page
- ✅ Mobile-friendly interface

---

## Visit Referral Page

**Route:** `/patient/visit-referral`  
**Component:** `VisitReferralPage.jsx`

### Purpose

Manage medical referrals and track healthcare visits.

### Features

- **Referral Management**
  - View referrals from doctors
  - Referral status tracking
  - Follow-up information
  - Referral expiration dates

- **Visit Tracking**
  - Upcoming referral appointments
  - Completed visits
  - Visit notes
  - Follow-up recommendations

### API Calls

```javascript
// Get Referrals
GET /api/referrals
Authorization: Bearer <token>

// Get Visits
GET /api/visits
Authorization: Bearer <token>
```

---

## User Flow Diagrams

### Patient Authentication Flow

```
Start
  ↓
Login Page
  ↓
Enter Email/Member ID + Password
  ↓
Validate Credentials
  ├─ Success → Store JWT Token
  │             ↓
  │         Redirect to Patient Dashboard
  │             ↓
  │         Access Patient Pages
  └─ Failed → Show Error Message
               ↓
            Retry Login
```

### Health Profile Update Flow

```
Start
  ↓
Health Profile Page
  ↓
Select Feature (Allergy/Medication/Disease)
  ↓
Enter Information
  ↓
Client-side Validation
  ├─ Failed → Show Error
  │            ↑
  │            └─ Retry
  └─ Success → Send to API
               ↓
               Server Validation
               ├─ Failed → Return Error
               │            ↓
               │            Show Error Message
               └─ Success → Save to DB
                            ↓
                            Return Success
                            ↓
                            Update UI
                            ↓
                            Show Notification
```

### Booking Flow

```
Start
  ↓
Booking Page
  ↓
Select Service Type
  ↓
Choose Date & Time
  ↓
Add Notes (Optional)
  ↓
Confirm Booking
  ↓
Send Request to API
  ├─ Failed → Show Error
  │            ↓
  │            Retry Option
  └─ Success → Booking Created
               ↓
               Store Details
               ↓
               Send Confirmation
               ↓
               Redirect to View Bookings
```

---

## Best Practices for Patient Pages

1. **Always validate forms** before API submission
2. **Show loading states** during API calls
3. **Handle errors gracefully** with user-friendly messages
4. **Implement proper error recovery** with retry options
5. **Use pagination** for large lists (50+ items)
6. **Cache frequently accessed data** (allergies, medications)
7. **Implement auto-save** for critical forms
8. **Show confirmation dialogs** before delete operations
9. **Responsive design** for all screen sizes
10. **Minimize API calls** with proper caching

---

## Common Integration Patterns

### Authentication Guard

```javascript
function PatientRoute({ children }) {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || user?.role !== "patient") {
    return <Navigate to="/login" />;
  }

  return children;
}
```

### API Call Pattern

```javascript
async function fetchHealthAllergies() {
  try {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const response = await axios.get("/api/allergies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAllergies(response.data.data);
  } catch (error) {
    setError(error.response?.data?.message || "Failed to load allergies");
  } finally {
    setLoading(false);
  }
}
```

### Form Handling Pattern

```javascript
const [formData, setFormData] = useState({
  /* initial */
});
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const validateForm = () => {
  const newErrors = {};
  if (!formData.allergen) newErrors.allergen = "Required";
  if (!formData.severity) newErrors.severity = "Required";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    setLoading(true);
    const response = await axios.post("/api/allergies", formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    // Handle success
    setSuccess(true);
    resetForm();
  } catch (error) {
    setErrors({ submit: error.response?.data?.message });
  } finally {
    setLoading(false);
  }
};
```

---

**End of Document**
