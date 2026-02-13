import TestResult from "./testResult.model.js";
import BloodGlucoseResult from "./discriminators/bloodGlucose.result.js";
import HemoglobinResult from "./discriminators/hemoglobin.result.js";
import BloodPressureResult from "./discriminators/bloodPressure.result.js";
import PregnancyTestResult from "./discriminators/pregnancy.result.js";
import XRayResult from "./discriminators/xray.result.js";
import ECGResult from "./discriminators/ecg.result.js";
import UltrasoundResult from "./discriminators/ultrasound.result.js";
import AutomatedReportResult from "./discriminators/automatedReport.result.js";

// Business logic for test result operations

export const createTestResult = async (testTypeDiscriminator, resultData) => {
  // TODO: Implement result creation logic
  // Determine which discriminator model to use based on testType.discriminatorType
};

export const findTestResultById = async (id) => {
  // TODO: Implement find by ID with population
};

export const findResultsByPatient = async (patientProfileId, filters = {}) => {
  // TODO: Implement find all results for a patient
};

export const findResultByBooking = async (bookingId) => {
  // TODO: Implement find result by booking ID
};

export const updateResultStatus = async (id, status, changedBy) => {
  // TODO: Implement status update with status history tracking
};

export const addViewedByEntry = async (id, userId) => {
  // TODO: Implement add userId to viewedBy array
};

export const findUnviewedResultsByPatient = async (patientProfileId) => {
  // TODO: Implement find results where patient hasn't viewed yet
};

export const findResultsByHealthCenter = async (
  healthCenterId,
  filters = {},
) => {
  // TODO: Implement find by health center with filters
};

export const findResultsByTestType = async (testTypeId) => {
  // TODO: Implement find by test type
};

export const deleteTestResult = async (id) => {
  // TODO: Implement delete
};

// Helper function to get correct discriminator model
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
