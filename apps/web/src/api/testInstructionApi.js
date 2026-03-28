import { apiRequest } from "./client";

export async function fetchTestInstructions() {
  try {
    return await apiRequest("/api/test-instructions");
  } catch (error) {
    // Treat "No test instructions found" as empty list
    if (error.message && error.message.includes("No test instructions found")) {
      return [];
    }
    throw error;
  }
}

export function createTestInstruction(payload) {
  return apiRequest("/api/test-instructions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTestInstruction(id, payload) {
  return apiRequest(`/api/test-instructions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTestInstruction(id) {
  return apiRequest(`/api/test-instructions/${id}`, {
    method: "DELETE",
  });
}
