// Notification Controller
// Handles sending notifications and managing reminder subscriptions

// ===== NOTIFICATION LOG OPERATIONS =====

export const sendResultReadyNotification = async (req, res, next) => {
  // TODO: Send notification when test result is ready
  // - Send SMS/Email to patient
  // - Log notification in NotificationLog
};

export const sendUnviewedResultReminder = async (req, res, next) => {
  // TODO: Send reminder for unviewed results
  // - Find unviewed results older than X days
  // - Send reminder notification
};

export const getNotificationHistory = async (req, res, next) => {
  // TODO: Get notification history for a patient
};

export const getNotificationById = async (req, res, next) => {
  // TODO: Get single notification log
};

export const resendNotification = async (req, res, next) => {
  // TODO: Resend a failed notification
};

// ===== REMINDER SUBSCRIPTION OPERATIONS =====

export const subscribeToReminder = async (req, res, next) => {
  // TODO: Create reminder subscription for a test type
  // - Check if test supports routine monitoring
  // - Calculate next reminder date from testType frequency
  // - Create subscription
};

export const unsubscribeFromReminder = async (req, res, next) => {
  // TODO: Unsubscribe from reminder
  // - Set status to 'inactive'
  // - Set unsubscribedAt timestamp
};

export const getPatientSubscriptions = async (req, res, next) => {
  // TODO: Get all active subscriptions for a patient
};

export const updateSubscription = async (req, res, next) => {
  // TODO: Update subscription (e.g., after new test result)
  // - Update lastTestDate
  // - Recalculate nextReminderDate
};

export const sendDueReminders = async (req, res, next) => {
  // TODO: Cron job endpoint - send reminders for all due subscriptions
  // - Find subscriptions where nextReminderDate <= today
  // - Send notification for each
  // - Update lastReminderSentAt and nextReminderDate
};

export const getSubscriptionById = async (req, res, next) => {
  // TODO: Get single subscription details
};
