import TestInstruction from "./testInstruction.model.js";

export const createTestInstruction = async (data) =>{
    const testInstruction = new TestInstruction(data);
    return testInstruction.save();
};
export const findTestInstructionByTestTypeId = async (testTypeId) => {
    return TestInstruction.findOne({ diagnosticTestId: testTypeId });
};

export const getAllTestInstructions = async (filters = {}) => {
    const query = {};

    // Filter by instruction content
    if (filters.instructions) {
        query.$or = [
            { preTestInstructions: { $regex: filters.instructions, $options: 'i' } },
            { postTestInstructions: { $regex: filters.instructions, $options: 'i' } }
        ];
    }

    // Filter by language
    if (filters.languageCode) {
        query.languageCode = filters.languageCode;
    }

    // Filter by test name
    let populateOptions = {};
    if (filters.testName) {
        populateOptions = {
            path: 'diagnosticTestId',
            match: { name: { $regex: filters.testName, $options: 'i' } }
        };
    } else {
        populateOptions = { path: 'diagnosticTestId' };
    }

    return TestInstruction.find(query)
        .populate(populateOptions)
        .then(results => {
            if (filters.testName) {
                return results.filter(instr => instr.diagnosticTestId);
            }
            return results;
        });
};
export const getTestInstructionById = async (id) => {
    return TestInstruction.findById(id);
};

export const getTestInstructionsByLanguage = async (testTypeId, languageCode) => {
    return TestInstruction.findOne({ diagnosticTestId: testTypeId, languageCode });
};

export const getTestInstructionsByDiagnosticTestId = async (diagnosticTestId) => {
    return TestInstruction.find({ diagnosticTestId });
};
export const updateTestInstruction =async(id, updateData) =>{
    return TestInstruction.findByIdAndUpdate(id, updateData, {new: true});
};
export const deleteTestInstruction = async (id) => {
    return TestInstruction.findByIdAndDelete(id);
}