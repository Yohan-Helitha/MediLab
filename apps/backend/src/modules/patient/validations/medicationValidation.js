import { body, param } from "express-validator";

export const validateMedicationCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("medicine_name")
    .notEmpty()
    .withMessage("Medicine name is required")
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("Medicine name must be between 1 and 150 characters"),
  
  body("dosage")
    .notEmpty()
    .withMessage("Dosage is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Dosage must be between 1 and 100 characters"),
  
  body("reason")
    .notEmpty()
    .withMessage("Reason is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Reason cannot be empty"),
  
  body("prescribed_by")
    .notEmpty()
    .withMessage("Prescribed by is required")
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("Prescribed by must be between 1 and 150 characters"),
  
  body("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid date format (use YYYY-MM-DD or ISO8601)"),
  
  body("prescription_photo")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Prescription photo path must be less than 255 characters")
];

export const validateMedicationUpdate = [
  param("id").isMongoId().withMessage("Invalid medication ID"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("medicine_name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("Medicine name must be between 1 and 150 characters"),
  
  body("dosage")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Dosage must be between 1 and 100 characters"),
  
  body("reason")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Reason cannot be empty"),
  
  body("prescribed_by")
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("Prescribed by must be between 1 and 150 characters"),
  
  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format (use YYYY-MM-DD or ISO8601)"),
  
  body("prescription_photo")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Prescription photo path must be less than 255 characters")
];

export const validateMedicationId = [
  param("id").isMongoId().withMessage("Invalid medication ID")
];