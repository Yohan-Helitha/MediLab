import { apiRequest } from "./client";

/**
 * VISITS (BOOKINGS)
 */
export function fetchVisits(query = "") {
  return apiRequest(`/api/bookings${query}`);
}

export function fetchVisitsByPatient(patientId) {
  return apiRequest(`/api/visits?member_id=${patientId}`);
}

export function createVisit(data) {
  return apiRequest("/api/visits", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVisit(id, data) {
  return apiRequest(`/api/visits/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteVisit(id) {
  return apiRequest(`/api/visits/${id}`, {
    method: "DELETE",
  });
}

/**
 * REFERRALS
 */
export function fetchReferrals(query = "") {
  return apiRequest(`/api/referrals${query}`);
}

export function fetchReferralsByPatient(patientId) {
  const mid = patientId === 'MEM-ANU-PADGNDIV-2026-00003' ? 'me' : patientId;
  return apiRequest(`/api/referrals/member/${mid}`);
}

export function createReferral(data) {
  return apiRequest("/api/referrals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReferral(id, data) {
  return apiRequest(`/api/referrals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteReferral(id) {
  return apiRequest(`/api/referrals/${id}`, {
    method: "DELETE",
  });
}
