import { apiRequest } from "./client";

// ---------------------------------------------------------------------------
// Notification history for a patient
// params: { limit, page }
// ---------------------------------------------------------------------------
export const getPatientNotifications = (patientId, params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
  ).toString();
  return apiRequest(`/api/notifications/patient/${patientId}${qs ? `?${qs}` : ""}`);
};

// ---------------------------------------------------------------------------
// Create a routine-monitoring subscription
// payload: { patientProfileId, testTypeId, lastTestDate }
// ---------------------------------------------------------------------------
export const subscribeToReminder = (payload) =>
  apiRequest("/api/notifications/subscriptions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ---------------------------------------------------------------------------
// Get all subscriptions for a patient
// ---------------------------------------------------------------------------
export const getPatientSubscriptions = (patientId) =>
  apiRequest(`/api/notifications/subscriptions/patient/${patientId}`);

// ---------------------------------------------------------------------------
// Delete (cancel) a subscription
// ---------------------------------------------------------------------------
export const unsubscribeFromReminder = (subscriptionId) =>
  apiRequest(`/api/notifications/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  });

// ---------------------------------------------------------------------------
// Failed notifications (admin/staff use)
// params: { limit, page }
// ---------------------------------------------------------------------------
export const getFailedNotifications = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
  ).toString();
  return apiRequest(`/api/notifications/failed${qs ? `?${qs}` : ""}`);
};

// ---------------------------------------------------------------------------
// Resend a failed notification (staff use)
// ---------------------------------------------------------------------------
export const resendNotification = (notificationId) =>
  apiRequest(`/api/notifications/${notificationId}/resend`, { method: "POST" });

// ---------------------------------------------------------------------------
// All notification logs – staff view (no patient filter)
// params: { limit, status, type, channel }
// ---------------------------------------------------------------------------
export const getAllNotifications = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
  ).toString();
  return apiRequest(`/api/notifications${qs ? `?${qs}` : ""}`);
};
