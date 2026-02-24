// Inventory validation
import { body } from "express-validator";
import mongoose from "mongoose";

export const reserveForBookingValidation = [
  body("testTypeId")
    .notEmpty()
    .withMessage("Test type ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid test type ID"),

  body("healthCenterId")
    .notEmpty()
    .withMessage("Health center ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid health center ID"),

  body("bookingId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid booking ID"),
];

export const restockInventoryValidation = [
  body("healthCenterId")
    .notEmpty()
    .withMessage("Health center ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid health center ID"),

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
