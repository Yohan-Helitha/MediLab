import { body, param } from 'express-validator';

export const updateLabTestStatusValidation = [
	body('status')
		.isIn(['AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_SUSPENDED'])
		.withMessage("status must be one of: AVAILABLE, UNAVAILABLE, TEMPORARILY_SUSPENDED"),
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
