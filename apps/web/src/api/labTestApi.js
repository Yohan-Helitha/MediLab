import { apiRequest } from "./client";

export async function fetchLabTestsByLab(labId) {
  if (!labId) return [];
  try {
    return await apiRequest(`/api/lab-tests/lab/${labId}`);
  } catch (error) {
    // If no tests are found for this lab, backend returns 404.
    // Treat that as an empty list instead of an error.
    if (
      error.message &&
      (error.message.includes("No tests found for this lab") ||
        error.message.includes("Not Found"))
    ) {
      return [];
    }
    throw error;
  }
}

export function createLabTest(payload) {
  return apiRequest("/api/lab-tests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLabTestStatus(id, status) {
  return apiRequest(`/api/lab-tests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateLabTest(id, payload) {
  return apiRequest(`/api/lab-tests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteLabTest(id) {
  return apiRequest(`/api/lab-tests/${id}`, {
    method: "DELETE",
  });
}
