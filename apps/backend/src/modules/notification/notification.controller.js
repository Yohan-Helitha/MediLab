// Notification Controller
// Handles sending notifications and managing reminder subscriptions

import { validationResult } from "express-validator";
import * as notificationService from "./notification.service.js";
import TestResult from "../result/testResult.model.js";

// ===== NOTIFICATION LOG OPERATIONS =====

/**
 * Send result ready notification (usually triggered automatically)
 * POST /api/notifications/send/result-ready
 */
export const sendResultReadyNotification = async (req, res, next) => {
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

    // Fetch test result to get releasedAt timestamp
    const testResult = await TestResult.findById(req.body.testResult._id);

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: "Test result not found",
      });
    }

    // Check if result is released
    if (testResult.currentStatus !== "released") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot send notification. Test result must be released first.",
      });
    }

    // Prepare data combining request body with test result data
    const notificationData = {
      testResult: {
        _id: testResult._id,
        releasedAt: testResult.releasedAt,
      },
      patient: {
        _id: req.body.patient._id,
        fullName: req.body.patient.fullName || "Patient",
        contactNumber: req.body.patient.contactNumber,
        email: req.body.patient.email,
      },
      testType: req.body.testType,
      healthCenter: req.body.healthCenter,
    };

    // Send notification via SMS and Email
    const results =
      await notificationService.sendResultReadyNotification(notificationData);

    res.status(200).json({
      success: true,
      message: "Result ready notification sent",
      data: {
        whatsapp: results.whatsapp,
        email: results.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send unviewed result reminder (for results not viewed within X days)
 * POST /api/notifications/send/unviewed-reminder
 * Body: { daysThreshold: 3, maxReminders: 2 } (optional, defaults provided)
 */
export const sendUnviewedResultReminder = async (req, res, next) => {
  try {
    // Use != null so daysThreshold=0 is treated as 0, not coerced to default
    const daysThreshold =
      req.body.daysThreshold != null ? parseInt(req.body.daysThreshold) : 3;
    const maxReminders =
      req.body.maxReminders != null ? parseInt(req.body.maxReminders) : 2;

    // Find unviewed results
    const unviewedResults = await notificationService.findUnviewedResults(
      daysThreshold,
      maxReminders,
    );

    let successCount = 0;
    let failCount = 0;

    // Send reminder for each unviewed result
    for (const data of unviewedResults) {
      try {
        const results =
          await notificationService.sendUnviewedResultReminder(data);

        if (results.whatsapp?.success || results.email?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error(
          `Error sending reminder for result ${data.testResult._id}:`,
          error.message,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Unviewed result reminders sent",
      data: {
        totalFound: unviewedResults.length,
        sent: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all notification logs (staff only)
 * GET /api/notifications?limit=50&status=&type=&channel=
 */
export const getAllNotifications = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      channel: req.query.channel,
    };
    const limit = req.query.limit || 50;
    const notifications = await notificationService.findAllNotifications(filters, limit);
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification history for a patient
 * GET /api/notifications/patient/:patientId?type=&channel=&status=&startDate=&endDate=
 */
export const getNotificationHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // AUTHORIZATION: Patients can only view their own notifications
    if (req.user.userType === "patient" && req.user.profileId?.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own notifications.",
      });
    }

    const filters = {
      type: req.query.type,
      channel: req.query.channel,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const notifications = await notificationService.findNotificationsByPatient(
      patientId,
      filters,
    );

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single notification log by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.findNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend a failed notification
 * POST /api/notifications/:id/resend
 */
export const resendNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.findNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Can only resend failed notifications",
      });
    }

    // Resend the notification
    const result = await notificationService.resendNotification(id);

    res.status(200).json({
      success: true,
      message: "Notification resent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get failed notifications (for admin/debugging)
 * GET /api/notifications/failed?limit=50
 */
export const getFailedNotifications = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const notifications =
      await notificationService.findFailedNotifications(limit);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ===== REMINDER SUBSCRIPTION OPERATIONS =====

/**
 * Subscribe to routine checkup reminders
 * POST /api/notifications/subscriptions
 */
export const subscribeToReminder = async (req, res, next) => {
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

    // AUTHORIZATION: Patients can only create subscriptions for themselves
    if (
      req.user.userType === "patient" &&
      req.user.profileId?.toString() !== req.body.patientProfileId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only create subscriptions for yourself.",
      });
    }

    const subscription = await notificationService.createSubscription(req.body);

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to routine checkup reminders",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unsubscribe from reminders
 * DELETE /api/notifications/subscriptions/:id
 */
export const unsubscribeFromReminder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch subscription first to check ownership
    const subscription = await notificationService.findSubscriptionById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // AUTHORIZATION: Patients can only unsubscribe their own subscriptions
    if (
      req.user.userType === "patient" &&
      req.user.profileId?.toString() !== subscription.patientProfileId._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only unsubscribe your own subscriptions.",
      });
    }

    const updated = await notificationService.deactivateSubscription(id);

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from reminders",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active subscriptions for a patient
 * GET /api/notifications/subscriptions/patient/:patientId
 */
export const getPatientSubscriptions = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // AUTHORIZATION: Patients can only view their own subscriptions
    if (req.user.userType === "patient" && req.user.profileId?.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own subscriptions.",
      });
    }

    const subscriptions =
      await notificationService.findSubscriptionsByPatient(patientId);

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single subscription by ID
 * GET /api/notifications/subscriptions/:id
 */
export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await notificationService.findSubscriptionById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // AUTHORIZATION: Patients can only view their own subscriptions
    if (
      req.user.userType === "patient" &&
      req.user.profileId?.toString() !== subscription.patientProfileId._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own subscriptions.",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update subscription (e.g., after new test result)
 * PUT /api/notifications/subscriptions/:id
 */
export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lastTestDate } = req.body;

    const subscription = await notificationService.findSubscriptionById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // AUTHORIZATION: Patients can only update their own subscriptions
    if (
      req.user.userType === "patient" &&
      req.user.profileId?.toString() !== subscription.patientProfileId._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own subscriptions.",
      });
    }

    // Update subscription with new test date
    const updated = await notificationService.updateSubscriptionAfterTest(
      subscription.patientProfileId,
      subscription.testTypeId,
      new Date(lastTestDate),
    );

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send routine checkup reminder (usually triggered by scheduled job)
 * POST /api/notifications/send/routine-reminder
 */
/**
 * Manual trigger for hard copy ready-for-pickup notification
 * POST /api/notifications/send/hard-copy-ready
 * Body: { resultId }
 */
export const sendHardCopyReadyNotification = async (req, res, next) => {
  try {
    const { resultId } = req.body;

    if (!resultId) {
      return res.status(400).json({
        success: false,
        message: "resultId is required",
      });
    }

    const populatedResult = await TestResult.findById(resultId)
      .populate("patientProfileId", "full_name email contact_number")
      .populate("testTypeId", "name")
      .populate(
        "healthCenterId",
        "name addressLine1 addressLine2 district phoneNumber operatingHours",
      );

    if (!populatedResult) {
      return res.status(404).json({
        success: false,
        message: "Test result not found",
      });
    }

    if (!populatedResult.hardCopyCollection?.isPrinted) {
      return res.status(400).json({
        success: false,
        message: "Hard copy has not been printed yet. Call mark-printed first.",
      });
    }

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
      testResult: { _id: populatedResult._id, bookingCode: null },
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

    const results =
      await notificationService.sendHardCopyReadyNotification(notificationData);

    res.status(200).json({
      success: true,
      message: "Hard copy ready notification sent",
      data: {
        whatsapp: results.whatsapp,
        email: results.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual trigger for uncollected hard copy collection reminders
 * POST /api/notifications/send/hard-copy-reminder
 * Body: { daysThreshold: 3, maxReminders: 2 } (optional, defaults provided)
 */
export const sendUncollectedHardCopyReminder = async (req, res, next) => {
  try {
    // Use != null so daysThreshold=0 is treated as 0, not coerced to default
    const daysThreshold =
      req.body.daysThreshold != null ? parseInt(req.body.daysThreshold) : 3;
    const maxReminders =
      req.body.maxReminders != null ? parseInt(req.body.maxReminders) : 2;

    const uncollectedResults =
      await notificationService.findUncollectedHardCopies(
        daysThreshold,
        maxReminders,
      );

    let successCount = 0;
    let failCount = 0;

    for (const data of uncollectedResults) {
      try {
        const results =
          await notificationService.sendUncollectedHardCopyReminder(data);

        if (results.whatsapp?.success || results.email?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error(
          `Error sending hard copy reminder for result ${data.testResult._id}:`,
          error.message,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Hard copy collection reminders sent",
      data: {
        totalFound: uncollectedResults.length,
        sent: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendRoutineCheckupReminder = async (req, res, next) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "subscriptionId is required in request body",
      });
    }

    const subscription =
      await notificationService.findSubscriptionById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Map populated patientProfileId (snake_case Mongoose doc) to camelCase for service
    const patientDoc = subscription.patientProfileId;
    const patient = {
      _id: patientDoc._id,
      fullName: patientDoc.full_name,
      contactNumber: patientDoc.contact_number,
      email: patientDoc.email,
    };
    const testType = subscription.testTypeId;

    const results = await notificationService.sendRoutineCheckupReminder({
      subscription,
      patient,
      testType,
    });

    res.status(200).json({
      success: true,
      message: "Routine checkup reminder sent",
      data: {
        whatsapp: results.whatsapp,
        email: results.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
