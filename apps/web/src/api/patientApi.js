import { apiRequest } from "./client";

export function fetchLabs() {
  return apiRequest("/api/labs");
}

export function fetchLabById(id) {
  return apiRequest(`/api/labs/${id}`);
}

export function fetchTestTypes() {
  return apiRequest(`/api/test-types`);
}

export async function fetchLabTestsByLab(labId) {
  if (!labId) return [];
  try {
    return await apiRequest(`/api/lab-tests/lab/${labId}`);
  } catch (error) {
    // Backend returns 404 when a lab has no assigned tests.
    // For patient pages, treat it as an empty list.
    if (
      error?.message &&
      (error.message.includes("No tests found for this lab") ||
        error.message.includes("Not Found"))
    ) {
      return [];
    }
    throw error;
  }
}

export function fetchTestInstructionsByDiagnosticTest(diagnosticTestId) {
	return apiRequest(`/api/test-instructions/diagnostic-test/${diagnosticTestId}`);
}
