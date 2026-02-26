import express from "express";
import * as notificationController from "./notification.controller.js";
import * as validation from "./notification.validation.js";
import {
  authenticate,
  isPatient,
  isHealthOfficer,
} from "../auth/auth.middleware.js";

const router = express.Router();

// ===== NOTIFICATION LOG ROUTES =====

// Send notifications (Health Officer only)
router.post(
  "/send/result-ready",
  authenticate,
  isHealthOfficer,
  validation.sendResultReadyValidation,
  notificationController.sendResultReadyNotification,
);
router.post(
  "/send/unviewed-reminder",
  authenticate,
  isHealthOfficer,
  notificationController.sendUnviewedResultReminder,
);
router.post(
  "/send/routine-reminder",
  authenticate,
  isHealthOfficer,
  validation.sendRoutineReminderValidation,
  notificationController.sendRoutineCheckupReminder,
);
router.post(
  "/:id/resend",
  authenticate,
  isHealthOfficer,
  validation.idParamValidation,
  notificationController.resendNotification,
);

// Get notification logs (Patient can view own, Health Officer can view all)
router.get(
  "/patient/:patientId",
  authenticate,
  validation.patientIdParamValidation,
  validation.notificationHistoryQueryValidation,
  notificationController.getNotificationHistory,
);
router.get(
  "/failed",
  authenticate,
  isHealthOfficer,
  validation.failedNotificationsQueryValidation,
  notificationController.getFailedNotifications,
);
router.get(
  "/:id",
  authenticate,
  isHealthOfficer,
  validation.idParamValidation,
  notificationController.getNotificationById,
);

// ===== REMINDER SUBSCRIPTION ROUTES =====

// Subscription management (Patient only - own subscriptions)
router.post(
  "/subscriptions",
  authenticate,
  isPatient,
  validation.subscribeValidation,
  notificationController.subscribeToReminder,
);
router.delete(
  "/subscriptions/:id",
  authenticate,
  isPatient,
  validation.subscriptionIdParamValidation,
  notificationController.unsubscribeFromReminder,
);
router.get(
  "/subscriptions/patient/:patientId",
  authenticate,
  isPatient,
  validation.patientIdParamValidation,
  notificationController.getPatientSubscriptions,
);
router.get(
  "/subscriptions/:id",
  authenticate,
  isPatient,
  validation.subscriptionIdParamValidation,
  notificationController.getSubscriptionById,
);
router.put(
  "/subscriptions/:id",
  authenticate,
  isPatient,
  validation.subscriptionIdParamValidation,
  validation.updateSubscriptionValidation,
  notificationController.updateSubscription,
);

export default router;
