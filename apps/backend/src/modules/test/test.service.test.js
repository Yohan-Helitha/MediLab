import { jest } from "@jest/globals";
import TestType from "./testType.model.js";

import {
	createTestType,
	findAllTestTypes,
	findTestTypeById,
	updateTestType,
	softDeleteTestType,
	findByCategory,
	hardDeleteTestType,
	findByEntryMethod,
	findMonitoringTests,
	findByDiscriminatorType,
} from "./test.service.js";

describe("test.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		TestType.prototype.save = jest.fn();
		TestType.find = jest.fn();
		TestType.findById = jest.fn();
		TestType.findByIdAndUpdate = jest.fn();
		TestType.findByIdAndDelete = jest.fn();
	});

	it("createTestType should construct and save a TestType", async () => {
		const data = { name: "CBC", code: "CBC", category: "Hematology" };
		const saved = { _id: "tt1", ...data };

		TestType.prototype.save.mockResolvedValue(saved);

		const result = await createTestType(data);

		expect(TestType.prototype.save).toHaveBeenCalledTimes(1);
		expect(result).toBe(saved);
	});

	it("findAllTestTypes without filters should call find with empty query", async () => {
		const docs = [{ _id: "tt1" }];
		TestType.find.mockResolvedValue(docs);

		const result = await findAllTestTypes();

		expect(TestType.find).toHaveBeenCalledWith({});
		expect(result).toBe(docs);
	});

	it("findAllTestTypes with category filter should use regex", async () => {
		const docs = [{ _id: "tt1" }];
		TestType.find.mockResolvedValue(docs);

		const result = await findAllTestTypes({ category: "Blood" });

		expect(TestType.find).toHaveBeenCalledWith({
			category: { $regex: "Blood", $options: "i" },
		});
		expect(result).toBe(docs);
	});

	it("findTestTypeById should delegate to findById", async () => {
		const doc = { _id: "tt1" };
		TestType.findById.mockResolvedValue(doc);

		const result = await findTestTypeById("tt1");

		expect(TestType.findById).toHaveBeenCalledWith("tt1");
		expect(result).toBe(doc);
	});

	it("updateTestType should use findByIdAndUpdate with new:true", async () => {
		const updated = { _id: "tt1", name: "Updated" };
		TestType.findByIdAndUpdate.mockResolvedValue(updated);

		const result = await updateTestType("tt1", { name: "Updated" });

		expect(TestType.findByIdAndUpdate).toHaveBeenCalledWith(
			"tt1",
			{ name: "Updated" },
			{ new: true },
		);
		expect(result).toBe(updated);
	});

	it("softDeleteTestType should set isActive to false", async () => {
		const updated = { _id: "tt1", isActive: false };
		TestType.findByIdAndUpdate.mockResolvedValue(updated);

		const result = await softDeleteTestType("tt1");

		expect(TestType.findByIdAndUpdate).toHaveBeenCalledWith(
			"tt1",
			{ isActive: false },
			{ new: true },
		);
		expect(result).toBe(updated);
	});

	it("findByCategory should query using regex on category", async () => {
		const docs = [{ _id: "tt1" }];
		TestType.find.mockResolvedValue(docs);

		const result = await findByCategory("Imaging");

		expect(TestType.find).toHaveBeenCalledWith({
			category: { $regex: "Imaging", $options: "i" },
		});
		expect(result).toBe(docs);
	});

	it("hardDeleteTestType should call findByIdAndDelete", async () => {
		const deleted = { _id: "tt1" };
		TestType.findByIdAndDelete.mockResolvedValue(deleted);

		const result = await hardDeleteTestType("tt1");

		expect(TestType.findByIdAndDelete).toHaveBeenCalledWith("tt1");
		expect(result).toBe(deleted);
	});

	it("findByEntryMethod should query using regex on entryMethod", async () => {
		const docs = [{ _id: "tt1" }];
		TestType.find.mockResolvedValue(docs);

		const result = await findByEntryMethod("form");

		expect(TestType.find).toHaveBeenCalledWith({
			entryMethod: { $regex: "form", $options: "i" },
		});
		expect(result).toBe(docs);
	});

	it("findMonitoringTests should query isMonitoringRecommended true", async () => {
		const docs = [{ _id: "tt1" }];
		TestType.find.mockResolvedValue(docs);

		const result = await findMonitoringTests();

		expect(TestType.find).toHaveBeenCalledWith({ isMonitoringRecommended: true });
		expect(result).toBe(docs);
	});

	it("findByDiscriminatorType should query by discriminatorType", async () => {
		const docs = [{ _id: "tt1" }];
		TestType.find.mockResolvedValue(docs);

		const result = await findByDiscriminatorType("ECG");

		expect(TestType.find).toHaveBeenCalledWith({ discriminatorType: "ECG" });
		expect(result).toBe(docs);
	});
});

