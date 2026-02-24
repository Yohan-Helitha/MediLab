import { body, param } from "express-validator";

export const validateChronicDiseaseCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("disease_name")
    .notEmpty()
    .withMessage("Disease name is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Disease name must be between 1 and 100 characters"),
  
  body("since_year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Since year must be between 1900 and ${new Date().getFullYear()} (past years and current year only, no future years)`),
  
  body("currently_on_medication")
    .optional()
    .isBoolean()
    .withMessage("Currently on medication must be either true (yes) or false (no)")
];

export const validateChronicDiseaseUpdate = [
  param("id").isMongoId().withMessage("Invalid chronic disease ID"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("disease_name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Disease name must be between 1 and 100 characters"),
  
  body("since_year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Since year must be between 1900 and ${new Date().getFullYear()} (past years and current year only, no future years)`),
  
  body("currently_on_medication")
    .optional()
    .isBoolean()
    .withMessage("Currently on medication must be either true (yes) or false (no)")
];

export const validateChronicDiseaseId = [
  param("id").isMongoId().withMessage("Invalid chronic disease ID")
];