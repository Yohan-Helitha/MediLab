import express from 'express';
import * as labController from './lab.controller.js';
import { handleValidationErrors } from '../auth/auth.middleware.js';
import { validateLab } from './lab.validation.js';

const router = express.Router();

// Create a new lab
router.post('/', validateLab, handleValidationErrors, labController.createLab);

// Get all labs
router.get('/', labController.getLabs);

// Get a single lab by ID
router.get('/:id', labController.getLabById);

// Update a lab by ID
router.put('/:id', validateLab, handleValidationErrors, labController.updateLab);

// Delete a lab by ID (hard delete)
router.delete('/:id', labController.deleteLab);

// Soft delete (deactivate/activate lab)
router.patch('/:id/status', labController.updateLabStatus);

export default router;
