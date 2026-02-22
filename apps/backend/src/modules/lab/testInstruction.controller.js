import * as testInstructionService from "./testInstruction.service.js";

export const createTestInstruction = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.createTestInstruction(req.body);
        res.status(201).json(testInstruction);
    }catch(error){
        res.status(400).json({error:error.message});
    }
};
export const getTestInstructionByTestTypeId = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.findTestInstructionByTestTypeId(req.params.testTypeId);
        if(!testInstruction || testInstruction.length === 0){
            return res.status(404).json({error: "No test instructions found for this test type"});
        }
        res.json(testInstruction);
    }catch(error){
        res.status(400).json({error: error.message});
    }
};  
export const getAllTestInstructions = async (req, res, next) => {
    try {
        const filters = {};
        if (req.query.testName) {
            filters.testName = req.query.testName;
        }
        if (req.query.instructions) {
            filters.instructions = req.query.instructions;
        }
        if (req.query.languageCode) {
            filters.languageCode = req.query.languageCode;
        }
        const testInstructions = await testInstructionService.getAllTestInstructions(filters);
        if (!testInstructions || testInstructions.length === 0) {
            return res.status(404).json({ error: "No test instructions found" });
        }
        res.json(testInstructions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const getTestInstructionById = async (req, res, next) => {
    try {
        const testInstruction = await testInstructionService.getTestInstructionById(req.params.id);
        if (!testInstruction) {
            return res.status(404).json({ error: "Test instruction not found" });
        }
        res.json(testInstruction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const updateTestInstructions = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.updateTestInstruction(req.params.testTypeId, req.body);
        if(!testInstruction){
            return res.status(204).json({error: "Test instructions are not found "});
        }
        res.json(testInstruction);

    }catch(error){
        res.status(400).json({error: error.message});
    }
};
export const getTestInstructionByLanguage = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.getTestInstructionsByLanguage(req.params.testTypeId, req.query.language);
        if(!testInstruction || testInstruction.length === 0){
            return res.status(404).json({error: "No test instructions found for this language"});
        }
        res.json(testInstruction);
    }catch(error){
        res.status(400).json({error:error.message});
    }
};
export const getTestInstructionByDiagnosticTestId = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.getTestInstructionsByDiagnosticTestId(req.params.diagnosticTestId, req.body);
        if(!testInstruction){
            return res.status(404).json({error: "No test instructions found for this diagnostic test"});
        }
        res.json(testInstruction);
    }catch(error){
        res.status(400).json({error:error.message});
    }
};
export const deleteTestInstructions = async (req, res, next) =>{
    try{
        const testInstruction = await testInstructionService.deleteTestInstruction(req.params.testTypeId);
        if(!testInstruction){
            return res.status(404).json({error: "Test instructions are not found"});
        }
        res.json({message: "Test instructions are deleted successfully"});
    }catch(error){
        res.status(400).json({error:error.message});
    }
};