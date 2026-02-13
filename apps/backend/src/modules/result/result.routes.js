import express from "express";
import * as resultController from "./result.controller.js";

const router = express.Router();

// Create/Submit Routes
router.post("/", resultController.submitTestResult);

// Get Routes
router.get("/:id", resultController.getTestResultById);
router.get("/patient/:patientId", resultController.getPatientTestResults);
router.get("/booking/:bookingId", resultController.getTestResultsByBooking);
router.get(
  "/health-center/:healthCenterId",
  resultController.getResultsByHealthCenter,
);
router.get("/test-type/:testTypeId", resultController.getResultsByTestType);
router.get("/patient/:patientId/unviewed", resultController.getUnviewedResults);

// Update Routes
router.patch("/:id/status", resultController.updateTestResultStatus);
router.patch("/:id/mark-viewed", resultController.markAsViewed);

// Delete Routes
router.delete("/:id", resultController.deleteTestResult);

export default router;
