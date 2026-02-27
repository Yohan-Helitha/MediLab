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
// Use the real JWT-based auth middleware
import {
  authenticate,
  isPatient,
  isHealthOfficer,
  checkRole,
} from '../auth/auth.middleware.js';

const router = express.Router();

// Local alias so existing naming (`protect`) still makes sense
const protect = authenticate;

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Patient (authenticated)
 */
router.post(
  '/',
  protect,                  // JWT authentication
  isPatient,                // only patients can create bookings
  createBookingValidation,  // validation middleware
  createBookingController   // controller
);

// List all bookings - restricted to health officers
router.get('/', protect, isHealthOfficer, getBookings);

// Filtered booking fetches
// By patient: allow any authenticated user for now
router.get('/patient/:patientProfileId', protect, getBookingByPatientId);

// Other filters: restricted to health officers
router.get('/center/:healthCenterId', protect, isHealthOfficer, getBookingByHealthCenterId);
router.get('/date/:bookingDate', protect, isHealthOfficer, getBookingByDate);
router.get('/createdBy/:createdBy', protect, isHealthOfficer, getBookingByCreatedBy);
router.get('/status/:status', protect, isHealthOfficer, getBookingByStatus);
router.get('/type/:type', protect, isHealthOfficer, getBookingByType);

// Update booking - restricted to health officers
router.put('/:id', protect, isHealthOfficer, updateBookingValidation, updateBookingController);

// Soft delete booking - restricted to health officers
router.delete('/:id', protect, isHealthOfficer, softDeleteBookingController);

// Hard delete booking - restricted to admin health officers
router.delete(
  '/:id/hard',
  protect,
  isHealthOfficer,
  checkRole(['Admin', 'ADMIN']),
  hardDeleteBookingController
);

export default router;

