import express from 'express';
import * as labTestController from './labTest.controller.js';
import { authenticate, checkRole } from '../auth/auth.middleware.js';

const router = express.Router();

// Only staff can update lab test availability status
router.patch(
	'/:id/status',
	authenticate,
	checkRole(['Staff']),
	labTestController.updateLabTestStatus
);
router.get('/lab/:labId', labTestController.getTestsByLabId);
router.get('/status', labTestController.getTestsByStatus);
router.get('/search', labTestController.getTestsByName);
router.get('/:id/availability', labTestController.getTestsAvailabilityById);

export default router;

