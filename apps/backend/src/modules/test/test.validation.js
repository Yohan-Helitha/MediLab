import { body, param } from "express-validator";

// Validation rules for creating a TestType
export const createTestTypeValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 200 })
    .withMessage("Name must be between 3 and 200 characters"),
  body("code")
    .isString()
    .withMessage("Code must be a string")
    .isLength({ max: 20 })
    .withMessage("Code must be at most 20 characters"),
  body("category")
    .isString()
    .withMessage("Category must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category must be between 3 and 50 characters"),
  body("entryMethod")
    .isString()
    .withMessage("entryMethod must be a string")
    .customSanitizer((v) => (typeof v === "string" ? v.toLowerCase() : v))
    .isIn(["form", "upload"])
    .withMessage("entryMethod must be either 'form' or 'upload'"),
  body("discriminatorType")
    .isString()
    .withMessage("discriminatorType must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("discriminatorType must be between 3 and 50 characters"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0"),
  body("resultTime")
    .matches(/^\d+\s*hours$/)
    .withMessage("resultTime must be in the format '<number> hours'")
    .isString(),
  body("isMonitoringRecommended")
    .optional()
    .isBoolean()
    .withMessage("isMonitoringRecommended must be a boolean"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Validation rules for updating a TestType
export const updateTestTypeValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 200 })
    .withMessage("Name must be between 3 and 200 characters"),
  body("code")
    .optional()
    .isString()
    .withMessage("Code must be a string")
    .isLength({ max: 20 })
    .withMessage("Code must be at most 20 characters"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category must be between 3 and 50 characters"),
  body("entryMethod")
    .optional()
    .isString()
    .withMessage("entryMethod must be a string")
    .customSanitizer((v) => (typeof v === "string" ? v.toLowerCase() : v))
    .isIn(["form", "upload"])
    .withMessage("entryMethod must be either 'form' or 'upload'"),
  body("discriminatorType")
    .optional()
    .isString()
    .withMessage("discriminatorType must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("discriminatorType must be between 3 and 50 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0"),
  body("resultTime")
    .optional()
    .matches(/^\d+\s*hours$/)
    .withMessage("resultTime must be in the format '<number> hours'")
    .isString(),
  body("isMonitoringRecommended")
    .optional()
    .isBoolean()
    .withMessage("isMonitoringRecommended must be a boolean"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Validation for :id route parameter
export const idParamValidation = [
  param("id")
    .isHexadecimal()
    .withMessage("id must be a valid hex string")
    .isLength({ min: 24, max: 24 })
    .withMessage("id must be a 24-character ObjectId"),
];
