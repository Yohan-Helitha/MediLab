import { body, param } from "express-validator";

export const validateEmergencyContactCreate = [
  body("member_id")
    .optional({ values: 'falsy' })
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
    .matches(/^[0-9]{10}$/)
    .withMessage("Primary phone must be exactly 10 digits with no symbols or letters"),
  
  body("secondary_phone")
    .optional({ values: 'falsy' })
    .matches(/^[0-9]{10}$/)
    .withMessage("Secondary phone must be exactly 10 digits with no symbols or letters"),
  
  body("contact_priority")
    .notEmpty()
    .withMessage("Contact priority is required")
    .isIn(["PRIMARY", "SECONDARY"])
    .withMessage("Contact priority must be PRIMARY or SECONDARY"),
  
  body("available_24_7")
    .optional()
    .isBoolean()
    .withMessage("Available 24/7 must be either true (yes) or false (no)"),
  
  body("best_time_to_contact")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const wordValues = ["ANYTIME", "MORNING", "AFTERNOON", "EVENING", "NIGHT"];
      if (timeRegex.test(value) || wordValues.includes(value.toUpperCase())) return true;
      throw new Error("Best time to contact must be a valid time (HH:MM) or one of: ANYTIME, MORNING, AFTERNOON, EVENING, NIGHT");
    }),
  
  body("address")
    .optional({ values: 'falsy' })
    .isLength({ max: 150 })
    .withMessage("Address must be less than 150 characters"),
  
  body("gn_division")
    .optional({ values: 'falsy' })
    .isLength({ max: 100 })
    .withMessage("GN Division must be less than 100 characters"),
  
  body("landmarks")
    .optional(),
  
  body("receive_medical_results")
    .optional()
    .isBoolean()
    .withMessage("Receive medical results must be either true (yes) or false (no)"),
  
  body("decision_permission")
    .optional()
    .isBoolean()
    .withMessage("Decision permission must be either true (yes) or false (no)"),
  
  body("collect_reports_permission")
    .optional()
    .isBoolean()
    .withMessage("Collect reports permission must be either true (yes) or false (no)")
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
    .matches(/^[0-9]{10}$/)
    .withMessage("Primary phone must be exactly 10 digits with no symbols or letters"),
  
  body("secondary_phone")
    .optional({ values: 'falsy' })
    .matches(/^[0-9]{10}$/)
    .withMessage("Secondary phone must be exactly 10 digits with no symbols or letters"),
  
  body("contact_priority")
    .optional()
    .isIn(["PRIMARY", "SECONDARY"])
    .withMessage("Contact priority must be PRIMARY or SECONDARY"),
  
  body("available_24_7")
    .optional()
    .isBoolean()
    .withMessage("Available 24/7 must be either true (yes) or false (no)"),
  
  body("best_time_to_contact")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const wordValues = ["ANYTIME", "MORNING", "AFTERNOON", "EVENING", "NIGHT"];
      if (timeRegex.test(value) || wordValues.includes(value.toUpperCase())) return true;
      throw new Error("Best time to contact must be a valid time (HH:MM) or one of: ANYTIME, MORNING, AFTERNOON, EVENING, NIGHT");
    }),
  
  body("address")
    .optional()
    .notEmpty()
    .withMessage("Address cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Address must be less than 150 characters"),
  
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
    .withMessage("Receive medical results must be either true (yes) or false (no)"),
  
  body("decision_permission")
    .optional()
    .isBoolean()
    .withMessage("Decision permission must be either true (yes) or false (no)"),
  
  body("collect_reports_permission")
    .optional()
    .isBoolean()
    .withMessage("Collect reports permission must be either true (yes) or false (no)")
];

export const validateEmergencyContactId = [
  param("id").isMongoId().withMessage("Invalid emergency contact ID")
];