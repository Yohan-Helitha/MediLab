import * as TestService from './test.service.js';

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
    const testType = await TestService.findAllTestTypes(filters);
    res.status(200).json(testType);  
  }catch(error){
    res.status(400).json({error:error.message});
  }
};

export const getTestTypeById = async (req, res, next) => {
  try{
    const testType = await TestService.findTestTypeById(req.params.id);
    if(!testType){
      return res.status(404).json({error: "Test type not found"});
    }
    res.json(testType);
  }catch(error){
    res.status(400).json({error: error.message});
  }
};

export const updateTestType = async (req, res, next) => {
  try{
    const testType = await TestService.updateTestType(req.params.id,req.body);
    if(!testType){
      return res.status(404).json({error:"Test type not found"});
    }
    res.json(testType);
  }catch(error){
      return res.status(400).json({error:error.message});
    }
};

export const softDeleteTestType = async (req, res, next) => {
  try{
    const testType = await TestService.softDeleteTestType(req.params.id);
    if(!testType){
      return res.status(404).json({error:"Test type is not found"});
    }
    res.json({message:"Test type currently inactive"});
  }catch(error){
    res.status(400).json({error:error.message});
  }
};

export const hardDeleteTestType =async (req,res,next) => {
  try{
    const testType = await TestService.hardDeleteTestType(req.params.id);
    if(!testType){
      return res.status(404).json({error:"Test type is not found"});
    }
    res.json({message:"Test type deleted successfully"});
  }catch(error){
    res.status(400).json({error:error.message});
  }
};

export const getTestTypesByCategory = async (req, res, next) => {
  try{
    const testType = await TestService.findByCategory(req.params.category);
    if(!testType || testType.length === 0){
      return res.status(404).json({error:"Test category not found"});
    }
    res.json(testType);
  }catch(error){
    res.status(400).json({error:error.message});
  }
};

export const getFormBasedTests = async (req, res, next) => {
  try{
    const testType = await TestService.findByEntryMethod("Form");
    if(!testType || testType.length === 0){
      return res.status(404).json({error:"Form based tests are not found"});
    }
    res.json(testType);
  }catch(error){
    res.status(400).json({error:error.message});
  }
};

export const getUploadBasedTests = async (req, res, next) => {
  try{
    const testType = await TestService.findByEntryMethod("Upload");
    if(!testType || testType.length === 0){
      return res.status(404).json({error:"Upload based tests are not found"});
    }
    res.json(testType);
  }catch(error){
    res.status(400).json({error:error.message});
  }
};

export const getMonitoringTests = async (req, res, next) => {
  try{
    const testType = await TestService.findMonitoringTests();
    if(!testType || testType.length === 0){
      return res.status(404).json({error:"Monitoring tests are not found"});
    }
    res.json(testType);
  }catch(error){
    res.status(400).json({error:error.message});
  }
};
