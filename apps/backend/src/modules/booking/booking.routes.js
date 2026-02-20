// Booking routes
// modules/booking/booking.routes.js

import express from 'express';
import {
  createBookingController,
  getBookings,
  getBookingByPatientId,
  getBookingByHealthCenterId,
  getBookingByDate,
  getBookingByCreatedBy,
  getBookingByStatus,
  getBookingByType,
  updateBookingController,
  softDeleteBookingController,
  hardDeleteBookingController,
} from './booking.controller.js';
import { createBookingValidation, updateBookingValidation } from './booking.validation.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Patient / Staff / Health Officer (authenticated)
 */
router.post(
  '/',
  protect,                   // authentication middleware
  createBookingValidation,   // validation middleware
  createBookingController    // controller
);

// List bookings
router.get('/', protect, getBookings);

// Filtered booking fetches
router.get('/patient/:patientProfileId', protect, getBookingByPatientId);
router.get('/center/:healthCenterId', protect, getBookingByHealthCenterId);
router.get('/date/:bookingDate', protect, getBookingByDate);
router.get('/createdBy/:createdBy', protect, getBookingByCreatedBy);
router.get('/status/:status', protect, getBookingByStatus);
router.get('/type/:type', protect, getBookingByType);

// Update booking
router.put('/:id', protect, updateBookingValidation, updateBookingController);

// Soft delete booking
router.delete('/:id', protect, softDeleteBookingController);

// Hard delete booking
router.delete('/:id/hard', protect, hardDeleteBookingController);

export default router;

