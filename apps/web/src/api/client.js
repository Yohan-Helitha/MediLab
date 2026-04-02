// Lightweight API client using fetch
// Configure VITE_API_BASE_URL in your root .env (e.g. http://localhost:5000)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiRequest(path, options = {}) {
	const url = `${API_BASE_URL}${path}`;
	
	const token = localStorage.getItem("token");
	const headers = {
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...(options.headers || {}),
	};

	// Only add Content-Type: application/json if we are not sending FormData
	if (!(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
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

