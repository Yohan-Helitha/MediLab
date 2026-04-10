import TestInstruction from "./testInstruction.model.js";

// Helper to create a consistent NotFound-style error that controllers can
// recognize and convert into a 404 response.
const createNotFoundError = (message) => {
	const error = new Error(message);
	error.name = "NotFoundError";
	return error;
};

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
    const instruction = await TestInstruction.findOne({ diagnosticTestId: testTypeId });
    if (!instruction) {
		throw createNotFoundError("No test instructions found for this test type");
	}
    return instruction;
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

    const results = await TestInstruction.find(query)
        .populate(populateOptions);

    // Always drop instructions whose linked test type no longer exists
    const withValidTest = results.filter(instr => instr.diagnosticTestId);
    if (!withValidTest || withValidTest.length === 0) {
		throw createNotFoundError("No test instructions found");
	}
    return withValidTest;
};
export const getTestInstructionById = async (id) => {
    const instruction = await TestInstruction.findById(id);
    if (!instruction) {
		throw createNotFoundError("Test instruction not found");
	}
    return instruction;
};

export const getTestInstructionsByLanguage = async (testTypeId, languageCode) => {
    const instruction = await TestInstruction.findOne({ diagnosticTestId: testTypeId, languageCode });
    if (!instruction) {
		throw createNotFoundError("No test instructions found for this language");
	}
    return instruction;
};

export const getTestInstructionsByDiagnosticTestId = async (diagnosticTestId) => {
    const instructions = await TestInstruction.find({ diagnosticTestId });
    if (!instructions || instructions.length === 0) {
		throw createNotFoundError("No test instructions found for this diagnostic test");
	}
    return instructions;
};
export const updateTestInstruction =async(id, updateData) =>{
    const updated = await TestInstruction.findByIdAndUpdate(id, updateData, {new: true});
    if (!updated) {
		throw createNotFoundError("Test instructions are not found");
	}
    return updated;
};
export const deleteTestInstruction = async (id) => {
    const deleted = await TestInstruction.findByIdAndDelete(id);
    if (!deleted) {
		throw createNotFoundError("Test instructions are not found");
	}
    return deleted;
}