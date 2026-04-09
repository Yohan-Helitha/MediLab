import { apiRequest } from "./client";

export async function fetchAdminOverview({ windowHours = 24, limit = 3 } = {}) {
	const params = new URLSearchParams();
	if (windowHours != null) params.set("windowHours", String(windowHours));
	if (limit != null) params.set("limit", String(limit));
	const qs = params.toString();
	return apiRequest(`/api/admin/overview${qs ? `?${qs}` : ""}`);
}
