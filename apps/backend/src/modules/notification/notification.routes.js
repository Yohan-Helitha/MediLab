import express from "express";
import * as notificationController from "./notification.controller.js";

const router = express.Router();

// ===== NOTIFICATION LOG ROUTES =====

// Send notifications
router.post(
  "/send/result-ready",
  notificationController.sendResultReadyNotification,
);
router.post(
  "/send/unviewed-reminder",
  notificationController.sendUnviewedResultReminder,
);
router.post("/:id/resend", notificationController.resendNotification);

// Get notification logs
router.get("/logs", notificationController.getNotificationHistory);
router.get("/logs/:id", notificationController.getNotificationById);

// ===== REMINDER SUBSCRIPTION ROUTES =====

// Subscription management
router.post("/subscriptions", notificationController.subscribeToReminder);
router.delete(
  "/subscriptions/:id",
  notificationController.unsubscribeFromReminder,
);
router.get(
  "/subscriptions/patient/:patientId",
  notificationController.getPatientSubscriptions,
);
router.get("/subscriptions/:id", notificationController.getSubscriptionById);
router.patch("/subscriptions/:id", notificationController.updateSubscription);

// Cron job endpoint (should be protected/internal only)
router.post(
  "/cron/send-due-reminders",
  notificationController.sendDueReminders,
);

export default router;
