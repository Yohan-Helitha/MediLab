import mongoose from "mongoose";

import InventoryStock from "./inventoryStock.model.js";
import StockTransaction from "./stockTransaction.model.js";
import TestEquipmentRequirement from "./testEquipmentRequirement.model.js";
import Booking from "../booking/booking.model.js";
import TestType from "../test/testType.model.js";

// Apply equipment usage for a completed booking.
// This should be called by the booking module (via HTTP) only
// when a booking moves to COMPLETED status.
export const applyEquipmentUsageForBooking = async (
  bookingId,
  { changedBy = null } = {},
) => {
  const booking = await Booking.findById(bookingId).exec();

  if (!booking) {
    throw new Error("Booking not found");
  }

  const testTypeId = booking.diagnosticTestId;

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const requirements = await TestEquipmentRequirement.find({
        testTypeId,
        isActive: true,
      }).session(session);

      if (!requirements.length) {
        result = {
          deductedItems: [],
          message: "No equipment requirements for test",
        };
        return;
      }

      const deductedItems = [];

      for (const req of requirements) {
        const stock = await InventoryStock.findOne({
          equipmentId: req.equipmentId,
        })
          .session(session)
          .exec();

        if (!stock) {
          throw new Error(
            "Inventory stock not configured for required equipment",
          );
        }

        const quantity = req.quantityPerTest;

        if (stock.availableQuantity < quantity) {
          throw new Error(
            `Available quantity too low for equipment ${req.equipmentId}. Available ${stock.availableQuantity}, trying to deduct ${quantity}`,
          );
        }

        stock.availableQuantity -= quantity;
        await stock.save({ session });

        await StockTransaction.create(
          [
            {
              equipmentId: req.equipmentId,
              quantity,
              type: "DEDUCT",
              referenceBookingId: bookingId,
              createdBy: changedBy,
            },
          ],
          { session },
        );

        deductedItems.push({
          equipmentId: req.equipmentId,
          quantity,
        });
      }

      result = { deductedItems };
    });

    return result;
  } finally {
    await session.endSession();
  }
};


export const restockEquipment = async (
  equipmentId,
  quantity,
  { createdBy = null } = {},
) => {
  const session = await mongoose.startSession();

  try {
    let updatedStock;

    await session.withTransaction(async () => {
      const stock = await InventoryStock.findOne({
        equipmentId,
      })
        .session(session)
        .exec();

      if (!stock) {
        // If stock record does not exist yet, create one
        updatedStock = await InventoryStock.create(
          [
            {
              equipmentId,
              availableQuantity: quantity,
              reservedQuantity: 0,
            },
          ],
          { session },
        );

        updatedStock = updatedStock[0];
      } else {
        stock.availableQuantity += quantity;
        updatedStock = await stock.save({ session });
      }

      await StockTransaction.create(
        [
          {
            equipmentId,
            quantity,
            type: "RESTOCK",
            createdBy,
          },
        ],
        { session },
      );
    });

    return updatedStock;
  } finally {
    await session.endSession();
  }
};


// ---- Inventory stock overview (per health center) ----

export const listInventoryStock = async ({ healthCenterId } = {}) => {
  const docs = await InventoryStock.find({})
    .populate("equipmentId", "name type")
    .exec();

  return docs.map((doc) => {
    const plain = doc.toObject();
    const healthCenter = doc.healthCenterId;
    const normalizedHealthCenterId =
      healthCenter && healthCenter._id ? healthCenter._id : healthCenter;
    const healthCenterName =
      healthCenter && healthCenter.name ? healthCenter.name : null;

    return {
      ...plain,
      healthCenterId: normalizedHealthCenterId,
      healthCenterName,
    };
  });
};


// ---- Test equipment requirement management (admin configuration) ----

export const getTestEquipmentRequirements = async (testTypeId) => {
  return TestEquipmentRequirement.find({
    testTypeId,
    isActive: true,
  })
    .populate("equipmentId", "name type description isActive")
    .exec();
};

export const upsertTestEquipmentRequirement = async ({
  id = null,
  testTypeId,
  equipmentId,
  quantityPerTest,
  isActive = true,
}) => {
  if (id) {
    // Return the updated document with equipment populated so the
    // frontend can immediately display the equipment name/type
    return TestEquipmentRequirement.findByIdAndUpdate(
      id,
      { testTypeId, equipmentId, quantityPerTest, isActive },
      { new: true, runValidators: true },
    )
      .populate("equipmentId", "name type description isActive")
      .exec();
  }

  const requirement = new TestEquipmentRequirement({
    testTypeId,
    equipmentId,
    quantityPerTest,
    isActive,
  });

  await requirement.save();
  await requirement.populate("equipmentId", "name type description isActive");

  return requirement;
};

export const deactivateTestEquipmentRequirement = async (id) => {
  return TestEquipmentRequirement.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  )
    .populate("equipmentId", "name type description isActive")
    .exec();
};


export default {
  applyEquipmentUsageForBooking,
  restockEquipment,
  listInventoryStock,
  getTestEquipmentRequirements,
  upsertTestEquipmentRequirement,
  deactivateTestEquipmentRequirement,
};
