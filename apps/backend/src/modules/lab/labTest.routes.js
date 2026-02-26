import express from 'express';
import * as labTestController from './labTest.controller.js';
import { authenticate, checkRole, handleValidationErrors } from '../auth/auth.middleware.js';
import {
	updateLabTestStatusValidation,
	labIdParamValidation,
	labTestIdParamValidation,
} from './labTest.validation.js';

const router = express.Router();

// Only staff can update lab test availability status
router.patch(
	'/:id/status',
	authenticate,
	checkRole(['Staff']),
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

