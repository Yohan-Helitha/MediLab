Booking {
  _id: ObjectId,

  // PATIENT INFORMATION
  patientProfileId: ObjectId,        // Reference to PatientProfile
  patientNameSnapshot: String,       // For history consistency
  patientPhoneSnapshot: String,

  // TEST & CENTER INFORMATION
  healthCenterId: ObjectId,
  diagnosticTestId: ObjectId,
  testNameSnapshot: String,          // Snapshot in case test changes
  centerNameSnapshot: String,

  // DATE & TIME
  bookingDate: Date,                 // The scheduled test date
  timeSlot: String,                  // Optional (e.g., "09:00–10:00")
  
  // BOOKING TYPE
  bookingType: String,               // PRE_BOOKED | WALK_IN
  
  // QUEUE MANAGEMENT
  queueNumber: Number,
  estimatedWaitTimeMinutes: Number,
  
  // PRIORITY MANAGEMENT
  priorityLevel: String,             // NORMAL | ELDERLY | PREGNANT | URGENT
  
  // STATUS TRACKING
  status: String,                    // PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW
  
  // PAYMENT (Optional if you add future expansion)
  paymentStatus: String,             // UNPAID | PAID | WAIVED
  paymentMethod: String,             // CASH | ONLINE | GOVERNMENT
  
  // SAFETY FLAGS (Very important for rural healthcare)
  allergyFlag: Boolean,
  chronicConditionFlag: Boolean,
  
  // AUDIT FIELDS
  createdBy: ObjectId,               // Patient or Staff userId
  createdAt: Date,
  updatedAt: Date,
  
  // SOFT DELETE
  isActive: Boolean
}


Lab {
  _id: ObjectId,

  // BASIC INFORMATION
  name: String,
  addressLine1: String,
  addressLine2: String,
  district: String,
  province: String,

  // LOCATION (Optional but Recommended)
  latitude: Number,
  longitude: Number,

  // CONTACT
  phoneNumber: String,
  email: String,

  // OPERATING HOURS
  operatingHours: [
    {
      day: String,              // Monday, Tuesday...
      openTime: String,         // "08:00"
      closeTime: String         // "16:00"
    }
  ],

  // STATUS CONTROL
  operationalStatus: {
    type: String,
    enum: ["OPEN", "CLOSED", "HOLIDAY", "MAINTENANCE"],
    default: "OPEN"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}


DiagnosticTest {
  _id: ObjectId,

  name: String,
  category: String,                 // Blood, Imaging, Cardiac...
  description: String,
  basePrice: Number,
  estimatedResultTimeHours: Number, // 24, 48, etc.

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

LabTest {
  _id: ObjectId,

  labId: ObjectId,                // Ref: Lab
  diagnosticTestId: ObjectId,     // Ref: DiagnosticTest

  // LAB-SPECIFIC SETTINGS
  price: Number,                   // Can override base price
  estimatedResultTimeHours: Number,

  // AVAILABILITY CONTROL
  availabilityStatus: {
    type: String,
    enum: ["AVAILABLE", "UNAVAILABLE", "TEMPORARILY_SUSPENDED"],
    default: "AVAILABLE"
  },

  dailyCapacity: Number,

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: Date,
  updatedAt: Date
}

TestInstruction {
  _id: ObjectId,

  diagnosticTestId: ObjectId,     // Ref: DiagnosticTest

  preTestInstructions: [String],  // Fasting, avoid medicine, etc.
  postTestInstructions: [String], // Rest, avoid heavy meals

  languageCode: {
    type: String,
    enum: ["en", "si", "ta"],
    default: "en"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

Translation {
  _id: ObjectId,

  entityType: {
    type: String,
    enum: ["LAB", "TEST", "INSTRUCTION"]
  },

  entityId: ObjectId,          // Ref to Lab / DiagnosticTest / Instruction

  languageCode: {
    type: String,
    enum: ["en", "si", "ta"]
  },

  translatedFields: {
    type: Map,
    of: String
  },

  createdAt: Date,
  updatedAt: Date
}
