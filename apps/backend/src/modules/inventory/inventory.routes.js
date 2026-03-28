import express from "express";
import {
  reserveForBookingController,
  deductAfterCompletionController,
  restockEquipmentController,
  listTestEquipmentRequirementsController,
  upsertTestEquipmentRequirementController,
  deactivateTestEquipmentRequirementController,
} from "./inventory.controller.js";
import {
  reserveForBookingValidation,
  restockInventoryValidation,
  upsertTestEquipmentRequirementValidation,
} from "./inventory.validation.js";
// Use the new JWT-based auth middleware
import {
  authenticate,
  isHealthOfficer,
  checkRole,
} from "../auth/auth.middleware.js";

const router = express.Router();

// Local alias to keep `protect` naming
const protect = authenticate;

// Reserve equipment for a booking (based on test type requirements)
router.post(
  "/reserve",
  protect,
  isHealthOfficer, // only health officers can reserve inventory
  reserveForBookingValidation,
  reserveForBookingController,
);

// Deduct equipment after a test is completed for a booking
router.post(
  "/deduct-after-completion/:bookingId",
  protect,
  isHealthOfficer, // only health officers can deduct after completion
  deductAfterCompletionController,
);

router.post(
  "/restock",
  protect,
  checkRole(["Admin", "ADMIN"]), // admin health officers only
  restockInventoryValidation,
  restockEquipmentController,
);

// Admin configuration of required equipment per test type
router.get(
  "/requirements",
  protect,
  checkRole(["Admin", "ADMIN"]),
  listTestEquipmentRequirementsController,
);

router.post(
  "/requirements",
  protect,
  checkRole(["Admin", "ADMIN"]),
  upsertTestEquipmentRequirementValidation,
  upsertTestEquipmentRequirementController,
);

router.put(
  "/requirements/:id",
  protect,
  checkRole(["Admin", "ADMIN"]),
  upsertTestEquipmentRequirementValidation,
  upsertTestEquipmentRequirementController,
);

router.delete(
  "/requirements/:id",
  protect,
  checkRole(["Admin", "ADMIN"]),
  deactivateTestEquipmentRequirementController,
);


export default router;
