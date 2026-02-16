// Booking routes
// modules/booking/booking.routes.js

import express from 'express';
import { createBooking } from './booking.controller.js';
import { createBookingValidator } from './booking.validator.js';
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
  createBookingValidator,    // validation middleware
  createBooking              // controller
);

export default router;

