import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import { useAuth } from "../context/AuthContext";
import { createBooking, createPayHereCheckout } from "../api/bookingApi";

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

function BookingCreatePage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();

	const state = location.state || {};
	const lab = state.lab || null;
	const labTest = state.labTest || null;

	const patientProfile = user?.profile || null;
	const patientProfileId = patientProfile?._id || null;

	const testName =
		labTest?.diagnosticTestId?.name || labTest?.diagnosticTestId?.name || labTest?.testName || "";
	const diagnosticTestId =
		labTest?.diagnosticTestId?._id || labTest?.diagnosticTestId || null;
	const healthCenterId = lab?._id || labTest?.labId || null;
	const centerName = lab?.name || "";
	const price = useMemo(() => {
		const p = labTest?.price;
		if (p == null) return null;
		const n = Number(p);
		return Number.isNaN(n) ? null : n;
	}, [labTest]);

	const [formData, setFormData] = useState({
		bookingDate: "",
		timeSlot: "",
		bookingType: "PRE_BOOKED",
		priorityLevel: "NORMAL",
		paymentMethod: "ONLINE",
	});

	const isWalkIn = formData.bookingType === "WALK_IN";

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const selectedOperatingHours = useMemo(() => {
		const hours = lab?.operatingHours;
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
	}, [lab?.operatingHours, formData.bookingDate]);

	const openTime = selectedOperatingHours?.openTime || "";
	const closeTime = selectedOperatingHours?.closeTime || "";

	useEffect(() => {
		// If user opened this page directly, force them back to labs.
		if (!labTest || !diagnosticTestId || !healthCenterId) {
			// Avoid redirect loop if already on home.
			navigate("/health-centers", { replace: true });
		}
	}, [diagnosticTestId, healthCenterId, labTest, navigate]);

	const onNavigate = (name, params = {}) => {
		switch (name) {
			case "home":
				navigate("/");
				return;
			case "health-centers":
				navigate("/health-centers");
				return;
			case "lab": {
				const labId = params?.labId;
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

	const submit = async ({ continueToPayment, e } = {}) => {
		if (e && typeof e.preventDefault === "function") e.preventDefault();
		setError("");

		if (!patientProfileId) {
			setError("Patient profile not found. Please log in again.");
			return;
		}
		if (!healthCenterId || !diagnosticTestId) {
			setError("Missing test selection. Please select a lab test again.");
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
			const bookingPayload = {
				patientProfileId,
				healthCenterId,
				diagnosticTestId,
				bookingDate: formData.bookingDate,
				timeSlot: formData.timeSlot || undefined,
				bookingType: formData.bookingType,
				priorityLevel: formData.priorityLevel,
				paymentMethod: isWalkIn ? "CASH" : formData.paymentMethod,
			};

			const created = await createBooking(bookingPayload);
			const bookingId = created?.booking?._id;
			if (!bookingId) {
				throw new Error("Booking was created but bookingId is missing in response");
			}

			// Proceed to PayHere ONLY when the user chose the payment flow.
			if (continueToPayment && !isWalkIn && formData.paymentMethod === "ONLINE") {
				const checkout = await createPayHereCheckout({ bookingId });
				if (!checkout?.checkoutUrl || !checkout?.fields) {
					throw new Error("Failed to create PayHere checkout payload");
				}
				postToPayHere(checkout.checkoutUrl, checkout.fields);
				return;
			}

			// For save-only and non-online payment flows, go back to My Bookings.
			navigate("/booking");
		} catch (err) {
			setError(err?.message || "Failed to create booking");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (e) => submit({ continueToPayment: true, e });
	const handleSave = () => submit({ continueToPayment: false });

	const patientName = patientProfile?.full_name || "";
	const patientPhone = patientProfile?.contact_number || "";
	const patientEmail = patientProfile?.email || "";

	return (
		<PublicLayout onNavigate={onNavigate}>
			<div className="space-y-6">
				<div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
					<div className="h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-400" />
					<div className="p-6 md:p-7">
						<h1 className="text-2xl font-semibold text-slate-900">Book Test</h1>
						<p className="mt-1 text-sm text-slate-600">
							Patient details are auto-filled. Test/booking details are entered below.
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 md:p-7 space-y-6">
					{/* Auto-filled patient info */}
					<section className="space-y-3">
						<h2 className="text-sm font-semibold text-slate-800">Client Details</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</label>
								<input value={patientName} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
								<input value={patientPhone} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
								<input value={patientEmail} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
						</div>
					</section>

					{/* Selected test */}
					<section className="space-y-3">
						<h2 className="text-sm font-semibold text-slate-800">Selected Test</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Health Center</label>
								<input value={centerName} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Test</label>
								<input value={testName} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Price</label>
								<input
									value={price == null ? "-" : `Rs ${price.toFixed(2)}`}
									readOnly
									className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
								/>
							</div>
						</div>
					</section>

					{/* Manual booking details */}
					<section className="space-y-3">
						<h2 className="text-sm font-semibold text-slate-800">Booking Details</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Booking Type</label>
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
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Booking Date</label>
								<input
									type="date"
									value={formData.bookingDate}
									onChange={(e) => setField("bookingDate", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Time Slot (optional)</label>
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
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</label>
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
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Method</label>
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

					{error && <div className="text-sm text-rose-600">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						<button
							type="submit"
							disabled={loading}
							className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
						>
							{loading ? "Processing..." : "Continue to Payment"}
						</button>

						<button
							type="button"
							onClick={() => (lab?._id ? navigate(`/labs/${lab._id}`) : navigate("/health-centers"))}
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

export default BookingCreatePage;
