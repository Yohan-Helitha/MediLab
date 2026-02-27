import { body } from 'express-validator';

// Validation rules for lab creation and update
// These are aligned with the Lab mongoose model (lab.model.js)
export const validateLab = [
  body('name')
    .isString()
    .withMessage('name must be a string')
    .isLength({ min: 3, max: 200 })
    .withMessage('name must be between 3 and 200 characters'),
  body('addressLine1')
    .optional()
    .isString()
    .withMessage('addressLine1 must be a string')
    .isLength({ max: 200 })
    .withMessage('addressLine1 must be at most 200 characters'),
  body('addressLine2')
    .optional()
    .isString()
    .withMessage('addressLine2 must be a string')
    .isLength({ max: 200 })
    .withMessage('addressLine2 must be at most 200 characters'),
  body('district')
    .optional()
    .isString()
    .withMessage('district must be a string')
    .isLength({ max: 100 })
    .withMessage('district must be at most 100 characters'),
  body('province')
    .optional()
    .isString()
    .withMessage('province must be a string')
    .isLength({ max: 100 })
    .withMessage('province must be at most 100 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('longitude must be between -180 and 180'),
  body('phoneNumber')
    .optional()
    .isString()
    .withMessage('phoneNumber must be a string')
    .isLength({ max: 40 })
    .withMessage('phoneNumber must be at most 40 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('email must be a valid email address')
    .isLength({ max: 200 })
    .withMessage('email must be at most 200 characters'),
  body('operatingHours')
    .optional()
    .isArray()
    .withMessage('operatingHours must be an array'),
  body('operatingHours.*.day')
    .optional()
    .isString()
    .withMessage('operatingHours.day must be a string'),
  body('operatingHours.*.openTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('openTime must be in HH:mm format'),
  body('operatingHours.*.closeTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('closeTime must be in HH:mm format'),
  body('operationalStatus')
    .optional()
    .isIn(['OPEN', 'CLOSED', 'HOLIDAY', 'MAINTENANCE'])
    .withMessage('operationalStatus must be one of: OPEN, CLOSED, HOLIDAY, MAINTENANCE'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('createdBy')
    .optional()
    .isHexadecimal()
    .withMessage('createdBy must be a valid hex string')
    .isLength({ min: 24, max: 24 })
    .withMessage('createdBy must be a 24-character ObjectId'),
];

export default { validateLab };
