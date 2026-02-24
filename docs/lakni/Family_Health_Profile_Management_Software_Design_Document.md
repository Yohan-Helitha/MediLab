# 👨‍👩‍👧‍👦 Family Health Profile Management Software Design Document

**Project:** MediLab - Rural Health Diagnostic Test Management System  
**Module:** Family Health Profile Management  
**Version:** 1.0  
**Date:** February 19, 2026  
**Author:** Lakni

---

## 1. Component Name

**Family Health Profile Management System**

This module is the cornerstone of patient data management within the MediLab platform, enabling comprehensive family-centric health record management for rural communities in Sri Lanka.

---

## 2. Overview

The Family Health Profile Management System is designed to address the unique healthcare needs of rural Sri Lankan communities by organizing patient health data at the **household level**. This approach aligns with the community-based healthcare delivery model commonly used by Public Health Inspectors (PHIs) and Medical Officers of Health (MOHs) in rural areas.

### **Key Characteristics:**

- **Health Officer-Driven Data Entry:** **All patient data is entered by authorized health officers** who log into the system - patients do not register themselves
- **Household-Based Organization:** Groups family members under a household unit for efficient community health management
- **Comprehensive Health Records:** Tracks allergies, chronic diseases, medications, emergency contacts, past medical history, and clinical visits
- **Multi-Generational Support:** Manages family relationships and hereditary health patterns across generations
- **Rural Context Awareness:** Captures environmental health factors like water source, CKDu exposure areas, dengue risk zones, and pesticide exposure
- **Field Data Collection:** Facilitates door-to-door household registration and community health surveillance during field visits

### **Purpose:**

This system serves as the **central patient information repository** that integrates with other MediLab modules (booking, lab tests, diagnosis, notifications) to provide a holistic view of patient health while supporting preventive healthcare and early disease detection in underserved rural populations.

### **Important Note:**

> 🔑 **The system has two interfaces:**
>
> - **Health Officer Interface:** For authorized health officers to enter and manage all patient data during field visits and clinical encounters
> - **Patient Interface:** For patients/family members to log in, view their own health records, book appointments, view test results, and manage their profile information

---

## 3. Objectives

### **Primary Objectives:**

1. **Enable Family-Centric Health Management**
   - Register and manage household units with environmental health context
   - Link family members and track hereditary health patterns
   - Support multi-generational health data analysis

2. **Comprehensive Patient Health Records**
   - Maintain detailed medical histories including allergies, chronic diseases, and medications
   - Record clinical visits with doctor notes and diagnoses
   - Track health measurements (height, weight, BMI, blood group)

3. **Support Clinical Decision Making**
   - Provide complete patient context during bookings and test recommendations
   - Alert health officers to allergies and chronic conditions
   - Enable referral management for specialized care

4. **Facilitate Community Health Surveillance**
   - Track household-level health risks (CKDu exposure, dengue zones, water quality)
   - Support epidemiological studies and disease pattern analysis
   - Enable targeted intervention programs

5. **Ensure Data Accuracy and Security**
   - Validate all health data inputs
   - Ensure referential integrity across related entities
   - Restrict access to authorized health officers only

### **Secondary Objectives:**

- Support multi-language display (English, Sinhala, Tamil) for patient-facing features
- Enable emergency contact management for critical situations
- Facilitate family tree visualization for genetic health analysis
- Provide audit trails for health officer activities

---

## 4. Actors

### **4.1 Health Officers (PRIMARY SYSTEM USERS - Only users who log in)**

**Roles:**

- Public Health Inspectors (PHIs)
- Medical Officers of Health (MOHs)
- Nurses
- Administrative Staff

**System Access:**

- ✅ **Login with health officer credentials** (employee_id, username, password)
- ✅ **JWT-based authentication** for all actions
- ✅ **Only actor who can access the system**

**Permissions:**

- ✅ **Enter and manage ALL patient data on behalf of patients**
- ✅ Register new households during field visits
- ✅ Add/update family members based on information collected from patients
- ✅ Record clinical visits and health measurements
- ✅ Document allergies, chronic diseases, medications reported by patients
- ✅ Create referrals based on clinical assessment
- ✅ View comprehensive family health profiles

**Workflow:**

- Health officer logs into system
- Visits patient/household in the field or at clinic
- Collects information verbally from patient/family
- **Health officer enters all data into system**
- System validates and saves data

**Use Cases:**

- Door-to-door household registration in rural villages
- Recording patient information at mobile clinics
- Updating health records during home visits
- Reviewing family medical history before test recommendations
- Creating referrals for specialists

### **4.2 Patients/Family Members (System Users with Patient Portal Access)**

**Roles:**

- Registered household members
- Individuals whose health data is managed in the system
- Primary users of the Patient Interface

**Patient Interface Access:**

- ✅ **Have login credentials** (registered patient accounts)
- ✅ **Log into Patient Portal** with username/password or NIC-based authentication
- ✅ **View their own health records** (read-only access)
- ✅ **Book diagnostic test appointments** (self-service)
- ✅ **View test results and reports**
- ✅ **Update personal contact information**
- ✅ **Manage emergency contacts**
- ✅ **View upcoming appointments and referrals**
- ✅ **Access family health summaries** (if household head)

**Health Officer Data Entry:**

- ✅ Provide medical information verbally to health officers during visits
- ✅ Health officers enter clinical data (allergies, chronic diseases, medications, visit notes)
- ✅ Receive notifications about appointments and referrals

**Dual Data Flow:**

```
Patient Portal Flow:
Patient logs in → Views records / Books appointment → System updates

Clinical Data Flow:
Patient speaks → Health Officer listens → Health Officer logs in → Health Officer enters clinical data → System saves
```

### **4.3 System Administrators**

**Permissions:**

- ✅ Manage health officer accounts
- ✅ Monitor system usage and data integrity
- ✅ Configure system parameters
- ❌ Cannot access patient medical records (HIPAA-like compliance)

---

## 5. Functionalities

### **5.1 Household Management**

**Description:**  
Manages household units representing families in rural communities, capturing both demographic and environmental health factors.

**Features:**

- ✅ **Register New Households** - Create household profiles with unique household IDs (format: `ANU-PADGNDIV-NNNNN`)
- ✅ **Record Household Details** - Capture address, GN division, district, province, village name
- ✅ **Environmental Health Factors** - Track water source, well water testing status, CKDu exposure areas, dengue risk, sanitation type, waste disposal methods, pesticide exposure
- ✅ **Family Chronic Disease History** - Record household-level chronic conditions (diabetes, hypertension, kidney disease, asthma, heart disease)
- ✅ **Update Household Information** - Modify household details and health factors
- ✅ **View All Households** - Browse registered households with filtering and search
- ✅ **Delete/Deactivate Households** - Remove inactive households

**CRUD Operations:**

- `POST /api/households` - Create household
- `GET /api/households` - Get all households
- `GET /api/households/:id` - Get household by ID
- `PUT /api/households/:id` - Update household
- `DELETE /api/households/:id` - Delete household

---

### **5.2 Family Member Management**

**Description:**  
Manages individual family members within households, supporting both registered patients and non-registered family members.

**Features:**

- ✅ **Register Family Members** - Add members to households with demographic information
- ✅ **Link to Patient Profiles** - Connect family members to authenticated patient accounts
- ✅ **Track Relationships** - Record relationship to household head (mother, father, spouse, son, daughter, etc.)
- ✅ **Auto-Calculate Age** - Compute age from date of birth
- ✅ **Gender-Specific Fields** - Support pregnancy status for females aged 12-55
- ✅ **Disability Status Tracking** - Flag members with disabilities
- ✅ **Profile Photo Management** - Store member photos
- ✅ **View Family Members** - List all members in a household
- ✅ **Update Member Information** - Modify demographic details
- ✅ **Remove Members** - Delete family members from households

**CRUD Operations:**

- `POST /api/members` - Create family member
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

**Member Fields:**

- Member ID (format: `MEM-YYYYMMDD-XXXX`)
- Full name, NIC, date of birth, age, gender
- Contact number, address
- Household ID reference
- Profile photo URL
- Disability status, pregnancy status
- Language preference (en, si, ta)
- Active status

---

### **5.3 Family Relationship Tracking**

**Description:**  
Maps familial connections between household members to enable genetic health pattern analysis and family tree visualization.

**Features:**

- ✅ **Define Relationships** - Create parent-child, spouse, sibling relationships
- ✅ **Relationship Types** - Support various relationship types (parent, child, spouse, sibling, grandparent, etc.)
- ✅ **Bi-Directional Linking** - Automatically create reciprocal relationships
- ✅ **Family Tree Visualization** - Generate family tree data for visualization
- ✅ **Hereditary Pattern Analysis** - Identify genetic health risks across generations
- ✅ **View All Relationships** - Browse family connections
- ✅ **Update Relationships** - Modify relationship details
- ✅ **Remove Relationships** - Delete relationship records

**CRUD Operations:**

- `POST /api/family-relationships` - Create relationship
- `GET /api/family-relationships` - Get all relationships
- `GET /api/family-relationships/:id` - Get relationship by ID
- `GET /api/family-relationships/family-tree/:familyMemberId` - Get family tree
- `PUT /api/family-relationships/:id` - Update relationship
- `DELETE /api/family-relationships/:id` - Delete relationship

**Relationship Types:**

- `PARENT` - Parent-child relationship
- `CHILD` - Child of member
- `SPOUSE` - Married partner
- `SIBLING` - Brother/sister
- `GRANDPARENT` - Grandparent-grandchild
- `GRANDCHILD` - Grandchild of member
- `OTHER` - Other familial relationships

---

### **5.4 Health Details Management**

**Description:**  
Records and tracks essential health measurements and vitals for family members during clinical visits.

**Features:**

- ✅ **Record Health Measurements** - Capture height, weight, blood group
- ✅ **Auto-Calculate BMI** - Compute BMI from height and weight
- ✅ **Link to Visits** - Associate measurements with clinical visits
- ✅ **Historical Tracking** - Maintain history of health measurements over time
- ✅ **Staff Attribution** - Track which health officer recorded the data
- ✅ **View Health Details** - Browse health measurement records
- ✅ **Update Measurements** - Modify health details
- ✅ **Delete Records** - Remove outdated measurements

**CRUD Operations:**

- `POST /api/health-details` - Create health details
- `GET /api/health-details` - Get all health details
- `GET /api/health-details/:id` - Get health details by ID
- `PUT /api/health-details/:id` - Update health details
- `DELETE /api/health-details/:id` - Delete health details

**Tracked Measurements:**

- Height (cm)
- Weight (kg)
- BMI (auto-calculated)
- Blood group (A+, A-, B+, B-, O+, O-, AB+, AB-)
- Recording date
- Recording health officer ID

---

### **5.5 Allergy Management**

**Description:**  
Comprehensive tracking of patient allergies to prevent adverse reactions during treatment and testing.

**Features:**

- ✅ **Record Allergies** - Document allergy details including type, allergen, reaction, severity
- ✅ **Allergy Types** - Categorize as drug, food, environmental, insect, contact, or other allergies
- ✅ **Severity Levels** - Classify as mild, moderate, severe, or life-threatening
- ✅ **Reaction Types** - Record specific allergic reactions (rash, swelling, anaphylaxis, etc.)
- ✅ **Historical Context** - Track since when the allergy has been known
- ✅ **Safety Alerts** - Flag allergies during booking and lab test processes
- ✅ **View All Allergies** - Browse allergy records per patient
- ✅ **Update Allergy Information** - Modify allergy details
- ✅ **Remove Allergies** - Delete resolved or incorrect allergy records

**CRUD Operations:**

- `POST /api/allergies` - Create allergy
- `GET /api/allergies` - Get all allergies
- `GET /api/allergies/:id` - Get allergy by ID
- `PUT /api/allergies/:id` - Update allergy
- `DELETE /api/allergies/:id` - Delete allergy

**Allergy Categories:**

- **Drug Allergies:** Penicillin, Sulfa drugs, NSAIDs, etc.
- **Food Allergies:** Nuts, seafood, dairy, eggs, etc.
- **Environmental:** Pollen, dust mites, mold
- **Insect:** Bee stings, ant bites
- **Contact:** Latex, metals, chemicals

---

### **5.6 Chronic Disease Management**

**Description:**  
Tracks long-term health conditions requiring ongoing management and monitoring.

**Features:**

- ✅ **Record Chronic Conditions** - Document chronic diseases with diagnosis details
- ✅ **Disease Types** - Track common rural health issues (diabetes, hypertension, CKDu, asthma, heart disease, kidney disease, etc.)
- ✅ **Treatment Tracking** - Record current treatment approaches
- ✅ **Diagnosis Timeline** - Capture year of diagnosis
- ✅ **Severity Classification** - Categorize disease severity and control status
- ✅ **Integration with Test Recommendations** - Link chronic conditions to required routine tests
- ✅ **View Chronic Diseases** - Browse patient chronic conditions
- ✅ **Update Disease Information** - Modify chronic disease records
- ✅ **Remove Conditions** - Delete resolved or misdiagnosed conditions

**CRUD Operations:**

- `POST /api/chronic-diseases` - Create chronic disease record
- `GET /api/chronic-diseases` - Get all chronic diseases
- `GET /api/chronic-diseases/:id` - Get chronic disease by ID
- `PUT /api/chronic-diseases/:id` - Update chronic disease
- `DELETE /api/chronic-diseases/:id` - Delete chronic disease

**Common Chronic Conditions in Rural Sri Lanka:**

- Diabetes Mellitus (Type 1, Type 2)
- Hypertension
- Chronic Kidney Disease of Unknown Etiology (CKDu)
- Asthma
- Coronary Heart Disease
- Epilepsy
- Thyroid Disorders
- Arthritis

---

### **5.7 Medication Management**

**Description:**  
Maintains current medication lists to prevent drug interactions and ensure safe prescribing.

**Features:**

- ✅ **Record Current Medications** - Document all medications patient is taking
- ✅ **Medication Details** - Capture medication name, dosage, frequency, administration route
- ✅ **Start Date Tracking** - Record when medication was started
- ✅ **Indication Tracking** - Link medications to conditions being treated
- ✅ **Special Instructions** - Note timing, food interactions, precautions
- ✅ **Active Status** - Track current vs discontinued medications
- ✅ **Drug Interaction Alerts** - Flag potential interactions (future enhancement)
- ✅ **View Medication List** - Browse patient medications
- ✅ **Update Medications** - Modify medication details
- ✅ **Discontinue/Remove Medications** - Mark medications as stopped

**CRUD Operations:**

- `POST /api/medications` - Create medication record
- `GET /api/medications` - Get all medications
- `GET /api/medications/:id` - Get medication by ID
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

**Medication Fields:**

- Medication name (generic/brand)
- Dosage (e.g., "500mg")
- Frequency (e.g., "twice daily")
- Route (oral, topical, injection)
- Start date
- Indication (why prescribed)
- Special instructions
- Active status

---

### **5.8 Emergency Contact Management**

**Description:**  
Stores emergency contact information for critical situations requiring immediate family notification.

**Features:**

- ✅ **Register Emergency Contacts** - Add emergency contact persons for patients
- ✅ **Multiple Contacts** - Support multiple emergency contacts per patient
- ✅ **Contact Details** - Capture name, relationship, primary and secondary phone numbers
- ✅ **Quick Access** - Easily accessible during emergencies
- ✅ **View Emergency Contacts** - List all emergency contacts for a patient
- ✅ **Update Contact Information** - Modify emergency contact details
- ✅ **Remove Contacts** - Delete emergency contact records

**CRUD Operations:**

- `POST /api/emergency-contacts` - Create emergency contact
- `GET /api/emergency-contacts` - Get all emergency contacts
- `GET /api/emergency-contacts/:id` - Get emergency contact by ID
- `PUT /api/emergency-contacts/:id` - Update emergency contact
- `DELETE /api/emergency-contacts/:id` - Delete emergency contact

**Contact Information:**

- Full name
- Relationship to patient (spouse, parent, sibling, friend, neighbor)
- Primary phone number
- Secondary phone number (optional)
- Member ID reference

---

### **5.9 Past Medical History Management**

**Description:**  
Documents significant past medical events, surgeries, hospitalizations, and major illnesses.

**Features:**

- ✅ **Record Medical History** - Document past medical events
- ✅ **Event Types** - Categorize as surgery, hospitalization, major illness, injury, pregnancy
- ✅ **Event Details** - Capture condition/procedure name, description, date
- ✅ **Outcome Tracking** - Record treatment outcomes
- ✅ **Hospital/Provider Information** - Note where treatment was received
- ✅ **Chronological View** - Display medical history timeline
- ✅ **View Medical History** - Browse past medical events
- ✅ **Update History Records** - Modify medical history entries
- ✅ **Remove Records** - Delete incorrect medical history entries

**CRUD Operations:**

- `POST /api/past-medical-history` - Create medical history record
- `GET /api/past-medical-history` - Get all medical history
- `GET /api/past-medical-history/:id` - Get medical history by ID
- `PUT /api/past-medical-history/:id` - Update medical history
- `DELETE /api/past-medical-history/:id` - Delete medical history

**Event Types:**

- Surgery/Operation
- Hospitalization
- Major Illness
- Injury/Accident
- Pregnancy/Childbirth
- Vaccination
- Diagnostic Procedure

---

### **5.10 Clinical Visit Management**

**Description:**  
Records patient visits to health facilities including mobile clinics, OPD visits, and home visits.

**Features:**

- ✅ **Record Visits** - Document clinical encounters
- ✅ **Visit Types** - Categorize as OPD, mobile clinic, or home visit
- ✅ **Clinical Notes** - Capture reason for visit, doctor notes, diagnosis
- ✅ **Follow-Up Management** - Schedule and track follow-up appointments
- ✅ **Link to Test Bookings** - Connect visits to diagnostic test bookings
- ✅ **Staff Attribution** - Track which health officer conducted the visit
- ✅ **Visit History** - View chronological patient visit records
- ✅ **Update Visit Records** - Modify visit details
- ✅ **Delete Visits** - Remove visit records

**CRUD Operations:**

- `POST /api/visits` - Create visit record
- `GET /api/visits` - Get all visits
- `GET /api/visits/:id` - Get visit by ID
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

**Visit Fields:**

- Visit date
- Visit type (OPD, Mobile Clinic, Home Visit)
- Reason for visit
- Doctor notes
- Diagnosis
- Follow-up required (yes/no)
- Follow-up date
- Member ID reference
- Household ID reference
- Created by staff ID

---

### **5.11 Referral Management**

**Description:**  
Manages patient referrals to specialists, hospitals, or diagnostic centers when advanced care is needed.

**Features:**

- ✅ **Create Referrals** - Generate referral documents
- ✅ **Referral Types** - Categorize as specialist, hospital, diagnostic center, emergency
- ✅ **Referral Details** - Specify referred to (facility/doctor), specialty, reason, urgency
- ✅ **Status Tracking** - Track referral status (pending, completed, cancelled)
- ✅ **Link to Visits** - Associate referrals with clinical visits
- ✅ **Priority Levels** - Mark urgent referrals
- ✅ **View Referrals** - Browse patient referrals
- ✅ **View by Visit** - Get all referrals for a specific visit
- ✅ **Update Referral Status** - Modify referral details and status
- ✅ **Cancel Referrals** - Delete or cancel referrals

**CRUD Operations:**

- `POST /api/referrals` - Create referral
- `GET /api/referrals` - Get all referrals
- `GET /api/referrals/visit/:visitId` - Get referrals by visit
- `GET /api/referrals/:id` - Get referral by ID
- `PUT /api/referrals/:id` - Update referral
- `DELETE /api/referrals/:id` - Delete referral

**Referral Fields:**

- Referral type
- Referred to (facility name, doctor name)
- Specialty
- Reason for referral
- Urgency level (routine, urgent, emergency)
- Status (pending, completed, cancelled)
- Referral date
- Visit ID reference
- Member ID reference

---

## 6. Data Model

### **6.1 Entity Relationship Diagram**

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Household     │◄────────┤  FamilyMember   │────────►│ Family          │
│                 │ 1     * │   (Member)      │ *     * │ Relationship    │
│ - household_id  │         │ - member_id     │         │ - member1_id    │
│ - village_name  │         │ - household_id  │         │ - member2_id    │
│ - gn_division   │         │ - full_name     │         │ - relationship  │
│ - water_source  │         │ - nic           │         └─────────────────┘
│ - ckdu_exposure │         │ - date_of_birth │
└─────────────────┘         │ - gender        │
                            │ - pregnancy_    │
                            │   status        │
                            └────────┬────────┘
                                     │ 1
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                │ *                  │ *                  │ *
         ┌──────▼──────┐      ┌─────▼──────┐      ┌─────▼──────┐
         │   Allergy   │      │  Chronic   │      │ Medication │
         │             │      │  Disease   │      │            │
         │ - allergy_  │      │ - disease_ │      │ - med_name │
         │   type      │      │   name     │      │ - dosage   │
         │ - severity  │      │ - severity │      │ - frequency│
         └─────────────┘      └────────────┘      └────────────┘

                ┌─────────────────┬─────────────────┬─────────────────┐
                │ *               │ *               │ *               │ *
         ┌──────▼──────┐   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
         │  Emergency  │   │   Health    │  │    Visit    │  │  Referral   │
         │  Contact    │   │   Details   │  │             │  │             │
         │             │   │             │  │ - visit_    │  │ - referred_ │
         │ - full_name │   │ - height_cm │  │   type      │  │   to        │
         │ - phone     │   │ - weight_kg │  │ - diagnosis │  │ - urgency   │
         │ - relation  │   │ - bmi       │  │ - doctor_   │  │ - status    │
         └─────────────┘   │ - blood_    │  │   notes     │  └─────────────┘
                           │   group     │  └─────┬───────┘
                           └─────────────┘        │ 1
                                                  │
                                                  │ *
                                          ┌───────▼────────┐
                                          │   Past         │
                                          │   Medical      │
                                          │   History      │
                                          │                │
                                          │ - event_type   │
                                          │ - condition    │
                                          │ - event_date   │
                                          └────────────────┘

┌────────────────┐
│ HealthOfficer  │
│                │
│ - employee_id  ├─────► registers/updates ────► All entities
│ - full_name    │
│ - role         │
└────────────────┘
```

### **6.2 Database Schemas**

#### **6.2.1 Household Schema**

```javascript
{
  _id: ObjectId,
  household_id: String,                    // ANU-PADGNDIV-NNNNN
  head_member_name: String,                // required, max 150
  primary_contact_number: String,          // required, max 20
  secondary_contact_number: String,        // optional, max 20
  address: String,                         // required
  village_name: String,                    // required, max 100
  gn_division: String,                     // required, max 100
  district: String,                        // required, max 100
  province: String,                        // required, max 100
  registered_by_staff_id: String,          // HO-YYYY-XXX format
  registration_date: Date,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.2 Member (Family Member) Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // MEM-YYYYMMDD-XXXX
  household_id: String,                    // ref: Household
  full_name: String,                       // required, max 150
  address: String,                         // required
  contact_number: String,                  // required, max 20
  nic: String,                             // unique, max 20
  password_hash: String,                   // for patient login
  date_of_birth: Date,                     // required
  age: Number,                             // auto-calculated
  gender: String,                          // MALE, FEMALE, OTHER
  relationship_to_head: String,            // MOTHER, FATHER, etc.
  language: String,                        // en, si, ta
  disability_status: Boolean,
  pregnancy_status: Boolean,               // females 12-55
  photo_url: String,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.3 Family Relationship Schema**

```javascript
{
  _id: ObjectId,
  member1_id: String,                      // ref: Member
  member2_id: String,                      // ref: Member
  relationship_type: String,               // PARENT, CHILD, SPOUSE, SIBLING
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.4 Health Details Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member
  visit_id: String,                        // optional ref: Visit
  height_cm: Number,
  weight_kg: Number,
  bmi: Number,                             // auto-calculated
  blood_group: String,                     // A+, O-, etc.
  recorded_date: Date,
  recorded_by_staff_id: String,
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.5 Allergy Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member, required
  allergy_type: String,                    // required, max 50
                                           // DRUG, FOOD, ENVIRONMENTAL, INSECT, CONTACT, OTHER
  allergen_name: String,                   // required, max 100
  reaction_type: String,                   // required, max 100
                                           // e.g., "Rash", "Anaphylaxis", "Swelling"
  severity: String,                        // required, max 20
                                           // MILD, MODERATE, SEVERE, LIFE_THREATENING
  since_year: Number,                      // min 1900, max current year
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.6 Chronic Disease Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member, required
  disease_name: String,                    // required, max 150
  diagnosis_year: Number,
  severity: String,                        // MILD, MODERATE, SEVERE
  current_treatment: String,
  notes: String,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.7 Medication Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member, required
  medication_name: String,                 // required, max 150
  dosage: String,                          // e.g., "500mg"
  frequency: String,                       // e.g., "twice daily"
  route: String,                           // ORAL, TOPICAL, INJECTION, etc.
  start_date: Date,
  indication: String,                      // why prescribed
  special_instructions: String,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.8 Emergency Contact Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member, required
  full_name: String,                       // required, max 150
  relationship: String,                    // required, max 50
  primary_phone_number: String,            // required, max 20
  secondary_phone_number: String,          // optional, max 20
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.9 Past Medical History Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member, required
  event_type: String,                      // required, max 50
                                           // SURGERY, HOSPITALIZATION, MAJOR_ILLNESS, etc.
  condition_or_procedure: String,          // required, max 200
  event_date: Date,
  hospital_or_provider: String,
  outcome: String,
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.10 Visit Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member, required
  household_id: String,                    // ref: Household
  visit_date: Date,                        // required
  visit_type: String,                      // required
                                           // OPD, MOBILE_CLINIC, HOME_VISIT
  reason_for_visit: String,
  doctor_notes: String,
  diagnosis: String,
  follow_up_required: Boolean,
  follow_up_date: Date,
  created_by_staff_id: String,             // required
  created_at: Date,
  updated_at: Date
}
```

#### **6.2.11 Referral Schema**

```javascript
{
  _id: ObjectId,
  member_id: String,                       // ref: Member, required
  visit_id: String,                        // ref: Visit
  referral_type: String,                   // SPECIALIST, HOSPITAL, DIAGNOSTIC_CENTER, EMERGENCY
  referred_to_facility: String,
  referred_to_doctor: String,
  specialty: String,
  reason_for_referral: String,
  urgency_level: String,                   // ROUTINE, URGENT, EMERGENCY
  status: String,                          // PENDING, COMPLETED, CANCELLED
  referral_date: Date,
  created_at: Date,
  updated_at: Date
}
```

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Health       │  │  Patient     │  │  Admin Dashboard     │  │
│  │ Officer UI   │  │  Portal UI   │  │  (System Admin)      │  │
│  │              │  │              │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │               │
└─────────┼─────────────────┼──────────────────────┼───────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                        │
│                    (Express.js REST API)                         │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   Auth     │  │  Request   │  │   CORS     │  │  Error   │ │
│  │ Middleware │  │ Validation │  │  Security  │  │ Handler  │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                            │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │ householdController  │  │ memberController             │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │ allergyController    │  │ chronicDiseaseController     │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │ medicationController │  │ emergencyContactController   │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │ visitController      │  │ referralController           │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │healthDetailsController│ │pastMedicalHistoryController │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │familyMemberController│  │familyRelationshipController │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYER                              │
│              (Express Validator Middleware)                      │
│                                                                  │
│  Validates:                                                      │
│  - Required fields                                               │
│  - Data types and formats                                        │
│  - ID format patterns (household_id, member_id, staff_id)       │
│  - Field length constraints                                      │
│  - Enum value restrictions                                       │
│  - Date ranges                                                   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│                   (Business Logic Layer)                         │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │ householdService     │  │ memberService                │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │ allergyService       │  │ chronicDiseaseService        │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │ medicationService    │  │ emergencyContactService      │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │ visitService         │  │ referralService              │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │healthDetailsService  │  │pastMedicalHistoryService     │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │familyMemberService   │  │familyRelationshipService     │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
│                                                                  │
│  Business Logic:                                                 │
│  - Auto-calculate age from date of birth                         │
│  - Auto-calculate BMI from height/weight                         │
│  - Generate unique IDs (household_id, member_id)                │
│  - Validate referential integrity                                │
│  - Enforce business rules                                        │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA ACCESS LAYER                          │
│                    (Mongoose ODM Models)                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  Household   │ │    Member    │ │  FamilyRelationship  │    │
│  │    Model     │ │    Model     │ │       Model          │    │
│  ├──────────────┤ ├──────────────┤ ├──────────────────────┤    │
│  │   Allergy    │ │   Chronic    │ │     Medication       │    │
│  │    Model     │ │   Disease    │ │       Model          │    │
│  │              │ │    Model     │ │                      │    │
│  ├──────────────┤ ├──────────────┤ ├──────────────────────┤    │
│  │  Emergency   │ │    Health    │ │        Visit         │    │
│  │   Contact    │ │   Details    │ │       Model          │    │
│  │    Model     │ │    Model     │ │                      │    │
│  ├──────────────┤ ├──────────────┤ ├──────────────────────┤    │
│  │   Referral   │ │    Past      │ │                      │    │
│  │    Model     │ │   Medical    │ │                      │    │
│  │              │ │   History    │ │                      │    │
│  └──────────────┘ └──────────────┘ └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│                         MongoDB                                  │
│                                                                  │
│  Collections:                                                    │
│  • households              • family_relationships               │
│  • members                 • allergies                           │
│  • chronic_diseases        • medications                         │
│  • emergency_contacts      • health_details                      │
│  • visits                  • referrals                           │
│  • past_medical_histories                                        │
└─────────────────────────────────────────────────────────────────┘
```

### **Cross-Module Integration Points:**

```
┌─────────────────────────────────────────────────────────────────┐
│             Family Health Profile Management Module              │
│                                                                  │
│         Exports:                    Imports:                     │
│         - Patient/Member data       - Auth (Health Officer)     │
│         - Household data            - Lab Test data             │
│         - Allergy alerts            - Booking data              │
│         - Chronic disease info      - Diagnosis API             │
│         - Medication lists          - Notification service      │
└─────────────────────────────────────────────────────────────────┘
          │                          │                  │
          ▼                          ▼                  ▼
┌─────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│   Booking       │  │  Lab/Test Results   │  │   Notification   │
│   Module        │  │      Module         │  │     Module       │
│                 │  │                     │  │                  │
│ Uses member &   │  │ Links results to    │  │ Sends alerts     │
│ household data  │  │ patients            │  │ about follow-ups │
│ for bookings    │  │                     │  │ & referrals      │
└─────────────────┘  └─────────────────────┘  └──────────────────┘
```

---

## 8. Workflow

### **8.1 Household Registration Workflow**

```
┌────────────────────────────────────────────────────────────────────┐
│                      HOUSEHOLD REGISTRATION                         │
└────────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────────────────┐
│ 1. Health Officer logs into system  │
│    (with employee credentials)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Health Officer visits rural area │
│    (door-to-door visit)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Health Officer interviews family │
│    and collects information:        │
│    - Head member name                │
│    - Address details                 │
│    - Village name, GN division       │
│    - Contact numbers                 │
│    - Environmental health factors    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Health Officer enters data into  │
│    system (mobile/tablet/laptop)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. System validates input            │
│    - Required fields check           │
│    - Format validations              │
│    - Staff ID verification           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. System generates household_id    │
│    Format: ANU-PADGNDIV-NNNNN       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Household record saved to DB     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 6. Health Officer proceeds to add   │
│    family members                    │
└──────────────┬──────────────────────┘
               │
               ▼
              END
```

### **8.2 Family Member Registration Workflow**

```
START (Household exists, Health Officer logged in)
  │
  ▼
┌─────────────────────────────────────┐
│ 1. Health Officer selects household │
│    in system                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Health Officer interviews family │
│    member and collects information: │
│    - Full name, NIC                  │
│    - Date of birth                   │
│    - Gender                          │
│    - Contact number                  │
│    - Relationship to head            │
│    - Disability/pregnancy status     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Health Officer enters member data│
│    into system                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. System validates & calculates:   │
│    - Age from DOB                    │
│    - Pregnancy status eligibility    │
│    - NIC uniqueness                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. System generates member_id       │
│    Format: MEM-YYYYMMDD-XXXX        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Member record saved to DB        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 6. Optionally add:                  │
│    - Emergency contacts              │
│    - Allergies                       │
│    - Chronic diseases                │
│    - Current medications             │
└──────────────┬──────────────────────┘
               │
               ▼
              END
```

### **8.3 Clinical Visit & Medical Record Workflow**

```
START (Patient arrives at health facility)
  │
  ▼
┌─────────────────────────────────────┐
│ 1. Health Officer logs into system  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Health Officer searches &        │
│    retrieves patient record         │
│    (by member_id, NIC, or name)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Health Officer reviews patient   │
│    medical summary:                 │
│    - Allergies (ALERT if present)   │
│    - Chronic diseases                │
│    - Current medications             │
│    - Past medical history            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Health Officer creates new visit │
│    record in system                 │
│    - Visit type, date               │
│    - Reason for visit               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Health Officer measures patient  │
│    and enters measurements:         │
│    - Height, weight → BMI calculated│
│    - Blood group (if first time)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 6. Health officer examines patient  │
│    and enters clinical notes:       │
│    - Records doctor notes           │
│    - Enters diagnosis                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 7. Health Officer decision point:   │
│    - Tests needed? → Create booking │
│    - Referral needed? → Create ref  │
│    - Follow-up needed? → Schedule   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 8. Health Officer updates patient   │
│    records if needed:               │
│    - New allergies discovered?      │
│    - New chronic disease diagnosis? │
│    - New medication prescribed?     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 9. Health Officer saves visit       │
│    record & all updates             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 10. [If tests ordered]              │
│     Health Officer creates booking  │
│     → Integrate with Booking Module │
│     → Link booking to this visit    │
└──────────────┬──────────────────────┘
               │
               ▼
              END
```

### **8.4 Referral Management Workflow**

```
START (During clinical visit)
  │
  ▼
┌─────────────────────────────────────┐
│ 1. Health officer identifies need   │
│    for specialist care               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Create referral:                 │
│    - Referral type (specialist/     │
│      hospital/diagnostic center)    │
│    - Referred to (facility/doctor)  │
│    - Specialty needed               │
│    - Reason for referral            │
│    - Urgency level                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. System validates & links:        │
│    - Links to current visit         │
│    - Links to patient record        │
│    - Sets status to PENDING         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Referral document generated      │
│    (for patient to take to facility)│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. [Optional] Notification sent     │
│    to patient about referral        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 6. Patient visits referred facility │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 7. [Later] Health officer updates   │
│    referral status to COMPLETED     │
└──────────────┬──────────────────────┘
               │
               ▼
              END
```

### **8.5 Family Health Pattern Analysis Workflow (Future)**

```
START (Triggered by system or health officer)
  │
  ▼
┌─────────────────────────────────────┐
│ 1. Select household for analysis    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Retrieve all family members      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Analyze chronic diseases across  │
│    family members                    │
│    - Diabetes prevalence             │
│    - Hypertension occurrence         │
│    - CKDu risk factors               │
│    - Other hereditary conditions     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Analyze environmental risks:     │
│    - Water source contamination     │
│    - CKDu exposure area              │
│    - Pesticide exposure              │
│    - Sanitation issues               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Generate health pattern report:  │
│    - Identified risks                │
│    - At-risk family members          │
│    - Recommended interventions       │
│    - Suggested tests                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 6. Present findings to health       │
│    officer for action                │
└──────────────┬──────────────────────┘
               │
               ▼
              END
```

---

## 9. API Endpoints

### **9.1 Household Management APIs**

| Method   | Endpoint              | Description          | Auth Required        |
| -------- | --------------------- | -------------------- | -------------------- |
| `POST`   | `/api/households`     | Create new household | Yes (Health Officer) |
| `GET`    | `/api/households`     | Get all households   | Yes (Health Officer) |
| `GET`    | `/api/households/:id` | Get household by ID  | Yes (Health Officer) |
| `PUT`    | `/api/households/:id` | Update household     | Yes (Health Officer) |
| `DELETE` | `/api/households/:id` | Delete household     | Yes (Health Officer) |

**POST /api/households - Request Body:**

```json
{
  "head_member_name": "D.M.K. Dissanayake",
  "primary_contact_number": "0712345678",
  "secondary_contact_number": "0777654321",
  "address": "No. 45, Temple Road, Padaviya",
  "village_name": "Padaviya",
  "gn_division": "Padaviya GN Division",
  "district": "Anuradhapura",
  "province": "North Central Province",
  "registered_by_staff_id": "HO-2026-001"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Household created successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "household_id": "ANU-PADGNDIV-00001",
    "head_member_name": "D.M.K. Dissanayake",
    "village_name": "Padaviya",
    "is_active": true,
    "created_at": "2026-02-19T10:30:00.000Z"
  }
}
```

---

### **9.2 Member (Family Member) Management APIs**

| Method   | Endpoint           | Description          | Auth Required        |
| -------- | ------------------ | -------------------- | -------------------- |
| `POST`   | `/api/members`     | Create family member | Yes (Health Officer) |
| `GET`    | `/api/members`     | Get all members      | Yes (Health Officer) |
| `GET`    | `/api/members/:id` | Get member by ID     | Yes (Health Officer) |
| `PUT`    | `/api/members/:id` | Update member        | Yes (Health Officer) |
| `DELETE` | `/api/members/:id` | Delete member        | Yes (Health Officer) |

**POST /api/members - Request Body:**

```json
{
  "household_id": "ANU-PADGNDIV-00001",
  "full_name": "K.M. Nimal Perera",
  "address": "No. 45, Temple Road, Padaviya",
  "contact_number": "0712345678",
  "nic": "912345678V",
  "date_of_birth": "1991-05-15",
  "gender": "MALE",
  "relationship_to_head": "SON",
  "language": "si",
  "disability_status": false,
  "pregnancy_status": false
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "_id": "65f9876543210abcdef67890",
    "member_id": "MEM-20260219-1001",
    "household_id": "ANU-PADGNDIV-00001",
    "full_name": "K.M. Nimal Perera",
    "age": 34,
    "gender": "MALE",
    "is_active": true,
    "created_at": "2026-02-19T11:00:00.000Z"
  }
}
```

---

### **9.3 Allergy Management APIs**

| Method   | Endpoint             | Description           | Auth Required        |
| -------- | -------------------- | --------------------- | -------------------- |
| `POST`   | `/api/allergies`     | Create allergy record | Yes (Health Officer) |
| `GET`    | `/api/allergies`     | Get all allergies     | Yes (Health Officer) |
| `GET`    | `/api/allergies/:id` | Get allergy by ID     | Yes (Health Officer) |
| `PUT`    | `/api/allergies/:id` | Update allergy        | Yes (Health Officer) |
| `DELETE` | `/api/allergies/:id` | Delete allergy        | Yes (Health Officer) |

**POST /api/allergies - Request Body:**

```json
{
  "member_id": "MEM-20260219-1001",
  "allergy_type": "DRUG",
  "allergen_name": "Penicillin",
  "reaction_type": "Rash and itching",
  "severity": "MODERATE",
  "since_year": 2018
}
```

---

### **9.4 Chronic Disease Management APIs**

| Method   | Endpoint                    | Description                   | Auth Required        |
| -------- | --------------------------- | ----------------------------- | -------------------- |
| `POST`   | `/api/chronic-diseases`     | Create chronic disease record | Yes (Health Officer) |
| `GET`    | `/api/chronic-diseases`     | Get all chronic diseases      | Yes (Health Officer) |
| `GET`    | `/api/chronic-diseases/:id` | Get chronic disease by ID     | Yes (Health Officer) |
| `PUT`    | `/api/chronic-diseases/:id` | Update chronic disease        | Yes (Health Officer) |
| `DELETE` | `/api/chronic-diseases/:id` | Delete chronic disease        | Yes (Health Officer) |

**POST /api/chronic-diseases - Request Body:**

```json
{
  "member_id": "MEM-20260219-1001",
  "disease_name": "Type 2 Diabetes Mellitus",
  "diagnosis_year": 2020,
  "severity": "MODERATE",
  "current_treatment": "Metformin 500mg twice daily, dietary control",
  "notes": "Family history of diabetes. Requires regular blood glucose monitoring.",
  "is_active": true
}
```

---

### **9.5 Medication Management APIs**

| Method   | Endpoint               | Description              | Auth Required        |
| -------- | ---------------------- | ------------------------ | -------------------- |
| `POST`   | `/api/medications`     | Create medication record | Yes (Health Officer) |
| `GET`    | `/api/medications`     | Get all medications      | Yes (Health Officer) |
| `GET`    | `/api/medications/:id` | Get medication by ID     | Yes (Health Officer) |
| `PUT`    | `/api/medications/:id` | Update medication        | Yes (Health Officer) |
| `DELETE` | `/api/medications/:id` | Delete medication        | Yes (Health Officer) |

**POST /api/medications - Request Body:**

```json
{
  "member_id": "MEM-20260219-1001",
  "medication_name": "Metformin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "route": "ORAL",
  "start_date": "2020-03-15",
  "indication": "Type 2 Diabetes Mellitus",
  "special_instructions": "Take with meals. Monitor blood sugar regularly.",
  "is_active": true
}
```

---

### **9.6 Emergency Contact Management APIs**

| Method   | Endpoint                      | Description                 | Auth Required        |
| -------- | ----------------------------- | --------------------------- | -------------------- |
| `POST`   | `/api/emergency-contacts`     | Create emergency contact    | Yes (Health Officer) |
| `GET`    | `/api/emergency-contacts`     | Get all emergency contacts  | Yes (Health Officer) |
| `GET`    | `/api/emergency-contacts/:id` | Get emergency contact by ID | Yes (Health Officer) |
| `PUT`    | `/api/emergency-contacts/:id` | Update emergency contact    | Yes (Health Officer) |
| `DELETE` | `/api/emergency-contacts/:id` | Delete emergency contact    | Yes (Health Officer) |

---

### **9.7 Health Details Management APIs**

| Method   | Endpoint                  | Description              | Auth Required        |
| -------- | ------------------------- | ------------------------ | -------------------- |
| `POST`   | `/api/health-details`     | Create health details    | Yes (Health Officer) |
| `GET`    | `/api/health-details`     | Get all health details   | Yes (Health Officer) |
| `GET`    | `/api/health-details/:id` | Get health details by ID | Yes (Health Officer) |
| `PUT`    | `/api/health-details/:id` | Update health details    | Yes (Health Officer) |
| `DELETE` | `/api/health-details/:id` | Delete health details    | Yes (Health Officer) |

**POST /api/health-details - Request Body:**

```json
{
  "member_id": "MEM-20260219-1001",
  "visit_id": "VISIT-20260219-5001",
  "height_cm": 170,
  "weight_kg": 75,
  "blood_group": "A+",
  "recorded_date": "2026-02-19",
  "recorded_by_staff_id": "HO-2026-001"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Health details created successfully",
  "data": {
    "_id": "65f11111abcdef123456789",
    "member_id": "MEM-20260219-1001",
    "height_cm": 170,
    "weight_kg": 75,
    "bmi": 25.95,
    "blood_group": "A+",
    "recorded_date": "2026-02-19T00:00:00.000Z",
    "created_at": "2026-02-19T12:00:00.000Z"
  }
}
```

---

### **9.8 Visit Management APIs**

| Method   | Endpoint          | Description         | Auth Required        |
| -------- | ----------------- | ------------------- | -------------------- |
| `POST`   | `/api/visits`     | Create visit record | Yes (Health Officer) |
| `GET`    | `/api/visits`     | Get all visits      | Yes (Health Officer) |
| `GET`    | `/api/visits/:id` | Get visit by ID     | Yes (Health Officer) |
| `PUT`    | `/api/visits/:id` | Update visit        | Yes (Health Officer) |
| `DELETE` | `/api/visits/:id` | Delete visit        | Yes (Health Officer) |

**POST /api/visits - Request Body:**

```json
{
  "member_id": "MEM-20260219-1001",
  "household_id": "ANU-PADGNDIV-00001",
  "visit_date": "2026-02-19",
  "visit_type": "OPD",
  "reason_for_visit": "Follow-up for diabetes management",
  "doctor_notes": "Patient reports good dietary adherence. Blood sugar levels improving.",
  "diagnosis": "Type 2 Diabetes Mellitus - well controlled",
  "follow_up_required": true,
  "follow_up_date": "2026-05-19",
  "created_by_staff_id": "HO-2026-001"
}
```

---

### **9.9 Referral Management APIs**

| Method   | Endpoint                        | Description               | Auth Required        |
| -------- | ------------------------------- | ------------------------- | -------------------- |
| `POST`   | `/api/referrals`                | Create referral           | Yes (Health Officer) |
| `GET`    | `/api/referrals`                | Get all referrals         | Yes (Health Officer) |
| `GET`    | `/api/referrals/visit/:visitId` | Get referrals by visit ID | Yes (Health Officer) |
| `GET`    | `/api/referrals/:id`            | Get referral by ID        | Yes (Health Officer) |
| `PUT`    | `/api/referrals/:id`            | Update referral           | Yes (Health Officer) |
| `DELETE` | `/api/referrals/:id`            | Delete referral           | Yes (Health Officer) |

**POST /api/referrals - Request Body:**

```json
{
  "member_id": "MEM-20260219-1001",
  "visit_id": "VISIT-20260219-5001",
  "referral_type": "SPECIALIST",
  "referred_to_facility": "Anuradhapura Teaching Hospital",
  "referred_to_doctor": "Dr. S. Jayasuriya",
  "specialty": "Endocrinology",
  "reason_for_referral": "Uncontrolled diabetes requiring specialist management",
  "urgency_level": "ROUTINE",
  "status": "PENDING",
  "referral_date": "2026-02-19"
}
```

---

### **9.10 Past Medical History Management APIs**

| Method   | Endpoint                        | Description                    | Auth Required        |
| -------- | ------------------------------- | ------------------------------ | -------------------- |
| `POST`   | `/api/past-medical-history`     | Create past medical history    | Yes (Health Officer) |
| `GET`    | `/api/past-medical-history`     | Get all past medical history   | Yes (Health Officer) |
| `GET`    | `/api/past-medical-history/:id` | Get past medical history by ID | Yes (Health Officer) |
| `PUT`    | `/api/past-medical-history/:id` | Update past medical history    | Yes (Health Officer) |
| `DELETE` | `/api/past-medical-history/:id` | Delete past medical history    | Yes (Health Officer) |

---

### **9.11 Family Relationship Management APIs**

| Method   | Endpoint                                                | Description                | Auth Required        |
| -------- | ------------------------------------------------------- | -------------------------- | -------------------- |
| `POST`   | `/api/family-relationships`                             | Create family relationship | Yes (Health Officer) |
| `GET`    | `/api/family-relationships`                             | Get all relationships      | Yes (Health Officer) |
| `GET`    | `/api/family-relationships/:id`                         | Get relationship by ID     | Yes (Health Officer) |
| `GET`    | `/api/family-relationships/family-tree/:familyMemberId` | Get family tree            | Yes (Health Officer) |
| `PUT`    | `/api/family-relationships/:id`                         | Update relationship        | Yes (Health Officer) |
| `DELETE` | `/api/family-relationships/:id`                         | Delete relationship        | Yes (Health Officer) |

**POST /api/family-relationships - Request Body:**

```json
{
  "member1_id": "MEM-20260219-1001",
  "member2_id": "MEM-20260219-1002",
  "relationship_type": "PARENT",
  "notes": "Father-son relationship"
}
```

---

## 10. Validation Rules

### **10.1 Household Validation Rules**

| Field                      | Validation Rules                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `household_id`             | • Optional on create (auto-generated)<br>• Format: `ANU-PADGNDIV-NNNNN`<br>• Max length: 50 characters                                                             |
| `head_member_name`         | • **Required**<br>• Max length: 150 characters                                                                                                                     |
| `primary_contact_number`   | • **Required**<br>• Max length: 20 characters                                                                                                                      |
| `secondary_contact_number` | • Optional<br>• Max length: 20 characters                                                                                                                          |
| `address`                  | • **Required**                                                                                                                                                     |
| `village_name`             | • **Required**<br>• Max length: 100 characters<br>• Valid values: Padaviya, Bohutiyagala, Birivanniyagala, Digangala, Alutgama, Moragoda, Kiragala, Kudagama, etc. |
| `gn_division`              | • **Required**<br>• Max length: 100 characters                                                                                                                     |
| `district`                 | • **Required**<br>• Max length: 100 characters                                                                                                                     |
| `province`                 | • **Required**<br>• Max length: 100 characters                                                                                                                     |
| `registered_by_staff_id`   | • **Required**<br>• Format: `HO-YYYY-XXX`                                                                                                                          |

### **10.2 Member Validation Rules**

| Field               | Validation Rules                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `member_id`         | • Optional on create (auto-generated)<br>• Format: `MEM-YYYYMMDD-XXXX`<br>• Max length: 50 characters |
| `household_id`      | • **Required**<br>• Must reference valid household                                                    |
| `full_name`         | • **Required**<br>• Max length: 150 characters                                                        |
| `address`           | • **Required**                                                                                        |
| `contact_number`    | • **Required**<br>• Max length: 20 characters                                                         |
| `nic`               | • Optional (for children without NIC)<br>• Must be unique if provided<br>• Max length: 20 characters  |
| `date_of_birth`     | • **Required**<br>• Must be valid past date                                                           |
| `age`               | • Auto-calculated from date_of_birth                                                                  |
| `gender`            | • **Required**<br>• Enum: `MALE`, `FEMALE`, `OTHER`                                                   |
| `language`          | • Optional<br>• Enum: `en`, `si`, `ta`<br>• Default: `si`                                             |
| `pregnancy_status`  | • Applicable only for females aged 12-55<br>• Boolean                                                 |
| `disability_status` | • Boolean                                                                                             |

### **10.3 Allergy Validation Rules**

| Field           | Validation Rules                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `member_id`     | • **Required**<br>• Must reference valid member                                                                        |
| `allergy_type`  | • **Required**<br>• Max length: 50 characters<br>• Enum: `DRUG`, `FOOD`, `ENVIRONMENTAL`, `INSECT`, `CONTACT`, `OTHER` |
| `allergen_name` | • **Required**<br>• Max length: 100 characters                                                                         |
| `reaction_type` | • **Required**<br>• Max length: 100 characters                                                                         |
| `severity`      | • **Required**<br>• Max length: 20 characters<br>• Enum: `MILD`, `MODERATE`, `SEVERE`, `LIFE_THREATENING`              |
| `since_year`    | • Optional<br>• Min: 1900<br>• Max: Current year                                                                       |

### **10.4 Chronic Disease Validation Rules**

| Field               | Validation Rules                                   |
| ------------------- | -------------------------------------------------- |
| `member_id`         | • **Required**<br>• Must reference valid member    |
| `disease_name`      | • **Required**<br>• Max length: 150 characters     |
| `diagnosis_year`    | • Optional<br>• Min: 1900<br>• Max: Current year   |
| `severity`          | • Optional<br>• Enum: `MILD`, `MODERATE`, `SEVERE` |
| `current_treatment` | • Optional                                         |
| `is_active`         | • Boolean<br>• Default: true                       |

### **10.5 Medication Validation Rules**

| Field             | Validation Rules                                                                      |
| ----------------- | ------------------------------------------------------------------------------------- |
| `member_id`       | • **Required**<br>• Must reference valid member                                       |
| `medication_name` | • **Required**<br>• Max length: 150 characters                                        |
| `dosage`          | • Optional                                                                            |
| `frequency`       | • Optional                                                                            |
| `route`           | • Optional<br>• Enum: `ORAL`, `TOPICAL`, `INJECTION`, `INHALATION`, `RECTAL`, `OTHER` |
| `start_date`      | • Optional<br>• Must be valid date                                                    |
| `is_active`       | • Boolean<br>• Default: true                                                          |

### **10.6 Health Details Validation Rules**

| Field                  | Validation Rules                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `member_id`            | • **Required**<br>• Must reference valid member                                       |
| `height_cm`            | • Optional<br>• Min: 30<br>• Max: 300                                                 |
| `weight_kg`            | • Optional<br>• Min: 1<br>• Max: 300                                                  |
| `bmi`                  | • Auto-calculated from height and weight<br>• Formula: `weight_kg / (height_cm/100)²` |
| `blood_group`          | • Optional<br>• Enum: `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`                |
| `recorded_date`        | • Optional<br>• Default: Current date                                                 |
| `recorded_by_staff_id` | • Optional                                                                            |

### **10.7 Visit Validation Rules**

| Field                 | Validation Rules                                                    |
| --------------------- | ------------------------------------------------------------------- |
| `member_id`           | • **Required**<br>• Must reference valid member                     |
| `household_id`        | • Optional<br>• Must reference valid household                      |
| `visit_date`          | • **Required**<br>• Must be valid date                              |
| `visit_type`          | • **Required**<br>• Enum: `OPD`, `MOBILE_CLINIC`, `HOME_VISIT`      |
| `follow_up_required`  | • Boolean<br>• Default: false                                       |
| `follow_up_date`      | • Required if `follow_up_required` is true<br>• Must be future date |
| `created_by_staff_id` | • **Required**                                                      |

### **10.8 Referral Validation Rules**

| Field           | Validation Rules                                                                  |
| --------------- | --------------------------------------------------------------------------------- |
| `member_id`     | • **Required**<br>• Must reference valid member                                   |
| `visit_id`      | • Optional<br>• Must reference valid visit                                        |
| `referral_type` | • Optional<br>• Enum: `SPECIALIST`, `HOSPITAL`, `DIAGNOSTIC_CENTER`, `EMERGENCY`  |
| `urgency_level` | • Optional<br>• Enum: `ROUTINE`, `URGENT`, `EMERGENCY`                            |
| `status`        | • Optional<br>• Enum: `PENDING`, `COMPLETED`, `CANCELLED`<br>• Default: `PENDING` |
| `referral_date` | • Optional<br>• Default: Current date                                             |

---

## 11. Security Considerations

### **11.1 Authentication & Authorization**

**Authentication:**

- ✅ **JWT-based authentication** for all API endpoints
- ✅ Health officers must login with credentials (`username`, `password_hash`)
- ✅ Tokens expire after configurable time period
- ✅ Refresh token mechanism for extended sessions

**Authorization:**

- ✅ **Role-based access control (RBAC)**
  - Health Officers: Full CRUD access to all patient data
  - Patients: Read-only access to own records (future)
  - Admins: System management, no patient data access
- ✅ Staff ID validation on data creation (`registered_by_staff_id`, `created_by_staff_id`)
- ✅ Middleware verifies user role before granting access

**Example Middleware:**

```javascript
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/",
  authMiddleware, // Verify JWT token
  roleMiddleware(["HEALTH_OFFICER"]), // Ensure role is Health Officer
  validateHouseholdCreate, // Validate input
  householdController.createHousehold,
);
```

### **11.2 Data Protection**

**Encryption:**

- ✅ **Passwords hashed** using bcrypt (minimum 10 salt rounds)
- ✅ **HTTPS enforced** in production for data in transit
- ✅ **Environment variables** for sensitive configuration (DB credentials, JWT secrets)

**Data Sanitization:**

- ✅ **Input validation** using express-validator on all POST/PUT requests
- ✅ **SQL injection prevention** via Mongoose ODM parameterized queries
- ✅ **XSS protection** by sanitizing user inputs

**Access Logging:**

- ✅ **Audit trails** for sensitive operations (who created/updated records, when)
- ✅ Timestamps (`created_at`, `updated_at`) on all entities
- ✅ Staff attribution fields (`registered_by_staff_id`, `created_by_staff_id`, `recorded_by_staff_id`)

### **11.3 Data Privacy & Compliance**

**Privacy Measures:**

- ✅ **Minimal data exposure** - APIs return only necessary fields
- ✅ **No password hashes in responses** - always excluded from JSON output
- ✅ **Medical data segregation** - admins cannot access patient medical records
- ✅ **Consent tracking** (future enhancement) - record patient consent for data usage

**Compliance Considerations:**

- ⚠️ **HIPAA-like principles** applied (though not legally required in Sri Lanka)
  - Data minimization
  - Purpose limitation
  - Access controls
  - Audit trails
- ⚠️ **Sri Lankan Personal Data Protection Act** compliance (when enacted)

### **11.4 Security Best Practices**

**Application Security:**

- ✅ **Rate limiting** to prevent brute force attacks
- ✅ **CORS configuration** restricts API access to authorized frontend domains
- ✅ **Helmet.js** for HTTP header security
- ✅ **Error messages** don't expose system internals

**Database Security:**

- ✅ **MongoDB authentication** enabled
- ✅ **Principle of least privilege** - application DB user has minimal permissions
- ✅ **Regular backups** of patient data
- ✅ **Unique constraints** on sensitive fields (NIC, household_id, member_id)

**File Upload Security (for photos):**

- ✅ **File type validation** - only images allowed
- ✅ **File size limits** enforced
- ✅ **Stored outside web root** with signed URLs for access
- ✅ **Virus scanning** on uploads (future enhancement)

---

## 12. Error Handling

### **12.1 Error Response Structure**

All errors follow a consistent JSON response structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error for this field"
    }
  ],
  "errorCode": "ERR_CODE",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

### **12.2 HTTP Status Codes**

| Status Code                   | Meaning                  | When Used                                                       |
| ----------------------------- | ------------------------ | --------------------------------------------------------------- |
| **200 OK**                    | Success                  | Successful GET, PUT, DELETE operations                          |
| **201 Created**               | Resource created         | Successful POST operations                                      |
| **400 Bad Request**           | Invalid input            | Validation failures, malformed requests                         |
| **401 Unauthorized**          | Authentication failed    | Missing or invalid JWT token                                    |
| **403 Forbidden**             | Insufficient permissions | User role doesn't have access                                   |
| **404 Not Found**             | Resource not found       | Requested entity doesn't exist                                  |
| **409 Conflict**              | Duplicate resource       | Unique constraint violations (NIC, household_id already exists) |
| **422 Unprocessable Entity**  | Semantic errors          | Business logic violations (e.g., pregnancy status for male)     |
| **500 Internal Server Error** | Server error             | Unexpected server-side errors                                   |

### **12.3 Validation Errors**

**Example: Missing Required Fields**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "head_member_name",
      "message": "Head member name is required"
    },
    {
      "field": "district",
      "message": "District is required"
    }
  ],
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

**Example: Format Validation Error**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "registered_by_staff_id",
      "message": "Invalid staff ID format. Expected format: HO-YYYY-XXX"
    }
  ],
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

### **12.4 Resource Not Found Errors**

```json
{
  "success": false,
  "message": "Household not found with ID: ANU-PADGNDIV-99999",
  "errorCode": "RESOURCE_NOT_FOUND",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

### **12.5 Duplicate Resource Errors**

```json
{
  "success": false,
  "message": "Member with NIC 912345678V already exists",
  "errorCode": "DUPLICATE_RESOURCE",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

### **12.6 Business Logic Errors**

**Example: Invalid Pregnancy Status**

```json
{
  "success": false,
  "message": "Pregnancy status can only be set for females aged 12-55",
  "errorCode": "BUSINESS_LOGIC_ERROR",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

**Example: Invalid Follow-Up Date**

```json
{
  "success": false,
  "message": "Follow-up date must be in the future",
  "errorCode": "BUSINESS_LOGIC_ERROR",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

### **12.7 Referential Integrity Errors**

```json
{
  "success": false,
  "message": "Cannot delete household ANU-PADGNDIV-00001 because it has 5 associated family members",
  "errorCode": "REFERENTIAL_INTEGRITY_ERROR",
  "timestamp": "2026-02-19T12:00:00.000Z"
}
```

### **12.8 Error Handling Implementation**

**Centralized Error Handler (apps/backend/src/core/error-handler.js):**

```javascript
const errorHandler = (err, req, res, next) => {
  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
      errorCode: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errorCode: "DUPLICATE_RESOURCE",
      timestamp: new Date().toISOString(),
    });
  }

  // Default 500 error
  console.error("[ERROR]", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errorCode: "INTERNAL_SERVER_ERROR",
    timestamp: new Date().toISOString(),
  });
};
```

**Try-Catch in Controllers:**

```javascript
const createHousehold = async (req, res, next) => {
  try {
    const household = await householdService.createHousehold(req.body);
    return res.status(201).json({
      success: true,
      message: "Household created successfully",
      data: household,
    });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};
```

---

## 13. Dependencies

### **13.1 Backend Dependencies**

**Core Framework:**

- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (^4.18.0) - Web framework

**Database:**

- **MongoDB** (v6+) - NoSQL database
- **Mongoose** (^7.0.0) - MongoDB ODM

**Authentication & Security:**

- **jsonwebtoken** (^9.0.0) - JWT token generation/verification
- **bcryptjs** (^2.4.3) - Password hashing
- **helmet** (^7.0.0) - HTTP security headers
- **cors** (^2.8.5) - Cross-Origin Resource Sharing

**Validation:**

- **express-validator** (^7.0.0) - Request validation middleware

**Utilities:**

- **dotenv** (^16.0.0) - Environment variable management
- **morgan** (^1.10.0) - HTTP request logger
- **nodemon** (^2.0.0) - Development server auto-restart

### **13.2 Module Dependencies (Within MediLab System)**

**This module depends on:**

| Module                        | Dependency                    | Usage                                           |
| ----------------------------- | ----------------------------- | ----------------------------------------------- |
| **Auth Module**               | Health Officer authentication | Validates health officer credentials and roles  |
| **Booking Module**            | Booking data                  | Links visits to test bookings                   |
| **Diagnosis Module** (Future) | Diagnosis API                 | Provides test recommendations based on symptoms |

**This module provides data to:**

| Module                      | Exported Data                                        | Usage                                                       |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| **Booking Module**          | Member ID, Household ID, Allergies, Chronic Diseases | Pre-fills patient info during booking, shows medical alerts |
| **Lab/Test Results Module** | Patient demographics                                 | Links test results to patients                              |
| **Notification Module**     | Contact information                                  | Sends SMS/notifications about appointments and results      |

### **13.3 External Service Dependencies**

**Current:**

- None (self-contained module)

**Future Enhancements:**

- **SMS Gateway** - For appointment reminders and test result notifications
- **Email Service** - For referral documents and health reports
- **Cloud Storage (AWS S3 / Google Cloud Storage)** - For patient photos and medical documents
- **RapidAPI Medical Diagnosis** - For AI-powered symptom checking and test recommendations (Priaid Symptom Checker)

### **13.4 Development Dependencies**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** (future) - Unit testing framework
- **Supertest** (future) - API integration testing

---

## 14. Future Enhancements

### **14.1 Patient Portal**

**Description:** Web/mobile application for patients to view their own health records.

**Features:**

- ✅ Patient login using NIC and password
- ✅ View personal health profile
- ✅ View test results
- ✅ View upcoming appointments
- ✅ View medication list
- ✅ Request prescription refills
- ✅ Multi-language support (Sinhala, Tamil, English)

**Benefits:**

- Patient empowerment through health data transparency
- Reduced administrative burden on health officers
- Better medication adherence

---

### **14.2 Family Health Pattern Analysis**

**Description:** AI/ML-powered analysis of family health patterns to identify genetic risks and environmental health hazards.

**Features:**

- ✅ Detect hereditary disease patterns (diabetes, hypertension, CKDu)
- ✅ Identify high-risk households based on environmental factors
- ✅ Generate predictive risk scores for family members
- ✅ Recommend preventive screenings
- ✅ Alert health officers to intervention opportunities

**Algorithms:**

- Clustering analysis for CKDu risk zones
- Family tree genetic risk scoring
- Environmental health risk modeling

**Benefits:**

- Proactive disease prevention
- Targeted health interventions
- Epidemiological research support

---

### **14.3 Family Tree Visualization**

**Description:** Interactive family tree diagram showing health conditions across generations.

**Features:**

- ✅ Visual family tree with health condition icons
- ✅ Click members to view detailed health profiles
- ✅ Color-coded disease severity indicators
- ✅ Hereditary pattern highlighting
- ✅ Export as PDF for referrals

**Technology:**

- D3.js or Cytoscape.js for visualization
- SVG-based rendering

**Benefits:**

- Quick visualization of genetic health risks
- Better communication with patients about family health
- Educational tool for health awareness

---

### **14.4 Mobile Data Collection App**

**Description:** Offline-capable mobile app for health officers conducting field visits in areas with poor connectivity.

**Features:**

- ✅ Offline household registration
- ✅ Offline data entry for visits and health details
- ✅ Auto-sync when internet connection available
- ✅ GPS tagging of household locations
- ✅ Photo capture for patient profiles
- ✅ Voice notes for doctor observations

**Technology:**

- React Native or Flutter
- Local SQLite database
- Sync mechanism with conflict resolution

**Benefits:**

- Reliable data collection in rural areas
- Faster field data entry
- Reduced data loss from connectivity issues

---

### **14.5 Integration with National Health Information System**

**Description:** Integration with Sri Lankan Ministry of Health's national health database (when available).

**Features:**

- ✅ Share patient data with national registry
- ✅ Retrieve vaccination records
- ✅ Access national chronic disease registry
- ✅ Report notifiable diseases automatically
- ✅ Bidirectional data synchronization

**Benefits:**

- Comprehensive national health data
- Reduced data duplication
- Better coordination across healthcare facilities

---

### **14.6 Medication Interaction Checker**

**Description:** Real-time drug interaction checking when recording medications.

**Features:**

- ✅ Check for drug-drug interactions
- ✅ Check for drug-allergy contraindications
- ✅ Check for drug-disease contraindications
- ✅ Dosage guidelines based on age/weight
- ✅ Alert health officers to potential issues

**Data Source:**

- FDA drug interaction database
- Local drug formulary

**Benefits:**

- Improved medication safety
- Reduced adverse drug events
- Clinical decision support

---

### **14.7 Consent Management System**

**Description:** Digital consent tracking for data usage and research participation.

**Features:**

- ✅ Record patient consent for data sharing
- ✅ Granular consent preferences (research, teaching, etc.)
- ✅ Withdrawal of consent tracking
- ✅ Audit trail of consent changes
- ✅ Compliance with data protection laws

**Benefits:**

- Legal compliance with privacy regulations
- Patient autonomy
- Ethical research support

---

### **14.8 Health Education Content Delivery**

**Description:** Personalized health education materials based on patient conditions.

**Features:**

- ✅ Condition-specific health tips (diabetes management, CKDu prevention)
- ✅ Multi-language content (Sinhala, Tamil, English)
- ✅ Video and infographic resources
- ✅ SMS-based health tips
- ✅ Track educational content delivery

**Benefits:**

- Patient health literacy improvement
- Better disease self-management
- Reduced preventable complications

---

### **14.9 Telemedicine Integration**

**Description:** Virtual consultation support for remote patient care.

**Features:**

- ✅ Video consultation scheduling
- ✅ Access to patient records during teleconsult
- ✅ E-prescriptions
- ✅ Remote monitoring data integration
- ✅ Teleconsult visit records

**Benefits:**

- Increased access to specialist care in rural areas
- Reduced travel burden for patients
- Continuity of care

---

### **14.10 Advanced Reporting & Analytics**

**Description:** Comprehensive reporting dashboard for health program management.

**Features:**

- ✅ **Disease Surveillance Reports:**
  - Chronic disease prevalence by GN division
  - CKDu incidence mapping
  - Dengue outbreak tracking
- ✅ **Service Delivery Metrics:**
  - Household registration progress
  - Visit frequency analysis
  - Referral completion rates
- ✅ **Health Officer Performance:**
  - Case load tracking
  - Data quality scores
  - Field visit coverage
- ✅ **Population Health Indicators:**
  - BMI distribution
  - Vaccination coverage
  - Maternal health indicators

**Technology:**

- Power BI / Tableau integration
- Custom React-based dashboards
- Export to Excel/PDF

**Benefits:**

- Data-driven health program planning
- Evidence-based resource allocation
- Transparent performance monitoring

---

## 📚 **References & Resources**

### **Related Documentation:**

- [PatientHealthSchema.md](../../PatientHealhSchema.md) - Database schema reference
- [Booking Module Documentation](../yohan/features_booking.md) - Integration reference
- [Lab Module Documentation](../arani/features_lab.md) - Test management context
- [Database Schemas](../Afham/database_schemas.md) - Complete schema definitions

### **External Resources:**

- [Mongoose Documentation](https://mongoosejs.com/docs/) - ODM reference
- [Express Validator](https://express-validator.github.io/docs/) - Validation docs
- [JWT Authentication Guide](https://jwt.io/introduction) - Token-based auth

---

**Document Status:** ✅ Complete  
**Last Updated:** February 19, 2026  
**Review Status:** Pending team review  
**Next Review Date:** March 19, 2026

---

**Prepared by:** Lakni  
**Reviewed by:** [To be assigned]  
**Approved by:** [To be assigned]

---

_This document is part of the MediLab Rural Health Diagnostic Test Management System project documentation suite._
