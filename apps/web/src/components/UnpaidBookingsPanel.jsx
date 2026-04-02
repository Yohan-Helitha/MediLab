import React, { useEffect, useMemo, useState } from "react";

import { fetchUnpaidBookings } from "../api/financeApi";

function UnpaidBookingsPanel({ refreshKey = 0, onMarkPaid }) {
	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		setError("");

		// We only want CASH unpaid bookings here, because online payments
		// should be confirmed by the payment gateway.
		fetchUnpaidBookings({ paymentMethod: "CASH", limit: 5000 })
			.then((data) => {
				if (!isMounted) return;
				const mapped = (data.items || []).map((row) => {
					const createdAt = row.createdAt ? new Date(row.createdAt) : null;
					const dateString = createdAt
						? createdAt.toISOString().slice(0, 10)
						: "-";

					return {
						bookingId: row.bookingId,
						patientName: row.patientName || "-",
						testName: row.testName || "-",
						centerName: row.centerName || "-",
						date: dateString,
						paymentMethod: row.paymentMethod || "CASH",
					};
				});
				setItems(mapped);
			})
			.catch((err) => {
				console.error("Failed to load unpaid bookings", err);
				if (isMounted)
					setError(err.message || "Failed to load unpaid bookings");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [refreshKey]);

	const hasItems = useMemo(() => items.length > 0, [items]);

	return (
		<section className="rounded-xl bg-white p-4 shadow-sm">
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-semibold text-slate-800">
						Unpaid Cash Bookings
					</h2>
					<p className="text-xs text-slate-500">
						Bookings awaiting cash payment confirmation.
					</p>
				</div>
				{hasItems && (
					<p className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
						{items.length} unpaid
					</p>
				)}
			</div>

			{error && (
				<div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
					{error}
				</div>
			)}

			<div className="hidden border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:block">
				<div className="grid grid-cols-12 gap-3">
					<div className="col-span-3">Booking ID</div>
					<div className="col-span-2">Patient</div>
					<div className="col-span-2">Test</div>
					<div className="col-span-2">Center</div>
					<div className="col-span-1">Date</div>
					<div className="col-span-2 text-right">Action</div>
				</div>
			</div>

			<div className="divide-y divide-slate-50">
				{isLoading && (
					<div className="py-4 text-sm text-slate-500">
						Loading unpaid bookings...
					</div>
				)}
				{!isLoading && !error && items.length === 0 && (
					<div className="py-4 text-sm text-slate-500">
						No unpaid cash bookings.
					</div>
				)}
				{!isLoading &&
					!error &&
					items.map((row) => (
						<div key={row.bookingId} className="py-3 text-sm text-slate-700">
							<div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-3">
								<div className="md:col-span-3">
									<div className="font-medium text-slate-900">
										{String(row.bookingId)}
									</div>
								</div>
								<div className="md:col-span-2">
									<div className="text-sm text-slate-800">
										{row.patientName}
									</div>
								</div>
								<div className="md:col-span-2">
									<div className="text-sm text-slate-800">
										{row.testName}
									</div>
								</div>
								<div className="md:col-span-2">
									<div className="text-xs text-slate-600">
										{row.centerName}
									</div>
								</div>
								<div className="md:col-span-1">
									<div className="text-xs text-slate-500">{row.date}</div>
								</div>
								<div className="md:col-span-2 md:text-right">
									<button
										type="button"
										className="inline-flex whitespace-nowrap rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
										onClick={() => onMarkPaid?.(row)}
									>
										Mark Paid
									</button>
								</div>
							</div>
						</div>
					))}
			</div>
		</section>
	);
}

export default UnpaidBookingsPanel;
