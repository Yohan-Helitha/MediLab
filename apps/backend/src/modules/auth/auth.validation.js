import { body } from 'express-validator';

/**
 * Validation for patient registration
 */
export const validatePatientRegister = [
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('contact_number')
    .notEmpty()
    .withMessage('Contact number is required')
    .trim()
    .custom((value) => {
      // Remove spaces, parentheses, and dashes for validation
      const cleaned = value.replace(/[\s\-()]/g, '');
      // Accept both local (07xxxxxxxx) and international formats (+94xxxxxxxxx)
      const isValid = /^(\+94\d{9}|0\d{9})$/.test(cleaned);
      if (!isValid) {
        throw new Error('Contact number must be a valid Sri Lankan phone number');
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 100 })
    .withMessage('Password must be between 8 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)')
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

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('contactNumber')
    .notEmpty()
    .withMessage('Contact number is required')
    .trim()
    .custom((value) => {
      // Remove spaces, parentheses, and dashes for validation
      const cleaned = value.replace(/[\s\-()]/g, '');
      // Accept both local (07xxxxxxxx) and international formats (+94xxxxxxxxx)
      const isValid = /^(\+94\d{9}|0\d{9})$/.test(cleaned);
      if (!isValid) {
        throw new Error('Contact number must be a valid Sri Lankan phone number');
      }
      return true;
    }),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['MOH', 'PHI', 'Nurse', 'Admin', 'Lab_Technician', 'Doctor', 'HealthOfficer', 'Staff'])
    .withMessage('Invalid role selected'),

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
