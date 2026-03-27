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
  return apiRequest(`/api/lab-tests/lab/${labId}`);
}
