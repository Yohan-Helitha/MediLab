import { body, param } from "express-validator";

export const validateMemberCreate = [
  body("household_id")
    .notEmpty()
    .withMessage("Household ID is required")
    .custom((value) => {
      // Accept old MongoDB ObjectId format (for existing household references) and new custom format
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isCustomFormat = /^ANU-PADGNDIV-\d{5}$/.test(value);
      
      if (isObjectId || isCustomFormat) {
        return true;
      }
      throw new Error("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN or existing ObjectId");
    })
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 150 })
    .withMessage("Full name must be less than 150 characters"),
  
  body("address")
    .notEmpty()
    .withMessage("Address is required"),
  
  body("contact_number")
    .notEmpty()
    .withMessage("Contact number is required")
    .isLength({ max: 20 })
    .withMessage("Contact number must be less than 20 characters"),
  
  body("nic")
    .optional()
    .custom((value, { req }) => {
      if (!req.body.date_of_birth) {
        throw new Error('Date of birth is required to validate NIC requirement');
      }
      
      const today = new Date();
      const birthDate = new Date(req.body.date_of_birth);
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      
      if (age > 18 && (!value || value.trim() === '')) {
        throw new Error('NIC is required for members above 18 years of age. You can use "N/A" if NIC is not available.');
      }
      
      if (value && value.length > 20) {
        throw new Error('NIC must be less than 20 characters');
      }
      
      return true;
    }),
  
  body("password_hash")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 255 })
    .withMessage("Password must be less than 255 characters"),
  
  body("date_of_birth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isLength({ max: 20 })
    .withMessage("Gender must be less than 20 characters"),
  
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
  
  body("photo")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Photo path must be less than 255 characters"),
  
  body("disability_status")
    .optional()
    .isBoolean()
    .withMessage("Disability status must be boolean"),
  
  body("pregnancy_status")
    .optional()
    .isBoolean()
    .withMessage("Pregnancy status must be boolean")
];

export const validateMemberUpdate = [
  param("id")
    .custom((value) => {
      // For updates: Accept old MongoDB ObjectId format (for existing data) and new custom format
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isCustomFormat = /^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/.test(value);
      
      if (isObjectId || isCustomFormat) {
        return true;
      }
      throw new Error("Invalid member ID format. Expected format: MEM-ANU-PADGNDIV-YYYY-NNNNN or existing ObjectId");
    }),
  
  body("household_id")
    .optional()
    .custom((value) => {
      // Accept old MongoDB ObjectId format (for existing household references) and new custom format
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isCustomFormat = /^ANU-PADGNDIV-\d{5}$/.test(value);
      
      if (isObjectId || isCustomFormat) {
        return true;
      }
      throw new Error("Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN or existing ObjectId");
    })
    .isLength({ max: 50 })
    .withMessage("Household ID must be less than 50 characters"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format. Expected format: MEM-ANU-PADGNDIV-YYYY-NNNNN"),
  
  body("full_name")
    .optional()
    .isLength({ max: 150 })
    .withMessage("Full name must be less than 150 characters"),
  
  body("contact_number")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Contact number must be less than 20 characters"),
  
  body("nic")
    .optional()
    .custom((value, { req }) => {
      if (req.body.date_of_birth) {
        const today = new Date();
        const birthDate = new Date(req.body.date_of_birth);
        const age = today.getFullYear() - birthDate.getFullYear() - 
          (today.getMonth() < birthDate.getMonth() || 
           (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
        
        if (age > 18 && (!value || value.trim() === '')) {
          throw new Error('NIC is required for members above 18 years of age. You can use "N/A" if NIC is not available.');
        }
      }
      
      if (value && value.length > 20) {
        throw new Error('NIC must be less than 20 characters');
      }
      
      return true;
    }),
  
  body("password_hash")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Password must be less than 255 characters"),
  
  body("date_of_birth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  
  body("gender")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Gender must be less than 20 characters"),
  
  body("gn_division")
    .optional()
    .isLength({ max: 100 })
    .withMessage("GN Division must be less than 100 characters"),
  
  body("district")
    .optional()
    .isLength({ max: 100 })
    .withMessage("District must be less than 100 characters"),
  
  body("photo")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Photo path must be less than 255 characters"),
  
  body("disability_status")
    .optional()
    .isBoolean()
    .withMessage("Disability status must be boolean"),
  
  body("pregnancy_status")
    .optional()
    .isBoolean()
    .withMessage("Pregnancy status must be boolean")
];

export const validateMemberId = [
  param("id")
    .custom((value) => {
      // For ID operations: Accept old MongoDB ObjectId format (for existing data) and new custom format
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isCustomFormat = /^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/.test(value);
      
      if (isObjectId || isCustomFormat) {
        return true;
      }
      throw new Error("Invalid member ID format. Expected format: MEM-ANU-PADGNDIV-YYYY-NNNNN or existing ObjectId");
    })
];