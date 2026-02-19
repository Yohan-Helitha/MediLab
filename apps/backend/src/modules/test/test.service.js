import TestType from "./testType.model.js";

// Business logic for test type operations

/**
 * Create a new test type
 * @param {Object} testTypeData - Test type data
 * @returns {Promise<Object>} Created test type
 */
export const createTestType = async (testTypeData) => {
  try {
    const testType = new TestType(testTypeData);
    await testType.save();
    return testType;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      const customError = new Error(
        `Test type with this ${field} already exists`,
      );
      customError.statusCode = 409;
      customError.field = field;
      throw customError;
    }
    throw error;
  }
};

/**
 * Find all test types with optional filters
 * @param {Object} filters - Query filters (category, entryMethod, isActive, isRoutineMonitoringRecommended)
 * @returns {Promise<Array>} Array of test types
 */
export const findAllTestTypes = async (filters = {}) => {
  const query = {};

  // Apply filters
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.entryMethod) {
    query.entryMethod = filters.entryMethod;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  if (filters.isRoutineMonitoringRecommended !== undefined) {
    query.isRoutineMonitoringRecommended =
      filters.isRoutineMonitoringRecommended === "true" ||
      filters.isRoutineMonitoringRecommended === true;
  }

  const testTypes = await TestType.find(query).sort({ createdAt: -1 });
  return testTypes;
};

/**
 * Find test type by ID
 * @param {String} id - Test type ID
 * @returns {Promise<Object>} Test type object
 */
export const findTestTypeById = async (id) => {
  const testType = await TestType.findById(id);
  if (!testType) {
    const error = new Error("Test type not found");
    error.statusCode = 404;
    throw error;
  }
  return testType;
};

/**
 * Update test type
 * @param {String} id - Test type ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated test type
 */
export const updateTestType = async (id, updateData) => {
  try {
    const testType = await TestType.findByIdAndUpdate(id, updateData, {
      new: true, // Return updated document
      runValidators: true, // Run schema validators
    });

    if (!testType) {
      const error = new Error("Test type not found");
      error.statusCode = 404;
      throw error;
    }

    return testType;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      const customError = new Error(
        `Test type with this ${field} already exists`,
      );
      customError.statusCode = 409;
      customError.field = field;
      throw customError;
    }
    throw error;
  }
};

/**
 * Soft delete test type (set isActive = false)
 * @param {String} id - Test type ID
 * @returns {Promise<Object>} Updated test type
 */
export const softDeleteTestType = async (id) => {
  const testType = await TestType.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );

  if (!testType) {
    const error = new Error("Test type not found");
    error.statusCode = 404;
    throw error;
  }

  return testType;
};

/**
 * Find test types by category
 * @param {String} category - Category name
 * @returns {Promise<Array>} Array of test types
 */
export const findByCategory = async (category) => {
  const testTypes = await TestType.find({ category, isActive: true }).sort({
    name: 1,
  });
  return testTypes;
};

/**
 * Find test types by entry method
 * @param {String} entryMethod - Entry method (form or upload)
 * @returns {Promise<Array>} Array of test types
 */
export const findByEntryMethod = async (entryMethod) => {
  const testTypes = await TestType.find({ entryMethod, isActive: true }).sort({
    name: 1,
  });
  return testTypes;
};

/**
 * Find test types with routine monitoring recommended
 * @returns {Promise<Array>} Array of test types
 */
export const findMonitoringTests = async () => {
  const testTypes = await TestType.find({
    isRoutineMonitoringRecommended: true,
    isActive: true,
  }).sort({ name: 1 });
  return testTypes;
};

/**
 * Find test type by discriminator type
 * @param {String} discriminatorType - Discriminator type
 * @returns {Promise<Object>} Test type object
 */
export const findByDiscriminatorType = async (discriminatorType) => {
  const testType = await TestType.findOne({
    discriminatorType,
    isActive: true,
  });
  if (!testType) {
    const error = new Error("Test type not found for this discriminator");
    error.statusCode = 404;
    throw error;
  }
  return testType;
};
