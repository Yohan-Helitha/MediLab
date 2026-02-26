import express from "express";
import {
  reserveForBookingController,
  deductAfterCompletionController,
  restockEquipmentController,
} from "./inventory.controller.js";
import {
  reserveForBookingValidation,
  restockInventoryValidation,
} from "./inventory.validation.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Reserve equipment for a booking (based on test type requirements)
router.post(
  "/reserve",
  protect,
  reserveForBookingValidation,
  reserveForBookingController,
);

// Deduct equipment after a test is completed for a booking
router.post(
  "/deduct-after-completion/:bookingId",
  protect,
  deductAfterCompletionController,
);

// Restock equipment - ADMIN only
// router.post(
//   "/restock",
//   protect,
//   adminOnly,
//   restockInventoryValidation,
//   restockEquipmentController,
// );

router.post(
  "/restock",
  protect,
  restockInventoryValidation,
  restockEquipmentController,
);


export default router;
