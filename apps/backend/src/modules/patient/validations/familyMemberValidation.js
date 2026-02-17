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
    .withMessage("Invalid date format"),
  
  body("relationship_to_head")
    .notEmpty()
    .withMessage("Relationship to head is required")
    .isLength({ max: 50 })
    .withMessage("Relationship to head must be less than 50 characters")
];

export const validateFamilyMemberUpdate = [
  param("id")
    .matches(/^FAM-ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid family member ID format. Expected format: FAM-ANU-PADGNDIV-NNNNN"),
  
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
    .withMessage("Invalid date format"),
  
  body("relationship_to_head")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Relationship to head must be less than 50 characters")
];

export const validateFamilyMemberId = [
  param("id")
    .matches(/^FAM-ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid family member ID format. Expected format: FAM-ANU-PADGNDIV-NNNNN")
];