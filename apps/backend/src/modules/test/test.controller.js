// Test Type Controller
// Handles CRUD operations for test type catalog
import { validationResult } from "express-validator";
import * as testService from "./test.service.js";

/**
 * Create a new test type
 * POST /api/tests
 */
export const createTestType = async (req, res, next) => {
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

    const testType = await testService.createTestType(req.body);

    res.status(201).json({
      success: true,
      message: "Test type created successfully",
      data: testType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all test types with optional filters
 * GET /api/tests?category=&entryMethod=&isActive=&isRoutineMonitoringRecommended=
 */
export const getAllTestTypes = async (req, res, next) => {
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

    const filters = {
      category: req.query.category,
      entryMethod: req.query.entryMethod,
      isActive: req.query.isActive,
      isRoutineMonitoringRecommended: req.query.isRoutineMonitoringRecommended,
    };

    const testTypes = await testService.findAllTestTypes(filters);

    res.status(200).json({
      success: true,
      message: "Test types retrieved successfully",
      count: testTypes.length,
      data: testTypes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single test type by ID
 * GET /api/tests/:id
 */
export const getTestTypeById = async (req, res, next) => {
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

    const testType = await testService.findTestTypeById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Test type retrieved successfully",
      data: testType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update test type
 * PUT /api/tests/:id
 */
export const updateTestType = async (req, res, next) => {
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

    const testType = await testService.updateTestType(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Test type updated successfully",
      data: testType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete test type (set isActive = false)
 * DELETE /api/tests/:id
 */
export const deleteTestType = async (req, res, next) => {
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

    const testType = await testService.softDeleteTestType(req.params.id);

    res.status(200).json({
      success: true,
      message: "Test type deleted successfully",
      data: testType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get test types by category
 * GET /api/tests/category/:category
 */
export const getTestTypesByCategory = async (req, res, next) => {
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

    const testTypes = await testService.findByCategory(req.params.category);

    res.status(200).json({
      success: true,
      message: "Test types retrieved successfully",
      count: testTypes.length,
      data: testTypes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get form-based test types
 * GET /api/tests/method/form
 */
export const getFormBasedTests = async (req, res, next) => {
  try {
    const testTypes = await testService.findByEntryMethod("form");

    res.status(200).json({
      success: true,
      message: "Form-based test types retrieved successfully",
      count: testTypes.length,
      data: testTypes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get upload-based test types
 * GET /api/tests/method/upload
 */
export const getUploadBasedTests = async (req, res, next) => {
  try {
    const testTypes = await testService.findByEntryMethod("upload");

    res.status(200).json({
      success: true,
      message: "Upload-based test types retrieved successfully",
      count: testTypes.length,
      data: testTypes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get test types with routine monitoring recommended
 * GET /api/tests/monitoring/recommended
 */
export const getMonitoringTests = async (req, res, next) => {
  try {
    const testTypes = await testService.findMonitoringTests();

    res.status(200).json({
      success: true,
      message: "Monitoring test types retrieved successfully",
      count: testTypes.length,
      data: testTypes,
    });
  } catch (error) {
    next(error);
  }
};
