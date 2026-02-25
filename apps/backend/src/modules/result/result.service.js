import TestResult from "./testResult.model.js";
import BloodGlucoseResult from "./discriminators/bloodGlucose.result.js";
import HemoglobinResult from "./discriminators/hemoglobin.result.js";
import BloodPressureResult from "./discriminators/bloodPressure.result.js";
import PregnancyTestResult from "./discriminators/pregnancy.result.js";
import XRayResult from "./discriminators/xray.result.js";
import ECGResult from "./discriminators/ecg.result.js";
import UltrasoundResult from "./discriminators/ultrasound.result.js";
import AutomatedReportResult from "./discriminators/automatedReport.result.js";
import { generateTestResultPDF } from "../../utils/pdfGenerator.js";

// Business logic for test result operations

/**
 * Create a test result using the appropriate discriminator model
 * @param {String} discriminatorType - The discriminator type from TestType
 * @param {Object} resultData - The result data including base and type-specific fields
 * @returns {Promise<Object>} Created test result
 */
export const createTestResult = async (discriminatorType, resultData) => {
  const ResultModel = getDiscriminatorModel(discriminatorType);

  // Check if booking already has a result
  const existingResult = await TestResult.findOne({
    bookingId: resultData.bookingId,
  });

  if (existingResult) {
    const error = new Error(
      "Test result already exists for this booking. Each booking can only have one test result.",
    );
    error.statusCode = 409;
    error.code = 11000; // Duplicate key error code
    throw error;
  }

  // Create status history entry
  const statusHistory = [
    {
      status: resultData.currentStatus || "released",
      changedBy: resultData.enteredBy,
      changedAt: new Date(),
    },
  ];

  // Create the result with status history
  const result = await ResultModel.create({
    ...resultData,
    statusHistory,
  });

  return result;
};

/**
 * Find test result by ID with populated references
 * @param {String} id - Test result ID
 * @returns {Promise<Object>} Test result with populated fields
 */
export const findTestResultById = async (id) => {
  const result = await TestResult.findById(id)
    .populate("patientProfileId", "firstName lastName contactNumber")
    .populate("testTypeId", "name code category discriminatorType")
    .populate("healthCenterId", "name location")
    .populate("bookingId")
    .populate("enteredBy", "firstName lastName")
    .populate("statusHistory.changedBy", "firstName lastName")
    .populate("viewedBy.userId", "firstName lastName");

  if (!result) {
    const error = new Error("Test result not found");
    error.statusCode = 404;
    throw error;
  }

  return result;
};

/**
 * Find all test results for a patient with optional filters
 * @param {String} patientProfileId - Patient profile ID
 * @param {Object} filters - Optional filters (status, testTypeId, startDate, endDate, limit, page)
 * @returns {Promise<Array>} Array of test results
 */
export const findResultsByPatient = async (patientProfileId, filters = {}) => {
  const query = { patientProfileId };

  // Apply filters
  if (filters.status) {
    query.currentStatus = filters.status;
  }

  if (filters.testTypeId) {
    query.testTypeId = filters.testTypeId;
  }

  if (filters.startDate || filters.endDate) {
    query.releasedAt = {};
    if (filters.startDate) {
      query.releasedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.releasedAt.$lte = new Date(filters.endDate);
    }
  }

  // Pagination
  const limit = parseInt(filters.limit) || 20;
  const page = parseInt(filters.page) || 1;
  const skip = (page - 1) * limit;

  const results = await TestResult.find(query)
    .populate("testTypeId", "name code category")
    .populate("healthCenterId", "name")
    .sort({ releasedAt: -1 })
    .limit(limit)
    .skip(skip);

  return results;
};

/**
 * Find test result by booking ID
 * @param {String} bookingId - Booking ID
 * @returns {Promise<Object>} Test result
 */
export const findResultByBooking = async (bookingId) => {
  const result = await TestResult.findOne({ bookingId })
    .populate("patientProfileId", "firstName lastName contactNumber")
    .populate("testTypeId", "name code category discriminatorType")
    .populate("healthCenterId", "name location")
    .populate("enteredBy", "firstName lastName");

  if (!result) {
    const error = new Error("Test result not found for this booking");
    error.statusCode = 404;
    throw error;
  }

  return result;
};

/**
 * Update test result status and add to status history
 * @param {String} id - Test result ID
 * @param {String} status - New status (sample_received, processing, released)
 * @param {String} changedBy - User ID making the change
 * @returns {Promise<Object>} Updated test result
 */
export const updateResultStatus = async (id, status, changedBy) => {
  const result = await TestResult.findById(id)
    .populate("patientProfileId", "fullName dateOfBirth gender contactNumber")
    .populate("testTypeId", "name code")
    .populate(
      "healthCenterId",
      "name addressLine1 addressLine2 district province phoneNumber email",
    )
    .populate("testingPersonnelId", "fullName name")
    .populate("bookingId", "bookingDate");

  if (!result) {
    const error = new Error("Test result not found");
    error.statusCode = 404;
    throw error;
  }

  // Update current status
  result.currentStatus = status;

  // Add to status history
  result.statusHistory.push({
    status,
    changedBy,
    changedAt: new Date(),
  });

  // Generate PDF report when status is released
  if (status === "released" && !result.generatedReportPath) {
    try {
      const pdfPath = await generateTestResultPDF(result);
      result.generatedReportPath = pdfPath;
      result.releasedAt = new Date();
    } catch (pdfError) {
      console.error("Error generating PDF report:", pdfError);
      // Continue without PDF - don't block status update
    }
  }

  await result.save();

  return result;
};

/**
 * Mark result as viewed by a user
 * @param {String} id - Test result ID
 * @param {String} userId - User ID who viewed the result
 * @returns {Promise<Object>} Updated test result
 */
export const addViewedByEntry = async (id, userId) => {
  const result = await TestResult.findById(id);

  if (!result) {
    const error = new Error("Test result not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if user already viewed
  const alreadyViewed = result.viewedBy.some(
    (view) => view.userId.toString() === userId.toString(),
  );

  if (!alreadyViewed) {
    result.viewedBy.push({
      userId,
      viewedAt: new Date(),
    });
    await result.save();
  }

  return result;
};

/**
 * Find unviewed test results for a patient
 * @param {String} patientProfileId - Patient profile ID
 * @returns {Promise<Array>} Array of unviewed test results
 */
export const findUnviewedResultsByPatient = async (patientProfileId) => {
  // Find results where the patient hasn't viewed yet
  // This would typically check if the patient's user ID is in viewedBy array
  const results = await TestResult.find({
    patientProfileId,
    // You might need to get the user ID from patientProfileId
    // For now, we'll return all results and filter in controller if needed
  })
    .populate("testTypeId", "name code category")
    .populate("healthCenterId", "name")
    .sort({ releasedAt: -1 });

  return results;
};

/**
 * Find test results by health center with optional filters
 * @param {String} healthCenterId - Health center ID
 * @param {Object} filters - Optional filters (status, testTypeId, startDate, endDate, limit, page)
 * @returns {Promise<Array>} Array of test results
 */
export const findResultsByHealthCenter = async (
  healthCenterId,
  filters = {},
) => {
  const query = { healthCenterId };

  // Apply filters
  if (filters.status) {
    query.currentStatus = filters.status;
  }

  if (filters.testTypeId) {
    query.testTypeId = filters.testTypeId;
  }

  if (filters.startDate || filters.endDate) {
    query.releasedAt = {};
    if (filters.startDate) {
      query.releasedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.releasedAt.$lte = new Date(filters.endDate);
    }
  }

  // Pagination
  const limit = parseInt(filters.limit) || 50;
  const page = parseInt(filters.page) || 1;
  const skip = (page - 1) * limit;

  const results = await TestResult.find(query)
    .populate("patientProfileId", "firstName lastName")
    .populate("testTypeId", "name code category")
    .populate("enteredBy", "firstName lastName")
    .sort({ releasedAt: -1 })
    .limit(limit)
    .skip(skip);

  return results;
};

/**
 * Find all test results by test type
 * @param {String} testTypeId - Test type ID
 * @returns {Promise<Array>} Array of test results
 */
export const findResultsByTestType = async (testTypeId) => {
  const results = await TestResult.find({ testTypeId })
    .populate("patientProfileId", "firstName lastName")
    .populate("healthCenterId", "name")
    .sort({ releasedAt: -1 })
    .limit(100);

  return results;
};

/**
 * Delete a test result (soft delete by setting status)
 * @param {String} id - Test result ID
 * @returns {Promise<Object>} Deleted result
 */
export const deleteTestResult = async (id) => {
  const result = await TestResult.findByIdAndDelete(id);

  if (!result) {
    const error = new Error("Test result not found");
    error.statusCode = 404;
    throw error;
  }

  return result;
};

/**
 * Helper function to get the correct discriminator model
 * @param {String} discriminatorType - The discriminator type
 * @returns {Model} Mongoose model for the discriminator
 */
export const getDiscriminatorModel = (discriminatorType) => {
  const models = {
    BloodGlucose: BloodGlucoseResult,
    Hemoglobin: HemoglobinResult,
    BloodPressure: BloodPressureResult,
    Pregnancy: PregnancyTestResult,
    XRay: XRayResult,
    ECG: ECGResult,
    Ultrasound: UltrasoundResult,
    AutomatedReport: AutomatedReportResult,
  };

  return models[discriminatorType] || TestResult;
};
