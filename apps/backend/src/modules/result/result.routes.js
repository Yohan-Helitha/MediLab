import express from "express";
import * as resultController from "./result.controller.js";
import * as resultValidation from "./result.validation.js";
import {
  authenticate,
  isPatient,
  isHealthOfficer,
  checkRole,
} from "../auth/auth.middleware.js";

const router = express.Router();

// Create/Submit Routes (Lab Staff only)
router.post(
  "/",
  authenticate,
  isHealthOfficer,
  resultValidation.submitResultValidation,
  resultController.submitTestResult,
);

// Get Routes - More specific routes first, then generic /:id
// Patient's unviewed results (Patient only - own results)
router.get(
  "/patient/:patientId/unviewed",
  authenticate,
  isPatient,
  resultValidation.patientIdParamValidation,
  resultController.getUnviewedResults,
);

// Patient results (Patient can view own, Health Officer can view all)
router.get(
  "/patient/:patientId",
  authenticate,
  resultValidation.patientIdParamValidation,
  resultValidation.resultQueryFiltersValidation,
  resultController.getPatientTestResults,
);

// Results by booking (Health Officer only)
router.get(
  "/booking/:bookingId",
  authenticate,
  isHealthOfficer,
  resultValidation.bookingIdParamValidation,
  resultController.getTestResultsByBooking,
);

// Results by health center (Health Officer only)
router.get(
  "/health-center/:healthCenterId",
  authenticate,
  isHealthOfficer,
  resultValidation.healthCenterIdParamValidation,
  resultValidation.resultQueryFiltersValidation,
  resultController.getResultsByHealthCenter,
);

// Results by test type (Health Officer only)
router.get(
  "/test-type/:testTypeId",
  authenticate,
  isHealthOfficer,
  resultValidation.testTypeIdParamValidation,
  resultController.getResultsByTestType,
);

// Download PDF route - must come before generic /:id (Patient own released + Health Officer)
router.get(
  "/:id/download",
  authenticate,
  resultValidation.idParamValidation,
  resultController.downloadTestResultPDF,
);

// Generic ID route last to avoid conflicts (Patient own released + Health Officer all)
router.get(
  "/:id",
  authenticate,
  resultValidation.idParamValidation,
  resultController.getTestResultById,
);

// Update Routes
// Update status (Health Officer only)
router.patch(
  "/:id/status",
  authenticate,
  isHealthOfficer,
  resultValidation.idParamValidation,
  resultValidation.updateStatusValidation,
  resultController.updateTestResultStatus,
);

// Mark as viewed (Patient only - own results)
router.patch(
  "/:id/mark-viewed",
  authenticate,
  isPatient,
  resultValidation.idParamValidation,
  resultValidation.markViewedValidation,
  resultController.markAsViewed,
);

// Delete Routes
// Hard delete route - MUST come before generic /:id route to avoid conflicts (Admin only)
router.delete(
  "/:id/permanent",
  authenticate,
  checkRole(["Admin"]),
  resultValidation.hardDeleteValidation,
  resultController.hardDeleteTestResult,
);

// Soft delete route (primary method - recommended, Health Officer only)
router.delete(
  "/:id",
  authenticate,
  isHealthOfficer,
  resultValidation.softDeleteValidation,
  resultController.softDeleteTestResult,
);

export default router;
