import { body } from 'express-validator';

/**
 * Validation for asking AI Doctor
 */
export const validateAskAIDoctor = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Message must be between 3 and 1000 characters')
    .trim(),

  body('specialization')
    .optional()
    .isIn([
      'general',
      'neurosurgery',
      'cardiology',
      'orthopedics',
      'pediatrics',
      'dermatology',
      'psychiatry',
      'ophthalmology',
      'gynecology',
      'oncology',
      'pharmacy',
      'surgery',
      'internal_medicine'
    ])
    .withMessage('Invalid specialization'),

  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be 2-5 characters')
];

/**
 * Validation for medical information query
 */
export const validateMedicalInfo = [
  body('condition')
    .notEmpty()
    .withMessage('Medical condition is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Condition must be between 2 and 200 characters')
    .trim(),

  body('specialization')
    .optional()
    .isIn([
      'general',
      'neurosurgery',
      'cardiology',
      'orthopedics',
      'pediatrics',
      'dermatology',
      'psychiatry',
      'ophthalmology',
      'gynecology',
      'oncology',
      'pharmacy',
      'surgery',
      'internal_medicine'
    ])
    .withMessage('Invalid specialization')
];

/**
 * Validation for symptom analysis
 */
export const validateSymptomAnalysis = [
  body('symptoms')
    .notEmpty()
    .withMessage('Symptoms are required')
    .isArray({ min: 1 })
    .withMessage('Symptoms must be an array with at least one item'),

  body('symptoms.*')
    .isString()
    .withMessage('Each symptom must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Each symptom must be between 2 and 100 characters')
    .trim(),

  body('patientInfo')
    .optional()
    .isObject()
    .withMessage('Patient info must be an object'),

  body('patientInfo.age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),

  body('patientInfo.gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER', 'Male', 'Female', 'Other'])
    .withMessage('Gender must be MALE, FEMALE, or OTHER')
];

/**
 * Validation for medication information
 */
export const validateMedicationInfo = [
  body('medicationName')
    .notEmpty()
    .withMessage('Medication name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Medication name must be between 2 and 200 characters')
    .trim()
];

/**
 * Validation for lifestyle advice
 */
export const validateLifestyleAdvice = [
  body('condition')
    .notEmpty()
    .withMessage('Health condition is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Condition must be between 2 and 200 characters')
    .trim()
];
