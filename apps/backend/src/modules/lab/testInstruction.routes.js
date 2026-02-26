import express from 'express';
import * as testInstructionController from './testInstruction.controller.js';

const router = express.Router();

router.post('/', testInstructionController.createTestInstruction);
router.get('/', testInstructionController.getAllTestInstructions);
router.get('/:id', testInstructionController.getTestInstructionById);
router.get('/test-type/:testTypeId', testInstructionController.getTestInstructionByTestTypeId);
router.get('/diagnostic-test/:diagnosticTestId', testInstructionController.getTestInstructionByDiagnosticTestId);
router.get('/language/:testTypeId', testInstructionController.getTestInstructionByLanguage);
router.put('/:id', testInstructionController.updateTestInstructions);
router.delete('/:id', testInstructionController.deleteTestInstructions);

export default router;
