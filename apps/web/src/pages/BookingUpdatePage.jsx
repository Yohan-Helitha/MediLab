import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import { useAuth } from "../context/AuthContext";
import { getBookingsByPatientId, updateBooking, createPayHereCheckout } from "../api/bookingApi";

function postToPayHere(checkoutUrl, fields) {
	const form = document.createElement("form");
	form.method = "POST";
	form.action = checkoutUrl;

	Object.entries(fields || {}).forEach(([key, value]) => {
		const input = document.createElement("input");
		input.type = "hidden";
		input.name = key;
		input.value = value == null ? "" : String(value);
		form.appendChild(input);
	});

	document.body.appendChild(form);
	form.submit();
}

function BookingUpdatePage() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();
	const { user } = useAuth();

	function normalizeTimeSlotValue(value) {
		if (!value || typeof value !== "string") return "";
		const trimmed = value.trim();
		if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
		const parts = trimmed.split("-");
		const first = (parts[0] || "").trim();
		return /^\d{2}:\d{2}$/.test(first) ? first : "";
	}

	const patientProfileId = user?.profile?._id || null;
	const [booking, setBooking] = useState(location.state?.booking || null);
	const bookingId = booking?._id || params?.id || null;

	const testName =
		booking?.diagnosticTestId?.name || booking?.testNameSnapshot || "";
	const centerName =
		booking?.healthCenterId?.name || booking?.centerNameSnapshot || "";

	const initialDate = useMemo(() => {
		const raw = booking?.bookingDate;
		if (!raw) return "";
		const d = new Date(raw);
		if (Number.isNaN(d.getTime())) return "";
		// YYYY-MM-DD for <input type="date"/>
		return d.toISOString().slice(0, 10);
	}, [booking?.bookingDate]);

	const [formData, setFormData] = useState({
		bookingDate: initialDate,
		timeSlot: normalizeTimeSlotValue(booking?.timeSlot || ""),
		bookingType: booking?.bookingType || "PRE_BOOKED",
		priorityLevel: booking?.priorityLevel || "NORMAL",
		paymentMethod: booking?.paymentMethod || "ONLINE",
	});

	const isWalkIn = formData.bookingType === "WALK_IN";

	useEffect(() => {
		setFormData({
			bookingDate: initialDate,
			timeSlot: normalizeTimeSlotValue(booking?.timeSlot || ""),
			bookingType: booking?.bookingType || "PRE_BOOKED",
			priorityLevel: booking?.priorityLevel || "NORMAL",
			paymentMethod: booking?.paymentMethod || "ONLINE",
		});
	}, [booking, initialDate]);

	const selectedOperatingHours = useMemo(() => {
		const hours = booking?.healthCenterId?.operatingHours;
		if (!Array.isArray(hours) || hours.length === 0) return null;
		if (!formData.bookingDate) return hours[0] || null;
		const d = new Date(formData.bookingDate);
		if (Number.isNaN(d.getTime())) return hours[0] || null;
		const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
		const byDay = hours.find(
			(h) =>
				typeof h?.day === "string" &&
				h.day.trim().toLowerCase() === weekday.toLowerCase(),
		);
		return byDay || hours[0] || null;
	}, [booking?.healthCenterId?.operatingHours, formData.bookingDate]);

	const openTime = selectedOperatingHours?.openTime || "";
	const closeTime = selectedOperatingHours?.closeTime || "";

	const validateTimeSlot = (value) => {
		if (!value) return true;
		if (!openTime || !closeTime) return true;
		return value >= openTime && value <= closeTime;
	};

	useEffect(() => {
		if (isWalkIn && formData.paymentMethod !== "CASH") {
			setFormData((prev) => ({ ...prev, paymentMethod: "CASH" }));
		}
	}, [isWalkIn, formData.paymentMethod]);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			// If navigation state didn't include booking, try to load it by id.
			if (!booking && bookingId && patientProfileId) {
				try {
					const data = await getBookingsByPatientId(patientProfileId);
					const payload = data?.bookings;
					const list = Array.isArray(payload)
						? payload
						: Array.isArray(payload?.bookings)
							? payload.bookings
							: [];
					const found = (list || []).find((x) => x?._id === bookingId) || null;
					if (!cancelled) setBooking(found);
				} catch {
					// ignore; we'll redirect below
				}
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [booking, bookingId, patientProfileId]);

	useEffect(() => {
		if (!bookingId) {
			navigate("/booking", { replace: true });
			return;
		}
		if (!booking && !location.state?.booking) {
			// Wait for load effect to try.
			return;
		}
		if (!booking) {
			navigate("/booking", { replace: true });
			return;
		}
		const status = (booking?.status || "").toString().toUpperCase();
		if (status === "COMPLETED") {
			navigate("/booking", { replace: true });
		}
	}, [booking, bookingId, location.state, navigate]);

	const onNavigate = (name, params2 = {}) => {
		switch (name) {
			case "home":
				navigate("/");
				return;
			case "health-centers":
				navigate("/health-centers");
				return;
			case "lab": {
				const labId = params2?.labId;
				if (labId) navigate(`/labs/${labId}`);
				return;
			}
			default:
				return;
		}
	};

	const setField = (name, value) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const submit = async ({ continueToPayment, e } = {}) => {
		if (e && typeof e.preventDefault === "function") e.preventDefault();
		setError("");

		if (!bookingId) {
			setError("Missing booking id.");
			return;
		}
		if (!formData.bookingDate) {
			setError("Please select a booking date.");
			return;
		}
		if (formData.timeSlot && !validateTimeSlot(formData.timeSlot)) {
			setError("Selected time is outside lab opening hours.");
			return;
		}

		setLoading(true);
		try {
			const payload = {
				bookingDate: formData.bookingDate,
				timeSlot: normalizeTimeSlotValue(formData.timeSlot) || undefined,
				bookingType: formData.bookingType,
				priorityLevel: formData.priorityLevel,
				paymentMethod: isWalkIn ? "CASH" : formData.paymentMethod,
			};

			await updateBooking(bookingId, payload);

			// Continue to PayHere ONLY when the user chose the payment flow.
			if (continueToPayment && !isWalkIn && formData.paymentMethod === "ONLINE") {
				const checkout = await createPayHereCheckout({ bookingId });
				if (!checkout?.checkoutUrl || !checkout?.fields) {
					throw new Error("Failed to create PayHere checkout payload");
				}
				postToPayHere(checkout.checkoutUrl, checkout.fields);
				return;
			}

			navigate("/booking", { replace: true });
		} catch (err) {
			setError(err?.message || "Failed to update booking");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (e) => submit({ continueToPayment: true, e });
	const handleSave = () => submit({ continueToPayment: false });

	return (
		<PublicLayout onNavigate={onNavigate}>
			<div className="space-y-6">
				<div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
					<div className="h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-400" />
					<div className="p-6 md:p-7">
						<h1 className="text-2xl font-semibold text-slate-900">Update Booking</h1>
						<p className="mt-1 text-sm text-slate-600">
							Update booking details, then continue to payment.
						</p>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 md:p-7 space-y-6"
				>
					<section className="space-y-3">
						<h2 className="text-sm font-semibold text-slate-800">Selected Test</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
									Health Center
								</label>
								<input
									value={centerName || "-"}
									readOnly
									className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
									Test
								</label>
								<input
									value={testName || "-"}
									readOnly
									className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
								/>
							</div>
						</div>
					</section>

					<section className="space-y-3">
						<h2 className="text-sm font-semibold text-slate-800">Booking Details</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
									Booking Type
								</label>
								<select
									value={formData.bookingType}
									onChange={(e) => setField("bookingType", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								>
									<option value="PRE_BOOKED">Pre-booked</option>
									<option value="WALK_IN">Walk-in</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
									Booking Date
								</label>
								<input
									type="date"
									value={formData.bookingDate}
									onChange={(e) => setField("bookingDate", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
									Time Slot (optional)
								</label>
								<input
									type="time"
									value={formData.timeSlot}
									min={openTime || undefined}
									max={closeTime || undefined}
									step={900}
									onChange={(e) => {
										const next = e.target.value;
										if (!next) {
											setError("");
											setField("timeSlot", "");
											return;
										}
										if (!validateTimeSlot(next)) {
											setError("Selected time is outside lab opening hours.");
											return;
										}
										setError("");
										setField("timeSlot", next);
									}}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
									Priority
								</label>
								<select
									value={formData.priorityLevel}
									onChange={(e) => setField("priorityLevel", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								>
									<option value="NORMAL">Normal</option>
									<option value="ELDERLY">Elderly</option>
									<option value="PREGNANT">Pregnant</option>
									<option value="URGENT">Urgent</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
									Payment Method
								</label>
								<select
									value={formData.paymentMethod}
									onChange={(e) => setField("paymentMethod", e.target.value)}
									disabled={isWalkIn}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:opacity-70"
								>
									<option value="ONLINE">Online (PayHere)</option>
									<option value="CASH">Cash (pay at center)</option>
								</select>
							</div>
						</div>
					</section>

					{error ? <div className="text-sm text-rose-600">{error}</div> : null}

					<div className="flex flex-wrap items-center gap-3">
						<button
							type="submit"
							disabled={loading}
							className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
						>
							{loading ? "Processing..." : "Update & Continue to Payment"}
						</button>

						<button
							type="button"
							onClick={() => navigate("/booking")}
							className="rounded-full bg-slate-100 px-6 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
						>
							Back
						</button>

						<div className="flex-1" />

						<button
							type="button"
							disabled={loading}
							onClick={handleSave}
							className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
						>
							{loading ? "Processing..." : "Save Booking"}
						</button>
					</div>
				</form>
			</div>
		</PublicLayout>
	);
}

export default BookingUpdatePage;
