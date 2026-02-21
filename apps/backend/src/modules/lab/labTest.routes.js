import express from 'express';
import * as labTestController from './labTest.controller.js';

const router = express.Router();

router.patch('/:id/status', labTestController.updateLabTestStatus);
router.get('/lab/:labId', labTestController.getTestsByLabId);
router.get('/status', labTestController.getTestsByStatus);
router.get('/search', labTestController.getTestsByName);
router.get('/:id/availability', labTestController.getTestsAvailabilityById);

export default router;

