import TestInstruction from "./testInstruction.model.js";

// Create or update instructions per (diagnosticTestId, languageCode)
// This lets clients POST for an existing test/language and have it overwrite
// the previous instructions instead of failing with a duplicate key error.
export const createTestInstruction = async (data) => {
    return TestInstruction.findOneAndUpdate(
        { diagnosticTestId: data.diagnosticTestId, languageCode: data.languageCode },
        data,
        { new: true, upsert: true }
    );
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
            // Always drop instructions whose linked test type no longer exists
            const withValidTest = results.filter(instr => instr.diagnosticTestId);
            return withValidTest;
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