import express from "express";
import * as notificationController from "./notification.controller.js";
import * as validation from "./notification.validation.js";

const router = express.Router();

// ===== NOTIFICATION LOG ROUTES =====

// Send notifications
router.post(
  "/send/result-ready",
  validation.sendResultReadyValidation,
  notificationController.sendResultReadyNotification,
);
router.post(
  "/send/unviewed-reminder",
  notificationController.sendUnviewedResultReminder,
);
router.post(
  "/send/routine-reminder",
  validation.sendRoutineReminderValidation,
  notificationController.sendRoutineCheckupReminder,
);
router.post(
  "/:id/resend",
  validation.idParamValidation,
  notificationController.resendNotification,
);

// Get notification logs
router.get(
  "/patient/:patientId",
  validation.patientIdParamValidation,
  validation.notificationHistoryQueryValidation,
  notificationController.getNotificationHistory,
);
router.get(
  "/failed",
  validation.failedNotificationsQueryValidation,
  notificationController.getFailedNotifications,
);
router.get(
  "/:id",
  validation.idParamValidation,
  notificationController.getNotificationById,
);

// ===== REMINDER SUBSCRIPTION ROUTES =====

// Subscription management
router.post(
  "/subscriptions",
  validation.subscribeValidation,
  notificationController.subscribeToReminder,
);
router.delete(
  "/subscriptions/:id",
  validation.subscriptionIdParamValidation,
  notificationController.unsubscribeFromReminder,
);
router.get(
  "/subscriptions/patient/:patientId",
  validation.patientIdParamValidation,
  notificationController.getPatientSubscriptions,
);
router.get(
  "/subscriptions/:id",
  validation.subscriptionIdParamValidation,
  notificationController.getSubscriptionById,
);
router.put(
  "/subscriptions/:id",
  validation.subscriptionIdParamValidation,
  validation.updateSubscriptionValidation,
  notificationController.updateSubscription,
);

export default router;
