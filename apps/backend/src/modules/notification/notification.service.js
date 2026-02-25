import NotificationLog from "./notificationLog.model.js";
import ReminderSubscription from "./reminderSubscription.model.js";
import TestResult from "../result/testResult.model.js";
import TestType from "../test/testType.model.js";
import { sendSMSWithRetry } from "../../config/twilio.js";
import {
  sendEmailWithRetry,
  sendResultReadyEmail,
  sendRoutineCheckupReminderEmail,
  sendUnviewedResultReminderEmail,
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
 * Send unviewed result reminder notification (SMS + Email)
 * @param {Object} data - Notification data { testResult, patient, testType, healthCenter, daysUnviewed }
 * @returns {Promise<Object>} { sms: result, email: result }
 */
export const sendUnviewedResultReminder = async (data) => {
  const { testResult, patient, testType, healthCenter, daysUnviewed } = data;

  const results = {
    sms: null,
    email: null,
  };

  // Prepare SMS message
  const smsMessage = `MediLab Reminder: Your ${testType.name} results (released ${daysUnviewed} days ago) have not been viewed. Please login to check: ${config.appUrl} - ${healthCenter.name}`;

  // Send SMS if patient has phone number
  if (patient.contactNumber) {
    const smsResult = await sendSMSWithRetry(patient.contactNumber, smsMessage);

    // Log SMS notification
    await createNotificationLog({
      patientProfileId: patient._id,
      type: "unviewed_result_reminder",
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
      releasedDate: testResult.releasedAt.toLocaleDateString(),
      daysUnviewed: daysUnviewed,
      loginUrl: `${config.frontendUrl}/login`,
    };

    const emailResult = await sendUnviewedResultReminderEmail(emailData);

    // Log email notification
    await createNotificationLog({
      patientProfileId: patient._id,
      type: "unviewed_result_reminder",
      channel: "email",
      recipient: patient.email,
      status: emailResult.success ? "sent" : "failed",
      errorMessage: emailResult.error || null,
      messageContent: `Unviewed Results Reminder: ${testType.name}`,
      testResultId: testResult._id,
      sentAt: new Date(),
      apiResponse: emailResult,
    });

    results.email = emailResult;
  }

  return results;
};

/**
 * Find unviewed test results (released more than X days ago with no views)
 * @param {number} daysThreshold - Number of days after release to consider unviewed (default: 3)
 * @param {number} maxReminders - Maximum reminders already sent (default: 2)
 * @returns {Promise<Array>} Array of unviewed test results with patient and test type data
 */
export const findUnviewedResults = async (
  daysThreshold = 3,
  maxReminders = 2,
) => {
  // Calculate cutoff date (X days ago)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

  // Find released results with empty viewedBy array
  const unviewedResults = await TestResult.find({
    currentStatus: "released",
    releasedAt: { $lte: cutoffDate },
    viewedBy: { $size: 0 },
  })
    .populate("patientProfileId", "firstName lastName email contactNumber")
    .populate("testTypeId", "name code")
    .populate("healthCenterId", "name")
    .sort({ releasedAt: 1 }); // Oldest first

  // Filter by reminder count (check notification log)
  const filteredResults = [];

  for (const result of unviewedResults) {
    // Count how many unviewed reminders already sent for this result
    const reminderCount = await NotificationLog.countDocuments({
      testResultId: result._id,
      type: "unviewed_result_reminder",
    });

    // Only include if less than max reminders sent
    if (reminderCount < maxReminders) {
      // Calculate days unviewed
      const daysUnviewed = Math.floor(
        (new Date() - result.releasedAt) / (1000 * 60 * 60 * 24),
      );

      filteredResults.push({
        testResult: result,
        patient: result.patientProfileId,
        testType: result.testTypeId,
        healthCenter: result.healthCenterId,
        daysUnviewed: daysUnviewed,
        remindersSent: reminderCount,
      });
    }
  }

  return filteredResults;
};

/**
 * Resend a failed notification
 * @param {string} notificationId - Notification log ID
 * @returns {Promise<Object>} Result of resending
 */
export const resendNotification = async (notificationId) => {
  const notification = await NotificationLog.findById(notificationId)
    .populate("patientProfileId")
    .populate("testResultId");

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (notification.status !== "failed") {
    const error = new Error("Can only resend failed notifications");
    error.statusCode = 400;
    throw error;
  }

  const { type, channel, recipient, messageContent, patientProfileId } =
    notification;

  let result;

  // Resend based on channel
  if (channel === "sms") {
    result = await sendSMSWithRetry(recipient, messageContent);
  } else if (channel === "email") {
    // Extract content and resend
    result = await sendEmailWithRetry(
      recipient,
      messageContent,
      `<p>${messageContent}</p>`,
    );
  }

  // Create new notification log for the resend attempt
  await createNotificationLog({
    patientProfileId: patientProfileId._id,
    type: type,
    channel: channel,
    recipient: recipient,
    status: result.success ? "sent" : "failed",
    errorMessage: result.error || null,
    messageContent: messageContent,
    testResultId: notification.testResultId?._id || null,
    sentAt: new Date(),
    apiResponse: result,
  });

  return result;
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
