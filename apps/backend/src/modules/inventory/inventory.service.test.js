import { jest } from "@jest/globals";
import mongoose from "mongoose";

import InventoryStock from "./inventoryStock.model.js";
import StockTransaction from "./stockTransaction.model.js";
import TestEquipmentRequirement from "./testEquipmentRequirement.model.js";
import Booking from "../booking/booking.model.js";

import {
	restockEquipment,
	getTestEquipmentRequirements,
	upsertTestEquipmentRequirement,
	deactivateTestEquipmentRequirement,
} from "./inventory.service.js";

// Helper to mock a simple mongoose session that just runs the callback inline
function mockSession() {
	return {
		withTransaction: async (fn) => {
			await fn();
		},
		endSession: jest.fn(),
	};
}

describe("inventory.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// Session mock
		mongoose.startSession = jest.fn().mockResolvedValue(mockSession());

		// Reset model statics we use
		InventoryStock.findOne = jest.fn();
		InventoryStock.create = jest.fn();
		StockTransaction.create = jest.fn();
		TestEquipmentRequirement.find = jest.fn();
		TestEquipmentRequirement.findByIdAndUpdate = jest.fn();
		Booking.findById = jest.fn();
	});

	test("restockEquipment creates new stock record when none exists", async () => {
		const equipmentId = "eq1";

		// No existing stock
		const stockExecMock = jest.fn().mockResolvedValue(null);
		const stockSessionMock = jest.fn().mockReturnValue({ exec: stockExecMock });
		InventoryStock.findOne.mockReturnValue({ session: stockSessionMock });

		const createdDocs = [
			{
				_id: "stock1",
				equipmentId,
				availableQuantity: 5,
				reservedQuantity: 0,
			},
		];
		InventoryStock.create.mockResolvedValue(createdDocs);
		StockTransaction.create.mockResolvedValue(true);

		const stock = await restockEquipment(equipmentId, 5, {
			createdBy: "admin1",
		});

		expect(InventoryStock.create).toHaveBeenCalledWith(
			[
				{
					equipmentId,
					availableQuantity: 5,
					reservedQuantity: 0,
				},
			],
			{ session: expect.any(Object) },
		);
		expect(StockTransaction.create).toHaveBeenCalled();
		expect(stock).toEqual(createdDocs[0]);
	});

	test("getTestEquipmentRequirements delegates to TestEquipmentRequirement.find with active filter", async () => {
		const docs = [{ _id: "req1" }];
		const execMock = jest.fn().mockResolvedValue(docs);
		const populateMock = jest.fn().mockReturnValue({ exec: execMock });
		TestEquipmentRequirement.find.mockReturnValue({
			populate: populateMock,
		});

		const result = await getTestEquipmentRequirements("testType1");

		expect(TestEquipmentRequirement.find).toHaveBeenCalledWith({
			testTypeId: "testType1",
			isActive: true,
		});
		expect(populateMock).toHaveBeenCalledWith(
			"equipmentId",
			"name type description isActive",
		);
		expect(result).toBe(docs);
	});

	test("upsertTestEquipmentRequirement creates new requirement when id is not provided", async () => {
		const saveMock = jest.fn().mockResolvedValue({ _id: "newReq" });
		TestEquipmentRequirement.prototype.save = saveMock;

		const result = await upsertTestEquipmentRequirement({
			testTypeId: "tt1",
			equipmentId: "eq1",
			quantityPerTest: 1,
			isActive: true,
		});

		expect(saveMock).toHaveBeenCalled();
		expect(result).toEqual({ _id: "newReq" });
	});

	test("deactivateTestEquipmentRequirement sets isActive to false", async () => {
		const updated = { _id: "req1", isActive: false };
		TestEquipmentRequirement.findByIdAndUpdate.mockReturnValue({
			exec: jest.fn().mockResolvedValue(updated),
		});

		const result = await deactivateTestEquipmentRequirement("req1");

		expect(TestEquipmentRequirement.findByIdAndUpdate).toHaveBeenCalledWith(
			"req1",
			{ isActive: false },
			{ new: true },
		);
		expect(result).toBe(updated);
	});
});
