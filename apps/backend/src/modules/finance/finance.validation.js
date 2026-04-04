import { body, query } from 'express-validator';
import mongoose from 'mongoose';

export const recordCashPaymentValidation = [
  body('bookingId')
    .notEmpty()
    .withMessage('bookingId is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid bookingId'),

  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .isFloat({ min: 0 })
    .withMessage('amount must be a number >= 0'),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('notes must be at most 500 characters'),
];

export const dateRangeQueryValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid startDate'),
  query('endDate').optional().isISO8601().withMessage('Invalid endDate'),
];

export const recentPaymentsQueryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50'),
];

export const listPaymentsQueryValidation = [
  query('paymentMethod')
    .optional()
    .isIn(['CASH', 'ONLINE'])
    .withMessage('paymentMethod must be CASH or ONLINE'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 5000 })
    .withMessage('limit must be between 1 and 5000'),
];

export const listUnpaidBookingsQueryValidation = [
  query('paymentMethod')
    .optional()
    .isIn(['CASH', 'ONLINE'])
    .withMessage('paymentMethod must be CASH or ONLINE'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 5000 })
    .withMessage('limit must be between 1 and 5000'),
];
