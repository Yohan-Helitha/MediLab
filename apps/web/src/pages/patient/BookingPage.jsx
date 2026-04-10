import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { getBookingsByPatientId, softDeleteBooking } from "../../api/bookingApi";
import { translateTexts } from "../../api/translationApi";

const BookingPage = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const patientProfileId = user?.profile?._id || null;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [items, setItems] = useState([]);
	const [nameTranslations, setNameTranslations] = useState({});

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

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				if (!patientProfileId) {
					throw new Error(t("bookings.error.noProfile"));
				}

				const data = await getBookingsByPatientId(patientProfileId);
				const payload = data?.bookings;
				const list = Array.isArray(payload)
					? payload
					: Array.isArray(payload?.bookings)
						? payload.bookings
						: [];

				if (!cancelled) setItems(list);
			} catch (err) {
				if (!cancelled) setError(err?.message || t("bookings.error.generic"));
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [patientProfileId]);

	const sortedItems = useMemo(() => {
		return [...(items || [])].sort((a, b) => {
			const da = new Date(a?.bookingDate || 0).getTime();
			const db = new Date(b?.bookingDate || 0).getTime();
			return db - da;
		});
	}, [items]);

	const formatDate = (value) => {
		if (!value) return "-";
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return "-";
		return new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "short",
			day: "2-digit",
		}).format(d);
	};

	const formatEnum = (value, type) => {
		const raw = (value || "-").toString().toUpperCase();
		if (!value) return "-";

		switch (type) {
			case "status":
				if (raw === "PENDING") return t("bookings.status.pending");
				if (raw === "COMPLETED") return t("bookings.status.completed");
				if (raw === "CANCELLED") return t("bookings.status.cancelled");
				break;
			case "payment":
				if (raw === "PENDING") return t("bookings.payment.pending");
				if (raw === "PAID") return t("bookings.payment.paid");
				if (raw === "UNPAID") return t("bookings.payment.unpaid");
				break;
			case "type":
				if (raw === "PRE_BOOKED") return t("bookings.type.preBooked");
				if (raw === "WALK_IN") return t("bookings.type.walkIn");
				break;
			case "priority":
				if (raw === "NORMAL") return t("bookings.priority.normal");
				if (raw === "ELDERLY") return t("bookings.priority.elderly");
				if (raw === "PREGNANT") return t("bookings.priority.pregnant");
				if (raw === "URGENT") return t("bookings.priority.urgent");
				break;
			default:
				break;
		}

		// Fallback: replace underscores with space and show raw
		return raw.replace(/_/g, " ");
	};

	// Dynamic translation for test and center names on the booking cards
	useEffect(() => {
		const loadTranslations = async () => {
			const lang = (i18n.language || "en").toLowerCase();
			if (!items.length || lang === "en") {
				setNameTranslations({});
				return;
			}

			try {
				const texts = [];
				items.forEach((b) => {
					const testName =
						b?.diagnosticTestId?.name || b?.testNameSnapshot || "";
					const centerName =
						b?.healthCenterId?.name || b?.centerNameSnapshot || "";
					if (testName) texts.push(testName);
					if (centerName) texts.push(centerName);
				});

				const map = await translateTexts(texts, lang, "en");
				setNameTranslations(map);
			} catch {
				setNameTranslations({});
			}
		};

		loadTranslations();
	}, [items, i18n.language]);
	const onDelete = async (booking) => {
		const bookingId = booking?._id;
		if (!bookingId) return;
		const ok = window.confirm("Delete this booking? You can’t undo this action.");
		if (!ok) return;

		setError("");
		try {
			await softDeleteBooking(bookingId);
			setItems((prev) => (prev || []).filter((x) => x?._id !== bookingId));
		} catch (err) {
			setError(err?.message || "Failed to delete booking");
		}
	};

	return (
		<PublicLayout onNavigate={onNavigate}>
			<div className="space-y-6">
				<header className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">{t("bookings.title")}</h1>
						<p className="mt-1 text-sm text-slate-600">
							{t("bookings.subtitle")}
						</p>
					</div>
					<button
						type="button"
						onClick={() => navigate("/health-centers")}
						className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
					>
						{t("bookings.bookTest")}
					</button>
				</header>

				{loading && (
					<div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 text-sm text-slate-600">
						{t("bookings.loading")}
					</div>
				)}

				{!loading && error && (
					<div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6">
						<p className="text-sm text-rose-600">{error}</p>
						<div className="mt-4 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={() => navigate(0)}
								className="rounded-full bg-slate-100 px-6 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
							>
								{t("bookings.button.retry")}
							</button>
							<button
								type="button"
								onClick={() => navigate("/health-centers")}
								className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
							>
								{t("bookings.bookTest")}
							</button>
						</div>
					</div>
				)}

				{!loading && !error && sortedItems.length === 0 && (
					<div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6">
						<h2 className="text-lg font-semibold text-slate-900">{t("bookings.empty.title")}</h2>
						<p className="mt-1 text-sm text-slate-600">
							{t("bookings.empty.body")}
						</p>
						<div className="mt-4">
							<button
								type="button"
								onClick={() => navigate("/health-centers")}
								className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
							>
								{t("bookings.empty.button")}
							</button>
						</div>
					</div>
				)}

				{!loading && !error && sortedItems.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{sortedItems.map((b) => {
							const id = b?._id || `${b?.healthCenterId?._id || b?.healthCenterId || ""}-${b?.bookingDate || ""}`;
							const baseTestName =
								b?.diagnosticTestId?.name || b?.testNameSnapshot || "-";
							const baseCenterName =
								b?.healthCenterId?.name || b?.centerNameSnapshot || "-";
							const testName =
								nameTranslations[baseTestName] || baseTestName;
							const centerName =
								nameTranslations[baseCenterName] || baseCenterName;
							const bookingDateLabel = formatDate(b?.bookingDate);
							const timeSlot = b?.timeSlot || "-";
							const status = formatEnum(b?.status);
							const paymentStatus = formatEnum(b?.paymentStatus);
							const bookingType = formatEnum(b?.bookingType);
							const priority = formatEnum(b?.priorityLevel);
							const queueLabel =
								b?.queueNumber === null || b?.queueNumber === undefined
									? "N/A"
									: `#${b.queueNumber}`;
							const canEdit = (b?.status || "").toString().toUpperCase() !== "COMPLETED";

							return (
								<div
									key={id}
									className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden"
								>
									<div className="h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-400" />
									<div className="p-6 space-y-4">
										<div className="flex items-start justify-between gap-3">
											<div>
												<h3 className="text-lg font-semibold text-slate-900">{testName}</h3>
												<p className="mt-1 text-sm text-slate-600">{centerName}</p>
											</div>

											<div className="flex items-center gap-2">
												<button
													type="button"
													disabled={!canEdit}
													title={!canEdit ? "Completed bookings can’t be edited." : "Edit booking"}
													onClick={() => {
													if (!canEdit) return;
													navigate(`/bookings/${b._id}/edit`, { state: { booking: b } });
												}}
												className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
											>
												Edit
											</button>

												<button
													type="button"
													onClick={() => onDelete(b)}
												className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
											>
												Delete
											</button>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-3 text-sm">
											<div>
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("bookings.card.label.date")}</div>
												<div className="mt-0.5 text-slate-800">{bookingDateLabel}</div>
											</div>
											<div>
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("bookings.card.label.timeSlot")}</div>
												<div className="mt-0.5 text-slate-800">{timeSlot}</div>
											</div>
											<div>
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("bookings.card.label.status")}</div>
												<div className="mt-0.5">
													<span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
														{status}
													</span>
												</div>
											</div>
											<div>
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("bookings.card.label.payment")}</div>
												<div className="mt-0.5">
													<span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
														{paymentStatus}
													</span>
												</div>
											</div>
										</div>

										<div className="flex flex-wrap gap-2 text-xs text-slate-600">
											<span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
												{t("bookings.card.label.type")}: <span className="font-semibold text-slate-800">{bookingType}</span>
											</span>
											<span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
												{t("bookings.card.label.priority")}: <span className="font-semibold text-slate-800">{priority}</span>
											</span>
											<span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
												Queue: <span className="font-semibold text-slate-800">{queueLabel}</span>
											</span>
										</div>
									</div>

								</div>
							);
						})}
					</div>
				)}
			</div>
		</PublicLayout>
	);
};

export default BookingPage;
