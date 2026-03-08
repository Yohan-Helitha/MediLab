# MongoDB Database Schemas

## Test Management & Communication Module

**Project:** Rural Health Diagnostic Test Management System  
**Date:** February 12, 2026  
**Database:** MongoDB with Mongoose ODM  
**Pattern:** Mongoose Discriminators for Type-Safe Test Results

---

## Schema Overview

This document defines the MongoDB schemas required for the Test Management & Communication Module.

### Design Pattern: Mongoose Discriminators

Uses **single collection inheritance** pattern where all test results are stored in one `testresults` collection, but each test type has its own validated schema with required fields enforced at the database level.

### Schemas in This Module:

1. **TestResult (Base Schema)** - Common fields for all test results
2. **Test Type Discriminators:**
   - **Form-Based Tests (4 types):**
     - BloodGlucoseResult
     - HemoglobinResult
     - BloodPressureResult
     - PregnancyTestResult
   - **Upload-Based Tests (4 types):**
     - XRayResult
     - ECGResult
     - UltrasoundResult
     - AutomatedReportResult
3. **TestType** - Test type metadata and configuration
4. **NotificationLog** - Tracks all sent notifications
5. **ReminderSubscription** - Manages routine checkup reminder subscriptions

### External References (From Other Modules):

- **Patient** (from Patient Management Module)
- **Booking** (from Booking/Appointment Module)
- **HealthCenter** (from Health Center Module)
- **User** (from User Management/Auth Module)

---

## 1. TestResult (Base Schema)

**Purpose:** Base schema containing common fields for all test results. Uses Mongoose discriminators for type-specific validation.

**Collection Name:** `testresults`

**Pattern:** All test types stored in single collection with `__t` field indicating discriminator type.

### Base Schema Fields:

```javascript
{
  _id: ObjectId,

  // Discriminator key (auto-managed by Mongoose)
  __t: {
    type: String,
    enum: [
      'BloodGlucose',
      'Hemoglobin',
      'BloodPressure',
      'Pregnancy',
      'XRay',
      'ECG',
      'Ultrasound',
      'AutomatedReport'
    ]
  },

  // References to other modules (REQUIRED)
  bookingId: {
    type: ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true
  },

  patientId: {
    type: ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },

  testTypeId: {
    type: ObjectId,
    ref: 'TestType',
    required: true,
    index: true
  },

  healthCenterId: {
    type: ObjectId,
    ref: 'HealthCenter',
    required: true,
    index: true
  },

  // General observations/notes (common to all tests)
  observations: {
    type: String,
    default: '',
    maxlength: 1000
  },

  // Generated PDF report path (for form-based tests only)
  // Note: Validation based on testType.entryMethod at application layer
  generatedReportPath: {
    type: String
  },

  // Current status
  currentStatus: {
    type: String,
    enum: ['sample_received', 'processing', 'released'],
    default: 'released',
    required: true,
    index: true
  },

  // Status history (embedded subdocument array)
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['sample_received', 'processing', 'released'],
        required: true
      },
      changedBy: {
        type: ObjectId,
        ref: 'User',
        required: true
      },
      changedAt: {
        type: Date,
        default: Date.now,
        required: true
      }
    }
  ],

  // Lab staff who entered the result
  enteredBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },

  // Release timestamp
  releasedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },

  // For tracking if patient has viewed the result
  viewedBy: [
    {
      userId: {
        type: ObjectId,
        ref: 'User',
        required: true
      },
      viewedAt: {
        type: Date,
        default: Date.now,
        required: true
      }
    }
  ]

  // Note: createdAt and updatedAt provided by Mongoose timestamps option
}
```

---

## 2. Form-Based Test Result Discriminators

### 2.1 BloodGlucoseResult Schema

**Discriminator Type:** `BloodGlucose`

**Purpose:** Stores blood glucose test results with comprehensive validation.

```javascript
{
  // Inherits all base schema fields, plus:

  // Test Type
  testType: {
    type: String,
    enum: ['Fasting', 'Random', 'Postprandial', 'HbA1c'],
    required: true
  },

  // Primary Result
  glucoseLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 600,
    set: (val) => Math.round(val * 10) / 10  // Round to 1 decimal
  },

  // Unit of Measurement
  unit: {
    type: String,
    enum: ['mg/dL', 'mmol/L'],
    default: 'mg/dL',
    required: true
  },

  // Sample Information
  sampleType: {
    type: String,
    enum: ['Venous Blood', 'Capillary Blood'],
    required: true
  },

  sampleQuality: {
    type: String,
    enum: ['Good', 'Hemolyzed', 'Lipemic', 'Clotted'],
    required: true
  },

  // Collection Details
  sampleCollectionTime: {
    type: Date,
    required: true
  },

  fastingDuration: {
    type: Number,
    min: 0,
    max: 24,
    required: function() {
      return this.testType === 'Fasting';
    }
  },

  // Testing Method
  method: {
    type: String,
    enum: ['Glucometer', 'Laboratory Analyzer', 'POC Device'],
    required: true
  },

  // Reference Ranges (stored for historical accuracy)
  referenceRange: {
    normalMin: { type: Number, required: true },
    normalMax: { type: Number, required: true },
    preDiabeticMin: Number,
    preDiabeticMax: Number,
    diabeticMin: Number
  },

  // Interpretation (auto-calculated)
  interpretation: {
    type: String,
    enum: ['Normal', 'Hypoglycemia', 'Pre-diabetic', 'Diabetic', 'Critical'],
    required: true
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500
  }
}
```

**Example Document:**

```json
{
  "_id": "65a1b2c3d4e5f6789012345a",
  "__t": "BloodGlucose",
  "bookingId": "65a1b2c3d4e5f6789012345b",
  "patientId": "65a1b2c3d4e5f6789012345c",
  "testTypeId": "65a1b2c3d4e5f6789012345d",
  "healthCenterId": "65a1b2c3d4e5f6789012345e",
  "entryMethod": "form",
  "testType": "Fasting",
  "glucoseLevel": 105,
  "unit": "mg/dL",
  "sampleType": "Venous Blood",
  "sampleQuality": "Good",
  "sampleCollectionTime": "2026-02-12T07:00:00Z",
  "fastingDuration": 12,
  "method": "Laboratory Analyzer",
  "referenceRange": {
    "normalMin": 70,
    "normalMax": 100,
    "preDiabeticMin": 100,
    "preDiabeticMax": 125,
    "diabeticMin": 126
  },
  "interpretation": "Pre-diabetic",
  "clinicalNotes": "Patient advised dietary modifications and follow-up in 3 months",
  "observations": "Patient properly fasted for 12 hours",
  "generatedReportPath": "/uploads/reports/2026/02/glucose_65a1b2c3d4e5f6789012345a.pdf",
  "currentStatus": "released",
  "enteredBy": "65a1b2c3d4e5f6789012345f",
  "releasedAt": "2026-02-12T08:30:00Z",
  "createdAt": "2026-02-12T08:15:00Z"
}
```

---

### 2.2 HemoglobinResult Schema

**Discriminator Type:** `Hemoglobin`

**Purpose:** Stores hemoglobin test results with sex-based reference ranges.

```javascript
{
  // Inherits all base schema fields, plus:

  // Primary Result
  hemoglobinLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 25,
    set: (val) => Math.round(val * 10) / 10
  },

  // Unit
  unit: {
    type: String,
    enum: ['g/dL', 'g/L'],
    default: 'g/dL',
    required: true
  },

  // Sample Information
  sampleType: {
    type: String,
    enum: ['Venous Blood', 'Capillary Blood'],
    required: true
  },

  sampleQuality: {
    type: String,
    enum: ['Good', 'Hemolyzed', 'Clotted', 'Insufficient'],
    required: true
  },

  // Collection Time
  sampleCollectionTime: {
    type: Date,
    required: true
  },

  // Testing Method
  method: {
    type: String,
    enum: ['Hemoglobinometer', 'Automated Hematology Analyzer', 'Cyanmethemoglobin Method'],
    required: true
  },

  // Patient Condition (affects reference range)
  patientCondition: {
    type: String,
    enum: ['Non-pregnant Adult', 'Pregnant', 'Child', 'Infant'],
    required: true
  },

  // Reference Range (sex and condition-specific)
  referenceRange: {
    normalMin: { type: Number, required: true },
    normalMax: { type: Number, required: true },
    mildAnemiaMin: Number,
    moderateAnemiaMin: Number,
    severeAnemiaMax: Number
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: ['Normal', 'Mild Anemia', 'Moderate Anemia', 'Severe Anemia', 'Polycythemia'],
    required: true
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500
  }
}
```

---

### 2.3 BloodPressureResult Schema

**Discriminator Type:** `BloodPressure`

**Purpose:** Stores blood pressure measurements with complete clinical context.

```javascript
{
  // Inherits all base schema fields, plus:

  // Primary Results
  systolicBP: {
    type: Number,
    required: true,
    min: 60,
    max: 300
  },

  diastolicBP: {
    type: Number,
    required: true,
    min: 40,
    max: 200
  },

  pulseRate: {
    type: Number,
    required: true,
    min: 30,
    max: 250
  },

  // Unit
  unit: {
    type: String,
    default: 'mmHg',
    required: true
  },

  // Measurement Context
  patientPosition: {
    type: String,
    enum: ['Sitting', 'Standing', 'Lying Down'],
    required: true
  },

  armUsed: {
    type: String,
    enum: ['Left', 'Right'],
    required: true
  },

  cuffSize: {
    type: String,
    enum: ['Small Adult', 'Adult', 'Large Adult', 'Thigh'],
    required: true
  },

  // Patient State
  patientState: {
    type: String,
    enum: ['Rested (5+ minutes)', 'Active', 'Post-exercise', 'Stressed'],
    required: true
  },

  // Measurement Time
  measurementTime: {
    type: Date,
    required: true
  },

  // Method
  method: {
    type: String,
    enum: ['Manual Sphygmomanometer', 'Digital BP Monitor', 'Automated Monitor'],
    required: true
  },

  // Multiple Readings (if taken)
  additionalReadings: [
    {
      systolic: Number,
      diastolic: Number,
      pulse: Number,
      timeTaken: Date
    }
  ],

  // Average (if multiple readings)
  averageReading: {
    systolic: Number,
    diastolic: Number,
    pulse: Number
  },

  // Reference Ranges
  referenceRange: {
    normalSystolicMax: { type: Number, default: 120 },
    normalDiastolicMax: { type: Number, default: 80 },
    elevatedSystolicMax: { type: Number, default: 129 },
    stage1HypertensionSystolicMax: { type: Number, default: 139 },
    stage1HypertensionDiastolicMax: { type: Number, default: 89 }
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      'Normal',
      'Elevated',
      'Stage 1 Hypertension',
      'Stage 2 Hypertension',
      'Hypertensive Crisis',
      'Hypotension'
    ],
    required: true
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500
  }
}
```

---

### 2.4 PregnancyTestResult Schema

**Discriminator Type:** `Pregnancy`

**Purpose:** Stores pregnancy test results (qualitative or quantitative).

```javascript
{
  // Inherits all base schema fields, plus:

  // Primary Result
  result: {
    type: String,
    enum: ['Positive', 'Negative', 'Indeterminate'],
    required: true
  },

  // Test Type
  testType: {
    type: String,
    enum: ['Urine hCG', 'Serum hCG (Qualitative)', 'Serum hCG (Quantitative)'],
    required: true
  },

  // Quantitative Result (for blood tests)
  hcgLevel: {
    type: Number,
    min: 0,
    required: function() {
      return this.testType === 'Serum hCG (Quantitative)';
    }
  },

  hcgUnit: {
    type: String,
    enum: ['mIU/mL', 'IU/L'],
    default: 'mIU/mL',
    required: function() {
      return this.testType === 'Serum hCG (Quantitative)';
    }
  },

  // Test Method
  method: {
    type: String,
    enum: [
      'Urine Test Strip',
      'Urine Cassette Test',
      'Serum Immunoassay',
      'ELISA'
    ],
    required: true
  },

  // Sample Information
  sampleType: {
    type: String,
    enum: ['Urine (First Morning)', 'Urine (Random)', 'Serum'],
    required: true
  },

  sampleQuality: {
    type: String,
    enum: ['Good', 'Dilute', 'Hemolyzed'],
    required: true
  },

  sampleCollectionTime: {
    type: Date,
    required: true
  },

  // Test Sensitivity
  sensitivity: {
    type: Number,
    default: 25,
    min: 10,
    max: 100
  },

  sensitivityUnit: {
    type: String,
    default: 'mIU/mL'
  },

  // Clinical Context
  lastMenstrualPeriod: {
    type: Date
  },

  daysPostLMP: {
    type: Number,
    min: 0
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      'Pregnant',
      'Not Pregnant',
      'Early Pregnancy Possible',
      'Repeat Test Recommended',
      'Biochemical Pregnancy',
      'Ectopic Pregnancy Suspected'
    ],
    required: true
  },

  // Recommendations
  recommendations: {
    type: String,
    maxlength: 500
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500
  }
}
```

---

## 3. Upload-Based Test Result Discriminators

### 3.1 XRayResult Schema

**Discriminator Type:** `XRay`

**Purpose:** Stores X-ray imaging results with radiologist interpretation.

```javascript
{
  // Inherits all base schema fields, plus:

  // Uploaded Files (1-5 images)
  uploadedFiles: {
    type: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileSize: { type: Number, required: true },
        mimeType: {
          type: String,
          required: true,
          enum: ['image/jpeg', 'image/png', 'application/dicom', 'application/pdf']
        },
        uploadedAt: { type: Date, default: Date.now },
        viewLabel: {
          type: String,
          enum: ['Frontal', 'Lateral', 'Oblique', 'AP', 'PA', 'Other']
        }
      }
    ],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 5,
      message: 'Must upload between 1 and 5 X-ray images'
    }
  },

  // X-ray Specifics
  bodyPart: {
    type: String,
    enum: [
      'Chest',
      'Skull',
      'Spine (Cervical)',
      'Spine (Thoracic)',
      'Spine (Lumbar)',
      'Pelvis',
      'Upper Limb',
      'Lower Limb',
      'Abdomen',
      'Other'
    ],
    required: true
  },

  specificLocation: {
    type: String,
    maxlength: 100
  },

  // Clinical Indication
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Imaging Parameters
  views: {
    type: [String],
    enum: ['AP', 'PA', 'Lateral', 'Oblique', 'Axial'],
    required: true
  },

  technique: {
    kVp: Number,
    mAs: Number,
    distance: String
  },

  // Radiologist Findings
  findings: {
    type: String,
    required: true,
    maxlength: 2000
  },

  impression: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      'Normal',
      'Abnormal - Non-urgent',
      'Abnormal - Urgent',
      'Critical - Immediate Attention Required'
    ],
    required: true
  },

  // Additional Recommendations
  recommendations: {
    type: String,
    maxlength: 500
  },

  // Radiologist Information
  radiologistName: {
    type: String,
    maxlength: 200
  },

  radiologistSignature: {
    type: String,
    maxlength: 200
  },

  reportDate: {
    type: Date,
    default: Date.now
  }
}
```

---

### 3.2 ECGResult Schema

**Discriminator Type:** `ECG`

**Purpose:** Stores ECG/EKG test results with cardiologist interpretation.

```javascript
{
  // Inherits all base schema fields, plus:

  // Uploaded Files (ECG printout or digital file)
  uploadedFiles: {
    type: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileSize: { type: Number, required: true },
        mimeType: {
          type: String,
          required: true,
          enum: ['application/pdf', 'image/jpeg', 'image/png']
        },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 3,
      message: 'Must upload between 1 and 3 ECG files'
    }
  },

  // ECG Type
  ecgType: {
    type: String,
    enum: ['Resting 12-Lead', 'Stress Test', 'Holter Monitor', '6-Lead', '3-Lead'],
    required: true
  },

  // Clinical Indication
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500
  },

  // ECG Parameters (if manually entered)
  heartRate: {
    type: Number,
    min: 20,
    max: 300
  },

  rhythm: {
    type: String,
    enum: [
      'Sinus Rhythm',
      'Sinus Tachycardia',
      'Sinus Bradycardia',
      'Atrial Fibrillation',
      'Atrial Flutter',
      'Ventricular Tachycardia',
      'Other Arrhythmia',
      'Irregular'
    ]
  },

  prInterval: {
    type: Number,
    min: 0,
    max: 500
  },

  qrsDuration: {
    type: Number,
    min: 0,
    max: 300
  },

  qtInterval: {
    type: Number,
    min: 0,
    max: 800
  },

  qtcInterval: {
    type: Number,
    min: 0,
    max: 800
  },

  axis: {
    type: String,
    enum: ['Normal', 'Left Axis Deviation', 'Right Axis Deviation', 'Indeterminate']
  },

  // Findings
  findings: {
    type: String,
    required: true,
    maxlength: 2000
  },

  impression: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      'Normal',
      'Abnormal - Non-urgent',
      'Abnormal - Urgent',
      'Critical - Immediate Intervention Required'
    ],
    required: true
  },

  // Recommendations
  recommendations: {
    type: String,
    maxlength: 500
  },

  // Physician Information
  interpretedBy: {
    type: String,
    maxlength: 200
  },

  physicianSignature: {
    type: String,
    maxlength: 200
  },

  reportDate: {
    type: Date,
    default: Date.now
  }
}
```

---

### 3.3 UltrasoundResult Schema

**Discriminator Type:** `Ultrasound`

**Purpose:** Stores ultrasound imaging results with sonographer/radiologist interpretation.

```javascript
{
  // Inherits all base schema fields, plus:

  // Uploaded Files (ultrasound images)
  uploadedFiles: {
    type: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileSize: { type: Number, required: true },
        mimeType: {
          type: String,
          required: true,
          enum: ['image/jpeg', 'image/png', 'application/dicom', 'application/pdf']
        },
        uploadedAt: { type: Date, default: Date.now },
        imageDescription: {
          type: String,
          maxlength: 200
        }
      }
    ],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 5,
      message: 'Must upload between 1 and 5 ultrasound images'
    }
  },

  // Ultrasound Type
  studyType: {
    type: String,
    enum: [
      'Abdominal',
      'Obstetric',
      'Pelvic',
      'Thyroid',
      'Breast',
      'Cardiac (Echocardiogram)',
      'Vascular (Doppler)',
      'Musculoskeletal',
      'Renal',
      'Other'
    ],
    required: true
  },

  specificRegion: {
    type: String,
    maxlength: 200
  },

  // Clinical Indication
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Technical Details
  transducerType: {
    type: String,
    enum: ['Linear', 'Curved', 'Sector', 'Endocavitary']
  },

  frequency: {
    type: String
  },

  // Obstetric-Specific (if applicable)
  obstetricDetails: {
    gestationalAge: {
      weeks: Number,
      days: Number
    },
    fetalHeartRate: Number,
    estimatedFetalWeight: Number,
    placentalPosition: String,
    amnioticFluidLevel: String
  },

  // Measurements (flexible for different study types)
  measurements: {
    type: Object
  },

  // Findings
  findings: {
    type: String,
    required: true,
    maxlength: 2000
  },

  impression: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      'Normal',
      'Abnormal - Non-urgent',
      'Abnormal - Requires Follow-up',
      'Critical - Urgent Attention Required'
    ],
    required: true
  },

  // Recommendations
  recommendations: {
    type: String,
    maxlength: 500
  },

  // Sonographer/Radiologist Information
  performedBy: {
    type: String,
    maxlength: 200
  },

  interpretedBy: {
    type: String,
    maxlength: 200
  },

  radiologistSignature: {
    type: String,
    maxlength: 200
  },

  reportDate: {
    type: Date,
    default: Date.now
  }
}
```

---

### 3.4 AutomatedReportResult Schema

**Discriminator Type:** `AutomatedReport`

**Purpose:** Stores automated machine-generated reports (e.g., CBC, Chemistry Panel).

```javascript
{
  // Inherits all base schema fields, plus:

  // Uploaded Files (machine-generated PDF)
  uploadedFiles: {
    type: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileSize: { type: Number, required: true },
        mimeType: {
          type: String,
          required: true,
          enum: ['application/pdf']
        },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    required: true,
    validate: {
      validator: (v) => v.length === 1,
      message: 'Must upload exactly 1 automated report file'
    }
  },

  // Test Panel Name
  testPanelName: {
    type: String,
    required: true,
    maxlength: 200
  },

  // Test Category
  testCategory: {
    type: String,
    enum: [
      'Complete Blood Count (CBC)',
      'Comprehensive Metabolic Panel',
      'Lipid Profile',
      'Liver Function Tests',
      'Renal Function Tests',
      'Thyroid Function Tests',
      'Coagulation Panel',
      'Other'
    ],
    required: true
  },

  // Machine Information
  analyzerName: {
    type: String,
    maxlength: 200
  },

  analyzerModel: {
    type: String,
    maxlength: 200
  },

  // Sample Information
  sampleType: {
    type: String,
    enum: [
      'Whole Blood (EDTA)',
      'Whole Blood (Citrate)',
      'Serum',
      'Plasma',
      'Urine',
      'Other'
    ],
    required: true
  },

  sampleQuality: {
    type: String,
    enum: ['Acceptable', 'Hemolyzed', 'Lipemic', 'Icteric', 'Clotted'],
    required: true
  },

  sampleCollectionTime: {
    type: Date,
    required: true
  },

  analysisTime: {
    type: Date,
    required: true
  },

  // Quality Control Status
  qcStatus: {
    type: String,
    enum: ['Passed', 'Failed', 'Not Performed'],
    default: 'Not Performed'
  },

  // Abnormal Flags (detected by machine)
  abnormalFlags: {
    type: [String],
    default: []
  },

  criticalValues: {
    type: [String],
    default: []
  },

  // Overall Interpretation
  interpretation: {
    type: String,
    enum: [
      'All Parameters Normal',
      'Some Abnormalities Detected',
      'Critical Values Present',
      'Review Required'
    ],
    required: true
  },

  // Reviewed By (Lab Staff)
  reviewedBy: {
    type: String,
    maxlength: 200
  },

  reviewNotes: {
    type: String,
    maxlength: 1000
  },

  reportDate: {
    type: Date,
    default: Date.now
  }
}
```

---

## 4. TestType Schema

**Purpose:** Stores test type metadata, configuration, and validation rules.

**Collection Name:** `testtypes`

**Note:** This schema is part of your module since you manage both test configuration and result templates.

```javascript
{
  _id: ObjectId,

  // Basic Information
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 200
  },

  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxlength: 20
  },

  category: {
    type: String,
    enum: [
      'Blood Chemistry',
      'Hematology',
      'Imaging',
      'Cardiology',
      'Clinical Pathology',
      'Other'
    ],
    required: true
  },

  description: {
    type: String,
    maxlength: 500
  },

  // Entry Method
  entryMethod: {
    type: String,
    enum: ['form', 'upload'],
    required: true
  },

  // Discriminator Type (links to TestResult discriminator)
  discriminatorType: {
    type: String,
    enum: [
      'BloodGlucose',
      'Hemoglobin',
      'BloodPressure',
      'Pregnancy',
      'XRay',
      'ECG',
      'Ultrasound',
      'AutomatedReport'
    ],
    required: true
  },

  // Routine Monitoring Configuration
  isRoutineMonitoringRecommended: {
    type: Boolean,
    default: false
  },

  recommendedFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'biannually', 'annually'],
    required: function() {
      return this.isRoutineMonitoringRecommended === true;
    }
  },

  // Frequency in days (calculated from recommendedFrequency)
  recommendedFrequencyInDays: {
    type: Number,
    required: function() {
      return this.isRoutineMonitoringRecommended === true;
    }
  },

  // Test-Specific Configuration Parameters (flexible object)
  // Used to pre-populate form fields and store test-specific defaults
  // Examples:
  //   - X-Ray: { bodyPart: "Chest", defaultViews: ["PA", "Lateral"] }
  //   - Blood Test: { fastingRequired: true, fastingHours: 8, sampleType: "Capillary" }
  //   - ECG: { leadConfiguration: "12-lead", recordingDuration: "10 seconds" }
  specificParameters: {
    type: Schema.Types.Mixed,  // Flexible - accepts any key-value pairs
    default: {}
  },

  // Report Template Path (for form-based tests)
  reportTemplate: {
    type: String,
    required: function() {
      return this.entryMethod === 'form';
    }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

  // Note: createdAt and updatedAt provided by Mongoose timestamps option
}
```

### Example Documents:

```json
{
  "_id": "65a1b2c3d4e5f6789012340a",
  "name": "Blood Glucose Test - Fasting",
  "code": "BG-FAST",
  "category": "Blood Chemistry",
  "description": "Measures fasting blood glucose levels for diabetes screening",
  "entryMethod": "form",
  "discriminatorType": "BloodGlucose",
  "isRoutineMonitoringRecommended": true,
  "recommendedFrequency": "monthly",
  "recommendedFrequencyInDays": 30,
  "specificParameters": {
    "fastingRequired": true,
    "fastingHours": 8,
    "sampleType": "Capillary",
    "testMethod": "Glucometer"
  },
  "reportTemplate": "/templates/blood-glucose-report.hbs",
  "isActive": true,
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-01-15T00:00:00Z"
},
{
  "_id": "65a1b2c3d4e5f6789012340b",
  "name": "Chest X-Ray",
  "code": "XRAY-CHEST",
  "category": "Imaging",
  "description": "Chest radiography for respiratory and cardiac evaluation",
  "entryMethod": "upload",
  "discriminatorType": "XRay",
  "specificParameters": {
    "bodyPart": "Chest",
    "defaultViews": ["PA", "Lateral"],
    "orientation": "Upright"
  },
  "isRoutineMonitoringRecommended": false,
  "isActive": true,
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-01-15T00:00:00Z"
}
```

### Indexes:

```javascript
db.testtypes.createIndex({ code: 1 }, { unique: true });
db.testtypes.createIndex({ discriminatorType: 1 });
db.testtypes.createIndex({ isActive: 1 });
```

---

## 5. NotificationLog Schema

**Purpose:** Records all notifications sent to patients (SMS and Email).

**Collection Name:** `notificationlogs`

```javascript
{
  _id: ObjectId,

  // Patient reference
  patientId: {
    type: ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },

  // Notification type
  type: {
    type: String,
    enum: ['result_ready', 'unviewed_result_reminder', 'routine_checkup_reminder'],
    required: true,
    index: true
  },

  // Communication channel
  channel: {
    type: String,
    enum: ['sms', 'email'],
    required: true
  },

  // Recipient contact
  recipient: {
    type: String,
    required: true
  },

  // Notification status
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true,
    index: true
  },

  // Error message if failed
  errorMessage: {
    type: String,
    default: null
  },

  // Message content (truncated for storage)
  messageContent: {
    type: String,
    required: true
  },

  // Related entities
  testResultId: {
    type: ObjectId,
    ref: 'TestResult',
    index: true
  },

  reminderSubscriptionId: {
    type: ObjectId,
    ref: 'ReminderSubscription',
    index: true
  },

  // Timestamp
  sentAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },

  // Third-party API response
  apiResponse: {
    type: Object,
    default: null
  }
}
```

### Example Documents:

**Result Ready SMS:**

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "patientId": "507f1f77bcf86cd799439002",
  "type": "result_ready",
  "channel": "sms",
  "recipient": "+94771234567",
  "status": "sent",
  "errorMessage": null,
  "messageContent": "Rural Health Alert: Your Blood Glucose Test results are now ready. Login to view your report: https://app.ruralhealth.lk - Anytown Health Center",
  "testResultId": "507f1f77bcf86cd799439011",
  "reminderSubscriptionId": null,
  "sentAt": "2026-02-11T08:30:05Z",
  "apiResponse": {
    "sid": "SM1234567890abcdef",
    "status": "delivered",
    "provider": "twilio"
  }
}
```

**Failed Email:**

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "patientId": "507f1f77bcf86cd799439002",
  "type": "result_ready",
  "channel": "email",
  "recipient": "patient@example.com",
  "status": "failed",
  "errorMessage": "SMTP connection timeout after 30 seconds",
  "messageContent": "Subject: Your Test Results are Ready\n\nDear John Doe...",
  "testResultId": "507f1f77bcf86cd799439011",
  "reminderSubscriptionId": null,
  "sentAt": "2026-02-11T08:30:10Z",
  "apiResponse": {
    "error": "connection_timeout",
    "provider": "sendgrid"
  }
}
```

**Routine Checkup Reminder:**

```json
{
  "_id": "507f1f77bcf86cd799439022",
  "patientId": "507f1f77bcf86cd799439002",
  "type": "routine_checkup_reminder",
  "channel": "sms",
  "recipient": "+94771234567",
  "status": "sent",
  "errorMessage": null,
  "messageContent": "Health Reminder: It's time for your routine Blood Glucose Test checkup. Last test: 2026-01-12. Book your appointment: https://app.ruralhealth.lk - Rural Health System",
  "testResultId": null,
  "reminderSubscriptionId": "507f1f77bcf86cd799439030",
  "sentAt": "2026-02-11T08:00:00Z",
  "apiResponse": {
    "sid": "SM9876543210fedcba",
    "status": "delivered",
    "provider": "twilio"
  }
}
```

### Indexes:

```javascript
db.notificationlogs.createIndex({ patientId: 1, sentAt: -1 });
db.notificationlogs.createIndex({ type: 1, status: 1, sentAt: -1 });
db.notificationlogs.createIndex({ testResultId: 1 });
db.notificationlogs.createIndex({ sentAt: -1 });
```

### Notes:

- `testResultId` is set for result_ready and unviewed_result_reminder types
- `reminderSubscriptionId` is set for routine_checkup_reminder type
- `messageContent` stores truncated version for reference
- `apiResponse` stores third-party API (Twilio/SendGrid) response for debugging

---

## 6. ReminderSubscription Schema

**Purpose:** Manages patient subscriptions for routine checkup reminders.

**Collection Name:** `remindersubscriptions`

```javascript
{
  _id: ObjectId,

  // Patient reference
  patientId: {
    type: ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },

  // Test type reference (includes frequency via testType.recommendedFrequency)
  testTypeId: {
    type: ObjectId,
    ref: 'TestType',
    required: true,
    index: true
  },

  // Last test date
  lastTestDate: {
    type: Date,
    required: true
  },

  // Next reminder date
  nextReminderDate: {
    type: Date,
    required: true,
    index: true
  },

  // Subscription status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: true,
    index: true
  },

  // Timestamps
  subscribedAt: {
    type: Date,
    default: Date.now,
    required: true
  },

  unsubscribedAt: {
    type: Date,
    default: null
  },

  // Last reminder sent timestamp
  lastReminderSentAt: {
    type: Date,
    default: null
  }
}
```

### Example Document:

```json
{
  "_id": "507f1f77bcf86cd799439030",
  "patientId": "507f1f77bcf86cd799439002",
  "testTypeId": "507f1f77bcf86cd799439003",
  "lastTestDate": "2026-02-11T00:00:00Z",
  "nextReminderDate": "2026-03-13T00:00:00Z",
  "status": "active",
  "subscribedAt": "2026-02-11T10:00:00Z",
  "unsubscribedAt": null,
  "lastReminderSentAt": null
}
```

### Indexes:

```javascript
db.remindersubscriptions.createIndex({ patientId: 1, testTypeId: 1 });
db.remindersubscriptions.createIndex({ nextReminderDate: 1, status: 1 });
db.remindersubscriptions.createIndex({ status: 1 });
```

### Notes:

- **Frequency determined by TestType:** Patients follow medical recommendations (testType.recommendedFrequency)
- Only one active subscription per patient per test type (enforced by unique index)
- `nextReminderDate` calculated using testType.recommendedFrequencyInDays
- When subscription status changes to 'inactive', `unsubscribedAt` is set
- `lastReminderSentAt` tracks when last reminder was sent for this subscription

### Calculating Next Reminder Date:

```javascript
// When creating subscription
const testType = await TestType.findById(testTypeId);
const nextReminder = new Date(
  lastTestDate.getTime() +
    testType.recommendedFrequencyInDays * 24 * 60 * 60 * 1000,
);
```

---

## 7. External Schema References

These schemas are managed by other modules but referenced in this module:

### 7.1 Patient (from Patient Management Module)

**Required Fields:**

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  age: Number,
  sex: String,
  patientId: String,  // Unique patient identifier
  phone: String,
  email: String
}
```

**Used In:**

- TestResult.patientId
- NotificationLog.patientId
- ReminderSubscription.patientId

---

### 7.2 Booking (from Booking/Appointment Module)

**Required Fields:**

```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  testTypeId: ObjectId,
  healthCenterId: ObjectId,
  appointmentDate: Date,
  appointmentTime: String,
  status: String  // 'confirmed', 'sample_received', 'processing', 'released', 'cancelled'
}
```

**Used In:**

- TestResult.bookingId

**Interactions:**

- When result is released, Booking.status should be updated to 'released'
- When result is deleted, Booking.status should revert to 'processing'

---

### 7.3 HealthCenter (from Health Center Module)

**Required Fields:**

```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  phone: String,
  email: String,
  logo: String  // URL or path to logo image
}
```

**Used In:**

- TestResult.healthCenterId

**Interactions:**

- Retrieve center details for PDF report generation

---

### 7.4 User (from User Management/Auth Module)

**Required Fields:**

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  role: String,  // 'lab_staff', 'admin', 'patient', 'system_admin'
  healthCenterId: ObjectId,  // For lab_staff
  email: String
}
```

**Used In:**

- TestResult.enteredBy
- TestResult.lastUpdatedBy
- TestResult.statusHistory.changedBy
- TestResult.viewedBy.userId

---

## 8. Mongoose Model Definitions

### 8.1 Base TestResult Model with Discriminators

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ===== EMBEDDED SCHEMAS =====

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["sample_received", "processing", "released"],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const ViewedBySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const FileSchema = new Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    viewLabel: {
      type: String,
      enum: ["Frontal", "Lateral", "Oblique", "AP", "PA", "Other"],
    },
  },
  { _id: false },
);

// ===== BASE TEST RESULT SCHEMA =====

const TestResultBaseSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    testTypeId: {
      type: Schema.Types.ObjectId,
      ref: "TestType",
      required: true,
      index: true,
    },
    healthCenterId: {
      type: Schema.Types.ObjectId,
      ref: "HealthCenter",
      required: true,
      index: true,
    },
    observations: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    generatedReportPath: {
      type: String,
    },
    currentStatus: {
      type: String,
      enum: ["sample_received", "processing", "released"],
      default: "released",
      required: true,
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    enteredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    releasedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    viewedBy: [ViewedBySchema],
  },
  {
    discriminatorKey: "testType",
    collection: "testresults",
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// Indexes
TestResultBaseSchema.index({ patientId: 1, releasedAt: -1 });
TestResultBaseSchema.index({
  healthCenterId: 1,
  currentStatus: 1,
  releasedAt: -1,
});
TestResultBaseSchema.index({ testTypeId: 1, releasedAt: -1 });

const TestResult = mongoose.model("TestResult", TestResultBaseSchema);

// ===== FORM-BASED DISCRIMINATORS =====

// Blood Glucose Test Result
const BloodGlucoseResultSchema = new Schema({
  testType: {
    type: String,
    enum: ["Fasting", "Random", "Postprandial", "HbA1c"],
    required: true,
  },
  glucoseLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 600,
    set: (val) => Math.round(val * 10) / 10,
  },
  unit: {
    type: String,
    enum: ["mg/dL", "mmol/L"],
    default: "mg/dL",
    required: true,
  },
  sampleType: {
    type: String,
    enum: ["Venous Blood", "Capillary Blood"],
    required: true,
  },
  sampleQuality: {
    type: String,
    enum: ["Good", "Hemolyzed", "Lipemic", "Clotted"],
    required: true,
  },
  sampleCollectionTime: {
    type: Date,
    required: true,
  },
  fastingDuration: {
    type: Number,
    min: 0,
    max: 24,
    required: function () {
      return this.testType === "Fasting";
    },
  },
  method: {
    type: String,
    enum: ["Glucometer", "Laboratory Analyzer", "POC Device"],
    required: true,
  },
  referenceRange: {
    normalMin: { type: Number, required: true },
    normalMax: { type: Number, required: true },
    preDiabeticMin: Number,
    preDiabeticMax: Number,
    diabeticMin: Number,
  },
  interpretation: {
    type: String,
    enum: ["Normal", "Hypoglycemia", "Pre-diabetic", "Diabetic", "Critical"],
    required: true,
  },
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const BloodGlucoseResult = TestResult.discriminator(
  "BloodGlucose",
  BloodGlucoseResultSchema,
);

// Hemoglobin Test Result
const HemoglobinResultSchema = new Schema({
  hemoglobinLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 25,
    set: (val) => Math.round(val * 10) / 10,
  },
  unit: {
    type: String,
    enum: ["g/dL", "g/L"],
    default: "g/dL",
    required: true,
  },
  sampleType: {
    type: String,
    enum: ["Venous Blood", "Capillary Blood"],
    required: true,
  },
  sampleQuality: {
    type: String,
    enum: ["Good", "Hemolyzed", "Clotted", "Insufficient"],
    required: true,
  },
  sampleCollectionTime: {
    type: Date,
    required: true,
  },
  method: {
    type: String,
    enum: [
      "Hemoglobinometer",
      "Automated Hematology Analyzer",
      "Cyanmethemoglobin Method",
    ],
    required: true,
  },
  patientCondition: {
    type: String,
    enum: ["Non-pregnant Adult", "Pregnant", "Child", "Infant"],
    required: true,
  },
  referenceRange: {
    normalMin: { type: Number, required: true },
    normalMax: { type: Number, required: true },
    mildAnemiaMin: Number,
    moderateAnemiaMin: Number,
    severeAnemiaMax: Number,
  },
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Mild Anemia",
      "Moderate Anemia",
      "Severe Anemia",
      "Polycythemia",
    ],
    required: true,
  },
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const HemoglobinResult = TestResult.discriminator(
  "Hemoglobin",
  HemoglobinResultSchema,
);

// Blood Pressure Test Result
const BloodPressureResultSchema = new Schema({
  systolicBP: {
    type: Number,
    required: true,
    min: 60,
    max: 300,
  },
  diastolicBP: {
    type: Number,
    required: true,
    min: 40,
    max: 200,
  },
  pulseRate: {
    type: Number,
    required: true,
    min: 30,
    max: 250,
  },
  unit: {
    type: String,
    default: "mmHg",
    required: true,
  },
  patientPosition: {
    type: String,
    enum: ["Sitting", "Standing", "Lying Down"],
    required: true,
  },
  armUsed: {
    type: String,
    enum: ["Left", "Right"],
    required: true,
  },
  cuffSize: {
    type: String,
    enum: ["Small Adult", "Adult", "Large Adult", "Thigh"],
    required: true,
  },
  patientState: {
    type: String,
    enum: ["Rested (5+ minutes)", "Active", "Post-exercise", "Stressed"],
    required: true,
  },
  measurementTime: {
    type: Date,
    required: true,
  },
  method: {
    type: String,
    enum: [
      "Manual Sphygmomanometer",
      "Digital BP Monitor",
      "Automated Monitor",
    ],
    required: true,
  },
  additionalReadings: [
    {
      systolic: Number,
      diastolic: Number,
      pulse: Number,
      timeTaken: Date,
    },
  ],
  averageReading: {
    systolic: Number,
    diastolic: Number,
    pulse: Number,
  },
  referenceRange: {
    normalSystolicMax: { type: Number, default: 120 },
    normalDiastolicMax: { type: Number, default: 80 },
    elevatedSystolicMax: { type: Number, default: 129 },
    stage1HypertensionSystolicMax: { type: Number, default: 139 },
    stage1HypertensionDiastolicMax: { type: Number, default: 89 },
  },
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Elevated",
      "Stage 1 Hypertension",
      "Stage 2 Hypertension",
      "Hypertensive Crisis",
      "Hypotension",
    ],
    required: true,
  },
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const BloodPressureResult = TestResult.discriminator(
  "BloodPressure",
  BloodPressureResultSchema,
);

// Pregnancy Test Result
const PregnancyTestResultSchema = new Schema({
  result: {
    type: String,
    enum: ["Positive", "Negative", "Indeterminate"],
    required: true,
  },
  testType: {
    type: String,
    enum: ["Urine hCG", "Serum hCG (Qualitative)", "Serum hCG (Quantitative)"],
    required: true,
  },
  hcgLevel: {
    type: Number,
    min: 0,
    required: function () {
      return this.testType === "Serum hCG (Quantitative)";
    },
  },
  hcgUnit: {
    type: String,
    enum: ["mIU/mL", "IU/L"],
    default: "mIU/mL",
    required: function () {
      return this.testType === "Serum hCG (Quantitative)";
    },
  },
  method: {
    type: String,
    enum: [
      "Urine Test Strip",
      "Urine Cassette Test",
      "Serum Immunoassay",
      "ELISA",
    ],
    required: true,
  },
  sampleType: {
    type: String,
    enum: ["Urine (First Morning)", "Urine (Random)", "Serum"],
    required: true,
  },
  sampleQuality: {
    type: String,
    enum: ["Good", "Dilute", "Hemolyzed"],
    required: true,
  },
  sampleCollectionTime: {
    type: Date,
    required: true,
  },
  sensitivity: {
    type: Number,
    default: 25,
    min: 10,
    max: 100,
  },
  sensitivityUnit: {
    type: String,
    default: "mIU/mL",
  },
  lastMenstrualPeriod: Date,
  daysPostLMP: {
    type: Number,
    min: 0,
  },
  interpretation: {
    type: String,
    enum: [
      "Pregnant",
      "Not Pregnant",
      "Early Pregnancy Possible",
      "Repeat Test Recommended",
      "Biochemical Pregnancy",
      "Ectopic Pregnancy Suspected",
    ],
    required: true,
  },
  recommendations: {
    type: String,
    maxlength: 500,
  },
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const PregnancyTestResult = TestResult.discriminator(
  "Pregnancy",
  PregnancyTestResultSchema,
);

// ===== UPLOAD-BASED DISCRIMINATORS =====

// X-Ray Result
const XRayResultSchema = new Schema({
  uploadedFiles: {
    type: [FileSchema],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 5,
      message: "Must upload between 1 and 5 X-ray images",
    },
  },
  bodyPart: {
    type: String,
    enum: [
      "Chest",
      "Skull",
      "Spine (Cervical)",
      "Spine (Thoracic)",
      "Spine (Lumbar)",
      "Pelvis",
      "Upper Limb",
      "Lower Limb",
      "Abdomen",
      "Other",
    ],
    required: true,
  },
  specificLocation: {
    type: String,
    maxlength: 100,
  },
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500,
  },
  views: {
    type: [String],
    enum: ["AP", "PA", "Lateral", "Oblique", "Axial"],
    required: true,
  },
  technique: {
    kVp: Number,
    mAs: Number,
    distance: String,
  },
  findings: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  impression: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Abnormal - Non-urgent",
      "Abnormal - Urgent",
      "Critical - Immediate Attention Required",
    ],
    required: true,
  },
  recommendations: {
    type: String,
    maxlength: 500,
  },
  radiologistName: {
    type: String,
    maxlength: 200,
  },
  radiologistSignature: {
    type: String,
    maxlength: 200,
  },
  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const XRayResult = TestResult.discriminator("XRay", XRayResultSchema);

// ECG Result
const ECGResultSchema = new Schema({
  uploadedFiles: {
    type: [FileSchema],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 3,
      message: "Must upload between 1 and 3 ECG files",
    },
  },
  ecgType: {
    type: String,
    enum: [
      "Resting 12-Lead",
      "Stress Test",
      "Holter Monitor",
      "6-Lead",
      "3-Lead",
    ],
    required: true,
  },
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500,
  },
  heartRate: {
    type: Number,
    min: 20,
    max: 300,
  },
  rhythm: {
    type: String,
    enum: [
      "Sinus Rhythm",
      "Sinus Tachycardia",
      "Sinus Bradycardia",
      "Atrial Fibrillation",
      "Atrial Flutter",
      "Ventricular Tachycardia",
      "Other Arrhythmia",
      "Irregular",
    ],
  },
  prInterval: {
    type: Number,
    min: 0,
    max: 500,
  },
  qrsDuration: {
    type: Number,
    min: 0,
    max: 300,
  },
  qtInterval: {
    type: Number,
    min: 0,
    max: 800,
  },
  qtcInterval: {
    type: Number,
    min: 0,
    max: 800,
  },
  axis: {
    type: String,
    enum: [
      "Normal",
      "Left Axis Deviation",
      "Right Axis Deviation",
      "Indeterminate",
    ],
  },
  findings: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  impression: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Abnormal - Non-urgent",
      "Abnormal - Urgent",
      "Critical - Immediate Intervention Required",
    ],
    required: true,
  },
  recommendations: {
    type: String,
    maxlength: 500,
  },
  interpretedBy: {
    type: String,
    maxlength: 200,
  },
  physicianSignature: {
    type: String,
    maxlength: 200,
  },
  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const ECGResult = TestResult.discriminator("ECG", ECGResultSchema);

// Ultrasound Result
const UltrasoundResultSchema = new Schema({
  uploadedFiles: {
    type: [FileSchema],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 5,
      message: "Must upload between 1 and 5 ultrasound images",
    },
  },
  studyType: {
    type: String,
    enum: [
      "Abdominal",
      "Obstetric",
      "Pelvic",
      "Thyroid",
      "Breast",
      "Cardiac (Echocardiogram)",
      "Vascular (Doppler)",
      "Musculoskeletal",
      "Renal",
      "Other",
    ],
    required: true,
  },
  specificRegion: {
    type: String,
    maxlength: 200,
  },
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500,
  },
  transducerType: {
    type: String,
    enum: ["Linear", "Curved", "Sector", "Endocavitary"],
  },
  frequency: String,
  obstetricDetails: {
    gestationalAge: {
      weeks: Number,
      days: Number,
    },
    fetalHeartRate: Number,
    estimatedFetalWeight: Number,
    placentalPosition: String,
    amnioticFluidLevel: String,
  },
  measurements: Schema.Types.Mixed,
  findings: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  impression: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Abnormal - Non-urgent",
      "Abnormal - Requires Follow-up",
      "Critical - Urgent Attention Required",
    ],
    required: true,
  },
  recommendations: {
    type: String,
    maxlength: 500,
  },
  performedBy: {
    type: String,
    maxlength: 200,
  },
  interpretedBy: {
    type: String,
    maxlength: 200,
  },
  radiologistSignature: {
    type: String,
    maxlength: 200,
  },
  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const UltrasoundResult = TestResult.discriminator(
  "Ultrasound",
  UltrasoundResultSchema,
);

// Automated Report Result
const AutomatedReportResultSchema = new Schema({
  uploadedFiles: {
    type: [FileSchema],
    required: true,
    validate: {
      validator: (v) => v.length === 1,
      message: "Must upload exactly 1 automated report file",
    },
  },
  testPanelName: {
    type: String,
    required: true,
    maxlength: 200,
  },
  testCategory: {
    type: String,
    enum: [
      "Complete Blood Count (CBC)",
      "Comprehensive Metabolic Panel",
      "Lipid Profile",
      "Liver Function Tests",
      "Renal Function Tests",
      "Thyroid Function Tests",
      "Coagulation Panel",
      "Other",
    ],
    required: true,
  },
  analyzerName: {
    type: String,
    maxlength: 200,
  },
  analyzerModel: {
    type: String,
    maxlength: 200,
  },
  sampleType: {
    type: String,
    enum: [
      "Whole Blood (EDTA)",
      "Whole Blood (Citrate)",
      "Serum",
      "Plasma",
      "Urine",
      "Other",
    ],
    required: true,
  },
  sampleQuality: {
    type: String,
    enum: ["Acceptable", "Hemolyzed", "Lipemic", "Icteric", "Clotted"],
    required: true,
  },
  sampleCollectionTime: {
    type: Date,
    required: true,
  },
  analysisTime: {
    type: Date,
    required: true,
  },
  qcStatus: {
    type: String,
    enum: ["Passed", "Failed", "Not Performed"],
    default: "Not Performed",
  },
  abnormalFlags: {
    type: [String],
    default: [],
  },
  criticalValues: {
    type: [String],
    default: [],
  },
  interpretation: {
    type: String,
    enum: [
      "All Parameters Normal",
      "Some Abnormalities Detected",
      "Critical Values Present",
      "Review Required",
    ],
    required: true,
  },
  reviewedBy: {
    type: String,
    maxlength: 200,
  },
  reviewNotes: {
    type: String,
    maxlength: 1000,
  },
  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const AutomatedReportResult = TestResult.discriminator(
  "AutomatedReport",
  AutomatedReportResultSchema,
);

// Export all models
module.exports = {
  TestResult,
  BloodGlucoseResult,
  HemoglobinResult,
  BloodPressureResult,
  PregnancyTestResult,
  XRayResult,
  ECGResult,
  UltrasoundResult,
  AutomatedReportResult,
};
```

---

### 8.2 TestType Model

```javascript
const TestTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 200,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxlength: 20,
  },
  category: {
    type: String,
    enum: [
      "Blood Chemistry",
      "Hematology",
      "Imaging",
      "Cardiology",
      "Clinical Pathology",
      "Other",
    ],
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  entryMethod: {
    type: String,
    enum: ["form", "upload"],
    required: true,
  },
  discriminatorType: {
    type: String,
    enum: [
      "BloodGlucose",
      "Hemoglobin",
      "BloodPressure",
      "Pregnancy",
      "XRay",
      "ECG",
      "Ultrasound",
      "AutomatedReport",
    ],
    required: true,
  },
  isRoutineMonitoringRecommended: {
    type: Boolean,
    default: false,
  },
  recommendedFrequency: {
    type: String,
    enum: ["monthly", "quarterly", "biannually", "annually"],
    required: function () {
      return this.isRoutineMonitoringRecommended === true;
    },
  },
  recommendedFrequencyInDays: {
    type: Number,
    required: function () {
      return this.isRoutineMonitoringRecommended === true;
    },
  },
  specificParameters: {
    type: Schema.Types.Mixed,
    default: {},
  },
  reportTemplate: {
    type: String,
    required: function () {
      return this.entryMethod === "form";
    },
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
});

// Indexes
TestTypeSchema.index({ code: 1 }, { unique: true });
TestTypeSchema.index({ discriminatorType: 1 });
TestTypeSchema.index({ isActive: 1 });

// Enable timestamps
TestTypeSchema.set("timestamps", true); // Adds createdAt and updatedAt

module.exports = mongoose.model("TestType", TestTypeSchema);
```

---

### 8.3 NotificationLog Model

```javascript
const NotificationLogSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      "result_ready",
      "unviewed_result_reminder",
      "routine_checkup_reminder",
    ],
    required: true,
    index: true,
  },
  channel: {
    type: String,
    enum: ["sms", "email"],
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "failed"],
    required: true,
    index: true,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  messageContent: {
    type: String,
    required: true,
  },
  testResultId: {
    type: Schema.Types.ObjectId,
    ref: "TestResult",
    index: true,
  },
  reminderSubscriptionId: {
    type: Schema.Types.ObjectId,
    ref: "ReminderSubscription",
    index: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  apiResponse: {
    type: Schema.Types.Mixed,
    default: null,
  },
});

// Indexes
NotificationLogSchema.index({ patientId: 1, sentAt: -1 });
NotificationLogSchema.index({ type: 1, status: 1, sentAt: -1 });
NotificationLogSchema.index({ sentAt: -1 });

module.exports = mongoose.model("NotificationLog", NotificationLogSchema);
```

---

### 8.4 ReminderSubscription Model

```javascript
const ReminderSubscriptionSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    index: true,
  },
  testTypeId: {
    type: Schema.Types.ObjectId,
    ref: "TestType",
    required: true,
    index: true,
  },
  lastTestDate: {
    type: Date,
    required: true,
  },
  nextReminderDate: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
    required: true,
    index: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  unsubscribedAt: {
    type: Date,
    default: null,
  },
  lastReminderSentAt: {
    type: Date,
    default: null,
  },
});

// Indexes
ReminderSubscriptionSchema.index({ patientId: 1, testTypeId: 1 });
ReminderSubscriptionSchema.index({ nextReminderDate: 1, status: 1 });

// Unique constraint: one active subscription per patient per test type
ReminderSubscriptionSchema.index(
  { patientId: 1, testTypeId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  },
);

module.exports = mongoose.model(
  "ReminderSubscription",
  ReminderSubscriptionSchema,
);
```

---

## 9. Summary

### Collections Created in This Module:

1. **testresults** - Single collection with 8 discriminator schemas (1 base + 8 specialized)
2. **testtypes** - Test type metadata and configuration
3. **notificationlogs** - Notification history
4. **remindersubscriptions** - Routine checkup reminders

### Test Result Discriminators:

**Form-Based (4 types):**

1. BloodGlucose
2. Hemoglobin
3. BloodPressure
4. Pregnancy

**Upload-Based (4 types):** 5. XRay 6. ECG 7. Ultrasound 8. AutomatedReport

### External Collections Referenced:

1. **patients** (Patient Management Module)
2. **bookings** (Booking Module)
3. **healthcenters** (Health Center Module)
4. **users** (User Management Module)

### Key Features:

- **Database-Level Validation:** Each test type has strict schema validation
- **Single Collection Storage:** All test results in `testresults` collection
- **Type Safety:** Discriminator pattern ensures correct data structure per test type
- **Scalability:** Easy to add new test types by creating new discriminators
- **Query Efficiency:** Single collection allows unified patient history queries
- **Flexibility:** Mix of form-based and upload-based tests supported
- **Optimized Schema Design:**
  - Mongoose timestamps used for automatic createdAt/updatedAt management
  - Single source of truth: entryMethod stored only in TestType (not duplicated in TestResult)
  - Removed unnecessary tracking fields (lastUpdatedAt, lastUpdatedBy, manual createdAt)
  - Status history maintained for workflow audit trail (FRD requirement FR-3.2.2)
  - Frequency configuration centralized in TestType (removed from ReminderSubscription)
  - Test-specific configuration via flexible specificParameters field (supports different fields per test type)
  - Medical recommendations control reminder frequency (patients follow recommended intervals)

### Total Schema Count:

- **4 Main Collections** (testresults, testtypes, notificationlogs, remindersubscriptions)
- **1 Base Schema** (TestResult)
- **8 Discriminator Schemas** (specialized test types)
- **4 External References** (patient, booking, healthcenter, user)

All schemas implement comprehensive medical data fields aligned with real-world diagnostic reporting standards and the functional requirements in the FRD.
