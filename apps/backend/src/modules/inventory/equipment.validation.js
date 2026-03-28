import { body } from "express-validator";

export const validateEquipmentPayload = [
	body("name")
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ max: 200 })
		.withMessage("Name must be at most 200 characters"),

	body("type")
		.notEmpty()
		.withMessage("Type is required")
		.isIn(["CONSUMABLE", "REUSABLE"])
		.withMessage("Type must be CONSUMABLE or REUSABLE"),

	body("description")
		.optional()
		.isLength({ max: 500 })
		.withMessage("Description must be at most 500 characters"),

	body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];
