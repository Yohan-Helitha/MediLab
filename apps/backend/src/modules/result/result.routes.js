import express from "express";
import * as resultController from "./result.controller.js";
import * as resultValidation from "./result.validation.js";

const router = express.Router();

// Create/Submit Routes
router.post(
  "/",
  resultValidation.submitResultValidation,
  resultController.submitTestResult,
);

// Get Routes - More specific routes first, then generic /:id
router.get(
  "/patient/:patientId/unviewed",
  resultValidation.patientIdParamValidation,
  resultController.getUnviewedResults,
);

router.get(
  "/patient/:patientId",
  resultValidation.patientIdParamValidation,
  resultValidation.resultQueryFiltersValidation,
  resultController.getPatientTestResults,
);

router.get(
  "/booking/:bookingId",
  resultValidation.bookingIdParamValidation,
  resultController.getTestResultsByBooking,
);

router.get(
  "/health-center/:healthCenterId",
  resultValidation.healthCenterIdParamValidation,
  resultValidation.resultQueryFiltersValidation,
  resultController.getResultsByHealthCenter,
);

router.get(
  "/test-type/:testTypeId",
  resultValidation.testTypeIdParamValidation,
  resultController.getResultsByTestType,
);

// Download PDF route - must come before generic /:id
router.get(
  "/:id/download",
  resultValidation.idParamValidation,
  resultController.downloadTestResultPDF,
);

// Generic ID route last to avoid conflicts
router.get(
  "/:id",
  resultValidation.idParamValidation,
  resultController.getTestResultById,
);

// Update Routes
router.patch(
  "/:id/status",
  resultValidation.idParamValidation,
  resultValidation.updateStatusValidation,
  resultController.updateTestResultStatus,
);

router.patch(
  "/:id/mark-viewed",
  resultValidation.idParamValidation,
  resultValidation.markViewedValidation,
  resultController.markAsViewed,
);

// Delete Routes
// TODO: After auth merge, add authentication middleware:
// - Soft delete: authenticate, isHealthOfficer (any lab staff)
// - Hard delete: authenticate, checkRole(['Admin']) (admin-only)

// Hard delete route - MUST come before generic /:id route to avoid conflicts
router.delete(
  "/:id/permanent",
  // authenticate,  // TODO: Uncomment after auth merge
  // checkRole(['Admin']),  // TODO: Uncomment after auth merge
  resultValidation.hardDeleteValidation,
  resultController.hardDeleteTestResult,
);

// Soft delete route (primary method - recommended)
router.delete(
  "/:id",
  // authenticate,  // TODO: Uncomment after auth merge
  // isHealthOfficer,  // TODO: Uncomment after auth merge (any health officer can soft delete)
  resultValidation.softDeleteValidation,
  resultController.softDeleteTestResult,
);

export default router;
