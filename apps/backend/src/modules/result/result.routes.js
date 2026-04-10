import express from "express";
import * as resultController from "./result.controller.js";
import * as resultValidation from "./result.validation.js";
import {
  authenticate,
  isPatient,
  isHealthOfficer,
  checkRole,
} from "../auth/auth.middleware.js";
import resultUpload from "../../middlewares/resultUploadMiddleware.js";

const router = express.Router();

// File upload endpoint — Health Officer uploads a single file and receives
// back { fileName, filePath (Cloudinary URL), fileSize, mimeType }.
// The client includes this object in uploadedFiles[] when submitting a result.
router.post(
  "/upload-file",
  authenticate,
  isHealthOfficer,
  resultUpload.single("file"),
  resultController.uploadResultFile,
);

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

// Status history route - must come before generic /:id (Patient own released + Health Officer)
router.get(
  "/:id/status-history",
  authenticate,
  resultValidation.idParamValidation,
  resultController.getStatusHistory,
);

// Uncollected hard copy reports (Health Officer only) — MUST be before /:id
router.get(
  "/uncollected",
  authenticate,
  isHealthOfficer,
  resultValidation.uncollectedQueryValidation,
  resultController.getUncollectedReports,
);

// Generic ID route last to avoid conflicts (Patient own released + Health Officer all)
router.get(
  "/:id",
  authenticate,
  resultValidation.idParamValidation,
  resultController.getTestResultById,
);

// Update Routes
// Update result data (Health Officer only)
router.put(
  "/:id",
  authenticate,
  isHealthOfficer,
  resultValidation.updateResultValidation,
  resultController.updateTestResult,
);

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

// Hard copy: mark as printed (Health Officer only)
router.patch(
  "/:id/mark-printed",
  authenticate,
  isHealthOfficer,
  resultValidation.idParamValidation,
  resultController.markAsPrinted,
);

// Hard copy: mark as collected by patient (Health Officer only)
router.patch(
  "/:id/mark-collected",
  authenticate,
  isHealthOfficer,
  resultValidation.idParamValidation,
  resultController.markAsCollected,
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
