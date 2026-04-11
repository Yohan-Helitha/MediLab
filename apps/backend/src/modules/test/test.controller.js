import * as TestService from "./test.service.js";

export const createTestType = async (req, res, next) => {
  try {
    const testType = await TestService.createTestType(req.body);
    res.status(201).json(testType);
  }catch(error){
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllTestTypes = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.category) {
      filters.category = req.query.category;
    }
    const testType = await TestService.findAllTestTypes(filters);
    res.status(200).json(testType);  
  }catch(error){
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTestTypeById = async (req, res, next) => {
  try {
    const testType = await TestService.findTestTypeById(req.params.id);
    res.json(testType);
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

export const updateTestType = async (req, res, next) => {
  try{
    const testType = await TestService.updateTestType(req.params.id,req.body);
    res.json(testType);
  }catch(error){
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        message:error.message,
      });
    }
};


export const hardDeleteTestType = async (req, res, next) => {
  try {
    const testType = await TestService.hardDeleteTestType(req.params.id);
    res.json({message:"Test type deleted successfully"});
  }catch(error){
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message:error.message,
    });
  }
};

export const getTestTypesByCategory = async (req, res, next) => {
  try {
    const testType = await TestService.findByCategory(req.params.category);
    res.json(testType);
  }catch(error){
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message:error.message,
    });
  }
};

export const getFormBasedTests = async (req, res, next) => {
  try {
    const testType = await TestService.findByEntryMethod("Form");
    res.json(testType);
  }catch(error){
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message:error.message,
    });
  }
};

export const getUploadBasedTests = async (req, res, next) => {
  try {
    const testType = await TestService.findByEntryMethod("Upload");
    res.json(testType);
  }catch(error){
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message:error.message,
    });
  }
};

export const getMonitoringTests = async (req, res, next) => {
  try {
    const testType = await TestService.findMonitoringTests();
    res.json(testType);
  }catch(error){
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message:error.message,
    });
  }
};
