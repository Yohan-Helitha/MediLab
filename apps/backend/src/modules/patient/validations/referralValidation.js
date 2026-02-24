import { body, param } from "express-validator";

export const validateReferralCreate = [
  body("visit_id")
    .notEmpty()
    .withMessage("Visit ID is required")
    .isString()
    .withMessage("Visit ID must be a string")
    .matches(/^VIS-ANU-\d{4}-\d{5}$/)
    .withMessage("Invalid visit ID format. Expected format: VIS-ANU-YYYY-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Visit ID must be less than 50 characters"),
  
  body("referred_to")
    .notEmpty()
    .withMessage("Referred to is required")
    .isIn(['Base Hospital', 'District Hospital', 'Specialist Clinic'])
    .withMessage("Referred to must be one of: Base Hospital, District Hospital, Specialist Clinic")
    .isLength({ max: 150 })
    .withMessage("Referred to must be less than 150 characters"),
  
  body("referral_reason")
    .notEmpty()
    .withMessage("Referral reason is required"),
  
  body("urgency_level")
    .notEmpty()
    .withMessage("Urgency level is required")
    .isIn(['Routine', 'Urgent', 'Emergency'])
    .withMessage("Urgency level must be one of: Routine, Urgent, Emergency")
    .isLength({ max: 20 })
    .withMessage("Urgency level must be less than 20 characters"),
  
  body("referral_status")
    .optional()
    .isIn(['Pending', 'Completed', 'Cancelled'])
    .withMessage("Referral status must be one of: Pending, Completed, Cancelled")
    .isLength({ max: 20 })
    .withMessage("Referral status must be less than 20 characters")
];

export const validateReferralUpdate = [
  param("id")
    .isMongoId()
    .withMessage("Invalid referral ID"),
  
  body("visit_id")
    .optional()
    .isString()
    .withMessage("Visit ID must be a string")
    .matches(/^VIS-ANU-\d{4}-\d{5}$/)
    .withMessage("Invalid visit ID format. Expected format: VIS-ANU-YYYY-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Visit ID must be less than 50 characters"),
  
  body("referred_to")
    .optional()
    .isIn(['Base Hospital', 'District Hospital', 'Specialist Clinic'])
    .withMessage("Referred to must be one of: Base Hospital, District Hospital, Specialist Clinic")
    .isLength({ max: 150 })
    .withMessage("Referred to must be less than 150 characters"),
  
  body("referral_reason")
    .optional(),
  
  body("urgency_level")
    .optional()
    .isIn(['Routine', 'Urgent', 'Emergency'])
    .withMessage("Urgency level must be one of: Routine, Urgent, Emergency")
    .isLength({ max: 20 })
    .withMessage("Urgency level must be less than 20 characters"),
  
  body("referral_status")
    .optional()
    .isIn(['Pending', 'Completed', 'Cancelled'])
    .withMessage("Referral status must be one of: Pending, Completed, Cancelled")
    .isLength({ max: 20 })
    .withMessage("Referral status must be less than 20 characters")
];

export const validateReferralId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid referral ID")
];

export const validateVisitId = [
  param("visitId")
    .notEmpty()
    .withMessage("Visit ID is required")
    .isString()
    .withMessage("Visit ID must be a string")
    .matches(/^VIS-ANU-\d{4}-\d{5}$/)
    .withMessage("Invalid visit ID format. Expected format: VIS-ANU-YYYY-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Visit ID must be less than 50 characters")
];