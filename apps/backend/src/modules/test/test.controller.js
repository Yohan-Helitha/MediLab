import TestService from './test.service.js';

export const createTestType = async (req, res, next) => {
  try{
    const testType = await TestService.createTestType(req.body);
    res.status(201).json(testType);
  }catch(error){
    res.status(400).json({error: error.message});
  }
  };

export const getAllTestTypes = async (req, res, next) => {
  try{
    const filters ={};
    if(req.query.category){
      filters.category = req.query.category;
    
    }
    const testType = await TestService.getAllTestTypes(filters);
    res.status(201).json(testType);  
  }catch(error){
    res.status(400).json({error:error.message});
  }
};

export const getTestTypeById = async (req, res, next) => {
  try{
    const testType = await TestService.getTestTypeById(req.params.id);
    if(!testType){
      return res.status(404).json({error: "Test type not found"});
    }
    res.json(testType);
  }catch(error){
    res.status(400).json({error: error.message});
  }
};

export const updateTestType = async (req, res, next) => {
  // TODO: Implement test type update
};

export const deleteTestType = async (req, res, next) => {
  // TODO: Implement soft delete (set isActive = false)
};

export const getTestTypesByCategory = async (req, res, next) => {
  // TODO: Implement get by category
};

export const getFormBasedTests = async (req, res, next) => {
  // TODO: Implement get tests with entryMethod = 'form'
};

export const getUploadBasedTests = async (req, res, next) => {
  // TODO: Implement get tests with entryMethod = 'upload'
};

export const getMonitoringTests = async (req, res, next) => {
  // TODO: Implement get tests with isRoutineMonitoringRecommended = true
};
