import { apiRequest } from "./client";

export function fetchLabs() {
	return apiRequest("/api/labs");
}

export function createLab(payload) {
	return apiRequest("/api/labs", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function updateLab(id, payload) {
	return apiRequest(`/api/labs/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}


