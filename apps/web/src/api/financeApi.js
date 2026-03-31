import { apiRequest } from "./client";

export function fetchFinanceSummary({ startDate, endDate } = {}) {
	const params = new URLSearchParams();
	if (startDate) params.set("startDate", startDate);
	if (endDate) params.set("endDate", endDate);

	const query = params.toString();
	const path = query ? `/api/finance/summary?${query}` : "/api/finance/summary";
	return apiRequest(path);
}

export function fetchRecentPayments({ limit } = {}) {
	const params = new URLSearchParams();
	if (limit) params.set("limit", String(limit));

	const query = params.toString();
	const path = query
		? `/api/finance/recent-payments?${query}`
		: "/api/finance/recent-payments";

	return apiRequest(path);
}

export function fetchPayments({ paymentMethod, limit } = {}) {
	const params = new URLSearchParams();
	if (paymentMethod) params.set("paymentMethod", paymentMethod);
	if (limit) params.set("limit", String(limit));

	const query = params.toString();
	const path = query ? `/api/finance/payments?${query}` : "/api/finance/payments";

	return apiRequest(path);
}

export function fetchUnpaidBookings({ paymentMethod, limit } = {}) {
	const params = new URLSearchParams();
	if (paymentMethod) params.set("paymentMethod", paymentMethod);
	if (limit) params.set("limit", String(limit));

	const query = params.toString();
	const path = query
		? `/api/finance/unpaid-bookings?${query}`
		: "/api/finance/unpaid-bookings";

	return apiRequest(path);
}

export function recordCashPayment({ bookingId, amount, notes } = {}) {
	return apiRequest("/api/finance/payments/cash", {
		method: "POST",
		body: JSON.stringify({ bookingId, amount, notes }),
	});
}
