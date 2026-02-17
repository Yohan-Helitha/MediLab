import { body, param } from "express-validator";

export const validateFamilyMemberCreate = [
  body("household_id")
    .notEmpty()
    .withMessage("Household ID is required")
    .matches(/^ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 150 })
    .withMessage("Full name must be less than 150 characters"),
  
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isLength({ max: 20 })
    .withMessage("Gender must be less than 20 characters"),
  
  body("date_of_birth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format")
];

export const validateFamilyMemberUpdate = [
  param("id")
    .isMongoId()
    .withMessage("Invalid family member ID"),
  
  body("household_id")
    .optional()
    .matches(/^ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("full_name")
    .optional()
    .isLength({ max: 150 })
    .withMessage("Full name must be less than 150 characters"),
  
  body("gender")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Gender must be less than 20 characters"),
  
  body("date_of_birth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
];

export const validateFamilyMemberId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid family member ID")
];