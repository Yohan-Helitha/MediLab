import { apiRequest } from "./client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ---------------------------------------------------------------------------
// File upload (staff only)
// Returns { fileName, filePath, fileSize, mimeType }
// ---------------------------------------------------------------------------
export const uploadResultFile = (formData) =>
  apiRequest("/api/results/upload-file", { method: "POST", body: formData });

// ---------------------------------------------------------------------------
// Submit new test result (staff only)
// ---------------------------------------------------------------------------
export const submitTestResult = (payload) =>
  apiRequest("/api/results", { method: "POST", body: JSON.stringify(payload) });

// ---------------------------------------------------------------------------
// Fetch results for a health centre (staff)
// params: { status, testTypeId, startDate, endDate, page, limit }
// ---------------------------------------------------------------------------
export const getResultsByHealthCenter = (healthCenterId, params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ""),
    ),
  ).toString();
  return apiRequest(
    `/api/results/health-center/${healthCenterId}${qs ? `?${qs}` : ""}`,
  );
};

// ---------------------------------------------------------------------------
// Fetch results for a patient
// params: { status, testTypeId, startDate, endDate, page, limit }
// ---------------------------------------------------------------------------
export const getPatientResults = (patientId, params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ""),
    ),
  ).toString();
  return apiRequest(`/api/results/patient/${patientId}${qs ? `?${qs}` : ""}`);
};

// ---------------------------------------------------------------------------
// Fetch unviewed results for a patient
// ---------------------------------------------------------------------------
export const getUnviewedResults = (patientId) =>
  apiRequest(`/api/results/patient/${patientId}/unviewed`);

// ---------------------------------------------------------------------------
// Fetch single result by ID
// ---------------------------------------------------------------------------
export const getResultById = (id) => apiRequest(`/api/results/${id}`);

// ---------------------------------------------------------------------------
// Fetch status history for a result
// ---------------------------------------------------------------------------
export const getStatusHistory = (id) =>
  apiRequest(`/api/results/${id}/status-history`);

// ---------------------------------------------------------------------------
// Fetch uncollected hard-copy reports
// params: { centerId, daysThreshold }
// ---------------------------------------------------------------------------
export const getUncollectedReports = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ""),
    ),
  ).toString();
  return apiRequest(`/api/results/uncollected${qs ? `?${qs}` : ""}`);
};

// ---------------------------------------------------------------------------
// Download PDF — raw fetch required to receive a Blob (not JSON)
// ---------------------------------------------------------------------------
export const downloadResultPDF = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/api/results/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let message = "Failed to download PDF";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.blob();
};

// ---------------------------------------------------------------------------
// Download a specific uploaded file by index (proxied through backend)
// ---------------------------------------------------------------------------
export const downloadUploadedFile = async (resultId, fileIndex) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${API_BASE}/api/results/${resultId}/file/${fileIndex}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    let message = "Failed to download file";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.blob();
};

// ---------------------------------------------------------------------------
// Update result data (staff)
// ---------------------------------------------------------------------------
export const updateTestResult = (id, payload) =>
  apiRequest(`/api/results/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// ---------------------------------------------------------------------------
// Change status (pending → released)
// ---------------------------------------------------------------------------
export const updateResultStatus = (id, status, changedBy) =>
  apiRequest(`/api/results/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, changedBy }),
  });

// ---------------------------------------------------------------------------
// Patient marks result as viewed
// ---------------------------------------------------------------------------
export const markAsViewed = (id, userId) =>
  apiRequest(`/api/results/${id}/mark-viewed`, {
    method: "PATCH",
    body: JSON.stringify({ userId }),
  });

// ---------------------------------------------------------------------------
// Staff marks hard copy as printed
// ---------------------------------------------------------------------------
export const markAsPrinted = (id) =>
  apiRequest(`/api/results/${id}/mark-printed`, { method: "PATCH" });

// ---------------------------------------------------------------------------
// Staff marks hard copy as collected
// ---------------------------------------------------------------------------
export const markAsCollected = (id) =>
  apiRequest(`/api/results/${id}/mark-collected`, { method: "PATCH" });

// ---------------------------------------------------------------------------
// Soft delete result (staff)
// ---------------------------------------------------------------------------
export const softDeleteResult = (id, deleteReason) =>
  apiRequest(`/api/results/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ deleteReason }),
  });

// ---------------------------------------------------------------------------
// Hard delete result (Admin only — permanent)
// ---------------------------------------------------------------------------
export const hardDeleteResult = (id, deleteReason) =>
  apiRequest(`/api/results/${id}/permanent`, {
    method: "DELETE",
    body: JSON.stringify({ deleteReason }),
  });

// ---------------------------------------------------------------------------
// Get all results across health centers (Admin only)
// params: { healthCenterId, status, startDate, endDate, includeDeleted, limit, page }
// ---------------------------------------------------------------------------
export const getAllResultsAdmin = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== ""),
    ),
  ).toString();
  return apiRequest(`/api/results/admin${qs ? `?${qs}` : ""}`);
};
