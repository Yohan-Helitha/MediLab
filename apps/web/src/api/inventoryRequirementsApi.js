import { apiRequest } from "./client";

export function fetchTestEquipmentRequirements(testTypeId) {
	const params = new URLSearchParams();
	params.set("testTypeId", testTypeId);
	return apiRequest(`/api/inventory/requirements?${params.toString()}`);
}

export function upsertTestEquipmentRequirement({ id, testTypeId, equipmentId, quantityPerTest, isActive }) {
	const payload = { testTypeId, equipmentId, quantityPerTest, isActive };
	if (id) {
		return apiRequest(`/api/inventory/requirements/${id}`, {
			method: "PUT",
			body: JSON.stringify(payload),
		});
	}
	return apiRequest("/api/inventory/requirements", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function deactivateTestEquipmentRequirement(id) {
	return apiRequest(`/api/inventory/requirements/${id}`, {
		method: "DELETE",
	});
}
