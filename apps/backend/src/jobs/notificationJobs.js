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
        // Map populated patientProfileId (snake_case Mongoose doc) to camelCase for service
        const patientDoc = subscription.patientProfileId;
        const patient = {
          _id: patientDoc._id,
          fullName: patientDoc.full_name,
          contactNumber: patientDoc.contact_number,
          email: patientDoc.email,
        };

        const results = await notificationService.sendRoutineCheckupReminder({
          subscription,
          patient,
          testType: subscription.testTypeId,
        });

        // Check if at least one notification was sent successfully
        if (results.whatsapp?.success || results.email?.success) {
          successCount++;
        } else {
          failureCount++;
        }

        console.log(
          `✅ Reminder sent for subscription ${subscription._id}: WhatsApp=${results.whatsapp?.success}, Email=${results.email?.success}`,
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
    // Find test results released more than 3 days ago with no views
    const unviewedResults = await notificationService.findUnviewedResults(3, 2);

    console.log(
      `🔍 Found ${unviewedResults.length} unviewed results to remind`,
    );

    let successCount = 0;
    let failCount = 0;

    // Send reminder for each unviewed result
    for (const data of unviewedResults) {
      try {
        const results =
          await notificationService.sendUnviewedResultReminder(data);

        // Check if at least one notification sent successfully
        if (results.whatsapp?.success || results.email?.success) {
          successCount++;
          console.log(
            `✅ Reminder sent for result ${data.testResult._id} (${data.daysUnviewed} days unviewed)`,
          );
        } else {
          failCount++;
          console.log(
            `❌ Failed to send reminder for result ${data.testResult._id}`,
          );
        }
      } catch (error) {
        failCount++;
        console.error(
          `❌ Error sending reminder for result ${data.testResult._id}:`,
          error.message,
        );
      }
    }

    console.log(
      `🔔 Unviewed reminders job completed: ${successCount} sent, ${failCount} failed`,
    );

    return {
      success: true,
      totalFound: unviewedResults.length,
      sent: successCount,
      failed: failCount,
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
 * Send reminders for printed hard copy reports not yet collected (older than 3 days)
 * This should be run daily
 */
export const sendUncollectedHardCopyReminders = async () => {
  console.log("🔔 Running scheduled job: Send uncollected hard copy reminders");

  try {
    const uncollectedItems =
      await notificationService.findUncollectedHardCopies(3, 2);

    console.log(
      `🔍 Found ${uncollectedItems.length} uncollected hard copies to remind`,
    );

    let successCount = 0;
    let failCount = 0;

    for (const data of uncollectedItems) {
      try {
        const results =
          await notificationService.sendUncollectedHardCopyReminder(data);

        if (results.whatsapp?.success || results.email?.success) {
          successCount++;
          console.log(
            `✅ Reminder sent for result ${data.testResult._id} (${data.daysSincePrinting} days since printing)`,
          );
        } else {
          failCount++;
          console.log(
            `❌ Failed to send reminder for result ${data.testResult._id}`,
          );
        }
      } catch (error) {
        failCount++;
        console.error(
          `❌ Error sending reminder for result ${data.testResult._id}:`,
          error.message,
        );
      }
    }

    console.log(
      `🔔 Uncollected hard copy reminders job completed: ${successCount} sent, ${failCount} failed`,
    );

    return {
      success: true,
      totalFound: uncollectedItems.length,
      sent: successCount,
      failed: failCount,
    };
  } catch (error) {
    console.error("❌ Error in sendUncollectedHardCopyReminders job:", error);
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
export const setupScheduledJobs = async () => {
  try {
    // Dynamically import node-cron
    const cron = (await import("node-cron")).default;

    // Run sendDueReminders every day at 8:00 AM
    cron.schedule("0 8 * * *", async () => {
      console.log("⏰ Cron: Sending due reminders");
      await sendDueReminders();
    });

    // Run sendUnviewedResultReminders every day at 10:00 AM
    cron.schedule("0 10 * * *", async () => {
      console.log("⏰ Cron: Sending unviewed result reminders");
      await sendUnviewedResultReminders();
    });

    // Run sendUncollectedHardCopyReminders every day at 3:00 PM
    cron.schedule("0 15 * * *", async () => {
      console.log("⏰ Cron: Sending uncollected hard copy reminders");
      await sendUncollectedHardCopyReminders();
    });

    console.log("✅ Scheduled notification jobs initialized");
    console.log("   - Due reminders: Daily at 8:00 AM");
    console.log("   - Unviewed result reminders: Daily at 10:00 AM");
    console.log("   - Uncollected hard copy reminders: Daily at 3:00 PM");
  } catch (error) {
    console.error("❌ Failed to setup scheduled jobs:", error.message);
  }
};

export default {
  sendDueReminders,
  sendUnviewedResultReminders,
  sendUncollectedHardCopyReminders,
  setupScheduledJobs,
};
