# MediLab Patient Module - API Documentation

**Author:** Lakni (IT23772922)  
**Version:** 1.0  
**Last Updated:** April 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Requirements](#authentication-requirements)
3. [Patient Members API](#patient-members-api)
4. [Household API](#household-api)
5. [Allergies API](#allergies-api)
6. [Medications API](#medications-api)
7. [Chronic Diseases API](#chronic-diseases-api)
8. [Emergency Contacts API](#emergency-contacts-api)
9. [Family Members API](#family-members-api)
10. [Family Relationships API](#family-relationships-api)
11. [Health Details API](#health-details-api)
12. [Past Medical History API](#past-medical-history-api)
13. [Visits API](#visits-api)
14. [Referrals API](#referrals-api)
15. [Error Handling](#error-handling)

---

## Overview

The Patient Module provides comprehensive management of patient health information, family structures, medical history, and health-related details. All endpoints require authentication and operate on patient-owned data.

### Base URL

```
http://localhost:3000/api
```

### Module Structure

The Patient Module is organized into logical sub-resources:

| Resource             | Base Endpoint           | Purpose                         |
| -------------------- | ----------------------- | ------------------------------- |
| Members              | `/members`              | Patient household members       |
| Households           | `/households`           | Household information           |
| Allergies            | `/allergies`            | Patient allergies               |
| Medications          | `/medications`          | Current medications             |
| Chronic Diseases     | `/chronic-diseases`     | Chronic conditions              |
| Emergency Contacts   | `/emergency-contacts`   | Emergency contact information   |
| Family Members       | `/family-members`       | Family tree members             |
| Family Relationships | `/family-relationships` | Family relationship definitions |
| Health Details       | `/health-details`       | General health information      |
| Past Medical History | `/past-medical-history` | Historical medical records      |
| Visits               | `/visits`               | Healthcare visit records        |
| Referrals            | `/referrals`            | Medical referrals               |

---

## Authentication Requirements

### All Patient Module Endpoints

All endpoints in the Patient Module require JWT authentication.

#### Authentication Header

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Token Validation

Tokens must be:

- Valid JWT format
- Not expired (within 24-hour validity)
- Issued by the auth service

#### Example with Missing Token

```bash
curl -X GET http://localhost:3000/api/members
# Response: 401 Unauthorized
```

#### Example with Valid Token

```bash
curl -X GET http://localhost:3000/api/members \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Patient Members API

The Members API allows patients to manage household members (family members living in the same household).

### 1. Get All Members

**Endpoint:** `GET /members`

**Authentication:** Required

**Description:** Retrieve all members in the authenticated patient's household.

#### Request

```http
GET /members HTTP/1.1
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "household_id": "ANU-PADGNDIV-00001",
      "full_name": "Roshan Silva",
      "address": "Tirappane Village, Padaviya, Anuradhapura",
      "contact_number": "+94712345678",
      "nic": "199512345678",
      "date_of_birth": "1995-12-15",
      "age": 28,
      "gender": "Male",
      "occupation": "Farmer",
      "photo_url": "/uploads/profiles/member_507f1f77.jpg",
      "created_at": "2026-04-06T10:30:00Z",
      "updated_at": "2026-04-06T10:30:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "household_id": "ANU-PADGNDIV-00001",
      "full_name": "Lakshmi Silva",
      "address": "Tirappane Village, Padaviya, Anuradhapura",
      "contact_number": "+94712345679",
      "nic": "199612345678",
      "date_of_birth": "1996-05-20",
      "age": 27,
      "gender": "Female",
      "occupation": "Teacher",
      "photo_url": "/uploads/profiles/member_507f1f77.jpg",
      "created_at": "2026-04-06T10:31:00Z",
      "updated_at": "2026-04-06T10:31:00Z"
    }
  ]
}
```

#### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid or missing authentication token"
}
```

---

### 2. Get Member by ID

**Endpoint:** `GET /members/:id`

**Authentication:** Required

**Parameters:**

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `id`      | string | Yes      | Member ID (MongoDB ObjectId) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "household_id": "ANU-PADGNDIV-00001",
    "full_name": "Roshan Silva",
    "address": "Tirappane Village, Padaviya, Anuradhapura",
    "contact_number": "+94712345678",
    "nic": "199512345678",
    "date_of_birth": "1995-12-15",
    "age": 28,
    "gender": "Male",
    "occupation": "Farmer",
    "photo_url": "/uploads/profiles/member_507f1f77.jpg",
    "created_at": "2026-04-06T10:30:00Z",
    "updated_at": "2026-04-06T10:30:00Z"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Member not found"
}
```

---

### 3. Create Member

**Endpoint:** `POST /members`

**Authentication:** Required

**Description:** Add a new member to the household. Photo upload is optional.

#### Request Body

```json
{
  "household_id": "ANU-PADGNDIV-00001",
  "full_name": "Roshan Silva",
  "address": "Tirappane Village, Padaviya, Anuradhapura",
  "contact_number": "+94712345678",
  "nic": "199512345678",
  "date_of_birth": "1995-12-15",
  "gender": "Male",
  "occupation": "Farmer"
}
```

#### Validation Rules

| Field            | Rules                                                                  | Example                    |
| ---------------- | ---------------------------------------------------------------------- | -------------------------- |
| `household_id`   | Required, valid format (ANU-PADGNDIV-NNNNN or ObjectId), max 50 chars  | ANU-PADGNDIV-00001         |
| `full_name`      | Required, max 150 characters                                           | John Doe                   |
| `address`        | Required                                                               | 123 Main Street, Colombo 7 |
| `contact_number` | +94equired, exactly 10 digits                                            | +94701234567                 |
| `nic`            | Optional, format: 9digits+V or 12digits or "N/A", required if age > 18 | 199512345678               |
| `date_of_birth`  | Required, ISO 8601 format                                              | 1995-12-15                 |
| `gender`         | Optional, Male/Female/Other                                            | Male                       |
| `occupation`     | Optional                                                               | Engineer                   |
| `photo`          | Optional, multipart file, max 10MB                                     | [binary]                   |

#### Request with File Upload

```http
POST /members HTTP/1.1
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="household_id"

ANU-PADGNDIV-00001
------FormBoundary
Content-Disposition: form-data; name="full_name"

John Doe
------FormBoundary
Content-Disposition: form-data; name="photo"; filename="photo.jpg"
Content-Type: image/jpeg

[binary file data]
------FormBoundary--
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "household_id": "ANU-PADGNDIV-00001",
    "full_name": "Roshan Silva",
    "address": "Tirappane Village, Padaviya, Anuradhapura",
    "contact_number": "+9494712345678",
    "nic": "199512345678",
    "date_of_birth": "1995-12-15",
    "age": 28,
    "gender": "Male",
    "occupation": "Farmer",
    "photo_url": "/uploads/profiles/member_507f1f77.jpg",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "nic",
      "message": "NIC is required for members above 18 years of age"
    },
    {
      "field": "contact_number",
+94    "message": "Contact number must be exactly 10 digits"
    }
  ]
}
```

---

### 4. Update Member

**Endpoint:** `PUT /members/:id`

**Authentication:** Required

**Description:** Update member information. Photo can be replaced or left unchanged.

#### Request Body

```json
{
  "full_name": "Lakshmi Silva",
  "address": "Senarathdeniya Village, Padaviya, Anuradhapura",
  "contact_number": "+9494712345679",
  "gender": "Female",
  "occupation": "Teacher"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "household_id": "ANU-PADGNDIV-00001",
    "full_name": "Lakshmi Silva",
    "address": "Senarathdeniya Village, Padaviya, Anuradhapura",
    "contact_number": "+94712345679",
    "nic": "199512345678",
    "date_of_birth": "1995-12-15",
    "age": 28,
    "gender": "Female",
    "occupation": "Teacher",
    "photo_url": "/uploads/profiles/member_507f1f77.jpg",
    "updated_at": "2026-04-06T11:45:00Z"
  }
}
```

---

### 5. Delete Member

**Endpoint:** `DELETE /members/:id`

**Authentication:** Required

**Description:** Remove a member from the household.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Member not found"
}
```

---

## Household API

Manage household information and settings.

### 1. Get All Households

**Endpoint:** `GET /households`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "607f1f77bcf86cd799439020",
      "household_id": "ANU-PADGNDIV-00001",
      "patient_id": "507f1f77bcf86cd799439011",
      "head_of_family": "Roshan Silva",
      "address": "Tirappane Village, Padaviya GN Division",
      "district": "Anuradhapura",
      "province": "North Central Province",
      "phone_number": "0712345678",
      "number_of_members": 4,
      "created_at": "2026-04-06T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Household by ID

**Endpoint:** `GET /households/:id`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "607f1f77bcf86cd799439020",
    "household_id": "ANU-PADGNDIV-00001",
    "patient_id": "507f1f77bcf86cd799439011",
    "head_of_family": "Roshan Silva",
    "address": "Tirappane Village, Padaviya GN Division",
    "district": "Anuradhapura",
    "province": "North Central Province",
    "phone_number": "0712345678",
    "number_of_members": 4,
    "created_at": "2026-04-06T10:30:00Z",
    "members": [
      {
        "id": "507f1f77bcf86cd799439011",
        "full_name": "Roshan Silva",
        "relationship": "Self"
      }
    ]
  }
}
```

---

### 3. Create Household

**Endpoint:** `POST /households`

**Authentication:** Required

#### Request Body

```json
{
  "head_of_family": "Roshan Silva",
  "address": "Tirappane Village, Padaviya GN Division",
  "district": "Anuradhapura",
  "province": "North Central Province",
  "phone_number": "0712345678"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Household created successfully",
  "data": {
    "id": "607f1f77bcf86cd799439020",
    "household_id": "ANU-PADGNDIV-00001",
    "patient_id": "507f1f77bcf86cd799439011",
    "head_of_family": "Roshan Silva",
    "address": "Tirappane Village, Padaviya GN Division",
    "district": "Anuradhapura",
    "province": "North Central Province",
    "phone_number": "0712345678",
    "number_of_members": 1,
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

### 4. Update Household

**Endpoint:** `PUT /households/:id`

**Authentication:** Required

#### Request Body

```json
{
  "head_of_family": "Lakshmi Silva",
  "address": "Kalthota Village, Padaviya GN Division",
  "province": "North Central Province"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Household updated successfully",
  "data": {
    "id": "607f1f77bcf86cd799439020",
    "household_id": "ANU-PADGNDIV-00001",
    "head_of_family": "Lakshmi Silva",
    "address": "Kalthota Village, Padaviya GN Division",
    "updated_at": "2026-04-06T11:45:00Z"
  }
}
```

---

### 5. Delete Household

**Endpoint:** `DELETE /households/:id`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Household deleted successfully"
}
```

---

## Allergies API

Manage patient allergies and reactions.

### 1. Get All Allergies

**Endpoint:** `GET /allergies`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439030",
      "member_id": "507f1f77bcf86cd799439011",
      "allergen": "Penicillin",
      "severity": "Severe",
      "reaction": "Anaphylaxis",
      "treatment": "Epinephrine injection",
      "created_at": "2026-04-06T10:30:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439031",
      "member_id": "507f1f77bcf86cd799439011",
      "allergen": "Shellfish",
      "severity": "Moderate",
      "reaction": "Itching and swelling",
      "treatment": "Antihistamine",
      "created_at": "2026-04-06T10:31:00Z"
    }
  ]
}
```

---

### 2. Get Allergy by ID

**Endpoint:** `GET /allergies/:id`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439030",
    "member_id": "507f1f77bcf86cd799439011",
    "allergen": "Penicillin",
    "severity": "Severe",
    "reaction": "Anaphylaxis",
    "treatment": "Epinephrine injection",
    "notes": "Developed during childhood",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

### 3. Create Allergy

**Endpoint:** `POST /allergies`

**Authentication:** Required

#### Request Body

```json
{
  "member_id": "507f1f77bcf86cd799439011",
  "allergen": "Penicillin",
  "severity": "Severe",
  "reaction": "Anaphylaxis",
  "treatment": "Epinephrine injection",
  "notes": "Developed during childhood"
}
```

#### Validation Rules

| Field       | Rules                          | Example                  |
| ----------- | ------------------------------ | ------------------------ |
| `member_id` | Required, valid MongoDB ID     | 507f1f77bcf86cd799439011 |
| `allergen`  | Required, string               | Penicillin               |
| `severity`  | Required, Mild/Moderate/Severe | Severe                   |
| `reaction`  | Required, description          | Anaphylaxis              |
| `treatment` | Required                       | Epinephrine injection    |
| `notes`     | Optional                       | Additional notes         |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Allergy created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439030",
    "member_id": "507f1f77bcf86cd799439011",
    "allergen": "Penicillin",
    "severity": "Severe",
    "reaction": "Anaphylaxis",
    "treatment": "Epinephrine injection",
    "notes": "Developed during childhood",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

### 4. Update Allergy

**Endpoint:** `PUT /allergies/:id`

**Authentication:** Required

#### Request Body

```json
{
  "severity": "Moderate",
  "reaction": "Mild rash",
  "treatment": "Antihistamine"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Allergy updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439030",
    "allergen": "Penicillin",
    "severity": "Moderate",
    "reaction": "Mild rash",
    "treatment": "Antihistamine",
    "updated_at": "2026-04-06T11:45:00Z"
  }
}
```

---

### 5. Delete Allergy

**Endpoint:** `DELETE /allergies/:id`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Allergy deleted successfully"
}
```

---

## Medications API

Manage patient medications and treatment records.

### 1. Get All Medications

**Endpoint:** `GET /medications`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439040",
      "member_id": "507f1f77bcf86cd799439011",
      "medication_name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily morning",
      "indication": "Hypertension",
      "start_date": "2025-01-15",
      "end_date": null,
      "status": "Active",
      "created_at": "2026-04-06T10:30:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439041",
      "member_id": "507f1f77bcf86cd799439011",
      "medication_name": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily with meals",
      "indication": "Type 2 Diabetes",
      "start_date": "2024-06-20",
      "end_date": null,
      "status": "Active",
      "created_at": "2026-04-06T10:31:00Z"
    }
  ]
}
```

---

### 2. Get Medication by ID

**Endpoint:** `GET /medications/:id`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439040",
    "member_id": "507f1f77bcf86cd799439011",
    "medication_name": "Lisinopril",
    "dosage": "10mg",
    "frequency": "Once daily",
    "indication": "Hypertension",
    "start_date": "2025-01-15",
    "end_date": null,
    "status": "Active",
    "side_effects": "Dry cough, dizziness",
    "prescribing_doctor": "Dr. Sarah Smith",
    "notes": "Take with water",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

### 3. Create Medication

**Endpoint:** `POST /medications`

**Authentication:** Required

#### Request Body

```json
{
  "member_id": "507f1f77bcf86cd799439011",
  "medication_name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "indication": "Hypertension",
  "start_date": "2025-01-15",
  "side_effects": "Dry cough, dizziness",
  "prescribing_doctor": "Dr. Sarah Smith",
  "notes": "Take with water"
}
```

#### Validation Rules

| Field                | Rules                      | Example                  |
| -------------------- | -------------------------- | ------------------------ |
| `member_id`          | Required, valid MongoDB ID | 507f1f77bcf86cd799439011 |
| `medication_name`    | Required                   | Lisinopril               |
| `dosage`             | Required                   | 10mg                     |
| `frequency`          | Required                   | Once daily               |
| `indication`         | Required                   | Hypertension             |
| `start_date`         | Required, ISO 8601         | 2025-01-15               |
| `end_date`           | Optional                   | 2026-01-15               |
| `side_effects`       | Optional                   | Dry cough                |
| `prescribing_doctor` | Optional                   | Dr. Smith                |
| `notes`              | Optional                   | Additional info          |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Medication created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439040",
    "member_id": "507f1f77bcf86cd799439011",
    "medication_name": "Lisinopril",
    "dosage": "10mg",
    "frequency": "Once daily",
    "indication": "Hypertension",
    "start_date": "2025-01-15",
    "status": "Active",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

### 4. Update Medication

**Endpoint:** `PUT /medications/:id`

**Authentication:** Required

#### Request Body

```json
{
  "dosage": "20mg",
  "frequency": "Once daily evening",
  "end_date": "2026-01-15"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Medication updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439040",
    "medication_name": "Lisinopril",
    "dosage": "20mg",
    "frequency": "Once daily evening",
    "status": "Active",
    "updated_at": "2026-04-06T11:45:00Z"
  }
}
```

---

### 5. Delete Medication

**Endpoint:** `DELETE /medications/:id`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Medication deleted successfully"
}
```

---

## Chronic Diseases API

Manage chronic conditions and diseases.

### 1. Get All Chronic Diseases

**Endpoint:** `GET /chronic-diseases`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439050",
      "member_id": "507f1f77bcf86cd799439011",
      "disease_name": "Type 2 Diabetes",
      "diagnosis_date": "2020-06-15",
      "treatment_status": "Controlled",
      "severity": "Moderate",
      "created_at": "2026-04-06T10:30:00Z"
    }
  ]
}
```

---

### 2. Create Chronic Disease

**Endpoint:** `POST /chronic-diseases`

**Authentication:** Required

#### Request Body

```json
{
  "member_id": "507f1f77bcf86cd799439011",
  "disease_name": "Type 2 Diabetes",
  "diagnosis_date": "2020-06-15",
  "treatment_status": "Controlled",
  "severity": "Moderate"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Chronic disease created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439050",
    "member_id": "507f1f77bcf86cd799439011",
    "disease_name": "Type 2 Diabetes",
    "diagnosis_date": "2020-06-15",
    "treatment_status": "Controlled",
    "severity": "Moderate",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

## Emergency Contacts API

Manage emergency contact information.

### 1. Get All Emergency Contacts

**Endpoint:** `GET /emergency-contacts`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439060",
      "member_id": "507f1f77bcf86cd799439011",
      "contact_name": "Lakshmi Silva",
      "relationship": "Spouse",
      "phone_number": "0712345679",
      "email": "lakshmi.silva@example.com",
      "is_primary": true,
      "created_at": "2026-04-06T10:30:00Z"
    }
  ]
}
```

---

### 2. Create Emergency Contact

**Endpoint:** `POST /emergency-contacts`

**Authentication:** Required

#### Request Body

```json
{
  "member_id": "507f1f77bcf86cd799439011",
  "contact_name": "Lakshmi Silva",
  "relationship": "Spouse",
  "phone_number": "0712345679",
  "email": "lakshmi.silva@example.com",
  "is_primary": true
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Emergency contact created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439060",
    "member_id": "507f1f77bcf86cd799439011",
    "contact_name": "Lakshmi Silva",
    "relationship": "Spouse",
    "phone_number": "0712345679",
    "is_primary": true,
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

## Family Members API

Manage extended family members and relationships.

### 1. Get All Family Members

**Endpoint:** `GET /family-members`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439070",
      "primary_member_id": "507f1f77bcf86cd799439011",
      "family_member_id": "507f1f77bcf86cd799439012",
      "family_member_name": "Lakshmi Silva",
      "relationship": "Spouse",
      "health_status": "Healthy",
      "created_at": "2026-04-06T10:30:00Z"
    }
  ]
}
```

---

### 2. Create Family Member

**Endpoint:** `POST /family-members`

**Authentication:** Required

#### Request Body

```json
{
  "primary_member_id": "507f1f77bcf86cd799439011",
  "family_member_id": "507f1f77bcf86cd799439012",
  "relationship": "Spouse",
  "health_status": "Healthy"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Family member created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439070",
    "primary_member_id": "507f1f77bcf86cd799439011",
    "family_member_id": "507f1f77bcf86cd799439012",
    "relationship": "Spouse",
    "health_status": "Healthy",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

## Health Details API

Manage general health information.

### 1. Get All Health Details

**Endpoint:** `GET /health-details`

**Authentication:** Required

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439080",
      "member_id": "507f1f77bcf86cd799439011",
      "blood_type": "O+",
      "height": "180",
      "weight": "75",
      "bmi": "23.1",
      "last_checkup": "2026-03-15",
      "created_at": "2026-04-06T10:30:00Z"
    }
  ]
}
```

---

### 2. Create Health Details

**Endpoint:** `POST /health-details`

**Authentication:** Required

#### Request Body

```json
{
  "member_id": "507f1f77bcf86cd799439011",
  "blood_type": "O+",
  "height": "180",
  "weight": "75",
  "last_checkup": "2026-03-15"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Health details created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439080",
    "member_id": "507f1f77bcf86cd799439011",
    "blood_type": "O+",
    "height": "180",
    "weight": "75",
    "bmi": "23.1",
    "created_at": "2026-04-06T10:30:00Z"
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error details"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning      | Scenario                       |
| ---- | ------------ | ------------------------------ |
| 200  | OK           | Successful request             |
| 201  | Created      | Resource created successfully  |
| 400  | Bad Request  | Validation errors              |
| 401  | Unauthorized | Missing/invalid authentication |
| 404  | Not Found    | Resource not found             |
| 409  | Conflict     | Duplicate entry                |
| 500  | Server Error | Internal error                 |

---

## Best Practices

1. **Always include token** in Authorization header
2. **Validate data client-side** before sending requests
3. **Handle expired tokens** with automatic re-authentication
4. **Use meaningful error messages** for user feedback
5. **Implement pagination** for large datasets
6. **Cache immutable data** when appropriate
7. **Implement retry logic** for failed requests
8. **Monitor API response times** and usage

---

**End of Document**
