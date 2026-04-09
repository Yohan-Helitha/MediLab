import express from 'express';
import * as labTestController from './labTest.controller.js';
import { authenticate, isStaff, handleValidationErrors } from '../auth/auth.middleware.js';
import {
	createLabTestValidation,
	updateLabTestStatusValidation,
	labIdParamValidation,
	labTestIdParamValidation,
	updateLabTestDetailsValidation,
} from './labTest.validation.js';

const router = express.Router();

// Create a lab-specific test (assign a diagnostic test to a lab) - protected (staff)
router.post(
	'/',
	authenticate,
	isStaff,
	createLabTestValidation,
	handleValidationErrors,
	labTestController.createLabTest
);

// Update lab test availability status - protected (staff)
router.patch(
	'/:id/status',
	authenticate,
	isStaff,
	labTestIdParamValidation,
	updateLabTestStatusValidation,
	handleValidationErrors,
	labTestController.updateLabTestStatus
);
// Update lab-test details (price, result time, capacity, etc.) - protected (staff)
router.patch(
	'/:id',
	authenticate,
	isStaff,
	labTestIdParamValidation,
	updateLabTestDetailsValidation,
	handleValidationErrors,
	labTestController.updateLabTestDetails
);
// Delete a lab-test assignment - protected (staff)
router.delete(
	'/:id',
	authenticate,
	isStaff,
	labTestIdParamValidation,
	handleValidationErrors,
	labTestController.deleteLabTest
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

