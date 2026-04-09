import { apiRequest } from "./client";

export function fetchEquipment() {
	return apiRequest("/api/equipment");
}

export function createEquipment(payload) {
	return apiRequest("/api/equipment", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function updateEquipment(id, payload) {
	return apiRequest(`/api/equipment/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export function softDeleteEquipment(id) {
	return apiRequest(`/api/equipment/${id}`, {
		method: "DELETE",
	});
}
