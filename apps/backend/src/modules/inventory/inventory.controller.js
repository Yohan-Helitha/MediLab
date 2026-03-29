import { validationResult } from "express-validator";
import {
  applyEquipmentUsageForBooking,
  restockEquipment,
  listInventoryStock,
  getTestEquipmentRequirements,
  upsertTestEquipmentRequirement,
  deactivateTestEquipmentRequirement,
} from "./inventory.service.js";

export const listInventoryStockController = async (req, res) => {
  try {
    const items = await listInventoryStock();
    return res.status(200).json({ items });
  } catch (error) {
    console.error("Error fetching inventory stock:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const applyEquipmentUsageForBookingController = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await applyEquipmentUsageForBooking(bookingId, {
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

    const { equipmentId, quantity } = req.body;

    const stock = await restockEquipment(equipmentId, quantity, {
      createdBy: req.user?.id || null,
    });

    return res.status(200).json({
      message: "Equipment restocked successfully",
      stock,
    });
  } catch (error) {
    console.error("Error restocking equipment:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const listTestEquipmentRequirementsController = async (req, res) => {
  try {
    const { testTypeId } = req.query;

    if (!testTypeId) {
      return res
        .status(400)
        .json({ message: "testTypeId query parameter is required" });
    }

    const requirements = await getTestEquipmentRequirements(testTypeId);

    return res.status(200).json({
      items: requirements,
    });
  } catch (error) {
    console.error("Error fetching test equipment requirements:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const upsertTestEquipmentRequirementController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { testTypeId, equipmentId, quantityPerTest, isActive } = req.body;

    const requirement = await upsertTestEquipmentRequirement({
      id: id || null,
      testTypeId,
      equipmentId,
      quantityPerTest,
      isActive,
    });

    return res.status(id ? 200 : 201).json({
      message: id
        ? "Test equipment requirement updated successfully"
        : "Test equipment requirement created successfully",
      requirement,
    });
  } catch (error) {
    console.error("Error saving test equipment requirement:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const deactivateTestEquipmentRequirementController = async (req, res) => {
  try {
    const { id } = req.params;

    const requirement = await deactivateTestEquipmentRequirement(id);

    return res.status(200).json({
      message: "Test equipment requirement deactivated successfully",
      requirement,
    });
  } catch (error) {
    console.error("Error deactivating test equipment requirement:", error);
    return res.status(400).json({ message: error.message });
  }
};
