// Lightweight API client using fetch
// Uses the auth token set by the login flows (localStorage key: "token")

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiRequest(path, options = {}) {
	const url = `${API_BASE_URL}${path}`;
	let headers = options.headers || {};
	
	// If body is NOT FormData, set JSON Content-Type
	if (!(options.body instanceof FormData)) {
		headers = {
			"Content-Type": "application/json",
			...headers,
		};
	}

	try {
		if (typeof window !== "undefined" && window.localStorage && !headers.Authorization) {
			const token = window.localStorage.getItem("token");
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
		}
	} catch {
		// Ignore localStorage access errors
	}

	const response = await fetch(url, { ...options, headers });
	if (!response.ok) {
		let message = `Request failed with status ${response.status}`;
		let errors = null;
		try {
			const data = await response.json();
			if (data && data.message) message = data.message;
			if (data && data.errors) errors = data.errors;
		} catch {
			// ignore JSON parse errors
		}
		const error = new Error(message);
		error.errors = errors;
		throw error;
	}
	return response.json();
}
