import express from 'express';
import authController from './auth.controller.js';
import {
  validatePatientRegister,
  validatePatientLogin,
  validateHealthOfficerRegister,
  validateHealthOfficerLogin,
  validateToken
} from './auth.validation.js';
import { handleValidationErrors, authenticate } from './auth.middleware.js';

const router = express.Router();

// ==================== Patient Routes ====================

/**
 * @route   POST /api/auth/patient/register
 * @desc    Register a new patient
 * @access  Public
 */
router.post(
  '/patient/register',
  validatePatientRegister,
  handleValidationErrors,
  authController.registerPatient
);

/**
 * @route   POST /api/auth/patient/login
 * @desc    Login patient
 * @access  Public
 */
router.post(
  '/patient/login',
  validatePatientLogin,
  handleValidationErrors,
  authController.loginPatient
);

// ==================== Health Officer Routes ====================

/**
 * @route   POST /api/auth/health-officer/register
 * @desc    Register a new health officer
 * @access  Public (or can be protected based on your requirements)
 * @note    In production, you may want to restrict this to admin-only access
 */
router.post(
  '/health-officer/register',
  validateHealthOfficerRegister,
  handleValidationErrors,
  authController.registerHealthOfficer
);

/**
 * @route   POST /api/auth/health-officer/login
 * @desc    Login health officer
 * @access  Public
 */
router.post(
  '/health-officer/login',
  validateHealthOfficerLogin,
  handleValidationErrors,
  authController.loginHealthOfficer
);

// ==================== Common Routes ====================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify token validity
 * @access  Public
 */
router.post(
  '/verify',
  validateToken,
  handleValidationErrors,
  authController.verifyToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token removal)
 * @access  Public
 */
router.post(
  '/logout',
  authController.logout
);

export default router;
