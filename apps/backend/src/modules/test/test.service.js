import TestType from "./testType.model.js";

export const createTestType = async (testTypeData) => {
   const testType = new TestType(testTypeData);
   return testType.save();
};

export const findAllTestTypes = async (filters = {}) => {
   const query ={};
    if (filters.category) {
      query.category = {$regex:filters.category, $options: 'i'};
    }
    return TestType.find(query);
};

export const findTestTypeById = async (id) =>{
  return TestType.findById(id);
};

export const updateTestType = async (id, updateData) => {
  return TestType.findByIdAndUpdate(id, updateData, {new:true});
};

export const softDeleteTestType = async (id) => {
  return TestType.findByIdAndUpdate(id,{isActive:false},{new:true});
};

export const findByCategory = async (category) => {
  return await TestType.find({category: {$regex:category,$options:'i'}});
};

export const hardDeleteTestType = async(id) =>{
  return TestType.findByIdAndDelete(id);
};

export const findByEntryMethod = async (entryMethod) => {
  return await TestType.find({entryMethod: {$regex:entryMethod,$options:'i'}});
};

export const findMonitoringTests = async () => {
  return await TestType.find({isMonitoringRecommended:true});
};

export const findByDiscriminatorType = async (discriminatorType) => {
  return await TestType.find({discriminatorType: discriminatorType});
};
