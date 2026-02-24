import { validationResult } from "express-validator";
import {
  reserveEquipement,
  deductAfterTestCompletion,
  restockEquipment,
} from "./inventory.service.js";

export const reserveForBookingController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testTypeId, healthCenterId, bookingId } = req.body;

    const result = await reserveEquipement(testTypeId, healthCenterId, {
      bookingId,
      createdBy: req.user?.id || null,
    });

    return res.status(200).json({
      message: "Equipment reserved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error reserving equipment for booking:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const deductAfterCompletionController = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await deductAfterTestCompletion(bookingId, {
      changedBy: req.user?.id || null,
    });

    return res.status(200).json({
      message: "Equipment stock deducted after test completion",
      ...result,
    });
  } catch (error) {
    console.error("Error deducting equipment after test completion:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const restockEquipmentController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { healthCenterId, equipmentId, quantity } = req.body;

    const stock = await restockEquipment(
      healthCenterId,
      equipmentId,
      quantity,
      { createdBy: req.user?.id || null },
    );

    return res.status(200).json({
      message: "Equipment restocked successfully",
      stock,
    });
  } catch (error) {
    console.error("Error restocking equipment:", error);
    return res.status(400).json({ message: error.message });
  }
};
