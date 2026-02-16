const express = require('express');
const router = express.Router();
const labController = require('./lab.controller');

// Create a new lab
router.post('/', labController.createLab);

// Get all labs
router.get('/', labController.getLabs);

// Get a single lab by ID
router.get('/:id', labController.getLabById);

// Update a lab by ID
router.put('/:id', labController.updateLab);

// Delete a lab by ID (hard delete)
router.delete('/:id', labController.deleteLab);

// Soft delete (deactivate/activate lab)
router.patch('/:id/status', labController.updateLabStatus);

module.exports = router;
