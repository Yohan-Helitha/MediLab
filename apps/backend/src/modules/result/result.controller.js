import axios from "axios";
import { validationResult } from "express-validator";
import * as resultService from "./result.service.js";
import TestType from "../test/testType.model.js";
import { uploadToCloudinary, getSignedDownloadUrl } from "../../utils/cloudinaryUpload.js";
import { generateTestResultPDF } from "../../utils/pdfGenerator.js";
import { sendHardCopyReadyNotification, sendResultReadyNotification } from "../notification/notification.service.js";
import TestResult from "./testResult.model.js";

// Test Result Controller
// Handles test result submission, viewing, and management

// ===== UPLOAD-TYPE DISCRIMINATORS =====
const UPLOAD_DISCRIMINATORS = ["XRay", "ECG", "Ultrasound", "AutomatedReport"];

/**
 * Validate discriminator-specific fields for upload-type test results.
 * Returns an array of error objects (empty if valid).
 */
const validateUploadDiscriminatorFields = (discriminatorType, body) => {
  if (!UPLOAD_DISCRIMINATORS.includes(discriminatorType)) return [];

  const errors = [];
  const files = body.uploadedFiles;

  // uploadedFiles array
  if (!Array.isArray(files) || files.length === 0) {
    errors.push({ path: "uploadedFiles", msg: "uploadedFiles must be a non-empty array" });
    return errors; // no point continuing
  }

  const maxFiles = { XRay: 5, ECG: 3, Ultrasound: 5, AutomatedReport: 1 };
  if (files.length > maxFiles[discriminatorType]) {
    errors.push({ path: "uploadedFiles", msg: `Maximum ${maxFiles[discriminatorType]} file(s) allowed for ${discriminatorType}` });
  }

  files.forEach((f, i) => {
    if (!f.fileName) errors.push({ path: `uploadedFiles[${i}].fileName`, msg: "fileName is required" });
    if (!f.filePath) errors.push({ path: `uploadedFiles[${i}].filePath`, msg: "filePath is required" });
    if (!f.fileSize || f.fileSize < 1) errors.push({ path: `uploadedFiles[${i}].fileSize`, msg: "fileSize must be a positive number" });
    if (!f.mimeType) errors.push({ path: `uploadedFiles[${i}].mimeType`, msg: "mimeType is required" });
    if (discriminatorType === "AutomatedReport" && f.mimeType !== "application/pdf") {
      errors.push({ path: `uploadedFiles[${i}].mimeType`, msg: "AutomatedReport files must be PDFs" });
    }
  });

  // Type-specific required fields
  if (discriminatorType === "XRay") {
    if (!body.bodyPart) errors.push({ path: "bodyPart", msg: "bodyPart is required" });
    if (!body.clinicalIndication) errors.push({ path: "clinicalIndication", msg: "clinicalIndication is required" });
    if (!Array.isArray(body.views) || body.views.length === 0) errors.push({ path: "views", msg: "at least one view is required" });
    if (!body.findings) errors.push({ path: "findings", msg: "findings is required" });
    if (!body.impression) errors.push({ path: "impression", msg: "impression is required" });
    if (!body.interpretation) errors.push({ path: "interpretation", msg: "interpretation is required" });
  }

  if (discriminatorType === "ECG") {
    if (!body.ecgType) errors.push({ path: "ecgType", msg: "ecgType is required" });
    if (!body.clinicalIndication) errors.push({ path: "clinicalIndication", msg: "clinicalIndication is required" });
    if (!body.findings) errors.push({ path: "findings", msg: "findings is required" });
    if (!body.interpretation) errors.push({ path: "interpretation", msg: "interpretation is required" });
  }

  if (discriminatorType === "Ultrasound") {
    if (!body.studyType) errors.push({ path: "studyType", msg: "studyType is required" });
    if (!body.clinicalIndication) errors.push({ path: "clinicalIndication", msg: "clinicalIndication is required" });
    if (!body.findings) errors.push({ path: "findings", msg: "findings is required" });
    if (!body.impression) errors.push({ path: "impression", msg: "impression is required" });
    if (!body.interpretation) errors.push({ path: "interpretation", msg: "interpretation is required" });
  }

  if (discriminatorType === "AutomatedReport") {
    if (!body.testPanelName) errors.push({ path: "testPanelName", msg: "testPanelName is required" });
    if (!body.testCategory) errors.push({ path: "testCategory", msg: "testCategory is required" });
    if (!body.sampleType) errors.push({ path: "sampleType", msg: "sampleType is required" });
    if (!body.sampleCollectionTime) errors.push({ path: "sampleCollectionTime", msg: "sampleCollectionTime is required" });
    if (!body.analysisCompletedTime) errors.push({ path: "analysisCompletedTime", msg: "analysisCompletedTime is required" });
  }

  return errors;
};

/**
 * Upload a single test result file (image or PDF) to Cloudinary.
 * The client receives { fileName, filePath, fileSize, mimeType } and includes
 * it in the uploadedFiles[] array when submitting the result form.
 * POST /api/results/upload-file
 */
export const uploadResultFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use field name \"file\" in multipart/form-data.",
      });
    }

    // Always upload as resource_type "image" — Cloudinary supports PDFs natively
    // under the image CDN and serves them without access restrictions.
    // resource_type "raw" causes CDN-level 401s that cannot be bypassed.
    const uploadOptions = { folder: "medilab/results", resourceType: "image" };

    const { url } = await uploadToCloudinary(req.file.buffer, uploadOptions);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: req.file.originalname,
        filePath: url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

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

    // Validate discriminator-specific fields (upload types: XRay, ECG, Ultrasound, AutomatedReport)
    const discriminatorErrors = validateUploadDiscriminatorFields(
      testType.discriminatorType,
      req.body,
    );
    if (discriminatorErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: discriminatorErrors,
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

    // AUTHORIZATION: Patients can only view their own released results
    if (req.user.userType === "patient") {
      if (result.patientProfileId._id.toString() !== req.user.profileId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only view your own test results.",
        });
      }

      if (result.currentStatus !== "released") {
        return res.status(403).json({
          success: false,
          message: "This test result has not been released yet.",
        });
      }
    }

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

    const { patientId } = req.params;

    // AUTHORIZATION: Patients can only view their own results
    if (req.user.userType === "patient" && req.user.profileId?.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own test results.",
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

    // Patients can only see released results
    if (req.user.userType === "patient") {
      filters.status = "released";
    }

    const results = await resultService.findResultsByPatient(
      patientId,
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

    // Auto-fire result-ready notification when status changes to released
    if (status === "released") {
      const patient = result.patientProfileId;
      const testType = result.testTypeId;
      const healthCenter = result.healthCenterId;

      if (patient && testType && healthCenter) {
        // Fire-and-forget — do not block the response on notification failures
        sendResultReadyNotification({
          testResult: { _id: result._id, releasedAt: result.releasedAt },
          patient: {
            _id: patient._id,
            fullName: patient.full_name || "Patient",
            contactNumber: patient.contact_number,
            email: patient.email,
          },
          testType: { name: testType.name },
          healthCenter: { name: healthCenter.name },
        }).catch((err) =>
          console.error("[notification] result-ready send failed:", err.message),
        );
      }
    }

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
 * Update test result data (Health Officer only)
 * PUT /api/results/:id
 * Body: { result data fields, observations, etc. }
 */
export const updateTestResult = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await resultService.updateTestResult(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message:
        "Test result updated successfully. PDF regenerated if form data changed.",
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
 * Get status history for a test result
 * GET /api/results/:id/status-history
 */
export const getStatusHistory = async (req, res, next) => {
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

    // AUTHORIZATION: Patients can only view their own results' history
    if (req.user.userType === "patient") {
      if (result.patientProfileId.toString() !== req.user.profileId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only view your own test results.",
        });
      }

      // Patients can only view history of released results
      if (result.currentStatus !== "released") {
        return res.status(403).json({
          success: false,
          message: "This result has not been released yet.",
        });
      }
    }

    // Synthesize hard copy lifecycle events from hardCopyCollection
    const hardCopyHistory = [];
    if (
      result.hardCopyCollection?.isPrinted &&
      result.hardCopyCollection.printedAt
    ) {
      hardCopyHistory.push({
        event: "printed",
        timestamp: result.hardCopyCollection.printedAt,
        performedBy: result.hardCopyCollection.handedOverBy || null,
      });
    }
    if (
      result.hardCopyCollection?.isCollected &&
      result.hardCopyCollection.collectedAt
    ) {
      hardCopyHistory.push({
        event: "collected",
        timestamp: result.hardCopyCollection.collectedAt,
        performedBy: result.hardCopyCollection.handedOverBy || null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Status history retrieved successfully",
      data: {
        resultId: result._id,
        bookingId: result.bookingId,
        currentStatus: result.currentStatus,
        statusHistory: result.statusHistory,
        hardCopyCollection: result.hardCopyCollection || null,
        hardCopyHistory,
      },
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

    // AUTHORIZATION: Patients can only mark their own results as viewed
    if (req.user.userType === "patient" && req.user.profileId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only mark your own test results as viewed.",
      });
    }

    const result = await resultService.addViewedByEntry(req.params.id, userId);

    // Double-check ownership after fetching result
    if (
      req.user.userType === "patient" &&
      result.patientProfileId._id?.toString() !== req.user.profileId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This test result does not belong to you.",
      });
    }

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

    const { patientId } = req.params;

    // AUTHORIZATION: Patients can only view their own unviewed results
    if (req.user.userType === "patient" && req.user.profileId?.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own test results.",
      });
    }

    const results = await resultService.findUnviewedResultsByPatient(patientId);

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

    // AUTHORIZATION: Patients can only download their own released results
    if (req.user.userType === "patient") {
      if (result.patientProfileId._id.toString() !== req.user.profileId) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You can only download your own test results.",
        });
      }

      if (result.currentStatus !== "released") {
        return res.status(403).json({
          success: false,
          message: "This test result has not been released yet.",
        });
      }
    }

    // Gate on released status — PDF is generated on-demand, never stored
    if (result.currentStatus !== "released") {
      return res.status(403).json({
        success: false,
        message: "PDF report is only available for released results.",
      });
    }

    // Fetch fully populated result for PDF generation
    const resultForPDF = await resultService.findTestResultForPDF(req.params.id);

    // Generate PDF in-memory and stream directly to client
    const pdfBuffer = await generateTestResultPDF(resultForPDF);

    // Build a descriptive filename: e.g. MediLab_Blood_Glucose_Test_<id>.pdf
    const testTypeName = resultForPDF.testTypeId?.name
      ? resultForPDF.testTypeId.name.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")
      : resultForPDF.constructor.modelName;
    const fileName = `MediLab_${testTypeName}_${result._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );
    res.send(pdfBuffer);
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
 * Download a specific uploaded file from a test result (proxied through backend)
 * GET /api/results/:id/file/:fileIndex
 */
export const downloadUploadedFile = async (req, res, next) => {
  try {
    const { id, fileIndex } = req.params;
    const idx = parseInt(fileIndex, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).json({ success: false, message: "Invalid file index." });
    }

    const result = await resultService.findTestResultById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Test result not found." });
    }

    // AUTHORIZATION: Patients can only access their own released results
    if (req.user.userType === "patient") {
      if (result.patientProfileId._id.toString() !== req.user.profileId) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (result.currentStatus !== "released") {
        return res.status(403).json({ success: false, message: "This result has not been released yet." });
      }
    }

    const files = result.uploadedFiles || [];
    if (idx >= files.length) {
      return res.status(404).json({ success: false, message: "File not found at this index." });
    }

    const file = files[idx];

    // Cloudinary restricts PDF delivery even on the image CDN by default.
    // Generating a signed URL embeds an HMAC signature that Cloudinary
    // validates at the edge — this bypasses delivery restrictions for
    // all file types including PDFs. Falls back to the raw URL for images
    // that are served publicly without restrictions.
    const fetchUrl = getSignedDownloadUrl(file.filePath) || file.filePath;
    console.log(`[downloadUploadedFile] idx=${idx} mimeType=${file.mimeType} fetchUrl=${fetchUrl}`);

    let cloudRes;
    try {
      cloudRes = await axios.get(fetchUrl, { responseType: "stream" });
    } catch (fetchErr) {
      const cloudStatus = fetchErr.response?.status ?? "no-response";
      console.error(
        `[downloadUploadedFile] Cloudinary fetch FAILED. HTTP=${cloudStatus} err="${fetchErr.message}" url="${fetchUrl}"`,
      );
      return res.status(502).json({
        success: false,
        message: "Unable to retrieve file from storage.",
      });
    }

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName || `file-${idx}`}"`,
    );
    if (cloudRes.headers["content-length"]) {
      res.setHeader("Content-Length", cloudRes.headers["content-length"]);
    }
    cloudRes.data.pipe(res);
  } catch (error) {
    next(error);
  }
};

// ===== HARD COPY MANAGEMENT CONTROLLERS =====

/**
 * Mark a test result hard copy as printed and notify the patient
 * PATCH /api/results/:id/mark-printed
 */
export const markAsPrinted = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await resultService.markResultAsPrinted(
      req.params.id,
      req.user.id,
    );

    // Fetch full populated result for notification
    const populatedResult = await TestResult.findById(result._id)
      .populate("patientProfileId", "full_name email contact_number")
      .populate("testTypeId", "name")
      .populate(
        "healthCenterId",
        "name addressLine1 addressLine2 district phoneNumber operatingHours",
      );

    // Send notification (non-blocking — do not fail the request if notification fails)
    if (
      populatedResult.patientProfileId &&
      populatedResult.testTypeId &&
      populatedResult.healthCenterId
    ) {
      const center = populatedResult.healthCenterId;
      const addressParts = [
        center.addressLine1,
        center.addressLine2,
        center.district,
      ].filter(Boolean);
      const operatingHoursSummary =
        center.operatingHours?.length > 0
          ? center.operatingHours
              .map((h) => `${h.day}: ${h.openTime} - ${h.closeTime}`)
              .join(", ")
          : null;

      const notificationData = {
        testResult: { _id: result._id, bookingCode: null },
        patient: {
          _id: populatedResult.patientProfileId._id,
          fullName: populatedResult.patientProfileId.full_name,
          contactNumber: populatedResult.patientProfileId.contact_number,
          email: populatedResult.patientProfileId.email,
        },
        testType: {
          _id: populatedResult.testTypeId._id,
          name: populatedResult.testTypeId.name,
        },
        healthCenter: {
          name: center.name,
          address: addressParts.join(", ") || null,
          contactNumber: center.phoneNumber || null,
          operatingHours: operatingHoursSummary,
        },
      };

      sendHardCopyReadyNotification(notificationData).catch((err) =>
        console.error("⚠️ Hard copy notification failed:", err.message),
      );
    }

    res.status(200).json({
      success: true,
      message: "Hard copy marked as printed. Patient notification sent.",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Mark a test result hard copy as collected by the patient
 * PATCH /api/results/:id/mark-collected
 */
export const markAsCollected = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await resultService.markResultAsCollected(
      req.params.id,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Hard copy marked as collected by patient.",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get all printed but uncollected hard copy reports
 * GET /api/results/uncollected
 */
export const getUncollectedReports = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { centerId, daysThreshold } = req.query;

    const results = await resultService.findUncollectedReports(
      centerId || null,
      daysThreshold ? parseInt(daysThreshold, 10) : 0,
    );

    res.status(200).json({
      success: true,
      message: "Uncollected hard copy reports retrieved",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
