import TestInstruction from "./testInstruction.model.js";

// Create instructions for a test.
// Business rule: a diagnostic test can have only ONE instructions record.
// If instructions already exist for the given diagnosticTestId, we throw a
// validation-style error so the client can prompt the user to edit instead.
export const createTestInstruction = async (data) => {
    const existing = await TestInstruction.findOne({
        diagnosticTestId: data.diagnosticTestId,
    });

    if (existing) {
        const error = new Error(
            "Instructions already exist for this test. Please edit the existing record instead of creating a new one."
        );
        // Optional code field for easier checks in controllers/tests if needed
        error.code = "INSTRUCTIONS_ALREADY_EXIST";
        throw error;
    }

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