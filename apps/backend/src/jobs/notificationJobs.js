// Scheduled Jobs for Notification Module
// Automated tasks for sending reminders and checking unviewed results

import * as notificationService from "../modules/notification/notification.service.js";

/**
 * Send routine checkup reminders for subscriptions due today
 * This should be run daily (e.g., at 8:00 AM)
 */
export const sendDueReminders = async () => {
  console.log("🔔 Running scheduled job: Send due reminders");

  try {
    // Find subscriptions that are due today
    const dueSubscriptions =
      await notificationService.findSubscriptionsDueToday();

    console.log(`Found ${dueSubscriptions.length} subscriptions due today`);

    let successCount = 0;
    let failureCount = 0;

    // Send reminder for each subscription
    for (const subscription of dueSubscriptions) {
      try {
        const results = await notificationService.sendRoutineCheckupReminder({
          subscription,
          patient: subscription.patientProfileId,
          testType: subscription.testTypeId,
        });

        // Check if at least one notification was sent successfully
        if (results.sms?.success || results.email?.success) {
          successCount++;
        } else {
          failureCount++;
        }

        console.log(
          `✅ Reminder sent for subscription ${subscription._id}: SMS=${results.sms?.success}, Email=${results.email?.success}`,
        );
      } catch (error) {
        failureCount++;
        console.error(
          `❌ Failed to send reminder for subscription ${subscription._id}:`,
          error.message,
        );
      }
    }

    console.log(
      `🔔 Job completed: ${successCount} successful, ${failureCount} failed`,
    );

    return {
      success: true,
      totalSubscriptions: dueSubscriptions.length,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error("❌ Error in sendDueReminders job:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send reminders for unviewed test results (older than 3 days)
 * This should be run daily
 */
export const sendUnviewedResultReminders = async () => {
  console.log("🔔 Running scheduled job: Send unviewed result reminders");

  try {
    // TODO: Implement logic to find and remind patients about unviewed results
    // 1. Find test results released more than 3 days ago
    // 2. Check if patient has viewed them (viewedBy array)
    // 3. Send reminder notification
    // 4. Track reminder count to avoid spamming (max 2 reminders)

    console.log("🔔 Job completed");

    return {
      success: true,
      message: "Feature not yet implemented",
    };
  } catch (error) {
    console.error("❌ Error in sendUnviewedResultReminders job:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Setup cron jobs (to be called on server startup)
 * Uses node-cron for scheduling
 */
export const setupScheduledJobs = () => {
  // Note: To use this with cron, install: npm install node-cron
  // Then uncomment and use:

  /*
  import cron from 'node-cron';
  
  // Run sendDueReminders every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Cron: Sending due reminders');
    await sendDueReminders();
  });
  
  // Run sendUnviewedResultReminders every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Cron: Sending unviewed result reminders');
    await sendUnviewedResultReminders();
  });
  
  console.log('✅ Scheduled jobs initialized');
  */

  console.log(
    "⚠️  Scheduled jobs setup skipped. Install node-cron and uncomment code to enable.",
  );
};

export default {
  sendDueReminders,
  sendUnviewedResultReminders,
  setupScheduledJobs,
};
