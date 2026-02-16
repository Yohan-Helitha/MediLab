// Booking validation
import { body } from 'express-validator';
import mongoose from 'mongoose';

export const createBookingValidation = [
    body('patientId')
        .notEmpty().withMessage('Patient ID is required')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Patient ID'),

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
]