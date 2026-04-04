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
