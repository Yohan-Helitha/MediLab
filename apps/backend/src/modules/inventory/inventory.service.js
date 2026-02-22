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
    let requirement;

    try {
        
        await session.withTransaction( async () => {
            requirement = await TestEquipmentRequirement.findOne({
                testTypeId: TestTypeId,
                isActive: true
            }).session(session);

            if (!requirement) {
                result = {reservedItems: [], message: "No equipement required for test"};
                return; 
            }
            
            for (const req of requirement) {

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