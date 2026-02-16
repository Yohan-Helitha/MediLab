import { body, param } from "express-validator";

export const validatePastMedicalHistoryCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("surgeries")
    .optional()
    .isBoolean()
    .withMessage("Surgeries must be a boolean value"),
  
  body("hospital_admissions")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Hospital admissions must be less than 500 characters"),
  
  body("serious_injuries")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Serious injuries must be less than 500 characters"),
  
  body("genetic_disorders")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Genetic disorders must be less than 500 characters"),
  
  body("blood_transfusion_history")
    .optional()
    .isBoolean()
    .withMessage("Blood transfusion history must be a boolean value"),
  
  body("tuberculosis_history")
    .optional()
    .isBoolean()
    .withMessage("Tuberculosis history must be a boolean value")
];

export const validatePastMedicalHistoryUpdate = [
  param("id").isMongoId().withMessage("Invalid past medical history ID"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("surgeries")
    .optional()
    .isBoolean()
    .withMessage("Surgeries must be a boolean value"),
  
  body("hospital_admissions")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Hospital admissions must be less than 500 characters"),
  
  body("serious_injuries")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Serious injuries must be less than 500 characters"),
  
  body("genetic_disorders")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Genetic disorders must be less than 500 characters"),
  
  body("blood_transfusion_history")
    .optional()
    .isBoolean()
    .withMessage("Blood transfusion history must be a boolean value"),
  
  body("tuberculosis_history")
    .optional()
    .isBoolean()
    .withMessage("Tuberculosis history must be a boolean value")
];

export const validatePastMedicalHistoryId = [
  param("id").isMongoId().withMessage("Invalid past medical history ID")
];