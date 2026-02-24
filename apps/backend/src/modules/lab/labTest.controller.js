import * as LabTestService from './labTest.service.js';

export const updateLabTestStatus = async (req, res, next) => {
    try {
        const labTest = await LabTestService.updateStatus(req.params.id, req.body.status);
        if (!labTest) {
            return res.status(404).json({ error: "Lab test is not found" });
        }
        res.json(labTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getTestsAvailabilityById = async (req, res, next) => {
    try {
        const labTest = await LabTestService.getTestsAvailabilityById(req.params.id);
        if (!labTest) {
            return res.status(404).json({ error: "Lab test not found" });
        }
        res.json(labTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getTestsByLabId = async (req, res, next) => {
    try {
        const labTest = await LabTestService.getTestsByLab(req.params.labId);
        if (!labTest || labTest.length === 0) {
            return res.status(404).json({ error: "No tests found for this lab" });
        }
        res.json(labTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getTestsByStatus = async (req, res, next) => {
    try {
        const labTest = await LabTestService.getTestsByStatus(req.query.status);
        if (!labTest || labTest.length === 0) {
            return res.status(404).json({ error: "No test found with this status" });
        }
        res.json(labTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getTestsByName = async (req, res, next) => {
    try {
        const labTest = await LabTestService.findTestByName(req.query.name);
        if (!labTest || labTest.length === 0) {
            return res.status(404).json({ error: "No test found with this name" });
        }
        res.json(labTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};