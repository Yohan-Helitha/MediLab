// Inventory validation
import { body } from "express-validator";
import mongoose from "mongoose";

export const restockInventoryValidation = [
  body("equipmentId")
    .notEmpty()
    .withMessage("Equipment ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid equipment ID"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
];

export const upsertTestEquipmentRequirementValidation = [
  body("testTypeId")
    .notEmpty()
    .withMessage("Test type ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid test type ID"),

  body("equipmentId")
    .notEmpty()
    .withMessage("Equipment ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid equipment ID"),

  body("quantityPerTest")
    .notEmpty()
    .withMessage("Quantity per test is required")
    .isInt({ gt: 0 })
    .withMessage("Quantity per test must be a positive integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];
