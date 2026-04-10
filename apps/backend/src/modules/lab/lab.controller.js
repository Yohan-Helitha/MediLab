import * as labService from './lab.service.js';

export const createLab = async (req, res) => {
  try {
    const lab = await labService.createLab(req.body);
    res.status(201).json(lab);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLabs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) {
      filter.name = req.query.name;
    }
    const labs = await labService.getLabs(filter);
    res.json(labs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLabById = async (req, res) => {
  try {
    const lab = await labService.getLabById(req.params.id);
    res.json(lab);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLab = async (req, res) => {
  try {
    const lab = await labService.updateLab(req.params.id, req.body);
    res.json(lab);
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

export const deleteLab = async (req, res) => {
  try {
    const lab = await labService.deleteLab(req.params.id);
    res.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLabStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lab = await labService.updateLabStatus(req.params.id, status);
    res.json(lab);
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


