// Lightweight API client using fetch
// Uses the auth token set by the login flows (localStorage key: "token")

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function buildHeaders(customHeaders = {}) {
	const headers = {
		"Content-Type": "application/json",
		...customHeaders,
	};

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

	return headers;
}

export async function apiRequest(path, options = {}) {
	const url = `${API_BASE_URL}${path}`;
	const headers = buildHeaders(options.headers || {});

	const response = await fetch(url, { ...options, headers });
	if (!response.ok) {
		let message = `Request failed with status ${response.status}`;
		try {
			const data = await response.json();
			if (data && data.message) message = data.message;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(message);
	}
	return response.json();
}
