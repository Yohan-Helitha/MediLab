import { body, param } from "express-validator";

export const validateVisitCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format. Expected: MEM-ANU-PADGNDIV-YYYY-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Member ID must be less than 50 characters"),
  
  body("household_id")
    .notEmpty()
    .withMessage("Household ID is required")
    .matches(/^ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid household ID format. Expected: ANU-PADGNDIV-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("visit_date")
    .notEmpty()
    .withMessage("Visit date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Visit date must be in YYYY-MM-DD format")
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(inputDate.getTime())) {
        throw new Error('Invalid date');
      }
      if (inputDate < today) {
        throw new Error('Visit date cannot be in the past; must be today or a future date');
      }
      return true;
    }),
  
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
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Follow up date must be in YYYY-MM-DD format")
    .custom((value) => {
      if (value) {
        const inputDate = new Date(value);
        if (isNaN(inputDate.getTime())) {
          throw new Error('Invalid follow up date');
        }
      }
      return true;
    }),
  
  body("created_by_staff_id")
    .notEmpty()
    .withMessage("Created by staff ID is required")
    .matches(/^HO-\d{4}-\d{3}$/)
    .withMessage("Invalid staff ID format. Expected format: HO-YYYY-XXX"),
];

export const validateVisitUpdate = [
  param("id")
    .isMongoId()
    .withMessage("Invalid visit ID"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format. Expected: MEM-ANU-PADGNDIV-YYYY-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Member ID must be less than 50 characters"),
  
  body("household_id")
    .optional()
    .matches(/^ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid household ID format. Expected: ANU-PADGNDIV-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("visit_date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Visit date must be in YYYY-MM-DD format")
    .custom((value) => {
      if (value) {
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(inputDate.getTime())) {
          throw new Error('Invalid date');
        }
        if (inputDate < today) {
          throw new Error('Visit date cannot be in the past; must be today or a future date');
        }
      }
      return true;
    }),
  
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
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Follow up date must be in YYYY-MM-DD format")
    .custom((value) => {
      if (value) {
        const inputDate = new Date(value);
        if (isNaN(inputDate.getTime())) {
          throw new Error('Invalid follow up date');
        }
      }
      return true;
    }),
  
  body("created_by_staff_id")
    .optional()
    .matches(/^HO-\d{4}-\d{3}$/)
    .withMessage("Invalid staff ID format. Expected format: HO-YYYY-XXX")
];

export const validateVisitId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid visit ID")
];