import NotificationLog from "./notificationLog.model.js";
import ReminderSubscription from "./reminderSubscription.model.js";

// Business logic for notification operations

// ===== NOTIFICATION LOG SERVICES =====

export const createNotificationLog = async (logData) => {
  // TODO: Create notification log entry
};

export const findNotificationsByPatient = async (
  patientProfileId,
  filters = {},
) => {
  // TODO: Find all notifications for a patient
};

export const findNotificationById = async (id) => {
  // TODO: Find notification by ID
};

export const findFailedNotifications = async () => {
  // TODO: Find all failed notifications for retry
};

export const updateNotificationStatus = async (
  id,
  status,
  errorMessage = null,
) => {
  // TODO: Update notification status
};

// ===== REMINDER SUBSCRIPTION SERVICES =====

export const createSubscription = async (subscriptionData) => {
  // TODO: Create reminder subscription
  // - Validate test type supports monitoring
  // - Calculate nextReminderDate from testType.recommendedFrequencyInDays
};

export const findSubscriptionsByPatient = async (patientProfileId) => {
  // TODO: Find all active subscriptions for patient
};

export const findSubscriptionById = async (id) => {
  // TODO: Find subscription by ID
};

export const deactivateSubscription = async (id) => {
  // TODO: Set status to 'inactive' and set unsubscribedAt
};

export const updateSubscriptionDates = async (id, lastTestDate) => {
  // TODO: Update lastTestDate and recalculate nextReminderDate
};

export const findDueSubscriptions = async () => {
  // TODO: Find subscriptions where nextReminderDate <= today and status = 'active'
};

export const updateReminderSent = async (id, nextReminderDate) => {
  // TODO: Update lastReminderSentAt and nextReminderDate
};

// ===== NOTIFICATION SENDING SERVICES =====

export const sendSMS = async (phoneNumber, message) => {
  // TODO: Integrate with Twilio API
  // - Send SMS
  // - Return response
};

export const sendEmail = async (email, subject, body) => {
  // TODO: Integrate with SendGrid/NodeMailer
  // - Send email
  // - Return response
};

// Helper function to calculate next reminder date
export const calculateNextReminderDate = (lastTestDate, frequencyInDays) => {
  const nextDate = new Date(lastTestDate);
  nextDate.setDate(nextDate.getDate() + frequencyInDays);
  return nextDate;
};
