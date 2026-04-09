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

// ==================== Health Officer Routes (Now Staff Routes) ====================

/**
 * @route   POST /api/auth/staff/register
 * @desc    Register a new staff member (MOH, Nurse, PHI, Lab Tech, etc.)
 * @access  Public (In production, restrict to admin)
 */
router.post(
  '/staff/register',
  validateHealthOfficerRegister,
  handleValidationErrors,
  authController.registerHealthOfficer
);

/**
 * @route   POST /api/auth/staff/login
 * @desc    Login staff member
 * @access  Public
 */
router.post(
  '/staff/login',
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

/**
 * @route   PUT /api/auth/update
 * @desc    Update user profile and password
 * @access  Private
 */
router.put(
  '/update',
  authenticate,
  authController.updateProfile
);

export default router;
