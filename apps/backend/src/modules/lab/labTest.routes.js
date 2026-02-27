import express from 'express';
import * as labTestController from './labTest.controller.js';
import { authenticate, isStaff, handleValidationErrors } from '../auth/auth.middleware.js';
import {
	createLabTestValidation,
	updateLabTestStatusValidation,
	labIdParamValidation,
	labTestIdParamValidation,
} from './labTest.validation.js';

const router = express.Router();

// Create a lab-specific test (assign a diagnostic test to a lab)
router.post(
	'/',
	authenticate,
	isStaff,
	createLabTestValidation,
	handleValidationErrors,
	labTestController.createLabTest
);

// Only staff can update lab test availability status
router.patch(
	'/:id/status',
	authenticate,
	isStaff,
	labTestIdParamValidation,
	updateLabTestStatusValidation,
	handleValidationErrors,
	labTestController.updateLabTestStatus
);
router.get('/lab/:labId', labIdParamValidation, handleValidationErrors, labTestController.getTestsByLabId);
router.get('/status', labTestController.getTestsByStatus);
router.get('/search', labTestController.getTestsByName);
router.get(
	'/:id/availability',
	labTestIdParamValidation,
	handleValidationErrors,
	labTestController.getTestsAvailabilityById
);

export default router;

