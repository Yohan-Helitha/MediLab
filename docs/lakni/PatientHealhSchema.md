PatientProfile {
  _id: ObjectId,

  // BASIC INFORMATION
  fullName: String,
  nic: String,
  dateOfBirth: Date,
  age: Number,                 // auto calculated
  gender: String,              // MALE | FEMALE | OTHER
  language: String,            // en | si | ta

  // CONTACT
  contactNumber: String,
  address: String,
  gnDivision: String,
  district: String,

  // AUTHENTICATION
  username: String,
  passwordHash: String,

  // HOUSEHOLD LINK
  householdId: ObjectId,       // Ref: Household

  // PROFILE MEDIA
  photoUrl: String,

  // MEDICAL FLAGS
  disabilityStatus: Boolean,
  pregnancyStatus: Boolean,    // applicable females 12–55

  // SYSTEM
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Household {
  _id: ObjectId,

  householdCode: String,       // public reference code
  headMemberName: String,

  primaryContactNumber: String,
  secondaryContactNumber: String,

  address: String,
  villageName: String,
  gnDivision: String,
  district: String,
  province: String,

  // ENVIRONMENTAL HEALTH FACTORS
  waterSource: String,         // PIPE | PROTECTED_WELL | RIVER | etc.
  wellWaterTested: String,     // YES | NO | NOT_SURE
  ckduExposureArea: String,    // YES | NO | NOT_SURE
  dengueRisk: Boolean,
  sanitationType: String,
  wasteDisposalMethod: String,
  pesticideExposure: Boolean,

  // FAMILY CHRONIC DISEASE HISTORY
  chronicDiseases: {
    diabetes: Boolean,
    hypertension: Boolean,
    kidneyDisease: Boolean,
    asthma: Boolean,
    heartDisease: Boolean,
    other: String
  },

  registeredByStaffId: ObjectId,
  registrationDate: Date,

  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}


FamilyMember {
  _id: ObjectId,

  householdId: ObjectId,       // Ref: Household

  fullName: String,
  gender: String,
  dateOfBirth: Date,
  age: Number,

  relationshipToHead: String,  // MOTHER | FATHER | SPOUSE | SON | etc.

  isPrimaryPatient: Boolean,   // true if linked to PatientProfile
  patientProfileId: ObjectId,  // optional

  createdAt: Date,
  updatedAt: Date
}


EmergencyContact {
  _id: ObjectId,

  patientProfileId: ObjectId,  // Ref: PatientProfile

  fullName: String,
  relationship: String,
  primaryPhoneNumber: String,
  secondaryPhoneNumber: String,

  createdAt: Date,
  updatedAt: Date
}


Visit {
  _id: ObjectId,

  patientProfileId: ObjectId,
  householdId: ObjectId,

  visitDate: Date,
  visitType: String,          // OPD | MOBILE_CLINIC | HOME_VISIT

  reasonForVisit: String,
  doctorNotes: String,
  diagnosis: String,

  followUpRequired: Boolean,
  followUpDate: Date,

  createdByStaffId: ObjectId,

  createdAt: Date,
  updatedAt: Date
}


HealthDetails {
  _id: ObjectId,

  patientProfileId: ObjectId,
  visitId: ObjectId,           // Optional link

  heightCm: Number,
  weightKg: Number,
  bmi: Number,                 // auto calculated
  bloodGroup: String,          // A+, O-, etc.

  recordedDate: Date,
  recordedByStaffId: ObjectId,

  createdAt: Date,
  updatedAt: Date
}


HealthPattern {
  _id: ObjectId,

  householdId: ObjectId,

  detectedCondition: String,       // CKDu risk, Dengue cluster, etc.
  riskLevel: String,               // LOW | MEDIUM | HIGH
  basedOnFactors: [String],        // waterSource, chronicDiseases, etc.

  generatedAt: Date,
  generatedBy: String              // SYSTEM | STAFF
}


TestRecommendation {
  _id: ObjectId,

  patientProfileId: ObjectId,
  visitId: ObjectId,

  recommendedTests: [ObjectId],   // Ref: DiagnosticTest
  reason: String,

  status: String,                 // PENDING | ACCEPTED | DECLINED

  recommendedAt: Date,
  recommendedBy: String           // SYSTEM | DOCTOR
}

HealthOfficer {
  _id: ObjectId,

  fullName: String,
  gender: String,
  employeeId: String,

  contactNumber: String,
  email: String,
  assignedArea: String,
  role: String,                  // MOH | PHI | Nurse | Admin

  username: String,
  passwordHash: String,

  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Household
   ↓
FamilyMember
   ↓
PatientProfile
   ↓
Visit
   ↓
HealthDetails
   ↓
TestRecommendation → Booking → LabTest
