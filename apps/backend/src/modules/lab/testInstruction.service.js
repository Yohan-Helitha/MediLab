import TestInstruction from "./testInstruction.model";

export const createTestInstruction = async (data) =>{
    const testInstruction = new TestInstruction(data);
    return testInstruction.save();
};
export const findTestInstructionByTestTypeId = async (testTypeId) => {
    return TestInstruction.findById(testTypeId);
};

