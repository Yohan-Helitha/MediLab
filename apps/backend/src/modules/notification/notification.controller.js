// Notification Controller
// Handles sending notifications and managing reminder subscriptions

import { validationResult } from "express-validator";
import * as notificationService from "./notification.service.js";

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

    // Get required data from request body
    const { testResult, patient, testType, healthCenter } = req.body;

    // Send notification via SMS and Email
    const results = await notificationService.sendResultReadyNotification({
      testResult,
      patient,
      testType,
      healthCenter,
    });

    res.status(200).json({
      success: true,
      message: "Result ready notification sent",
      data: {
        sms: results.sms,
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
    const daysThreshold = parseInt(req.body.daysThreshold) || 3;
    const maxReminders = parseInt(req.body.maxReminders) || 2;

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

        if (results.sms?.success || results.email?.success) {
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
 * Get notification history for a patient
 * GET /api/notifications/patient/:patientId?type=&channel=&status=&startDate=&endDate=
 */
export const getNotificationHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
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

    const subscription = await notificationService.deactivateSubscription(id);

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from reminders",
      data: subscription,
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
export const sendRoutineCheckupReminder = async (req, res, next) => {
  try {
    const { subscriptionId } = req.body;

    const subscription =
      await notificationService.findSubscriptionById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Get patient and test type data
    const patient = subscription.patientProfileId; // Assuming populated
    const testType = subscription.testTypeId; // Assuming populated

    const results = await notificationService.sendRoutineCheckupReminder({
      subscription,
      patient,
      testType,
    });

    res.status(200).json({
      success: true,
      message: "Routine checkup reminder sent",
      data: {
        sms: results.sms,
        email: results.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
