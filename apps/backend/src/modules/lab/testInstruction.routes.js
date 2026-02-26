import express from 'express';
import * as testInstructionController from './testInstruction.controller.js';
import { authenticate, checkRole, handleValidationErrors } from '../auth/auth.middleware.js';
import {
	createTestInstructionValidation,
	updateTestInstructionValidation,
	testInstructionIdParamValidation,
} from './testInstruction.validation.js';

const router = express.Router();

// Only staff can create, update, or delete test instructions
router.post(
	'/',
	authenticate,
	checkRole(['Staff']),
	createTestInstructionValidation,
	handleValidationErrors,
	testInstructionController.createTestInstruction
);
router.get('/', testInstructionController.getAllTestInstructions);
router.get('/:id', testInstructionController.getTestInstructionById);
router.get('/test-type/:testTypeId', testInstructionController.getTestInstructionByTestTypeId);
router.get('/diagnostic-test/:diagnosticTestId', testInstructionController.getTestInstructionByDiagnosticTestId);
router.get('/language/:testTypeId', testInstructionController.getTestInstructionByLanguage);
router.put(
	'/:id',
	authenticate,
	checkRole(['Staff']),
	testInstructionIdParamValidation,
	updateTestInstructionValidation,
	handleValidationErrors,
	testInstructionController.updateTestInstructions
);
router.delete(
	'/:id',
	authenticate,
	checkRole(['Staff']),
	testInstructionIdParamValidation,
	handleValidationErrors,
	testInstructionController.deleteTestInstructions
);

export default router;
