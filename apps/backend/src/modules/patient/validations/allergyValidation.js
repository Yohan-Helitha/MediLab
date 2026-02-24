import { body, param } from "express-validator";

export const validateAllergyCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("allergy_type")
    .notEmpty()
    .withMessage("Allergy type is required")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Allergy type must be between 1 and 50 characters")
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage("Allergy type can only contain letters, spaces, and hyphens"),
  
  body("allergen_name")
    .notEmpty()
    .withMessage("Allergen name is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Allergen name must be between 1 and 100 characters"),
  
  body("reaction_type")
    .notEmpty()
    .withMessage("Reaction type is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Reaction type must be between 1 and 100 characters"),
  
  body("severity")
    .notEmpty()
    .withMessage("Severity is required")
    .trim()
    .isIn(["Mild", "Moderate", "Severe", "Critical"])
    .withMessage("Severity must be one of: Mild, Moderate, Severe, Critical"),
  
  body("since_year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() - 1 })
    .withMessage(`Since year must be between 1900 and ${new Date().getFullYear() - 1} (past years only)`)
];

export const validateAllergyUpdate = [
  param("id").isMongoId().withMessage("Invalid allergy ID"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("allergy_type")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Allergy type must be between 1 and 50 characters")
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage("Allergy type can only contain letters, spaces, and hyphens"),
  
  body("allergen_name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Allergen name must be between 1 and 100 characters"),
  
  body("reaction_type")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Reaction type must be between 1 and 100 characters"),
  
  body("severity")
    .optional()
    .trim()
    .isIn(["Mild", "Moderate", "Severe", "Critical"])
    .withMessage("Severity must be one of: Mild, Moderate, Severe, Critical"),
  
  body("since_year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() - 1 })
    .withMessage(`Since year must be between 1900 and ${new Date().getFullYear() - 1} (past years only)`)
];

export const validateAllergyId = [
  param("id").isMongoId().withMessage("Invalid allergy ID")
];