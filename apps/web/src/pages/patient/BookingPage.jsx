import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { getBookingsByPatientId, softDeleteBooking } from "../../api/bookingApi";

const BookingPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const patientProfileId = user?.profile?._id || null;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [items, setItems] = useState([]);

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
					throw new Error("Patient profile not found. Please log in again.");
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
				if (!cancelled) setError(err?.message || "Failed to load bookings");
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

	const formatEnum = (value) => {
		return (value || "-").toString().replace(/_/g, " ");
	};

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
						<h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
						<p className="mt-1 text-sm text-slate-600">
							View your booked tests and their status.
						</p>
					</div>
					<button
						type="button"
						onClick={() => navigate("/health-centers")}
						className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
					>
						Book a test
					</button>
				</header>

				{loading && (
					<div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 text-sm text-slate-600">
						Loading your bookings...
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
								Retry
							</button>
							<button
								type="button"
								onClick={() => navigate("/health-centers")}
								className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
							>
								Book a test
							</button>
						</div>
					</div>
				)}

				{!loading && !error && sortedItems.length === 0 && (
					<div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6">
						<h2 className="text-lg font-semibold text-slate-900">No bookings yet</h2>
						<p className="mt-1 text-sm text-slate-600">
							You haven’t booked any tests. Start by selecting a health center.
						</p>
						<div className="mt-4">
							<button
								type="button"
								onClick={() => navigate("/health-centers")}
								className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
							>
								Book your first test
							</button>
						</div>
					</div>
				)}

				{!loading && !error && sortedItems.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{sortedItems.map((b) => {
							const id = b?._id || `${b?.healthCenterId?._id || b?.healthCenterId || ""}-${b?.bookingDate || ""}`;
							const testName =
								b?.diagnosticTestId?.name || b?.testNameSnapshot || "-";
							const centerName =
								b?.healthCenterId?.name || b?.centerNameSnapshot || "-";
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
							const isCompleted = (b?.status || "").toString().toUpperCase() === "COMPLETED";

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
												{isCompleted && (
													<button
														type="button"
														onClick={() => navigate("/health-reports")}
														className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
													>
														View Results
													</button>
												)}
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
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</div>
												<div className="mt-0.5 text-slate-800">{bookingDateLabel}</div>
											</div>
											<div>
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time Slot</div>
												<div className="mt-0.5 text-slate-800">{timeSlot}</div>
											</div>
											<div>
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</div>
												<div className="mt-0.5">
													<span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
														{status}
													</span>
												</div>
											</div>
											<div>
												<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</div>
												<div className="mt-0.5">
													<span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
														{paymentStatus}
													</span>
												</div>
											</div>
										</div>

										<div className="flex flex-wrap gap-2 text-xs text-slate-600">
											<span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
												Type: <span className="font-semibold text-slate-800">{bookingType}</span>
											</span>
											<span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
												Priority: <span className="font-semibold text-slate-800">{priority}</span>
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
