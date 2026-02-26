import { body, param, query } from "express-validator";

// Validation schemas for test result operations

// Validate MongoDB ObjectId parameter
export const idParamValidation = [
  param("id").isMongoId().withMessage("Invalid test result ID format"),
];

// Validate patient ID parameter
export const patientIdParamValidation = [
  param("patientId").isMongoId().withMessage("Invalid patient ID format"),
];

// Validate booking ID parameter
export const bookingIdParamValidation = [
  param("bookingId").isMongoId().withMessage("Invalid booking ID format"),
];

// Validate health center ID parameter
export const healthCenterIdParamValidation = [
  param("healthCenterId")
    .isMongoId()
    .withMessage("Invalid health center ID format"),
];

// Validate test type ID parameter
export const testTypeIdParamValidation = [
  param("testTypeId").isMongoId().withMessage("Invalid test type ID format"),
];

// Base validation for submitting test result
export const submitResultValidation = [
  body("bookingId")
    .notEmpty()
    .withMessage("Booking ID is required")
    .isMongoId()
    .withMessage("Invalid booking ID format"),

  body("patientProfileId")
    .notEmpty()
    .withMessage("Patient profile ID is required")
    .isMongoId()
    .withMessage("Invalid patient profile ID format"),

  body("testTypeId")
    .notEmpty()
    .withMessage("Test type ID is required")
    .isMongoId()
    .withMessage("Invalid test type ID format"),

  body("healthCenterId")
    .notEmpty()
    .withMessage("Health center ID is required")
    .isMongoId()
    .withMessage("Invalid health center ID format"),

  body("enteredBy")
    .notEmpty()
    .withMessage("Entered by user ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  body("observations")
    .optional()
    .isString()
    .withMessage("Observations must be a string")
    .isLength({ max: 1000 })
    .withMessage("Observations cannot exceed 1000 characters"),

  body("currentStatus")
    .optional()
    .isIn(["sample_received", "processing", "released"])
    .withMessage("Invalid status value"),

  body("releasedAt")
    .optional()
    .isISO8601()
    .withMessage("Released at must be a valid date"),

  // Dynamic validation for discriminator-specific fields will be handled in controller
];

// Validation for Blood Glucose specific fields
export const bloodGlucoseValidation = [
  body("testType")
    .notEmpty()
    .withMessage("Blood glucose test type is required")
    .isIn(["Fasting", "Random", "Postprandial", "HbA1c"])
    .withMessage("Invalid blood glucose test type"),

  body("glucoseLevel")
    .notEmpty()
    .withMessage("Glucose level is required")
    .isFloat({ min: 0, max: 600 })
    .withMessage("Glucose level must be between 0 and 600"),

  body("unit")
    .notEmpty()
    .withMessage("Unit is required")
    .isIn(["mg/dL", "mmol/L"])
    .withMessage("Unit must be mg/dL or mmol/L"),

  body("sampleType")
    .notEmpty()
    .withMessage("Sample type is required")
    .isIn(["Venous Blood", "Capillary Blood"])
    .withMessage("Invalid sample type"),

  body("sampleQuality")
    .notEmpty()
    .withMessage("Sample quality is required")
    .isIn(["Good", "Hemolyzed", "Lipemic", "Clotted"])
    .withMessage("Invalid sample quality"),

  body("sampleCollectionTime")
    .notEmpty()
    .withMessage("Sample collection time is required")
    .isISO8601()
    .withMessage("Invalid date format for sample collection time"),

  body("fastingDuration")
    .optional()
    .isInt({ min: 0, max: 24 })
    .withMessage("Fasting duration must be between 0 and 24 hours"),

  body("interpretation")
    .optional()
    .isString()
    .withMessage("Interpretation must be a string")
    .isLength({ max: 500 })
    .withMessage("Interpretation cannot exceed 500 characters"),
];

// Validation for Hemoglobin specific fields
export const hemoglobinValidation = [
  body("hemoglobinLevel")
    .notEmpty()
    .withMessage("Hemoglobin level is required")
    .isFloat({ min: 0, max: 25 })
    .withMessage("Hemoglobin level must be between 0 and 25"),

  body("unit")
    .notEmpty()
    .withMessage("Unit is required")
    .isIn(["g/dL", "g/L"])
    .withMessage("Unit must be g/dL or g/L"),

  body("sampleType")
    .notEmpty()
    .withMessage("Sample type is required")
    .isIn(["Venous Blood", "Capillary Blood"])
    .withMessage("Invalid sample type"),

  body("sampleCollectionTime")
    .notEmpty()
    .withMessage("Sample collection time is required")
    .isISO8601()
    .withMessage("Invalid date format"),
];

// Validation for Blood Pressure specific fields
export const bloodPressureValidation = [
  body("systolicBP")
    .notEmpty()
    .withMessage("Systolic BP is required")
    .isInt({ min: 60, max: 300 })
    .withMessage("Systolic BP must be between 60 and 300"),

  body("diastolicBP")
    .notEmpty()
    .withMessage("Diastolic BP is required")
    .isInt({ min: 40, max: 200 })
    .withMessage("Diastolic BP must be between 40 and 200"),

  body("pulseRate")
    .notEmpty()
    .withMessage("Pulse rate is required")
    .isInt({ min: 30, max: 250 })
    .withMessage("Pulse rate must be between 30 and 250"),

  body("unit").optional().isIn(["mmHg"]).withMessage("Unit must be mmHg"),

  body("patientPosition")
    .notEmpty()
    .withMessage("Patient position is required")
    .isIn(["Sitting", "Standing", "Lying Down"])
    .withMessage("Invalid patient position"),

  body("armUsed")
    .notEmpty()
    .withMessage("Arm used is required")
    .isIn(["Left", "Right"])
    .withMessage("Arm used must be Left or Right"),

  body("cuffSize")
    .notEmpty()
    .withMessage("Cuff size is required")
    .isIn(["Small Adult", "Adult", "Large Adult", "Thigh"])
    .withMessage("Invalid cuff size"),

  body("patientState")
    .notEmpty()
    .withMessage("Patient state is required")
    .isIn(["Rested (5+ minutes)", "Active", "Post-exercise", "Stressed"])
    .withMessage("Invalid patient state"),

  body("measurementTime")
    .notEmpty()
    .withMessage("Measurement time is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("method")
    .notEmpty()
    .withMessage("Measurement method is required")
    .isIn([
      "Manual Sphygmomanometer",
      "Digital BP Monitor",
      "Automated Monitor",
    ])
    .withMessage("Invalid measurement method"),
];

// Validation for Pregnancy Test specific fields
export const pregnancyValidation = [
  body("result")
    .notEmpty()
    .withMessage("Test result is required")
    .isIn(["Positive", "Negative", "Indeterminate"])
    .withMessage("Result must be Positive, Negative, or Indeterminate"),

  body("testType")
    .notEmpty()
    .withMessage("Test type is required")
    .isIn(["Urine hCG", "Serum hCG (Qualitative)", "Serum hCG (Quantitative)"])
    .withMessage("Invalid pregnancy test type"),

  body("hcgLevel")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("hCG level must be a positive number"),

  body("hcgUnit")
    .optional()
    .isIn(["mIU/mL", "IU/L"])
    .withMessage("hCG unit must be mIU/mL or IU/L"),

  body("method")
    .notEmpty()
    .withMessage("Test method is required")
    .isIn([
      "Urine Test Strip",
      "Urine Cassette Test",
      "Serum Immunoassay",
      "ELISA",
    ])
    .withMessage("Invalid test method"),

  body("sampleType")
    .notEmpty()
    .withMessage("Sample type is required")
    .isIn(["Urine (First Morning)", "Urine (Random)", "Serum"])
    .withMessage("Invalid sample type"),

  body("sampleQuality")
    .notEmpty()
    .withMessage("Sample quality is required")
    .isIn(["Good", "Dilute", "Hemolyzed"])
    .withMessage("Invalid sample quality"),

  body("sampleCollectionTime")
    .notEmpty()
    .withMessage("Sample collection time is required")
    .isISO8601()
    .withMessage("Invalid date format"),
];

// Validation for X-Ray specific fields
export const xrayValidation = [
  body("uploadedFiles")
    .notEmpty()
    .withMessage("Uploaded files are required")
    .isArray({ min: 1, max: 5 })
    .withMessage("Must upload between 1 and 5 X-ray images"),

  body("uploadedFiles.*.fileName")
    .notEmpty()
    .withMessage("File name is required"),

  body("uploadedFiles.*.filePath")
    .notEmpty()
    .withMessage("File path is required"),

  body("uploadedFiles.*.fileSize")
    .notEmpty()
    .withMessage("File size is required")
    .isInt({ min: 1 })
    .withMessage("File size must be a positive number"),

  body("uploadedFiles.*.mimeType")
    .notEmpty()
    .withMessage("MIME type is required"),

  body("bodyPart")
    .notEmpty()
    .withMessage("Body part is required")
    .isIn([
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
    ])
    .withMessage("Invalid body part"),

  body("clinicalIndication")
    .notEmpty()
    .withMessage("Clinical indication is required")
    .isLength({ max: 500 })
    .withMessage("Clinical indication cannot exceed 500 characters"),

  body("views")
    .notEmpty()
    .withMessage("Views are required")
    .isArray({ min: 1 })
    .withMessage("At least one view is required"),

  body("findings")
    .notEmpty()
    .withMessage("Findings are required")
    .isLength({ max: 2000 })
    .withMessage("Findings cannot exceed 2000 characters"),

  body("impression")
    .notEmpty()
    .withMessage("Impression is required")
    .isLength({ max: 1000 })
    .withMessage("Impression cannot exceed 1000 characters"),

  body("interpretation")
    .notEmpty()
    .withMessage("Interpretation is required")
    .isIn([
      "Normal",
      "Abnormal - Non-urgent",
      "Abnormal - Urgent",
      "Critical - Immediate Attention Required",
    ])
    .withMessage("Invalid interpretation"),
];

// Validation for ECG specific fields
export const ecgValidation = [
  body("uploadedFiles")
    .notEmpty()
    .withMessage("Uploaded files are required")
    .isArray({ min: 1, max: 3 })
    .withMessage("Must upload between 1 and 3 ECG files"),

  body("uploadedFiles.*.fileName")
    .notEmpty()
    .withMessage("File name is required"),

  body("uploadedFiles.*.filePath")
    .notEmpty()
    .withMessage("File path is required"),

  body("uploadedFiles.*.fileSize")
    .notEmpty()
    .withMessage("File size is required")
    .isInt({ min: 1 })
    .withMessage("File size must be a positive number"),

  body("uploadedFiles.*.mimeType")
    .notEmpty()
    .withMessage("MIME type is required"),

  body("ecgType")
    .notEmpty()
    .withMessage("ECG type is required")
    .isIn([
      "Resting 12-Lead",
      "Stress Test",
      "Holter Monitor",
      "6-Lead",
      "3-Lead",
    ])
    .withMessage("Invalid ECG type"),

  body("clinicalIndication")
    .notEmpty()
    .withMessage("Clinical indication is required")
    .isLength({ max: 500 })
    .withMessage("Clinical indication cannot exceed 500 characters"),

  body("heartRate")
    .optional()
    .isInt({ min: 20, max: 300 })
    .withMessage("Heart rate must be between 20 and 300"),

  body("rhythm")
    .optional()
    .isIn([
      "Sinus Rhythm",
      "Sinus Tachycardia",
      "Sinus Bradycardia",
      "Atrial Fibrillation",
      "Atrial Flutter",
      "Ventricular Tachycardia",
      "Other Arrhythmia",
      "Irregular",
    ])
    .withMessage("Invalid rhythm"),

  body("findings")
    .notEmpty()
    .withMessage("Findings are required")
    .isLength({ max: 2000 })
    .withMessage("Findings cannot exceed 2000 characters"),

  body("interpretation")
    .notEmpty()
    .withMessage("Interpretation is required")
    .isIn([
      "Normal",
      "Abnormal - Non-urgent",
      "Abnormal - Urgent",
      "Critical - Immediate Attention Required",
    ])
    .withMessage("Invalid interpretation"),
];

// Validation for Ultrasound specific fields
export const ultrasoundValidation = [
  body("uploadedFiles")
    .notEmpty()
    .withMessage("Uploaded files are required")
    .isArray({ min: 1, max: 5 })
    .withMessage("Must upload between 1 and 5 ultrasound images"),

  body("uploadedFiles.*.fileName")
    .notEmpty()
    .withMessage("File name is required"),

  body("uploadedFiles.*.filePath")
    .notEmpty()
    .withMessage("File path is required"),

  body("uploadedFiles.*.fileSize")
    .notEmpty()
    .withMessage("File size is required")
    .isInt({ min: 1 })
    .withMessage("File size must be a positive number"),

  body("uploadedFiles.*.mimeType")
    .notEmpty()
    .withMessage("MIME type is required"),

  body("studyType")
    .notEmpty()
    .withMessage("Study type is required")
    .isIn([
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
    ])
    .withMessage("Invalid study type"),

  body("clinicalIndication")
    .notEmpty()
    .withMessage("Clinical indication is required")
    .isLength({ max: 500 })
    .withMessage("Clinical indication cannot exceed 500 characters"),

  body("findings")
    .notEmpty()
    .withMessage("Findings are required")
    .isLength({ max: 2000 })
    .withMessage("Findings cannot exceed 2000 characters"),

  body("impression")
    .notEmpty()
    .withMessage("Impression is required")
    .isLength({ max: 1000 })
    .withMessage("Impression cannot exceed 1000 characters"),

  body("interpretation")
    .notEmpty()
    .withMessage("Interpretation is required")
    .isIn([
      "Normal",
      "Abnormal - Non-urgent",
      "Abnormal - Urgent",
      "Critical - Immediate Attention Required",
    ])
    .withMessage("Invalid interpretation"),
];

// Validation for Automated Report specific fields
export const automatedReportValidation = [
  body("uploadedFiles")
    .notEmpty()
    .withMessage("Uploaded file is required")
    .isArray({ min: 1, max: 1 })
    .withMessage("Must upload exactly 1 automated report file"),

  body("uploadedFiles.*.fileName")
    .notEmpty()
    .withMessage("File name is required"),

  body("uploadedFiles.*.filePath")
    .notEmpty()
    .withMessage("File path is required"),

  body("uploadedFiles.*.fileSize")
    .notEmpty()
    .withMessage("File size is required")
    .isInt({ min: 1 })
    .withMessage("File size must be a positive number"),

  body("uploadedFiles.*.mimeType")
    .notEmpty()
    .withMessage("MIME type is required")
    .equals("application/pdf")
    .withMessage("File must be a PDF"),

  body("testPanelName")
    .notEmpty()
    .withMessage("Test panel name is required")
    .isLength({ max: 200 })
    .withMessage("Test panel name cannot exceed 200 characters"),

  body("testCategory")
    .notEmpty()
    .withMessage("Test category is required")
    .isIn([
      "Complete Blood Count (CBC)",
      "Comprehensive Metabolic Panel",
      "Lipid Profile",
      "Liver Function Tests",
      "Renal Function Tests",
      "Thyroid Function Tests",
      "Coagulation Panel",
      "Other",
    ])
    .withMessage("Invalid test category"),

  body("sampleType")
    .notEmpty()
    .withMessage("Sample type is required")
    .isIn([
      "Whole Blood (EDTA)",
      "Whole Blood (Citrate)",
      "Serum",
      "Plasma",
      "Urine",
      "Other",
    ])
    .withMessage("Invalid sample type"),

  body("sampleCollectionTime")
    .notEmpty()
    .withMessage("Sample collection time is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("analysisCompletedTime")
    .notEmpty()
    .withMessage("Analysis completed time is required")
    .isISO8601()
    .withMessage("Invalid date format"),
];

// Validation for update status
export const updateStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["sample_received", "processing", "released"])
    .withMessage("Status must be sample_received, processing, or released"),

  body("changedBy")
    .notEmpty()
    .withMessage("Changed by user ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

// Validation for mark as viewed
export const markViewedValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

// Query filters validation for result lists
export const resultQueryFiltersValidation = [
  query("status")
    .optional()
    .isIn(["sample_received", "processing", "released"])
    .withMessage("Invalid status filter"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format"),

  query("testTypeId")
    .optional()
    .isMongoId()
    .withMessage("Invalid test type ID format"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1"),
];

// Validation for soft delete (primary method)
export const softDeleteValidation = [
  param("id").isMongoId().withMessage("Invalid test result ID format"),

  body("deleteReason")
    .notEmpty()
    .withMessage("Deletion reason is required")
    .isString()
    .withMessage("Deletion reason must be a string")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Deletion reason must be between 10 and 500 characters")
    .matches(/^[a-zA-Z0-9\s\.,;:()\-'"!?]+$/)
    .withMessage(
      "Deletion reason contains invalid characters. Use only letters, numbers, and basic punctuation.",
    ),
];

// Validation for hard delete (admin-only permanent deletion)
export const hardDeleteValidation = [
  param("id").isMongoId().withMessage("Invalid test result ID format"),

  body("deleteReason")
    .notEmpty()
    .withMessage("Deletion reason is required for permanent deletion")
    .isString()
    .withMessage("Deletion reason must be a string")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Deletion reason must be between 10 and 500 characters")
    .matches(/^[a-zA-Z0-9\s\.,;:()\-'"!?]+$/)
    .withMessage(
      "Deletion reason contains invalid characters. Use only letters, numbers, and basic punctuation.",
    ),
];
