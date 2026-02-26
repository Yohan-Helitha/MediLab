import { body, param } from "express-validator";

// Validation rules for creating a TestInstruction
export const createTestInstructionValidation = [
	body("diagnosticTestId")
		.notEmpty()
		.withMessage("diagnosticTestId is required")
		.isHexadecimal()
		.withMessage("diagnosticTestId must be a valid hex string")
		.isLength({ min: 24, max: 24 })
		.withMessage("diagnosticTestId must be a 24-character ObjectId"),
	body("preTestInstructions")
		.optional()
		.isArray()
		.withMessage("preTestInstructions must be an array of strings"),
	body("preTestInstructions.*")
		.optional()
		.isString()
		.withMessage("Each pre-test instruction must be a string")
		.isLength({ min: 1, max: 500 })
		.withMessage("Each pre-test instruction must be between 1 and 500 characters"),
	body("postTestInstructions")
		.optional()
		.isArray()
		.withMessage("postTestInstructions must be an array of strings"),
	body("postTestInstructions.*")
		.optional()
		.isString()
		.withMessage("Each post-test instruction must be a string")
		.isLength({ min: 1, max: 500 })
		.withMessage("Each post-test instruction must be between 1 and 500 characters"),
	body("languageCode")
		.optional()
		.isIn(["en", "si", "ta"])
		.withMessage("languageCode must be one of: en, si, ta"),
	body("isActive")
		.optional()
		.isBoolean()
		.withMessage("isActive must be a boolean"),
	body("createdBy")
		.notEmpty()
		.withMessage("createdBy is required")
		.isHexadecimal()
		.withMessage("createdBy must be a valid hex string")
		.isLength({ min: 24, max: 24 })
		.withMessage("createdBy must be a 24-character ObjectId"),
];

// Validation rules for updating a TestInstruction
export const updateTestInstructionValidation = [
	body("diagnosticTestId")
		.optional()
		.isHexadecimal()
		.withMessage("diagnosticTestId must be a valid hex string")
		.isLength({ min: 24, max: 24 })
		.withMessage("diagnosticTestId must be a 24-character ObjectId"),
	body("preTestInstructions")
		.optional()
		.isArray()
		.withMessage("preTestInstructions must be an array of strings"),
	body("preTestInstructions.*")
		.optional()
		.isString()
		.withMessage("Each pre-test instruction must be a string")
		.isLength({ min: 1, max: 500 })
		.withMessage("Each pre-test instruction must be between 1 and 500 characters"),
	body("postTestInstructions")
		.optional()
		.isArray()
		.withMessage("postTestInstructions must be an array of strings"),
	body("postTestInstructions.*")
		.optional()
		.isString()
		.withMessage("Each post-test instruction must be a string")
		.isLength({ min: 1, max: 500 })
		.withMessage("Each post-test instruction must be between 1 and 500 characters"),
	body("languageCode")
		.optional()
		.isIn(["en", "si", "ta"])
		.withMessage("languageCode must be one of: en, si, ta"),
	body("isActive")
		.optional()
		.isBoolean()
		.withMessage("isActive must be a boolean"),
	body("createdBy")
		.optional()
		.isHexadecimal()
		.withMessage("createdBy must be a valid hex string")
		.isLength({ min: 24, max: 24 })
		.withMessage("createdBy must be a 24-character ObjectId"),
];

// Validation for :id parameter on routes like /:id
export const testInstructionIdParamValidation = [
	param("id")
		.isHexadecimal()
		.withMessage("id must be a valid hex string")
		.isLength({ min: 24, max: 24 })
		.withMessage("id must be a 24-character ObjectId"),
];
