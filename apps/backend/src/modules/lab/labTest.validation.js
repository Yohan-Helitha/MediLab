import { body, param } from 'express-validator';

// Validation for creating a lab-test assignment (adding a test to a lab)
export const createLabTestValidation = [
	body('labId')
		.notEmpty()
		.withMessage('labId is required')
		.isHexadecimal()
		.withMessage('labId must be a valid hex string')
		.isLength({ min: 24, max: 24 })
		.withMessage('labId must be a 24-character ObjectId'),
	body('diagnosticTestId')
		.notEmpty()
		.withMessage('diagnosticTestId is required')
		.isHexadecimal()
		.withMessage('diagnosticTestId must be a valid hex string')
		.isLength({ min: 24, max: 24 })
		.withMessage('diagnosticTestId must be a 24-character ObjectId'),
	body('price')
		.notEmpty()
		.withMessage('price is required')
		.isFloat({ min: 0 })
		.withMessage('price must be a number greater than or equal to 0'),
	body('estimatedResultTimeHours')
		.notEmpty()
		.withMessage('estimatedResultTimeHours is required')
		.isFloat({ min: 0 })
		.withMessage('estimatedResultTimeHours must be a number greater than or equal to 0'),
	body('availabilityStatus')
		.optional()
		.isIn(['AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_SUSPENDED'])
		.withMessage('availabilityStatus must be one of: AVAILABLE, UNAVAILABLE, TEMPORARILY_SUSPENDED'),
	body('dailyCapacity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('dailyCapacity must be an integer greater than or equal to 0'),
	body('isActive')
		.optional()
		.isBoolean()
		.withMessage('isActive must be a boolean'),
];

export const updateLabTestStatusValidation = [
	body('status')
		.isIn(['AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_SUSPENDED'])
		.withMessage('status must be one of: AVAILABLE, UNAVAILABLE, TEMPORARILY_SUSPENDED'),
];

export const labIdParamValidation = [
	param('labId')
		.isHexadecimal()
		.withMessage('labId must be a valid hex string')
		.isLength({ min: 24, max: 24 })
		.withMessage('labId must be a 24-character ObjectId'),
];

export const labTestIdParamValidation = [
	param('id')
		.isHexadecimal()
		.withMessage('id must be a valid hex string')
		.isLength({ min: 24, max: 24 })
		.withMessage('id must be a 24-character ObjectId'),
];
