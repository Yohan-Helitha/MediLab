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
    .isIn(['male', 'female', 'Male', 'Female'])
    .withMessage("Gender must be either 'male' or 'female'")
    .customSanitizer(value => value.toLowerCase()),
  
  body("date_of_birth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date of birth must be in YYYY-MM-DD format")
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare only dates
      
      if (inputDate > today) {
        throw new Error('Date of birth cannot be a future date');
      }
      
      // Check if it's a valid date
      if (isNaN(inputDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      return true;
    })
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
    .isIn(['male', 'female', 'Male', 'Female'])
    .withMessage("Gender must be either 'male' or 'female'")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
  body("date_of_birth")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date of birth must be in YYYY-MM-DD format")
    .custom((value) => {
      if (value) {
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare only dates
        
        if (inputDate > today) {
          throw new Error('Date of birth cannot be a future date');
        }
        
        // Check if it's a valid date
        if (isNaN(inputDate.getTime())) {
          throw new Error('Invalid date');
        }
      }
      
      return true;
    })
];

export const validateFamilyMemberId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid family member ID")
];