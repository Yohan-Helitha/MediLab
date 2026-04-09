import { jest } from "@jest/globals";
import mongoose from "mongoose";

import InventoryStock from "./inventoryStock.model.js";
import StockTransaction from "./stockTransaction.model.js";
import TestEquipmentRequirement from "./testEquipmentRequirement.model.js";
import Booking from "../booking/booking.model.js";

import {
	restockEquipment,
	reserveEquipmentForBooking,
	finalizeEquipmentUsageForReleasedResult,
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
		StockTransaction.findOne = jest.fn();
		TestEquipmentRequirement.find = jest.fn();
		TestEquipmentRequirement.findByIdAndUpdate = jest.fn();
		Booking.findById = jest.fn();
	});

	test("reserveEquipmentForBooking reserves stock (available -> reserved)", async () => {
		Booking.findById.mockReturnValue({
			exec: jest.fn().mockResolvedValue({
				_id: "booking1",
				diagnosticTestId: "tt1",
			}),
		});

		TestEquipmentRequirement.find.mockReturnValue({
			session: jest.fn().mockReturnValue([
				{ equipmentId: "eq1", quantityPerTest: 2 },
			]),
		});

		const txExec = jest.fn().mockResolvedValue(null);
		StockTransaction.findOne.mockReturnValue({
			session: jest.fn().mockReturnValue({ exec: txExec }),
		});

		const stockDoc = {
			availableQuantity: 5,
			reservedQuantity: 1,
			save: jest.fn().mockResolvedValue(true),
		};
		const stockExec = jest.fn().mockResolvedValue(stockDoc);
		InventoryStock.findOne.mockReturnValue({
			session: jest.fn().mockReturnValue({ exec: stockExec }),
		});

		StockTransaction.create.mockResolvedValue(true);

		const result = await reserveEquipmentForBooking("booking1", {
			changedBy: "officer1",
		});

		expect(stockDoc.availableQuantity).toBe(3);
		expect(stockDoc.reservedQuantity).toBe(3);
		expect(StockTransaction.create).toHaveBeenCalledWith(
			[
				{
					equipmentId: "eq1",
					quantity: 2,
					type: "RESERVE",
					referenceBookingId: "booking1",
					createdBy: "officer1",
				},
			],
			{ session: expect.any(Object) },
		);
		expect(result.reservedItems).toEqual([
			{ equipmentId: "eq1", quantity: 2 },
		]);
	});

	test("finalizeEquipmentUsageForReleasedResult deducts CONSUMABLE using reservation first", async () => {
		// Mock booking lookup
		Booking.findById.mockReturnValue({
			exec: jest.fn().mockResolvedValue({
				_id: "booking1",
				diagnosticTestId: "tt1",
			}),
		});

		// Requirements
		TestEquipmentRequirement.find.mockReturnValue({
			session: jest.fn().mockReturnValue([
				{ equipmentId: "eq1", quantityPerTest: 2 },
			]),
		});

		// Equipment: CONSUMABLE
		const equipmentExec = jest.fn().mockResolvedValue({ type: "CONSUMABLE" });
		const equipmentSession = jest.fn().mockReturnValue({ exec: equipmentExec });
		const equipmentFindById = jest.fn().mockReturnValue({ session: equipmentSession });
		// Lazy import mocking: overwrite the method on the model instance used by service
		const equipmentModule = await import("./equipment.model.js");
		equipmentModule.default.findById = equipmentFindById;

		// Idempotency: no prior DEDUCT
		const txExec = jest.fn().mockResolvedValue(null);
		StockTransaction.findOne.mockReturnValue({
			session: jest.fn().mockReturnValue({ exec: txExec }),
		});

		// Stock has full reservation
		const stockDoc = {
			availableQuantity: 3,
			reservedQuantity: 2,
			save: jest.fn().mockResolvedValue(true),
		};
		InventoryStock.findOne.mockReturnValue({
			session: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(stockDoc) }),
		});

		StockTransaction.create.mockResolvedValue(true);

		const result = await finalizeEquipmentUsageForReleasedResult("booking1", {
			changedBy: "officer1",
		});

		expect(stockDoc.reservedQuantity).toBe(0);
		expect(stockDoc.availableQuantity).toBe(3);
		expect(result.deductedItems).toEqual([
			{ equipmentId: "eq1", quantity: 2 },
		]);
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
		const saveMock = jest.fn().mockResolvedValue(true);
		const populateMock = jest.fn().mockResolvedValue(true);
		TestEquipmentRequirement.prototype.save = saveMock;
		TestEquipmentRequirement.prototype.populate = populateMock;

		const result = await upsertTestEquipmentRequirement({
			testTypeId: "tt1",
			equipmentId: "eq1",
			quantityPerTest: 1,
			isActive: true,
		});

		expect(saveMock).toHaveBeenCalled();
		expect(populateMock).toHaveBeenCalledWith(
			"equipmentId",
			"name type description isActive",
		);
		expect(result).toHaveProperty("_id");
		expect(result.quantityPerTest).toBe(1);
		expect(result.isActive).toBe(true);
	});

	test("deactivateTestEquipmentRequirement sets isActive to false", async () => {
		const updated = { _id: "req1", isActive: false };
		const execMock = jest.fn().mockResolvedValue(updated);
		const populateMock = jest.fn().mockReturnValue({ exec: execMock });
		TestEquipmentRequirement.findByIdAndUpdate.mockReturnValue({
			populate: populateMock,
		});

		const result = await deactivateTestEquipmentRequirement("req1");

		expect(TestEquipmentRequirement.findByIdAndUpdate).toHaveBeenCalledWith(
			"req1",
			{ isActive: false },
			{ new: true },
		);
		expect(populateMock).toHaveBeenCalledWith(
			"equipmentId",
			"name type description isActive",
		);
		expect(result).toBe(updated);
	});
});
