import TestInstruction, {
	findOneAndUpdateMock,
	findOneMock,
	findMock,
	findByIdMock,
	findByIdAndUpdateMock,
	findByIdAndDeleteMock,
} from "./testInstruction.model.js";

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

// Mock the TestInstruction model and its static methods
jest.mock("./testInstruction.model.js", () => {
	const findOneAndUpdateMockLocal = jest.fn();
	const findOneMockLocal = jest.fn();
	const findMockLocal = jest.fn();
	const findByIdMockLocal = jest.fn();
	const findByIdAndUpdateMockLocal = jest.fn();
	const findByIdAndDeleteMockLocal = jest.fn();

	const TestInstructionMock = function () {};

	TestInstructionMock.findOneAndUpdate = findOneAndUpdateMockLocal;
	TestInstructionMock.findOne = findOneMockLocal;
	TestInstructionMock.find = findMockLocal;
	TestInstructionMock.findById = findByIdMockLocal;
	TestInstructionMock.findByIdAndUpdate = findByIdAndUpdateMockLocal;
	TestInstructionMock.findByIdAndDelete = findByIdAndDeleteMockLocal;

	return {
		__esModule: true,
		default: TestInstructionMock,
		findOneAndUpdateMock: findOneAndUpdateMockLocal,
		findOneMock: findOneMockLocal,
		findMock: findMockLocal,
		findByIdMock: findByIdMockLocal,
		findByIdAndUpdateMock: findByIdAndUpdateMockLocal,
		findByIdAndDeleteMock: findByIdAndDeleteMockLocal,
	};
});

describe("testInstruction.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("createTestInstruction should upsert by diagnosticTestId and languageCode", async () => {
		const data = {
			diagnosticTestId: "test1",
			languageCode: "en",
			preTestInstructions: ["Do X"],
		};
		const upserted = { _id: "ti1", ...data };
		findOneAndUpdateMock.mockResolvedValue(upserted);

		const result = await createTestInstruction(data);

		expect(findOneAndUpdateMock).toHaveBeenCalledWith(
			{ diagnosticTestId: "test1", languageCode: "en" },
			data,
			{ new: true, upsert: true },
		);
		expect(result).toBe(upserted);
	});

	it("findTestInstructionByTestTypeId should query by diagnosticTestId", async () => {
		const doc = { _id: "ti1" };
		findOneMock.mockResolvedValue(doc);

		const result = await findTestInstructionByTestTypeId("test1");

		expect(findOneMock).toHaveBeenCalledWith({ diagnosticTestId: "test1" });
		expect(result).toBe(doc);
	});

	it("getAllTestInstructions without filters should populate diagnosticTestId and drop missing tests", async () => {
		const docs = [
			{ _id: "ti1", diagnosticTestId: { name: "CBC" } },
			{ _id: "ti2", diagnosticTestId: null },
		];
		const populateMock = jest.fn().mockResolvedValue(docs);
		findMock.mockReturnValue({ populate: populateMock });

		const result = await getAllTestInstructions();

		expect(findMock).toHaveBeenCalledWith({});
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
		findMock.mockReturnValue({ populate: populateMock });

		const result = await getAllTestInstructions(filters);

		expect(findMock).toHaveBeenCalledWith({
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
		findByIdMock.mockResolvedValue(doc);

		const result = await getTestInstructionById("ti1");

		expect(findByIdMock).toHaveBeenCalledWith("ti1");
		expect(result).toBe(doc);
	});

	it("getTestInstructionsByLanguage should query by diagnosticTestId and languageCode", async () => {
		const doc = { _id: "ti1" };
		findOneMock.mockResolvedValue(doc);

		const result = await getTestInstructionsByLanguage("test1", "si");

		expect(findOneMock).toHaveBeenCalledWith({ diagnosticTestId: "test1", languageCode: "si" });
		expect(result).toBe(doc);
	});

	it("getTestInstructionsByDiagnosticTestId should query by diagnosticTestId", async () => {
		const docs = [{ _id: "ti1" }];
		findMock.mockResolvedValue(docs);

		const result = await getTestInstructionsByDiagnosticTestId("test1");

		expect(findMock).toHaveBeenCalledWith({ diagnosticTestId: "test1" });
		expect(result).toBe(docs);
	});

	it("updateTestInstruction should use findByIdAndUpdate with new:true", async () => {
		const updated = { _id: "ti1", languageCode: "en" };
		findByIdAndUpdateMock.mockResolvedValue(updated);

		const result = await updateTestInstruction("ti1", { languageCode: "en" });

		expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
			"ti1",
			{ languageCode: "en" },
			{ new: true },
		);
		expect(result).toBe(updated);
	});

	it("deleteTestInstruction should call findByIdAndDelete", async () => {
		const deleted = { _id: "ti1" };
		findByIdAndDeleteMock.mockResolvedValue(deleted);

		const result = await deleteTestInstruction("ti1");

		expect(findByIdAndDeleteMock).toHaveBeenCalledWith("ti1");
		expect(result).toBe(deleted);
	});
});

