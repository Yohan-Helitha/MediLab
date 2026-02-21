import NotificationLog from "./notificationLog.model.js";
import ReminderSubscription from "./reminderSubscription.model.js";
import TestType from "../test/testType.model.js";
import { sendSMSWithRetry } from "../../config/twilio.js";
import {
  sendEmailWithRetry,
  sendResultReadyEmail,
  sendRoutineCheckupReminderEmail,
} from "../../config/sendgrid.js";
import config from "../../config/environment.js";

// Business logic for notification operations

// ===== NOTIFICATION LOG SERVICES =====

/**
 * Create a notification log entry
 * @param {Object} logData - Notification log data
 * @returns {Promise<Object>} Created notification log
 */
export const createNotificationLog = async (logData) => {
  const notificationLog = new NotificationLog(logData);
  await notificationLog.save();
  return notificationLog;
};

/**
 * Find all notifications for a patient with optional filters
 * @param {string} patientProfileId - Patient ID
 * @param {Object} filters - Optional filters (type, channel, status, startDate, endDate)
 * @returns {Promise<Array>} Array of notification logs
 */
export const findNotificationsByPatient = async (
  patientProfileId,
  filters = {},
) => {
  const query = { patientProfileId };

  // Apply filters
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.channel) {
    query.channel = filters.channel;
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.startDate || filters.endDate) {
    query.sentAt = {};
    if (filters.startDate) {
      query.sentAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.sentAt.$lte = new Date(filters.endDate);
    }
  }

  return await NotificationLog.find(query).sort({ sentAt: -1 }).limit(100); // Latest 100
};

/**
 * Find notification by ID
 * @param {string} id - Notification log ID
 * @returns {Promise<Object>} Notification log or null
 */
export const findNotificationById = async (id) => {
  return await NotificationLog.findById(id);
};

/**
 * Find all failed notifications for retry
 * @param {number} limit - Maximum number of failed notifications to return
 * @returns {Promise<Array>} Array of failed notification logs
 */
export const findFailedNotifications = async (limit = 50) => {
  return await NotificationLog.find({ status: "failed" })
    .sort({ sentAt: -1 })
    .limit(limit);
};

/**
 * Update notification status
 * @param {string} id - Notification log ID
 * @param {string} status - New status ('sent' or 'failed')
 * @param {string} errorMessage - Error message (if failed)
 * @returns {Promise<Object>} Updated notification log
 */
export const updateNotificationStatus = async (
  id,
  status,
  errorMessage = null,
) => {
  const updateData = { status };
  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  return await NotificationLog.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Send result ready notification (SMS + Email)
 * @param {Object} data - Notification data { testResult, patient, testType, healthCenter }
 * @returns {Promise<Object>} { sms: result, email: result }
 */
export const sendResultReadyNotification = async (data) => {
  const { testResult, patient, testType, healthCenter } = data;

  const results = {
    sms: null,
    email: null,
  };

  // Prepare SMS message
  const smsMessage = `Rural Health Alert: Your ${testType.name} results are now ready. Login to view your report: ${config.appUrl} - ${healthCenter.name}`;

  // Send SMS if patient has phone number
  if (patient.contactNumber) {
    const smsResult = await sendSMSWithRetry(patient.contactNumber, smsMessage);

    // Log SMS notification
    await createNotificationLog({
      patientProfileId: patient._id,
      type: "result_ready",
      channel: "sms",
      recipient: patient.contactNumber,
      status: smsResult.success ? "sent" : "failed",
      errorMessage: smsResult.error || null,
      messageContent: smsMessage,
      testResultId: testResult._id,
      sentAt: new Date(),
      apiResponse: smsResult,
    });

    results.sms = smsResult;
  }

  // Send Email if patient has email
  if (patient.email) {
    const emailData = {
      to: patient.email,
      patientName: `${patient.firstName} ${patient.lastName}`,
      testName: testType.name,
      testDate: testResult.releasedAt.toLocaleDateString(),
      centerName: healthCenter.name,
      loginUrl: `${config.frontendUrl}/login`,
    };

    const emailResult = await sendResultReadyEmail(emailData);

    // Log email notification
    await createNotificationLog({
      patientProfileId: patient._id,
      type: "result_ready",
      channel: "email",
      recipient: patient.email,
      status: emailResult.success ? "sent" : "failed",
      errorMessage: emailResult.error || null,
      messageContent: `Test Results Ready: ${testType.name}`,
      testResultId: testResult._id,
      sentAt: new Date(),
      apiResponse: emailResult,
    });

    results.email = emailResult;
  }

  return results;
};

/**
 * Send routine checkup reminder notification
 * @param {Object} data - Reminder data { subscription, patient, testType }
 * @returns {Promise<Object>} { sms: result, email: result }
 */
export const sendRoutineCheckupReminder = async (data) => {
  const { subscription, patient, testType } = data;

  const results = {
    sms: null,
    email: null,
  };

  // Prepare SMS message
  const smsMessage = `Health Reminder: It's time for your routine ${testType.name} checkup. Last test: ${subscription.lastTestDate.toLocaleDateString()}. Book your appointment: ${config.appUrl} - MediLab`;

  // Send SMS if patient has phone number
  if (patient.contactNumber) {
    const smsResult = await sendSMSWithRetry(patient.contactNumber, smsMessage);

    // Log SMS notification
    await createNotificationLog({
      patientProfileId: patient._id,
      type: "routine_checkup_reminder",
      channel: "sms",
      recipient: patient.contactNumber,
      status: smsResult.success ? "sent" : "failed",
      errorMessage: smsResult.error || null,
      messageContent: smsMessage,
      reminderSubscriptionId: subscription._id,
      sentAt: new Date(),
      apiResponse: smsResult,
    });

    results.sms = smsResult;
  }

  // Send Email if patient has email
  if (patient.email) {
    const emailData = {
      to: patient.email,
      patientName: `${patient.firstName} ${patient.lastName}`,
      testName: testType.name,
      lastTestDate: subscription.lastTestDate.toLocaleDateString(),
      bookingUrl: `${config.frontendUrl}/booking`,
      unsubscribeUrl: `${config.frontendUrl}/subscriptions/${subscription._id}/unsubscribe`,
    };

    const emailResult = await sendRoutineCheckupReminderEmail(emailData);

    // Log email notification
    await createNotificationLog({
      patientProfileId: patient._id,
      type: "routine_checkup_reminder",
      channel: "email",
      recipient: patient.email,
      status: emailResult.success ? "sent" : "failed",
      errorMessage: emailResult.error || null,
      messageContent: `Routine Checkup Reminder: ${testType.name}`,
      reminderSubscriptionId: subscription._id,
      sentAt: new Date(),
      apiResponse: emailResult,
    });

    results.email = emailResult;
  }

  // Update subscription with last reminder sent timestamp
  subscription.lastReminderSentAt = new Date();

  // Calculate next reminder date
  const nextReminderDate = new Date(subscription.lastTestDate);
  nextReminderDate.setDate(
    nextReminderDate.getDate() + testType.recommendedFrequencyInDays,
  );
  subscription.nextReminderDate = nextReminderDate;

  await subscription.save();

  return results;
};

// ===== REMINDER SUBSCRIPTION SERVICES =====

/**
 * Create a reminder subscription
 * @param {Object} subscriptionData - Subscription data { patientProfileId, testTypeId, lastTestDate }
 * @returns {Promise<Object>} Created subscription
 */
export const createSubscription = async (subscriptionData) => {
  // Get test type to validate and calculate reminder date
  const testType = await TestType.findById(subscriptionData.testTypeId);

  if (!testType) {
    const error = new Error("Test type not found");
    error.statusCode = 404;
    throw error;
  }

  // Validate that test type supports routine monitoring
  if (!testType.isRoutineMonitoringRecommended) {
    const error = new Error(
      "This test type does not support routine monitoring reminders",
    );
    error.statusCode = 400;
    throw error;
  }

  // Check if active subscription already exists
  const existingSubscription = await ReminderSubscription.findOne({
    patientProfileId: subscriptionData.patientProfileId,
    testTypeId: subscriptionData.testTypeId,
    status: "active",
  });

  if (existingSubscription) {
    const error = new Error(
      "Active subscription already exists for this test type",
    );
    error.statusCode = 409;
    throw error;
  }

  // Calculate next reminder date
  const lastTestDate = new Date(subscriptionData.lastTestDate);
  const nextReminderDate = new Date(lastTestDate);
  nextReminderDate.setDate(
    nextReminderDate.getDate() + testType.recommendedFrequencyInDays,
  );

  // Create subscription
  const subscription = new ReminderSubscription({
    ...subscriptionData,
    nextReminderDate,
    status: "active",
  });

  await subscription.save();
  return subscription;
};

/**
 * Find all active subscriptions for a patient
 * @param {string} patientProfileId - Patient ID
 * @returns {Promise<Array>} Array of active subscriptions with populated test types
 */
export const findSubscriptionsByPatient = async (patientProfileId) => {
  return await ReminderSubscription.find({
    patientProfileId,
    status: "active",
  })
    .populate("testTypeId")
    .sort({ nextReminderDate: 1 }); // Earliest reminder first
};

/**
 * Find subscription by ID
 * @param {string} id - Subscription ID
 * @returns {Promise<Object>} Subscription or null
 */
export const findSubscriptionById = async (id) => {
  return await ReminderSubscription.findById(id).populate("testTypeId");
};

/**
 * Deactivate (unsubscribe) a subscription
 * @param {string} id - Subscription ID
 * @returns {Promise<Object>} Updated subscription
 */
export const deactivateSubscription = async (id) => {
  const subscription = await ReminderSubscription.findById(id);

  if (!subscription) {
    const error = new Error("Subscription not found");
    error.statusCode = 404;
    throw error;
  }

  subscription.status = "inactive";
  subscription.unsubscribedAt = new Date();

  await subscription.save();
  return subscription;
};

/**
 * Find subscriptions due for reminder today
 * @returns {Promise<Array>} Array of subscriptions needing reminders
 */
export const findSubscriptionsDueToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await ReminderSubscription.find({
    status: "active",
    nextReminderDate: { $gte: today, $lt: tomorrow },
  })
    .populate("testTypeId")
    .populate("patientProfileId");
};

/**
 * Update subscription after new test result
 * @param {string} patientProfileId - Patient ID
 * @param {string} testTypeId - Test type ID
 * @param {Date} newTestDate - New test date
 * @returns {Promise<Object>} Updated subscription or null
 */
export const updateSubscriptionAfterTest = async (
  patientProfileId,
  testTypeId,
  newTestDate,
) => {
  const subscription = await ReminderSubscription.findOne({
    patientProfileId,
    testTypeId,
    status: "active",
  }).populate("testTypeId");

  if (!subscription) {
    return null; // No active subscription
  }

  // Update last test date
  subscription.lastTestDate = newTestDate;

  // Recalculate next reminder date
  const nextReminderDate = new Date(newTestDate);
  nextReminderDate.setDate(
    nextReminderDate.getDate() +
      subscription.testTypeId.recommendedFrequencyInDays,
  );
  subscription.nextReminderDate = nextReminderDate;

  // Reset last reminder sent
  subscription.lastReminderSentAt = null;

  await subscription.save();
  return subscription;
};
