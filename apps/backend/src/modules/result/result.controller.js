import { validationResult } from "express-validator";
import * as resultService from "./result.service.js";
import TestType from "../test/testType.model.js";
import fs from "fs";
import path from "path";

// Test Result Controller
// Handles test result submission, viewing, and management

/**
 * Submit a new test result with discriminator support
 * POST /api/results
 */
export const submitTestResult = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Get test type to determine discriminator
    const testType = await TestType.findById(req.body.testTypeId);
    if (!testType) {
      return res.status(404).json({
        success: false,
        message: "Test type not found",
      });
    }

    // Validate that the test type is active
    if (!testType.isActive) {
      return res.status(400).json({
        success: false,
        message: "Test type is not active",
      });
    }

    // Create test result using appropriate discriminator
    const result = await resultService.createTestResult(
      testType.discriminatorType,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Test result submitted successfully",
      data: result,
    });
  } catch (error) {
    // Handle duplicate booking error
    if (error.code === 11000 || error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message || "Test result already exists for this booking",
      });
    }
    next(error);
  }
};

/**
 * Get test result by ID
 * GET /api/results/:id
 */
export const getTestResultById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await resultService.findTestResultById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Test result retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get all test results for a patient with filters
 * GET /api/results/patient/:patientId
 * Query params: status, testTypeId, startDate, endDate, limit, page
 */
export const getPatientTestResults = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const filters = {
      status: req.query.status,
      testTypeId: req.query.testTypeId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit,
      page: req.query.page,
    };

    const results = await resultService.findResultsByPatient(
      req.params.patientId,
      filters,
    );

    res.status(200).json({
      success: true,
      message: "Patient test results retrieved successfully",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get test result by booking ID
 * GET /api/results/booking/:bookingId
 */
export const getTestResultsByBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await resultService.findResultByBooking(
      req.params.bookingId,
    );

    res.status(200).json({
      success: true,
      message: "Test result retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Update test result status
 * PATCH /api/results/:id/status
 * Body: { status, changedBy }
 */
export const updateTestResultStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { status, changedBy } = req.body;

    const result = await resultService.updateResultStatus(
      req.params.id,
      status,
      changedBy,
    );

    res.status(200).json({
      success: true,
      message: "Test result status updated successfully",
      data: result,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Mark test result as viewed by user
 * PATCH /api/results/:id/mark-viewed
 * Body: { userId }
 */
export const markAsViewed = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { userId } = req.body;

    const result = await resultService.addViewedByEntry(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: "Test result marked as viewed",
      data: result,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get unviewed test results for a patient
 * GET /api/results/patient/:patientId/unviewed
 */
export const getUnviewedResults = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const results = await resultService.findUnviewedResultsByPatient(
      req.params.patientId,
    );

    res.status(200).json({
      success: true,
      message: "Unviewed test results retrieved successfully",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get test results by health center with filters
 * GET /api/results/health-center/:healthCenterId
 * Query params: status, testTypeId, startDate, endDate, limit, page
 */
export const getResultsByHealthCenter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const filters = {
      status: req.query.status,
      testTypeId: req.query.testTypeId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit,
      page: req.query.page,
    };

    const results = await resultService.findResultsByHealthCenter(
      req.params.healthCenterId,
      filters,
    );

    res.status(200).json({
      success: true,
      message: "Health center test results retrieved successfully",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get test results by test type
 * GET /api/results/test-type/:testTypeId
 */
export const getResultsByTestType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const results = await resultService.findResultsByTestType(
      req.params.testTypeId,
    );

    res.status(200).json({
      success: true,
      message: "Test results retrieved successfully",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete test result (primary method - recommended)
 * DELETE /api/results/:id
 * Body: { deleteReason }
 */
export const softDeleteTestResult = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { deleteReason } = req.body;
    const deletedBy = req.user?.id; // From auth middleware

    if (!deletedBy) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to delete results",
      });
    }

    const result = await resultService.softDeleteTestResult(
      req.params.id,
      deleteReason,
      deletedBy,
    );

    res.status(200).json({
      success: true,
      message: "Test result marked as deleted successfully",
      data: result,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Hard delete test result (admin-only - permanent deletion)
 * DELETE /api/results/:id/permanent
 * Body: { deleteReason }
 */
export const hardDeleteTestResult = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { deleteReason } = req.body;
    const deletedBy = req.user?.id; // From auth middleware (must be admin)

    if (!deletedBy) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to delete results",
      });
    }

    // Additional admin check (middleware should handle this, but double-check)
    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only system administrators can permanently delete results",
      });
    }

    const result = await resultService.hardDeleteTestResult(
      req.params.id,
      deleteReason,
      deletedBy,
    );

    res.status(200).json({
      success: true,
      message: "Test result permanently deleted",
      data: result,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Legacy delete function (deprecated - use softDeleteTestResult instead)
 * Keeping for backward compatibility
 */
export const deleteTestResult = softDeleteTestResult;

/**
 * Download test result PDF report
 * GET /api/results/:id/download
 */
export const downloadTestResultPDF = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await resultService.findTestResultById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Test result not found",
      });
    }

    // Check if PDF has been generated
    if (!result.generatedReportPath) {
      return res.status(404).json({
        success: false,
        message: "PDF report not yet generated. Result must be released first.",
      });
    }

    // Check if file exists
    if (!fs.existsSync(result.generatedReportPath)) {
      return res.status(404).json({
        success: false,
        message: "PDF report file not found on server",
      });
    }

    // Get filename for download
    const fileName = path.basename(result.generatedReportPath);

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Stream the PDF file
    const fileStream = fs.createReadStream(result.generatedReportPath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error streaming PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error streaming PDF file",
        });
      }
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
