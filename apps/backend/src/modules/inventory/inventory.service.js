import mongoose from "mongoose";

import InventoryStock from "./inventoryStock.model.js";
import StockTransaction from "./stockTransaction.model.js";
import TestEquipmentRequirement from "./testEquipmentRequirement.model.js";
import Booking from "../booking/booking.model.js";
import TestType from "../test/testType.model.js";

export const reserveEquipement = async (
    TestTypeId,
    healthCenterId,
    {bookingId = null, createdBy = null} = {}

) => {

    const session = await mongoose.startSession();
    let result;
    let reservedItems = [];
    let requirements;

    try {
        
        await session.withTransaction( async () => {
          requirements = await TestEquipmentRequirement.find({
            testTypeId: TestTypeId,
            isActive: true
          }).session(session);

          if (!requirements.length) {
            result = {reservedItems: [], message: "No equipement required for test"};
                return; 
            }
            
          for (const req of requirements) {

                const stock = await InventoryStock.findOne({
                    healthCenterId,
                    equipmentId: req.equipmentId
                }).session(session).exec();

                if(!stock){
                    throw new Error(`Stock record not found for equipment ${req.equipmentId} at health center ${healthCenterId}`);
                }

                const freeQuantity = stock.availableQuantity - stock.reservedQuantity;
                const needed = req.quantityPerTest;

                if (freeQuantity < needed) {
                    throw new Error(`Insufficient stock for equipment ${req.equipmentId}. Needed ${needed}, available ${freeQuantity}`);
                }

                stock.reservedQuantity += needed;
                await stock.save({ session });

                await StockTransaction.create([
                    {
                        healthCenterId,
                        equipmentId: req.equipmentId,
                        quantity: needed,
                        type: "RESERVE",
                        referenceBookingId: bookingId,
                        createdBy
                    }
                ], { session });

                reservedItems.push({
                    equipmentId: req.equipmentId,
                    quantity: needed
                });
            }

            result = {reservedItems, message: "Equipment reserved successfully"};
        });

    } catch (error) {

        console.error("Error reserving equipment:", error);
        result = {reservedItems: [], message: `Failed to reserve equipment: ${error.message}`};
        throw error;        
        
    } finally {
        session.endSession();
    }
    return result;
};



export const deductAfterTestCompletion = async (
  bookingId,
  { changedBy = null } = {},
) => {
  const booking = await Booking.findById(bookingId).exec();

  if (!booking) {
    throw new Error("Booking not found");
  }

  const healthCenterId = booking.healthCenterId;
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
        result = { deductedItems: [], message: "No equipment requirements for test" };
        return;
      }

      const deductedItems = [];

      for (const req of requirements) {
        const stock = await InventoryStock.findOne({
          healthCenterId,
          equipmentId: req.equipmentId,
        })
          .session(session)
          .exec();

        if (!stock) {
          throw new Error(
            "Inventory stock not configured for required equipment at this health center",
          );
        }

        const quantity = req.quantityPerTest;

        if (stock.reservedQuantity < quantity) {
          throw new Error(
            `Reserved quantity too low for equipment ${req.equipmentId}. Reserved ${stock.reservedQuantity}, trying to deduct ${quantity}`,
          );
        }

        if (stock.availableQuantity < quantity) {
          throw new Error(
            `Available quantity too low for equipment ${req.equipmentId}. Available ${stock.availableQuantity}, trying to deduct ${quantity}`,
          );
        }

        stock.availableQuantity -= quantity;
        stock.reservedQuantity -= quantity;
        await stock.save({ session });

        await StockTransaction.create(
          [
            {
              healthCenterId,
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
  healthCenterId,
  equipmentId,
  quantity,
  { createdBy = null } = {},
) => {
  const session = await mongoose.startSession();

  try {
    let updatedStock;

    await session.withTransaction(async () => {
      const stock = await InventoryStock.findOne({
        healthCenterId,
        equipmentId,
      })
        .session(session)
        .exec();

      if (!stock) {
        // If stock record does not exist yet, create one
        updatedStock = await InventoryStock.create(
          [
            {
              healthCenterId,
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
            healthCenterId,
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
  const query = {};

  if (healthCenterId) {
    query.healthCenterId = healthCenterId;
  }

  const docs = await InventoryStock.find(query)
    .populate("equipmentId", "name type")
    .populate("healthCenterId", "name")
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
    return TestEquipmentRequirement.findByIdAndUpdate(
      id,
      { testTypeId, equipmentId, quantityPerTest, isActive },
      { new: true, runValidators: true },
    ).exec();
  }

  const requirement = new TestEquipmentRequirement({
    testTypeId,
    equipmentId,
    quantityPerTest,
    isActive,
  });

  return requirement.save();
};

export const deactivateTestEquipmentRequirement = async (id) => {
  return TestEquipmentRequirement.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  ).exec();
};


export default {
  reserveEquipement,
  deductAfterTestCompletion,
  restockEquipment,
  listInventoryStock,
  getTestEquipmentRequirements,
  upsertTestEquipmentRequirement,
  deactivateTestEquipmentRequirement,
};
