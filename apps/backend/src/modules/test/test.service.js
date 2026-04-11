import TestType from "./testType.model.js";

// Helper to create a consistent NotFound-style error that controllers can
// recognize and convert into a 404 response.
const createNotFoundError = (message) => {
	const error = new Error(message);
	error.name = "NotFoundError";
	return error;
};

export const createTestType = async (testTypeData) => {
  const testType = new TestType(testTypeData);
  return testType.save();
};

export const findAllTestTypes = async (filters = {}) => {
  const query = {};
  if (filters.category) {
    query.category = { $regex: filters.category, $options: "i" };
  }
  return TestType.find(query);
};

export const findTestTypeById = async (id) => {
  const testType = await TestType.findById(id);
  if (!testType) {
		throw createNotFoundError("Test type not found");
	}
  return testType;
};

export const updateTestType = async (id, updateData) => {
  const testType = await TestType.findByIdAndUpdate(id, updateData, { new: true });
  if (!testType) {
		throw createNotFoundError("Test type not found");
	}
  return testType;
};

export const softDeleteTestType = async (id) => {
  const testType = await TestType.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!testType) {
		throw createNotFoundError("Test type is not found");
	}
  return testType;
};

export const findByCategory = async (category) => {
  const docs = await TestType.find({ category: { $regex: category, $options: "i" } });
  if (!docs || docs.length === 0) {
		throw createNotFoundError("Test category not found");
	}
  return docs;
};

export const hardDeleteTestType = async (id) => {
  const deleted = await TestType.findByIdAndDelete(id);
  if (!deleted) {
		throw createNotFoundError("Test type is not found");
	}
  return deleted;
};

export const findByEntryMethod = async (entryMethod) => {
  const docs = await TestType.find({
    entryMethod: { $regex: entryMethod, $options: "i" },
  });

	if (!docs || docs.length === 0) {
		let message = "Tests are not found";
		if (/form/i.test(entryMethod)) {
			message = "Form based tests are not found";
		} else if (/upload/i.test(entryMethod)) {
			message = "Upload based tests are not found";
		}
		throw createNotFoundError(message);
	}

  return docs;
};

export const findMonitoringTests = async () => {
  const docs = await TestType.find({ isMonitoringRecommended: true });
  if (!docs || docs.length === 0) {
		throw createNotFoundError("Monitoring tests are not found");
	}
  return docs;
};

export const findByDiscriminatorType = async (discriminatorType) => {
  return await TestType.find({ discriminatorType: discriminatorType });
};
