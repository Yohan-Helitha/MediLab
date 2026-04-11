import * as LabTestService from './labTest.service.js';

export const createLabTest = async (req, res, next) => {
    try {
        const labTest = await LabTestService.createLabTest(req.body);
        res.status(201).json(labTest);
    } catch (error) {
        // Handle duplicate (labId, diagnosticTestId) constraint violations gracefully
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This test is already assigned to this lab',
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateLabTestStatus = async (req, res, next) => {
    try {
        const labTest = await LabTestService.updateStatus(req.params.id, req.body.status);
        res.json(labTest);
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

export const getTestsAvailabilityById = async (req, res, next) => {
    try {
        const labTest = await LabTestService.getTestsAvailabilityById(req.params.id);
        res.json(labTest);
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

export const getTestsByLabId = async (req, res, next) => {
    try {
        const labTest = await LabTestService.getTestsByLab(req.params.labId);
        res.json(labTest);
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

export const getTestsByStatus = async (req, res, next) => {
    try {
        const labTest = await LabTestService.getTestsByStatus(req.query.status);
        res.json(labTest);
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

export const getTestsByName = async (req, res, next) => {
    try {
        const labTest = await LabTestService.findTestByName(req.query.name);
        res.json(labTest);
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

export const updateLabTestDetails = async (req, res, next) => {
    try {
        const labTest = await LabTestService.updateLabTest(req.params.id, req.body);
        res.json(labTest);
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

export const deleteLabTest = async (req, res, next) => {
    try {
        const deleted = await LabTestService.deleteLabTest(req.params.id);
        res.status(204).send();
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