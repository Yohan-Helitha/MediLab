import { body } from 'express-validator';

// Validation rules for lab creation and update
export const validateLab = [
  body('name')
    .isString()
    .withMessage('name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('name must be between 3 and 100 characters'),
  body('location')
    .isString()
    .withMessage('location must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('location must be between 3 and 100 characters'),
  body('contactInfo')
    .isObject()
    .withMessage('contactInfo must be an object'),
  body('contactInfo.phone')
    .isString()
    .withMessage('phone must be a string')
    .matches(/^\+?[0-9\-\s]{7,15}$/)
    .withMessage('phone must be a valid phone number'),
  body('contactInfo.address')
    .isString()
    .withMessage('address must be a string')
    .isLength({ min: 5, max: 200 })
    .withMessage('address must be between 5 and 200 characters'),
  body('operatingHours')
    .isObject()
    .withMessage('operatingHours must be an object'),
  body('operatingHours.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('operatingHours.start must be in HH:MM format'),
  body('operatingHours.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('operatingHours.end must be in HH:MM format'),
  body('status')
    .isIn(['active', 'inactive', 'closed', 'holiday'])
    .withMessage("status must be one of: active, inactive, closed, holiday"),
];

export default { validateLab };
