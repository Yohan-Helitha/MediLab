import { apiRequest } from "./client";

export function fetchTests() {
	return apiRequest("/api/test-types");
}

export function createTest(payload) {
	return apiRequest("/api/test-types", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function updateTest(id, payload) {
	return apiRequest(`/api/test-types/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export function deleteTest(id) {
	return apiRequest(`/api/test-types/${id}`, {
		method: "DELETE",
	});
}

