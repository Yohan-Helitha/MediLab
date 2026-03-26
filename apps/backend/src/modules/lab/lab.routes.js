import express from 'express';
import * as labController from './lab.controller.js';
import { handleValidationErrors } from '../auth/auth.middleware.js';
import { validateLab } from './lab.validation.js';

const router = express.Router();

// Create a new lab (temporarily public for integration testing)
router.post('/', validateLab, handleValidationErrors, labController.createLab);

// Get all labs
router.get('/', labController.getLabs);

// Get a single lab by ID
router.get('/:id', labController.getLabById);

// Update a lab by ID (temporarily public for integration testing)
router.put('/:id', validateLab, handleValidationErrors, labController.updateLab);

// Delete a lab by ID (hard delete, temporarily public for integration testing)
router.delete('/:id', labController.deleteLab);

// Soft delete / status update (temporarily public for integration testing)
router.patch('/:id/status', labController.updateLabStatus);

export default router;
