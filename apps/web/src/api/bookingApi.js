import { apiRequest } from "./client";

export function createBooking(payload) {
	return apiRequest("/api/bookings", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function createPayHereCheckout({ bookingId }) {
	return apiRequest("/api/payments/payhere/checkout", {
		method: "POST",
		body: JSON.stringify({ bookingId }),
	});
}

export function getBookingsByPatientId(patientProfileId) {
	if (!patientProfileId) {
		throw new Error("patientProfileId is required");
	}
	return apiRequest(`/api/bookings/patient/${patientProfileId}`);
}

export function updateBooking(bookingId, payload) {
	if (!bookingId) {
		throw new Error("bookingId is required");
	}
	return apiRequest(`/api/bookings/${bookingId}`,
		{
			method: "PUT",
			body: JSON.stringify(payload || {}),
		}
	);
}

export function softDeleteBooking(bookingId) {
	if (!bookingId) {
		throw new Error("bookingId is required");
	}
	return apiRequest(`/api/bookings/${bookingId}`,
		{
			method: "DELETE",
		}
	);
}

export function hardDeleteBooking(bookingId) {
	if (!bookingId) {
		throw new Error("bookingId is required");
	}
	return apiRequest(`/api/bookings/${bookingId}/hard`, {
		method: "DELETE",
	});
}

export function getBookingById(bookingId) {
	if (!bookingId) {
		throw new Error("bookingId is required");
	}
	return apiRequest(`/api/bookings/${bookingId}`);
}
