import { apiRequest } from "./client";

export function fetchTestTypes() {
	return apiRequest("/api/test-types");
}

