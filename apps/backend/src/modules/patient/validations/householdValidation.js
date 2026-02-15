import { body, param } from "express-validator";

export const validateHouseholdCreate = [
  body("household_code")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Household code must be less than 50 characters"),
  
  body("head_member_name")
    .notEmpty()
    .withMessage("Head member name is required")
    .isLength({ max: 150 })
    .withMessage("Head member name must be less than 150 characters"),
  
  body("primary_contact_number")
    .notEmpty()
    .withMessage("Primary contact number is required")
    .isLength({ max: 20 })
    .withMessage("Primary contact number must be less than 20 characters"),
  
  body("secondary_contact_number")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Secondary contact number must be less than 20 characters"),
  
  body("address")
    .notEmpty()
    .withMessage("Address is required"),
  
  body("village_name")
    .notEmpty()
    .withMessage("Village name is required")
    .isLength({ max: 100 })
    .withMessage("Village name must be less than 100 characters"),
  
  body("gn_division")
    .notEmpty()
    .withMessage("GN Division is required")
    .isLength({ max: 100 })
    .withMessage("GN Division must be less than 100 characters"),
  
  body("district")
    .notEmpty()
    .withMessage("District is required")
    .isLength({ max: 100 })
    .withMessage("District must be less than 100 characters"),
  
  body("province")
    .notEmpty()
    .withMessage("Province is required")
    .isLength({ max: 100 })
    .withMessage("Province must be less than 100 characters"),
  
  body("registered_by_staff_id")
    .notEmpty()
    .withMessage("Registered by staff ID is required")
    .matches(/^HO-\d{4}-\d{3}$/)
    .withMessage("Invalid staff ID format. Expected format: HO-YYYY-XXX")
];

export const validateHouseholdUpdate = [
  param("id").isMongoId().withMessage("Invalid household ID"),
  
  body("household_code")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Household code must be less than 50 characters"),
  
  body("head_member_name")
    .optional()
    .isLength({ max: 150 })
    .withMessage("Head member name must be less than 150 characters"),
  
  body("primary_contact_number")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Primary contact number must be less than 20 characters"),
  
  body("secondary_contact_number")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Secondary contact number must be less than 20 characters"),
  
  body("village_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Village name must be less than 100 characters"),
  
  body("gn_division")
    .optional()
    .isLength({ max: 100 })
    .withMessage("GN Division must be less than 100 characters"),
  
  body("district")
    .optional()
    .isLength({ max: 100 })
    .withMessage("District must be less than 100 characters"),
  
  body("province")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Province must be less than 100 characters"),
  
  body("registered_by_staff_id")
    .optional()
    .matches(/^HO-\d{4}-\d{3}$/)
    .withMessage("Invalid staff ID format. Expected format: HO-YYYY-XXX")
];

export const validateHouseholdId = [
  param("id").isMongoId().withMessage("Invalid household ID")
];