import { body, param } from "express-validator";

export const validateVisitCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .isString()
    .withMessage("Member ID must be a string")
    .isLength({ max: 50 })
    .withMessage("Member ID must be less than 50 characters"),
  
  body("household_id")
    .notEmpty()
    .withMessage("Household ID is required")
    .isString()
    .withMessage("Household ID must be a string")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("visit_date")
    .notEmpty()
    .withMessage("Visit date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  
  body("visit_type")
    .notEmpty()
    .withMessage("Visit type is required")
    .isLength({ max: 50 })
    .withMessage("Visit type must be less than 50 characters"),
  
  body("reason_for_visit")
    .notEmpty()
    .withMessage("Reason for visit is required"),
  
  body("doctor_notes")
    .optional(),
  
  body("diagnosis")
    .optional(),
  
  body("follow_up_required")
    .optional()
    .isBoolean()
    .withMessage("Follow up required must be boolean"),
  
  body("follow_up_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid follow up date format"),
  
  body("created_by_staff_id")
    .notEmpty()
    .withMessage("Created by staff ID is required")
    .isString()
    .withMessage("Staff ID must be a string")
    .isLength({ max: 20 })
    .withMessage("Staff ID must be less than 20 characters")
];

export const validateVisitUpdate = [
  param("id")
    .isMongoId()
    .withMessage("Invalid visit ID"),
  
  body("member_id")
    .optional()
    .isString()
    .withMessage("Member ID must be a string")
    .isLength({ max: 50 })
    .withMessage("Member ID must be less than 50 characters"),
  
  body("household_id")
    .optional()
    .isString()
    .withMessage("Household ID must be a string")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("visit_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  
  body("visit_type")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Visit type must be less than 50 characters"),
  
  body("reason_for_visit")
    .optional(),
  
  body("doctor_notes")
    .optional(),
  
  body("diagnosis")
    .optional(),
  
  body("follow_up_required")
    .optional()
    .isBoolean()
    .withMessage("Follow up required must be boolean"),
  
  body("follow_up_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid follow up date format"),
  
  body("created_by_staff_id")
    .optional()
    .isString()
    .withMessage("Staff ID must be a string")
    .isLength({ max: 20 })
    .withMessage("Staff ID must be less than 20 characters")
];

export const validateVisitId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid visit ID")
];