// Lightweight API client using fetch
// Configure VITE_API_BASE_URL in your root .env (e.g. http://localhost:5000)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiRequest(path, options = {}) {
	const url = `${API_BASE_URL}${path}`;
	const headers = {
		"Content-Type": "application/json",
		...(options.headers || {}),
	};

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

