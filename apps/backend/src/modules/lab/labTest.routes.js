import express from 'express';
import * as labTestController from './labTest.controller.js';
import { handleValidationErrors } from '../auth/auth.middleware.js';
import {
	createLabTestValidation,
	updateLabTestStatusValidation,
	labIdParamValidation,
	labTestIdParamValidation,
	updateLabTestDetailsValidation,
} from './labTest.validation.js';

const router = express.Router();

// Create a lab-specific test (assign a diagnostic test to a lab)
router.post(
	'/',
	createLabTestValidation,
	handleValidationErrors,
	labTestController.createLabTest
);

// Only staff can update lab test availability status
router.patch(
	'/:id/status',
	labTestIdParamValidation,
	updateLabTestStatusValidation,
	handleValidationErrors,
	labTestController.updateLabTestStatus
);
// Update lab-test details (price, result time, capacity, etc.)
router.patch(
	'/:id',
	labTestIdParamValidation,
	updateLabTestDetailsValidation,
	handleValidationErrors,
	labTestController.updateLabTestDetails
);
// Delete a lab-test assignment
router.delete(
	'/:id',
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

