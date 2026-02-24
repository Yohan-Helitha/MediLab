import { body, param } from "express-validator";

/**
 * Medication Validation Rules
 * 
 * Note: Prescription photo file size validation (10MB limit) should be handled separately 
 * in the controller using multer middleware with file size limits.
 * Example: multer({ limits: { fileSize: 10 * 1024 * 1024 } })
 */

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
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Start date must be in YYYY-MM-DD format")
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare only dates
      
      if (inputDate > today) {
        throw new Error('Start date cannot be a future date');
      }
      
      // Check if it's a valid date
      if (isNaN(inputDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      return true;
    }),
  
  body("prescription_photo")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Prescription photo path must be less than 255 characters")
    // Note: File size validation (10MB limit) handled in multer middleware
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
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Start date must be in YYYY-MM-DD format")
    .custom((value) => {
      if (value) {
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare only dates
        
        if (inputDate > today) {
          throw new Error('Start date cannot be a future date');
        }
        
        // Check if it's a valid date
        if (isNaN(inputDate.getTime())) {
          throw new Error('Invalid date');
        }
      }
      
      return true;
    }),
  
  body("prescription_photo")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Prescription photo path must be less than 255 characters")
    // Note: File size validation (10MB limit) handled in multer middleware
];

export const validateMedicationId = [
  param("id").isMongoId().withMessage("Invalid medication ID")
];