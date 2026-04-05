import { body, param } from "express-validator";

const commonValidation = [
  // Environmental Health Factors
  body("water_source")
    .notEmpty()
    .withMessage("Water source is required"),
  body("well_water_tested")
    .notEmpty()
    .withMessage("Well water testing status is required"),
  body("ckdu_exposure_area")
    .notEmpty()
    .withMessage("CKDu exposure status is required"),
  body("dengue_risk")
    .exists()
    .withMessage("Dengue risk field must exist"),
  body("sanitation_type")
    .notEmpty()
    .withMessage("Sanitation type is required"),
  body("waste_disposal")
    .notEmpty()
    .withMessage("Waste disposal method is required"),
  body("pesticide_exposure")
    .exists()
    .withMessage("Pesticide exposure field must exist"),
  body("chronic_diseases")
    .notEmpty()
    .withMessage("Chronic disease history object is required"),
  body("chronic_diseases.diabetes").exists(),
  body("chronic_diseases.hypertension").exists(),
  body("chronic_diseases.kidney_disease").exists(),
  body("chronic_diseases.asthma").exists(),
  body("chronic_diseases.heart_disease").exists(),
  body("chronic_diseases.other").optional(),
  body("chronic_diseases.none").exists()
];

export const validateHouseholdCreate = [
  body("household_id")
    .optional({ checkFalsy: true })
    .matches(/^ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),

  body("head_member_name")
    .notEmpty()
    .withMessage("Head member name is required")
    .isLength({ max: 150 })
    .withMessage("Head member name must be less than 150 characters"),

  body("primary_contact_number")
    .notEmpty()
    .withMessage("Primary contact number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Primary contact number must be exactly 10 digits with no symbols or letters"),

  body("secondary_contact_number")
    .optional()
    .custom((value) => {
      if (!value || value.trim() === "") return true;
      if (!/^[0-9]{10}$/.test(value)) {
        throw new Error("Secondary contact number must be exactly 10 digits");  
      }
      return true;
    }),

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

  body("submitted_by")
    .notEmpty()
    .withMessage("Submitted by is required"),

  body("members_list")
    .optional()
    .isArray()
    .withMessage("Members list must be an array"),

  body("members_list.*.date_of_birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid date format for member's date of birth")
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      if (dob > today) {
        throw new Error("Date of birth cannot be in the future");
      }
      return true;
    }),

  ...commonValidation
];

export const validateHouseholdUpdate = [
  param("id")
    .custom((value) => {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isCustomFormat = /^ANU-PADGNDIV-\d{5}$/.test(value);

      if (isObjectId || isCustomFormat) {
        return true;
      }
      throw new Error("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN or existing ObjectId");
    }),

  body("household_id")
    .optional()
    .matches(/^ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN")
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),

  body("head_member_name")
    .notEmpty()
    .withMessage("Head member name is required")
    .isLength({ max: 150 })
    .withMessage("Head member name must be less than 150 characters"),

  body("primary_contact_number")
    .notEmpty()
    .withMessage("Primary contact number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Primary contact number must be exactly 10 digits with no symbols or letters"),

  body("secondary_contact_number")
    .optional()
    .custom((value) => {
      if (!value || value.trim() === "") return true;
      if (!/^[0-9]{10}$/.test(value)) {
        throw new Error("Secondary contact number must be exactly 10 digits");  
      }
      return true;
    }),

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

  body("submitted_by")
    .notEmpty()
    .withMessage("Submitted by is required"),

  body("members_list")
    .optional()
    .isArray()
    .withMessage("Members list must be an array"),

  body("members_list.*.date_of_birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid date format for member's date of birth")
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      if (dob > today) {
        throw new Error("Date of birth cannot be in the future");
      }
      return true;
    }),

  ...commonValidation
];

export const validateHouseholdId = [
  param("id")
    .custom((value) => {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isCustomFormat = /^ANU-PADGNDIV-\d{5}$/.test(value);

      if (isObjectId || isCustomFormat) {
        return true;
      }
      throw new Error("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN or existing ObjectId");
    })
];
