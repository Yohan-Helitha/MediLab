import LabTest, {
	saveMock,
	findMock,
	findByIdMock,
	findByIdAndUpdateMock,
} from "./labTest.model.js";
import {
	createLabTest,
	updateStatus,
	getTestsByLab,
	getTestsByStatus,
	findTestByName,
	getTestsAvailabilityById,
} from "./labTest.service.js";

// Mock the LabTest model and its static methods
jest.mock("./labTest.model.js", () => {
	const saveMockLocal = jest.fn();
	const findMockLocal = jest.fn();
	const findByIdMockLocal = jest.fn();
	const findByIdAndUpdateMockLocal = jest.fn();

	const LabTestMock = jest.fn().mockImplementation(() => ({
		save: saveMockLocal,
	}));

	LabTestMock.find = findMockLocal;
	LabTestMock.findById = findByIdMockLocal;
	LabTestMock.findByIdAndUpdate = findByIdAndUpdateMockLocal;

	return {
		__esModule: true,
		default: LabTestMock,
		saveMock: saveMockLocal,
		findMock: findMockLocal,
		findByIdMock: findByIdMockLocal,
		findByIdAndUpdateMock: findByIdAndUpdateMockLocal,
	};
});

describe("labTest.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("createLabTest should construct and save a LabTest", async () => {
		const labTestData = { labId: "lab1", diagnosticTestId: "test1", price: 1200 };
		const saved = { _id: "lt1", ...labTestData };

		saveMock.mockResolvedValue(saved);

		const result = await createLabTest(labTestData);

		expect(LabTest).toHaveBeenCalledWith(labTestData);
		expect(saveMock).toHaveBeenCalledTimes(1);
		expect(result).toBe(saved);
	});

	it("updateStatus should update availabilityStatus with new:true", async () => {
		const updated = { _id: "lt1", availabilityStatus: "AVAILABLE" };
		findByIdAndUpdateMock.mockResolvedValue(updated);

		const result = await updateStatus("lt1", "AVAILABLE");

		expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
			"lt1",
			{ availabilityStatus: "AVAILABLE" },
			{ new: true },
		);
		expect(result).toBe(updated);
	});

	it("getTestsByLab should find by labId and populate diagnosticTestId", async () => {
		const labTests = [{ _id: "lt1" }, { _id: "lt2" }];
		const populateMock = jest.fn().mockResolvedValue(labTests);
		findMock.mockReturnValue({ populate: populateMock });

		const result = await getTestsByLab("lab1");

		expect(findMock).toHaveBeenCalledWith({ labId: "lab1" });
		expect(populateMock).toHaveBeenCalledWith("diagnosticTestId");
		expect(result).toBe(labTests);
	});

	it("getTestsByStatus should find by availabilityStatus and populate diagnosticTestId", async () => {
		const labTests = [{ _id: "lt1" }];
		const populateMock = jest.fn().mockResolvedValue(labTests);
		findMock.mockReturnValue({ populate: populateMock });

		const result = await getTestsByStatus("AVAILABLE");

		expect(findMock).toHaveBeenCalledWith({ availabilityStatus: "AVAILABLE" });
		expect(populateMock).toHaveBeenCalledWith("diagnosticTestId");
		expect(result).toBe(labTests);
	});

	it("findTestByName should filter out lab tests without populated diagnosticTestId", async () => {
		const allResults = [
			{ _id: "lt1", diagnosticTestId: { name: "Chest X-Ray" } },
			{ _id: "lt2", diagnosticTestId: null },
		];
		const populateMock = jest.fn().mockResolvedValue(allResults);
		findMock.mockReturnValue({
			populate: populateMock,
		});

		const result = await findTestByName("Chest");

		expect(findMock).toHaveBeenCalledTimes(1);
		expect(populateMock).toHaveBeenCalledWith({
			path: "diagnosticTestId",
			match: { name: { $regex: "Chest", $options: "i" } },
		});
		expect(result).toEqual([{ _id: "lt1", diagnosticTestId: { name: "Chest X-Ray" } }]);
	});

	it("getTestsAvailabilityById should select only availabilityStatus", async () => {
		const doc = { _id: "lt1", availabilityStatus: "UNAVAILABLE" };
		const selectMock = jest.fn().mockResolvedValue(doc);
		findByIdMock.mockReturnValue({ select: selectMock });

		const result = await getTestsAvailabilityById("lt1");

		expect(findByIdMock).toHaveBeenCalledWith("lt1");
		expect(selectMock).toHaveBeenCalledWith("availabilityStatus");
		expect(result).toBe(doc);
	});
});

