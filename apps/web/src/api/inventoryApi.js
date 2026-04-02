import { apiRequest } from "./client";

export function fetchInventoryStock(healthCenterId) {
	const params = new URLSearchParams();
	if (healthCenterId) {
		params.set("healthCenterId", healthCenterId);
	}
	const query = params.toString();
	const path = query ? `/api/inventory/stock?${query}` : "/api/inventory/stock";
	return apiRequest(path, {
		// credentials (e.g. auth header) are attached globally via fetch if needed
	});
}

export function restockInventory({ healthCenterId, equipmentId, quantity }) {
	return apiRequest("/api/inventory/restock", {
		method: "POST",
		body: JSON.stringify({ healthCenterId, equipmentId, quantity }),
	});
}
