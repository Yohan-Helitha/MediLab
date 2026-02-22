import { body } from 'express-validator';

/**
 * Validation for patient registration
 */
export const validatePatientRegister = [
  body('household_id')
    .notEmpty()
    .withMessage('Household ID is required')
    .custom((value) => {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isCustomFormat = /^ANU-PADGNDIV-\d{5}$/.test(value);
      
      if (isObjectId || isCustomFormat) {
        return true;
      }
      throw new Error('Invalid household ID format. Expected format: ANU-PADGNDIV-NNNNN or existing ObjectId');
    }),

  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters')
    .trim(),

  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .trim(),

  body('contact_number')
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^[0-9+\-() ]+$/)
    .withMessage('Invalid contact number format')
    .isLength({ min: 9, max: 20 })
    .withMessage('Contact number must be between 9 and 20 characters'),

  body('nic')
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
        throw new Error('NIC is required for members above 18 years of age');
      }
      
      if (value && value.length > 20) {
        throw new Error('NIC must be less than 20 characters');
      }
      
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('date_of_birth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['MALE', 'FEMALE', 'OTHER', 'Male', 'Female', 'Other'])
    .withMessage('Gender must be MALE, FEMALE, or OTHER'),

  body('gn_division')
    .notEmpty()
    .withMessage('GN Division is required')
    .isLength({ max: 100 })
    .withMessage('GN Division must be less than 100 characters')
    .trim(),

  body('district')
    .notEmpty()
    .withMessage('District is required')
    .isLength({ max: 100 })
    .withMessage('District must be less than 100 characters')
    .trim(),

  body('photo')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Photo path must be less than 255 characters'),

  body('disability_status')
    .optional()
    .isBoolean()
    .withMessage('Disability status must be boolean'),

  body('pregnancy_status')
    .optional()
    .isBoolean()
    .withMessage('Pregnancy status must be boolean')
];

/**
 * Validation for patient login
 */
export const validatePatientLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Member ID, NIC, or contact number is required')
    .trim(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation for health officer registration
 */
export const validateHealthOfficerRegister = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters')
    .trim(),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Gender must be MALE, FEMALE, or OTHER'),

  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .matches(/^[A-Z0-9\-]+$/)
    .withMessage('Employee ID must contain only uppercase letters, numbers, and hyphens')
    .isLength({ min: 3, max: 50 })
    .withMessage('Employee ID must be between 3 and 50 characters')
    .trim(),

  body('contactNumber')
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^[0-9+\-() ]+$/)
    .withMessage('Invalid contact number format')
    .isLength({ min: 9, max: 20 })
    .withMessage('Contact number must be between 9 and 20 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),

  body('assignedArea')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Assigned area must be less than 100 characters')
    .trim(),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['MOH', 'PHI', 'Nurse', 'Admin', 'Lab_Technician', 'Doctor'])
    .withMessage('Invalid role. Must be one of: MOH, PHI, Nurse, Admin, Lab_Technician, Doctor'),

  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must contain only letters, numbers, and underscores')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .trim(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 100 })
    .withMessage('Password must be between 8 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)')
];

/**
 * Validation for health officer login
 */
export const validateHealthOfficerLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Employee ID, email, or username is required')
    .trim(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation for token verification
 */
export const validateToken = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
    .isJWT()
    .withMessage('Invalid token format')
];
