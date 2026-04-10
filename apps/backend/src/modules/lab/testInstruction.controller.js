import * as testInstructionService from "./testInstruction.service.js";

export const createTestInstruction = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.createTestInstruction(req.body);
        res.status(201).json(testInstruction);
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const getTestInstructionByTestTypeId = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.findTestInstructionByTestTypeId(req.params.testTypeId);
        res.json(testInstruction);
    }catch(error){
        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
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
        res.json(testInstructions);
    } catch (error) {
        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const getTestInstructionById = async (req, res, next) => {
    try {
        const testInstruction = await testInstructionService.getTestInstructionById(req.params.id);
        res.json(testInstruction);
    } catch (error) {
        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const updateTestInstructions = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.updateTestInstruction(req.params.id, req.body);
        res.json(testInstruction);

    }catch(error){
        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const getTestInstructionByLanguage = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.getTestInstructionsByLanguage(req.params.testTypeId, req.query.language);
        res.json(testInstruction);
    }catch(error){
        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const getTestInstructionByDiagnosticTestId = async (req, res, next) => {
    try{
        const testInstruction = await testInstructionService.getTestInstructionsByDiagnosticTestId(req.params.diagnosticTestId, req.body);
        res.json(testInstruction);
    }catch(error){
        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const deleteTestInstructions = async (req, res, next) =>{
    try{
        const testInstruction = await testInstructionService.deleteTestInstruction(req.params.id);
        res.json({message: "Test instructions are deleted successfully"});
    }catch(error){
        if (error.name === 'NotFoundError') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};