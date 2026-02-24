// Booking validation
import { body } from 'express-validator';
import mongoose from 'mongoose';

export const createBookingValidation = [
    body('patientProfileId')
        .notEmpty().withMessage('Patient Profile ID is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Patient Profile ID'),

    body('healthCenterId')
        .notEmpty().withMessage('Health Center is Required')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Health Center ID'),

    body('diagnosticTestId')
        .notEmpty().withMessage('Diagnostic test is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid diagnostic test ID'),

    body('bookingDate')
        .notEmpty().withMessage('Booking date is required')
        .isISO8601().withMessage('Invalid date format'),

    body('bookingType')
        .isIn(['PRE_BOOKED', 'WALK_IN'])
        .withMessage('Invalid booking type')
];

export const updateBookingValidation = [
    body('bookingDate')
        .optional()
        .isISO8601().withMessage('Invalid date format'),

    body('bookingType')
        .optional()
        .isIn(['PRE_BOOKED', 'WALK_IN'])
        .withMessage('Invalid booking type'),

    body('priorityLevel')
        .optional()
        .isIn(['NORMAL', 'ELDERLY', 'PREGNANT', 'URGENT'])
        .withMessage('Invalid priority level'),

    body('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
        .withMessage('Invalid booking status'),

    body('paymentStatus')
        .optional()
        .isIn(['UNPAID', 'PAID', 'WAIVED'])
        .withMessage('Invalid payment status'),

    body('paymentMethod')
        .optional()
        .isIn(['CASH', 'ONLINE', 'GOVERNMENT'])
        .withMessage('Invalid payment method'),
];