// Validation schemas for notification operations
import { body, param, query } from "express-validator";

// ===== PARAMETER VALIDATIONS =====

/**
 * Validate MongoDB ObjectId parameters
 */
export const idParamValidation = [
  param("id").isMongoId().withMessage("Invalid notification ID format"),
];

export const patientIdParamValidation = [
  param("patientId").isMongoId().withMessage("Invalid patient ID format"),
];

export const subscriptionIdParamValidation = [
  param("id").isMongoId().withMessage("Invalid subscription ID format"),
];

// ===== NOTIFICATION OPERATIONS VALIDATIONS =====

/**
 * Validate send result ready notification request
 * POST /api/notifications/send/result-ready
 */
export const sendResultReadyValidation = [
  body("testResult")
    .exists()
    .withMessage("Test result data is required")
    .isObject()
    .withMessage("Test result must be an object"),
  body("testResult._id")
    .isMongoId()
    .withMessage("Invalid test result ID format"),
  body("patient")
    .exists()
    .withMessage("Patient data is required")
    .isObject()
    .withMessage("Patient must be an object"),
  body("patient._id").isMongoId().withMessage("Invalid patient ID format"),
  body("patient.contactNumber")
    .optional()
    .isString()
    .withMessage("Contact number must be a string"),
  body("patient.email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),
  body("testType")
    .exists()
    .withMessage("Test type data is required")
    .isObject()
    .withMessage("Test type must be an object"),
  body("testType._id").isMongoId().withMessage("Invalid test type ID format"),
  body("testType.name")
    .isString()
    .notEmpty()
    .withMessage("Test type name is required"),
  body("healthCenter")
    .exists()
    .withMessage("Health center data is required")
    .isObject()
    .withMessage("Health center must be an object"),
  body("healthCenter.name")
    .isString()
    .notEmpty()
    .withMessage("Health center name is required"),
];

/**
 * Validate notification history query filters
 * GET /api/notifications/patient/:patientId
 */
export const notificationHistoryQueryValidation = [
  query("type")
    .optional()
    .isIn([
      "result_ready",
      "unviewed_result_reminder",
      "routine_checkup_reminder",
    ])
    .withMessage("Invalid notification type"),
  query("channel")
    .optional()
    .isIn(["sms", "email"])
    .withMessage("Invalid channel. Must be 'sms' or 'email'"),
  query("status")
    .optional()
    .isIn(["sent", "failed"])
    .withMessage("Invalid status. Must be 'sent' or 'failed'"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

/**
 * Validate failed notifications query
 * GET /api/notifications/failed
 */
export const failedNotificationsQueryValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// ===== REMINDER SUBSCRIPTION VALIDATIONS =====

/**
 * Validate subscription creation request
 * POST /api/notifications/subscriptions
 */
export const subscribeValidation = [
  body("patientProfileId")
    .isMongoId()
    .withMessage("Invalid patient profile ID format"),
  body("testTypeId").isMongoId().withMessage("Invalid test type ID format"),
  body("lastTestDate")
    .isISO8601()
    .withMessage("Last test date must be a valid ISO 8601 date")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error("Last test date cannot be in the future");
      }
      return true;
    }),
];

/**
 * Validate subscription update request
 * PUT /api/notifications/subscriptions/:id
 */
export const updateSubscriptionValidation = [
  body("lastTestDate")
    .isISO8601()
    .withMessage("Last test date must be a valid ISO 8601 date")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error("Last test date cannot be in the future");
      }
      return true;
    }),
];

/**
 * Validate send routine reminder request
 * POST /api/notifications/send/routine-reminder
 */
export const sendRoutineReminderValidation = [
  body("subscriptionId")
    .isMongoId()
    .withMessage("Invalid subscription ID format"),
];
