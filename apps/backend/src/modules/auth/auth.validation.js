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
    .matches(/^[0-9+\-() ]+$/)
    .withMessage('Invalid contact number format')
    .isLength({ min: 9, max: 20 })
    .withMessage('Contact number must be between 9 and 20 characters'),

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
    .matches(/^[0-9+\-() ]+$/)
    .withMessage('Invalid contact number format')
    .isLength({ min: 9, max: 20 })
    .withMessage('Contact number must be between 9 and 20 characters'),

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
