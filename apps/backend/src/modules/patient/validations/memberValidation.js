import { body, param } from "express-validator";

/**
 * Member Validation Rules
 * 
 * Note: Photo file size validation (10MB limit) should be handled separately 
 * in the controller using multer middleware with file size limits.
 * Example: multer({ limits: { fileSize: 10 * 1024 * 1024 } })
 */

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
    .matches(/^[0-9]{10}$/)
    .withMessage("Contact number must be exactly 10 digits with no symbols or letters"),
  
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
      
      // Validate NIC format if provided
      if (value && value !== 'N/A') {
        // Type 1: 9 digits + uppercase V (e.g., 123456789V)
        const oldNicFormat = /^[0-9]{9}V$/;
        // Type 2: 12 digits (e.g., 200012345678)
        const newNicFormat = /^[0-9]{12}$/;
        
        if (!oldNicFormat.test(value) && !newNicFormat.test(value)) {
          throw new Error('NIC must be either 9 digits followed by uppercase "V" (e.g., 123456789V) or 12 digits (e.g., 200012345678). No spacing, symbols, or lowercase letters allowed.');
        }
        
        // Check if lowercase 'v' was used
        if (value.endsWith('v')) {
          throw new Error('NIC must use uppercase "V", not lowercase "v"');
        }
      }
      
      return true;
    }),
  
  body("password_hash")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 255 })
    .withMessage("Password must be at least 8 characters and less than 255 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#_])[a-zA-Z0-9@#_]+$/)
    .withMessage("Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@, #, or _)"),
  
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
    }),
  
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(['male', 'female', 'Male', 'Female'])
    .withMessage("Gender must be either 'male' or 'female'")
    .customSanitizer(value => value.toLowerCase()),
  
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
    .matches(/^[0-9]{10}$/)
    .withMessage("Contact number must be exactly 10 digits with no symbols or letters"),
  
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
      
      // Validate NIC format if provided
      if (value && value !== 'N/A') {
        // Type 1: 9 digits + uppercase V (e.g., 123456789V)
        const oldNicFormat = /^[0-9]{9}V$/;
        // Type 2: 12 digits (e.g., 200012345678)
        const newNicFormat = /^[0-9]{12}$/;
        
        if (!oldNicFormat.test(value) && !newNicFormat.test(value)) {
          throw new Error('NIC must be either 9 digits followed by uppercase "V" (e.g., 123456789V) or 12 digits (e.g., 200012345678). No spacing, symbols, or lowercase letters allowed.');
        }
        
        // Check if lowercase 'v' was used
        if (value.endsWith('v')) {
          throw new Error('NIC must use uppercase "V", not lowercase "v"');
        }
      }
      
      return true;
    }),
  
  body("password_hash")
    .optional()
    .isLength({ min: 8, max: 255 })
    .withMessage("Password must be at least 8 characters and less than 255 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#_])[a-zA-Z0-9@#_]+$/)
    .withMessage("Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@, #, or _)"),
  
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
    }),
  
  body("gender")
    .optional()
    .isIn(['male', 'female', 'Male', 'Female'])
    .withMessage("Gender must be either 'male' or 'female'")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
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