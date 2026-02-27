import LabTest from "./labTest.model.js";

export const createLabTest = async (labTestData) => {
    const labTest = new LabTest(labTestData);
    return labTest.save();
};

export const updateStatus = async (labTestId, status) => {
    return LabTest.findByIdAndUpdate(
        labTestId,
        { availabilityStatus: status },
        { new: true }
    );
};

export const getTestsByLab = async (labId) => {
    return LabTest.find({ labId: labId }).populate('diagnosticTestId');
};

export const getTestsByStatus = async (status) => {
    return LabTest.find({ availabilityStatus: status }).populate('diagnosticTestId');
};

export const findTestByName = async (name) => {
    return LabTest.find()
        .populate({
            path: 'diagnosticTestId',
            match: { name: { $regex: name, $options: 'i' } }
        })
        .then(results => results.filter(labTest => labTest.diagnosticTestId));
};

export const getTestsAvailabilityById = async (labTestId) => {
    return LabTest.findById(labTestId).select('availabilityStatus');
};