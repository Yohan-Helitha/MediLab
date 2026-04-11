import LabTest from "./labTest.model.js";

// Helper to create a consistent NotFound-style error that controllers can
// recognize and convert into a 404 response.
const createNotFoundError = (message) => {
    const error = new Error(message);
    error.name = "NotFoundError";
    return error;
};

export const createLabTest = async (labTestData) => {
    const labTest = new LabTest(labTestData);
    return labTest.save();
};

export const updateLabTest = async (labTestId, updates) => {
    const labTest = await LabTest.findByIdAndUpdate(labTestId, updates, { new: true });
    if (!labTest) {
        throw createNotFoundError("Lab test is not found");
    }
    return labTest;
};

export const updateStatus = async (labTestId, status) => {
    const labTest = await LabTest.findByIdAndUpdate(
        labTestId,
        { availabilityStatus: status },
        { new: true }
    );

    if (!labTest) {
        throw createNotFoundError("Lab test is not found");
    }

    return labTest;
};

export const getTestsByLab = async (labId) => {
    const labTests = await LabTest.find({ labId: labId }).populate('diagnosticTestId');
    if (!labTests || labTests.length === 0) {
        throw createNotFoundError("No tests found for this lab");
    }
    return labTests;
};

export const getTestsByStatus = async (status) => {
    const labTests = await LabTest.find({ availabilityStatus: status }).populate('diagnosticTestId');
    if (!labTests || labTests.length === 0) {
        throw createNotFoundError("No test found with this status");
    }
    return labTests;
};

export const findTestByName = async (name) => {
    const results = await LabTest.find()
        .populate({
            path: 'diagnosticTestId',
            match: { name: { $regex: name, $options: 'i' } }
        });

    const filtered = results.filter(labTest => labTest.diagnosticTestId);
    if (!filtered || filtered.length === 0) {
        throw createNotFoundError("No test found with this name");
    }
    return filtered;
};

export const getTestsAvailabilityById = async (labTestId) => {
    const labTest = await LabTest.findById(labTestId).select('availabilityStatus');
    if (!labTest) {
        throw createNotFoundError("Lab test not found");
    }
    return labTest;
};

export const deleteLabTest = async (labTestId) => {
    const deleted = await LabTest.findByIdAndDelete(labTestId);
    if (!deleted) {
        throw createNotFoundError("Lab test is not found");
    }
    return deleted;
};