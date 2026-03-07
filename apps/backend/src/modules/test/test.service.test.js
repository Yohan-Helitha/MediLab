import TestType, {
	saveMock,
	findMock,
	findByIdMock,
	findByIdAndUpdateMock,
	findByIdAndDeleteMock,
} from "./testType.model.js";

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

// Mock the TestType model and its static methods
jest.mock("./testType.model.js", () => {
	const saveMockLocal = jest.fn();
	const findMockLocal = jest.fn();
	const findByIdMockLocal = jest.fn();
	const findByIdAndUpdateMockLocal = jest.fn();
	const findByIdAndDeleteMockLocal = jest.fn();

	const TestTypeMock = jest.fn().mockImplementation(() => ({
		save: saveMockLocal,
	}));

	TestTypeMock.find = findMockLocal;
	TestTypeMock.findById = findByIdMockLocal;
	TestTypeMock.findByIdAndUpdate = findByIdAndUpdateMockLocal;
	TestTypeMock.findByIdAndDelete = findByIdAndDeleteMockLocal;

	return {
		__esModule: true,
		default: TestTypeMock,
		saveMock: saveMockLocal,
		findMock: findMockLocal,
		findByIdMock: findByIdMockLocal,
		findByIdAndUpdateMock: findByIdAndUpdateMockLocal,
		findByIdAndDeleteMock: findByIdAndDeleteMockLocal,
	};
});

describe("test.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("createTestType should construct and save a TestType", async () => {
		const data = { name: "CBC", code: "CBC", category: "Hematology" };
		const saved = { _id: "tt1", ...data };

		saveMock.mockResolvedValue(saved);

		const result = await createTestType(data);

		expect(TestType).toHaveBeenCalledWith(data);
		expect(saveMock).toHaveBeenCalledTimes(1);
		expect(result).toBe(saved);
	});

	it("findAllTestTypes without filters should call find with empty query", async () => {
		const docs = [{ _id: "tt1" }];
		findMock.mockResolvedValue(docs);

		const result = await findAllTestTypes();

		expect(findMock).toHaveBeenCalledWith({});
		expect(result).toBe(docs);
	});

	it("findAllTestTypes with category filter should use regex", async () => {
		const docs = [{ _id: "tt1" }];
		findMock.mockResolvedValue(docs);

		const result = await findAllTestTypes({ category: "Blood" });

		expect(findMock).toHaveBeenCalledWith({
			category: { $regex: "Blood", $options: "i" },
		});
		expect(result).toBe(docs);
	});

	it("findTestTypeById should delegate to findById", async () => {
		const doc = { _id: "tt1" };
		findByIdMock.mockResolvedValue(doc);

		const result = await findTestTypeById("tt1");

		expect(findByIdMock).toHaveBeenCalledWith("tt1");
		expect(result).toBe(doc);
	});

	it("updateTestType should use findByIdAndUpdate with new:true", async () => {
		const updated = { _id: "tt1", name: "Updated" };
		findByIdAndUpdateMock.mockResolvedValue(updated);

		const result = await updateTestType("tt1", { name: "Updated" });

		expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
			"tt1",
			{ name: "Updated" },
			{ new: true },
		);
		expect(result).toBe(updated);
	});

	it("softDeleteTestType should set isActive to false", async () => {
		const updated = { _id: "tt1", isActive: false };
		findByIdAndUpdateMock.mockResolvedValue(updated);

		const result = await softDeleteTestType("tt1");

		expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
			"tt1",
			{ isActive: false },
			{ new: true },
		);
		expect(result).toBe(updated);
	});

	it("findByCategory should query using regex on category", async () => {
		const docs = [{ _id: "tt1" }];
		findMock.mockResolvedValue(docs);

		const result = await findByCategory("Imaging");

		expect(findMock).toHaveBeenCalledWith({
			category: { $regex: "Imaging", $options: "i" },
		});
		expect(result).toBe(docs);
	});

	it("hardDeleteTestType should call findByIdAndDelete", async () => {
		const deleted = { _id: "tt1" };
		findByIdAndDeleteMock.mockResolvedValue(deleted);

		const result = await hardDeleteTestType("tt1");

		expect(findByIdAndDeleteMock).toHaveBeenCalledWith("tt1");
		expect(result).toBe(deleted);
	});

	it("findByEntryMethod should query using regex on entryMethod", async () => {
		const docs = [{ _id: "tt1" }];
		findMock.mockResolvedValue(docs);

		const result = await findByEntryMethod("form");

		expect(findMock).toHaveBeenCalledWith({
			entryMethod: { $regex: "form", $options: "i" },
		});
		expect(result).toBe(docs);
	});

	it("findMonitoringTests should query isMonitoringRecommended true", async () => {
		const docs = [{ _id: "tt1" }];
		findMock.mockResolvedValue(docs);

		const result = await findMonitoringTests();

		expect(findMock).toHaveBeenCalledWith({ isMonitoringRecommended: true });
		expect(result).toBe(docs);
	});

	it("findByDiscriminatorType should query by discriminatorType", async () => {
		const docs = [{ _id: "tt1" }];
		findMock.mockResolvedValue(docs);

		const result = await findByDiscriminatorType("ECG");

		expect(findMock).toHaveBeenCalledWith({ discriminatorType: "ECG" });
		expect(result).toBe(docs);
	});
});

