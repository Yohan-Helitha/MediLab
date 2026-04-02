import express from 'express';
import consultationController from './consultation.controller.js';
import {
  validateAskAIDoctor,
  validateMedicalInfo,
  validateSymptomAnalysis,
  validateMedicationInfo,
  validateLifestyleAdvice
} from './consultation.validation.js';
import { handleValidationErrors, authenticate, optionalAuth } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/consultation/ask
 * @desc    Ask AI Doctor a medical question
 * @access  Private (requires authentication)
 * @body    { message: string, specialization?: string, language?: string }
 */
router.post(
  '/ask',
  authenticate,
  validateAskAIDoctor,
  handleValidationErrors,
  consultationController.askAIDoctor
);

/**
 * @route   POST /api/consultation/medical-info
 * @desc    Get detailed information about a medical condition
 * @access  Private (requires authentication)
 * @body    { condition: string, specialization?: string }
 */
router.post(
  '/medical-info',
  authenticate,
  validateMedicalInfo,
  handleValidationErrors,
  consultationController.getMedicalInfo
);

/**
 * @route   POST /api/consultation/analyze-symptoms
 * @desc    Analyze patient symptoms and get possible conditions
 * @access  Private (requires authentication)
 * @body    { symptoms: string[], patientInfo?: { age?: number, gender?: string } }
 */
router.post(
  '/analyze-symptoms',
  authenticate,
  validateSymptomAnalysis,
  handleValidationErrors,
  consultationController.analyzeSymptoms
);

/**
 * @route   POST /api/consultation/medication-info
 * @desc    Get information about a medication
 * @access  Private (requires authentication)
 * @body    { medicationName: string }
 */
router.post(
  '/medication-info',
  authenticate,
  validateMedicationInfo,
  handleValidationErrors,
  consultationController.getMedicationInfo
);

/**
 * @route   POST /api/consultation/lifestyle-advice
 * @desc    Get lifestyle and prevention advice for a condition
 * @access  Private (requires authentication)
 * @body    { condition: string }
 */
router.post(
  '/lifestyle-advice',
  authenticate,
  validateLifestyleAdvice,
  handleValidationErrors,
  consultationController.getLifestyleAdvice
);

/**
 * @route   GET /api/consultation/health
 * @desc    Check AI Doctor API health status
 * @access  Public
 */
router.get(
  '/health',
  consultationController.checkHealth
);

export default router;
