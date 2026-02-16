import { body, param } from "express-validator";

export const validateEmergencyContactCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format. Expected format: MEM-ANU-PADGNDIV-YYYY-NNNNN"),
  
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 150 })
    .withMessage("Full name must be less than 150 characters"),
  
  body("relationship")
    .notEmpty()
    .withMessage("Relationship is required")
    .isLength({ max: 50 })
    .withMessage("Relationship must be less than 50 characters"),
  
  body("primary_phone")
    .notEmpty()
    .withMessage("Primary phone is required")
    .isLength({ max: 20 })
    .withMessage("Primary phone must be less than 20 characters")
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Primary phone must contain only valid phone number characters"),
  
  body("secondary_phone")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Secondary phone must be less than 20 characters")
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage("Secondary phone must contain only valid phone number characters"),
  
  body("contact_priority")
    .notEmpty()
    .withMessage("Contact priority is required")
    .isIn(["PRIMARY", "SECONDARY"])
    .withMessage("Contact priority must be PRIMARY or SECONDARY"),
  
  body("available_24_7")
    .optional()
    .isBoolean()
    .withMessage("Available 24/7 must be boolean"),
  
  body("best_time_to_contact")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Best time to contact must be less than 20 characters"),
  
  body("address")
    .notEmpty()
    .withMessage("Address is required"),
  
  body("gn_division")
    .notEmpty()
    .withMessage("GN Division is required")
    .isLength({ max: 100 })
    .withMessage("GN Division must be less than 100 characters"),
  
  body("landmarks")
    .optional(),
  
  body("receive_medical_results")
    .optional()
    .isBoolean()
    .withMessage("Receive medical results must be boolean"),
  
  body("decision_permission")
    .optional()
    .isBoolean()
    .withMessage("Decision permission must be boolean"),
  
  body("collect_reports_permission")
    .optional()
    .isBoolean()
    .withMessage("Collect reports permission must be boolean")
];

export const validateEmergencyContactUpdate = [
  param("id").isMongoId().withMessage("Invalid emergency contact ID"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format. Expected format: MEM-ANU-PADGNDIV-YYYY-NNNNN"),
  
  body("full_name")
    .optional()
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Full name must be less than 150 characters"),
  
  body("relationship")
    .optional()
    .notEmpty()
    .withMessage("Relationship cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Relationship must be less than 50 characters"),
  
  body("primary_phone")
    .optional()
    .notEmpty()
    .withMessage("Primary phone cannot be empty")
    .isLength({ max: 20 })
    .withMessage("Primary phone must be less than 20 characters")
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Primary phone must contain only valid phone number characters"),
  
  body("secondary_phone")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Secondary phone must be less than 20 characters")
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage("Secondary phone must contain only valid phone number characters"),
  
  body("contact_priority")
    .optional()
    .isIn(["PRIMARY", "SECONDARY"])
    .withMessage("Contact priority must be PRIMARY or SECONDARY"),
  
  body("available_24_7")
    .optional()
    .isBoolean()
    .withMessage("Available 24/7 must be boolean"),
  
  body("best_time_to_contact")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Best time to contact must be less than 20 characters"),
  
  body("address")
    .optional()
    .notEmpty()
    .withMessage("Address cannot be empty"),
  
  body("gn_division")
    .optional()
    .notEmpty()
    .withMessage("GN Division cannot be empty")
    .isLength({ max: 100 })
    .withMessage("GN Division must be less than 100 characters"),
  
  body("landmarks")
    .optional(),
  
  body("receive_medical_results")
    .optional()
    .isBoolean()
    .withMessage("Receive medical results must be boolean"),
  
  body("decision_permission")
    .optional()
    .isBoolean()
    .withMessage("Decision permission must be boolean"),
  
  body("collect_reports_permission")
    .optional()
    .isBoolean()
    .withMessage("Collect reports permission must be boolean")
];

export const validateEmergencyContactId = [
  param("id").isMongoId().withMessage("Invalid emergency contact ID")
];