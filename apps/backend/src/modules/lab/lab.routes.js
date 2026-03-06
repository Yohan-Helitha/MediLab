import express from 'express';
import * as labController from './lab.controller.js';
import { authenticate, isStaff, handleValidationErrors } from '../auth/auth.middleware.js';
import { validateLab } from './lab.validation.js';

const router = express.Router();

// Create a new lab (Staff only)
router.post('/', authenticate, isStaff, validateLab, handleValidationErrors, labController.createLab);

// Get all labs
router.get('/', labController.getLabs);

// Get a single lab by ID
router.get('/:id', labController.getLabById);

// Update a lab by ID (Staff only)
router.put('/:id', authenticate, isStaff, validateLab, handleValidationErrors, labController.updateLab);

// Delete a lab by ID (hard delete, Staff only)
router.delete('/:id', authenticate, isStaff, labController.deleteLab);

// Soft delete / status update (Staff only)
router.patch('/:id/status', authenticate, isStaff, labController.updateLabStatus);

export default router;
