// Validation schemas for test type operations
import { body, param, query } from "express-validator";

// Validation for creating a test type
export const createTestTypeValidation = [
  body("name")
    .notEmpty()
    .withMessage("Test name is required")
    .isString()
    .withMessage("Test name must be a string")
    .isLength({ max: 200 })
    .withMessage("Test name cannot exceed 200 characters")
    .trim(),

  body("code")
    .notEmpty()
    .withMessage("Test code is required")
    .isString()
    .withMessage("Test code must be a string")
    .isLength({ max: 20 })
    .withMessage("Test code cannot exceed 20 characters")
    .toUpperCase()
    .trim()
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage(
      "Test code can only contain uppercase letters, numbers, hyphens, and underscores",
    ),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Blood Chemistry",
      "Hematology",
      "Imaging",
      "Cardiology",
      "Clinical Pathology",
      "Other",
    ])
    .withMessage("Invalid category"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
    .trim(),

  body("entryMethod")
    .notEmpty()
    .withMessage("Entry method is required")
    .isIn(["form", "upload"])
    .withMessage("Entry method must be either 'form' or 'upload'"),

  body("discriminatorType")
    .notEmpty()
    .withMessage("Discriminator type is required")
    .isIn([
      "BloodGlucose",
      "Hemoglobin",
      "BloodPressure",
      "Pregnancy",
      "XRay",
      "ECG",
      "Ultrasound",
      "AutomatedReport",
    ])
    .withMessage("Invalid discriminator type"),

  body("isRoutineMonitoringRecommended")
    .optional()
    .isBoolean()
    .withMessage("isRoutineMonitoringRecommended must be a boolean"),

  body("recommendedFrequency")
    .if(body("isRoutineMonitoringRecommended").equals(true))
    .notEmpty()
    .withMessage(
      "Recommended frequency is required when routine monitoring is enabled",
    )
    .isIn(["monthly", "quarterly", "biannually", "annually"])
    .withMessage("Invalid frequency"),

  body("recommendedFrequencyInDays")
    .if(body("isRoutineMonitoringRecommended").equals(true))
    .notEmpty()
    .withMessage(
      "Recommended frequency in days is required when routine monitoring is enabled",
    )
    .isInt({ min: 1, max: 365 })
    .withMessage("Frequency in days must be between 1 and 365"),

  body("specificParameters")
    .optional()
    .isObject()
    .withMessage("Specific parameters must be an object"),

  body("reportTemplate")
    .if(body("entryMethod").equals("form"))
    .notEmpty()
    .withMessage("Report template is required for form-based tests")
    .isString()
    .withMessage("Report template must be a string"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Validation for updating a test type
export const updateTestTypeValidation = [
  param("id").isMongoId().withMessage("Invalid test type ID"),

  body("name")
    .optional()
    .isString()
    .withMessage("Test name must be a string")
    .isLength({ max: 200 })
    .withMessage("Test name cannot exceed 200 characters")
    .trim(),

  body("code")
    .optional()
    .isString()
    .withMessage("Test code must be a string")
    .isLength({ max: 20 })
    .withMessage("Test code cannot exceed 20 characters")
    .toUpperCase()
    .trim()
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage(
      "Test code can only contain uppercase letters, numbers, hyphens, and underscores",
    ),

  body("category")
    .optional()
    .isIn([
      "Blood Chemistry",
      "Hematology",
      "Imaging",
      "Cardiology",
      "Clinical Pathology",
      "Other",
    ])
    .withMessage("Invalid category"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
    .trim(),

  body("entryMethod")
    .optional()
    .isIn(["form", "upload"])
    .withMessage("Entry method must be either 'form' or 'upload'"),

  body("discriminatorType")
    .optional()
    .isIn([
      "BloodGlucose",
      "Hemoglobin",
      "BloodPressure",
      "Pregnancy",
      "XRay",
      "ECG",
      "Ultrasound",
      "AutomatedReport",
    ])
    .withMessage("Invalid discriminator type"),

  body("isRoutineMonitoringRecommended")
    .optional()
    .isBoolean()
    .withMessage("isRoutineMonitoringRecommended must be a boolean"),

  body("recommendedFrequency")
    .optional()
    .isIn(["monthly", "quarterly", "biannually", "annually"])
    .withMessage("Invalid frequency"),

  body("recommendedFrequencyInDays")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Frequency in days must be between 1 and 365"),

  body("specificParameters")
    .optional()
    .isObject()
    .withMessage("Specific parameters must be an object"),

  body("reportTemplate")
    .optional()
    .isString()
    .withMessage("Report template must be a string"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Validation for ID parameter
export const idParamValidation = [
  param("id").isMongoId().withMessage("Invalid test type ID"),
];

// Validation for category parameter
export const categoryParamValidation = [
  param("category")
    .isIn([
      "Blood Chemistry",
      "Hematology",
      "Imaging",
      "Cardiology",
      "Clinical Pathology",
      "Other",
    ])
    .withMessage("Invalid category"),
];

// Validation for query filters
export const queryFiltersValidation = [
  query("category")
    .optional()
    .isIn([
      "Blood Chemistry",
      "Hematology",
      "Imaging",
      "Cardiology",
      "Clinical Pathology",
      "Other",
    ])
    .withMessage("Invalid category"),

  query("entryMethod")
    .optional()
    .isIn(["form", "upload"])
    .withMessage("Entry method must be either 'form' or 'upload'"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  query("isRoutineMonitoringRecommended")
    .optional()
    .isBoolean()
    .withMessage("isRoutineMonitoringRecommended must be a boolean"),
];
