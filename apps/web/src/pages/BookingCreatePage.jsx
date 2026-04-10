import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import { useAuth } from "../context/AuthContext";
import { createBooking, createPayHereCheckout } from "../api/bookingApi";
import { translateTexts } from "../api/translationApi";
import { useTranslation } from "react-i18next";
import ToastMessage from "../components/ToastMessage";

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
	const { t, i18n } = useTranslation();

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

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [translatedNames, setTranslatedNames] = useState({});
	const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		// If user opened this page directly, force them back to labs.
		if (!labTest || !diagnosticTestId || !healthCenterId) {
			// Avoid redirect loop if already on home.
			navigate("/health-centers", { replace: true });
		}
	}, [diagnosticTestId, healthCenterId, labTest, navigate]);

	// Dynamic translation for selected lab/test names
	useEffect(() => {
		const loadTranslations = async () => {
			const lang = (i18n.language || "en").toLowerCase();
			if (!centerName && !testName) return;
			if (lang === "en") {
				setTranslatedNames({});
				return;
			}

			try {
				const texts = [centerName, testName].filter(Boolean);
				const map = await translateTexts(texts, lang, "en");
				setTranslatedNames(map);
			} catch {
				setTranslatedNames({});
			}
		};

		loadTranslations();
	}, [centerName, testName, i18n.language]);

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!patientProfileId) {
			setError(t("booking.create.error.noProfile"));
			return;
		}
		if (!healthCenterId || !diagnosticTestId) {
			setError(t("booking.create.error.missingSelection"));
			return;
		}
		if (!formData.bookingDate) {
			setError(t("booking.create.error.noDate"));
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
				paymentMethod: formData.paymentMethod,
			};

			const created = await createBooking(bookingPayload);
			const bookingId = created?.booking?._id;
			if (!bookingId) {
				throw new Error(t("booking.create.error.missingBookingId"));
			}

			// Always proceed to PayHere for ONLINE payments.
			if (formData.paymentMethod === "ONLINE") {
				setToastMessage({
					type: "success",
					text: t("booking.create.toast.createdRedirecting"),
				});
				const checkout = await createPayHereCheckout({ bookingId });
				if (!checkout?.checkoutUrl || !checkout?.fields) {
					throw new Error(t("booking.create.error.payherePayload"));
				}
				postToPayHere(checkout.checkoutUrl, checkout.fields);
				return;
			}

			setToastMessage({
				type: "success",
				text: t("booking.create.toast.createdCash"),
			});
			navigate("/dashboard");
		} catch (err) {
			setError(err?.message || t("booking.create.error.generic"));
			setToastMessage({
				type: "error",
				text: err?.message || t("booking.create.error.generic"),
			});
		} finally {
			setLoading(false);
		}
	};

	const patientName = patientProfile?.full_name || "";
	const patientPhone = patientProfile?.contact_number || "";
	const patientEmail = patientProfile?.email || "";

	return (
		<PublicLayout onNavigate={onNavigate}>
			<ToastMessage
				type={toastMessage.type}
				text={toastMessage.text}
				onClose={() => setToastMessage({ type: "", text: "" })}
			/>
			<div className="space-y-6">
				<div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
					<div className="h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-400" />
					<div className="p-6 md:p-7">
						<h1 className="text-2xl font-semibold text-slate-900">{t("booking.create.title")}</h1>
						<p className="mt-1 text-sm text-slate-600">
							{t("booking.create.subtitle")}
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 md:p-7 space-y-6">
					{/* Auto-filled patient info */}
					<section className="space-y-3">
						<h2 className="text-sm font-semibold text-slate-800">{t("booking.create.section.clientDetails")}</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("healthProfile.form.fullName")}</label>
								<input value={patientName} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("register.phoneLabel")}</label>
								<input value={patientPhone} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("login.emailLabel")}</label>
								<input value={patientEmail} readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
							</div>
						</div>
					</section>

					{/* Selected test */}
					<section className="space-y-3">
						<h2 className="text-sm font-semibold text-slate-800">{t("booking.create.section.selectedTest")}</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.healthCenter")}</label>
								<input
									value={translatedNames[centerName] || centerName}
									readOnly
									className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.test")}</label>
								<input
									value={translatedNames[testName] || testName}
									readOnly
									className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.price")}</label>
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
						<h2 className="text-sm font-semibold text-slate-800">{t("booking.create.section.bookingDetails")}</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.bookingType")}</label>
								<select
									value={formData.bookingType}
									onChange={(e) => setField("bookingType", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								>
									<option value="PRE_BOOKED">{t("booking.create.option.bookingType.preBooked")}</option>
									<option value="WALK_IN">{t("booking.create.option.bookingType.walkIn")}</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.bookingDate")}</label>
								<input
									type="date"
									value={formData.bookingDate}
									onChange={(e) => setField("bookingDate", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.timeSlotOptional")}</label>
								<input
									type="text"
									value={formData.timeSlot}
									onChange={(e) => setField("timeSlot", e.target.value)}
									placeholder={t("booking.create.placeholder.timeSlot")}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.priority")}</label>
								<select
									value={formData.priorityLevel}
									onChange={(e) => setField("priorityLevel", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								>
									<option value="NORMAL">{t("booking.create.option.priority.normal")}</option>
									<option value="ELDERLY">{t("booking.create.option.priority.elderly")}</option>
									<option value="PREGNANT">{t("booking.create.option.priority.pregnant")}</option>
									<option value="URGENT">{t("booking.create.option.priority.urgent")}</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("booking.create.label.paymentMethod")}</label>
								<select
									value={formData.paymentMethod}
									onChange={(e) => setField("paymentMethod", e.target.value)}
									className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								>
									<option value="ONLINE">{t("booking.create.option.payment.online")}</option>
									<option value="CASH">{t("booking.create.option.payment.cash")}</option>
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
							{loading
								? t("booking.create.button.processing")
								: t("booking.create.button.continue")}
						</button>

						<button
							type="button"
							onClick={() => (lab?._id ? navigate(`/labs/${lab._id}`) : navigate("/health-centers"))}
							className="rounded-full bg-slate-100 px-6 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
						>
							{t("booking.create.button.back")}
						</button>
					</div>
				</form>
			</div>
		</PublicLayout>
	);
}

export default BookingCreatePage;
