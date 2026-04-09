import { jest } from "@jest/globals";
import TestInstruction from "./testInstruction.model.js";

import {
	createTestInstruction,
	findTestInstructionByTestTypeId,
	getAllTestInstructions,
	getTestInstructionById,
	getTestInstructionsByLanguage,
	getTestInstructionsByDiagnosticTestId,
	updateTestInstruction,
	deleteTestInstruction,
} from "./testInstruction.service.js";

describe("testInstruction.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		TestInstruction.findOneAndUpdate = jest.fn();
		TestInstruction.findOne = jest.fn();
		TestInstruction.find = jest.fn();
		TestInstruction.findById = jest.fn();
		TestInstruction.findByIdAndUpdate = jest.fn();
		TestInstruction.findByIdAndDelete = jest.fn();
	});

	it("createTestInstruction should upsert by diagnosticTestId and languageCode", async () => {
		const data = {
			diagnosticTestId: "test1",
			languageCode: "en",
			preTestInstructions: ["Do X"],
		};
		const upserted = { _id: "ti1", ...data };
		TestInstruction.findOneAndUpdate.mockResolvedValue(upserted);

		const result = await createTestInstruction(data);

		expect(TestInstruction.findOneAndUpdate).toHaveBeenCalledWith(
			{ diagnosticTestId: "test1", languageCode: "en" },
			data,
			{ new: true, upsert: true },
		);
		expect(result).toBe(upserted);
	});

	it("findTestInstructionByTestTypeId should query by diagnosticTestId", async () => {
		const doc = { _id: "ti1" };
		TestInstruction.findOne.mockResolvedValue(doc);

		const result = await findTestInstructionByTestTypeId("test1");

		expect(TestInstruction.findOne).toHaveBeenCalledWith({ diagnosticTestId: "test1" });
		expect(result).toBe(doc);
	});

	it("getAllTestInstructions without filters should populate diagnosticTestId and drop missing tests", async () => {
		const docs = [
			{ _id: "ti1", diagnosticTestId: { name: "CBC" } },
			{ _id: "ti2", diagnosticTestId: null },
		];
		const populateMock = jest.fn().mockResolvedValue(docs);
		TestInstruction.find.mockReturnValue({ populate: populateMock });

		const result = await getAllTestInstructions();

		expect(TestInstruction.find).toHaveBeenCalledWith({});
		expect(populateMock).toHaveBeenCalledWith({ path: "diagnosticTestId" });
		// Should only keep entries with a valid diagnosticTestId
		expect(result).toEqual([{ _id: "ti1", diagnosticTestId: { name: "CBC" } }]);
	});

	it("getAllTestInstructions with filters should build query and populate with match on testName", async () => {
		const filters = {
			instructions: "water",
			languageCode: "en",
			testName: "Glucose",
		};

		const docs = [
			{ _id: "ti1", diagnosticTestId: { name: "Fasting Blood Glucose" } },
		];
		const populateMock = jest.fn().mockResolvedValue(docs);
		TestInstruction.find.mockReturnValue({ populate: populateMock });

		const result = await getAllTestInstructions(filters);

		expect(TestInstruction.find).toHaveBeenCalledWith({
			$or: [
				{ preTestInstructions: { $regex: "water", $options: "i" } },
				{ postTestInstructions: { $regex: "water", $options: "i" } },
			],
			languageCode: "en",
		});
		expect(populateMock).toHaveBeenCalledWith({
			path: "diagnosticTestId",
			match: { name: { $regex: "Glucose", $options: "i" } },
		});
		expect(result).toEqual(docs);
	});

	it("getTestInstructionById should delegate to findById", async () => {
		const doc = { _id: "ti1" };
		TestInstruction.findById.mockResolvedValue(doc);

		const result = await getTestInstructionById("ti1");

		expect(TestInstruction.findById).toHaveBeenCalledWith("ti1");
		expect(result).toBe(doc);
	});

	it("getTestInstructionsByLanguage should query by diagnosticTestId and languageCode", async () => {
		const doc = { _id: "ti1" };
		TestInstruction.findOne.mockResolvedValue(doc);

		const result = await getTestInstructionsByLanguage("test1", "si");

		expect(TestInstruction.findOne).toHaveBeenCalledWith({ diagnosticTestId: "test1", languageCode: "si" });
		expect(result).toBe(doc);
	});

	it("getTestInstructionsByDiagnosticTestId should query by diagnosticTestId", async () => {
		const docs = [{ _id: "ti1" }];
		TestInstruction.find.mockResolvedValue(docs);

		const result = await getTestInstructionsByDiagnosticTestId("test1");

		expect(TestInstruction.find).toHaveBeenCalledWith({ diagnosticTestId: "test1" });
		expect(result).toBe(docs);
	});

	it("updateTestInstruction should use findByIdAndUpdate with new:true", async () => {
		const updated = { _id: "ti1", languageCode: "en" };
		TestInstruction.findByIdAndUpdate.mockResolvedValue(updated);

		const result = await updateTestInstruction("ti1", { languageCode: "en" });

		expect(TestInstruction.findByIdAndUpdate).toHaveBeenCalledWith(
			"ti1",
			{ languageCode: "en" },
			{ new: true },
		);
		expect(result).toBe(updated);
	});

	it("deleteTestInstruction should call findByIdAndDelete", async () => {
		const deleted = { _id: "ti1" };
		TestInstruction.findByIdAndDelete.mockResolvedValue(deleted);

		const result = await deleteTestInstruction("ti1");

		expect(TestInstruction.findByIdAndDelete).toHaveBeenCalledWith("ti1");
		expect(result).toBe(deleted);
	});
});

