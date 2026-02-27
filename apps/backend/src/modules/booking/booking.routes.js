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

// Allow both patients and health officers to access a route
const isPatientOrHealthOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.userType !== 'patient' && req.user.userType !== 'healthOfficer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This endpoint is only for patients or health officers.',
    });
  }

  next();
};

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
router.get('/patient/:patientProfileId', protect, isPatient, getBookingByPatientId);

// Other filters
// Center, date, status, type: patients OR health officers
router.get('/center/:healthCenterId', protect, isPatientOrHealthOfficer, getBookingByHealthCenterId);
router.get('/date/:bookingDate', protect, isPatientOrHealthOfficer, getBookingByDate);

// CreatedBy: health officers only
router.get('/createdBy/:createdBy', protect, isHealthOfficer, getBookingByCreatedBy);

// Status / type: patients OR health officers
router.get('/status/:status', protect, isPatientOrHealthOfficer, getBookingByStatus);
router.get('/type/:type', protect, isPatientOrHealthOfficer, getBookingByType);

// Update booking - patients OR health officers
router.put('/:id', protect, isPatientOrHealthOfficer, updateBookingValidation, updateBookingController);

// Soft delete booking - patients OR health officers
router.delete('/:id', protect, isPatientOrHealthOfficer, softDeleteBookingController);

// Hard delete booking - restricted to admin health officers
router.delete(
  '/:id/hard',
  protect,
  isHealthOfficer,
  checkRole(['Admin', 'ADMIN']),
  hardDeleteBookingController
);

export default router;

