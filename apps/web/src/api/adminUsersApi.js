import { apiRequest } from "./client";

export function fetchAdminUsers({ role } = {}) {
	const qs = new URLSearchParams();
	if (role && role !== "All") qs.set("role", role);
	const suffix = qs.toString();
	return apiRequest(`/api/admin/users${suffix ? `?${suffix}` : ""}`);
}
