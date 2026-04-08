import React, { useEffect, useMemo, useState } from "react";

import Modal from "../components/Modal";
import { fetchFinanceSummary, fetchPayments, recordCashPayment } from "../api/financeApi";
import UnpaidBookingsPanel from "../components/UnpaidBookingsPanel";

function AdminFinanceDashboard() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [summary, setSummary] = useState(null);
	const [payments, setPayments] = useState([]);
	const [activeMainTab, setActiveMainTab] = useState("PAYMENTS");
	const [activeTab, setActiveTab] = useState("ALL");
	const [isRecordingCash, setIsRecordingCash] = useState(false);
	const [cashBookingId, setCashBookingId] = useState("");
	const [cashBookingMeta, setCashBookingMeta] = useState(null);
	const [cashAmount, setCashAmount] = useState("");
	const [cashNotes, setCashNotes] = useState("");
	const [isSubmittingCash, setIsSubmittingCash] = useState(false);
	const [unpaidRefreshKey, setUnpaidRefreshKey] = useState(0);

	const paymentMethodFilter = useMemo(() => {
		if (activeTab === "CASH") return "CASH";
		if (activeTab === "ONLINE") return "ONLINE";
		return null;
	}, [activeTab]);

	const mapPaymentRows = (items) =>
		(items || []).map((row) => {
			const createdAt = row.createdAt ? new Date(row.createdAt) : null;
			const dateString = createdAt
				? createdAt.toISOString().slice(0, 10)
				: "-";

			return {
				id: row.bookingId || row.transactionId,
				patientName: row.patientName || "-",
				labName: row.centerName || "-",
				testName: row.testName || "-",
				amount: row.amount ?? 0,
				method: row.paymentMethod || "-",
				status: row.paymentStatus || "-",
				date: dateString,
			};
		});

	const reloadFinance = async ({ methodFilter } = {}) => {
		setIsLoading(true);
		setError("");
		try {
			const [summaryData, paymentsData] = await Promise.all([
				fetchFinanceSummary(),
				fetchPayments({ paymentMethod: methodFilter || null, limit: 5000 }),
			]);
			setSummary(summaryData);
			setPayments(mapPaymentRows(paymentsData.items));
			setUnpaidRefreshKey((k) => k + 1);
		} catch (err) {
			console.error("Failed to load finance dashboard", err);
			setError(err.message || "Failed to load finance data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		setError("");

		Promise.all([
			fetchFinanceSummary(),
			fetchPayments({ limit: 5000 }),
		])
			.then(([summaryData, paymentsData]) => {
				if (!isMounted) return;
				setSummary(summaryData);
				setPayments(mapPaymentRows(paymentsData.items));
				setUnpaidRefreshKey((k) => k + 1);
			})
			.catch((err) => {
				console.error("Failed to load finance dashboard", err);
				if (isMounted)
					setError(err.message || "Failed to load finance data");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const totalRevenue = summary?.totalRevenue ?? 0;
	const totalPaymentsReceived = summary?.totalPaid ?? totalRevenue;
	const pendingPaymentsCount =
		summary?.pendingCount ?? summary?.pendingPayments ?? 0;

	const formatCurrency = (value) =>
		new Intl.NumberFormat("en-LK", {
			style: "currency",
			currency: "LKR",
			maximumFractionDigits: 0,
		}).format(value);

	const pendingDisplayValue = useMemo(() => {
		if (isLoading && !summary) return "-";
		return String(pendingPaymentsCount);
	}, [isLoading, pendingPaymentsCount, summary]);

	const handleOpenCashModal = (row = null) => {
		const bookingId = row?.bookingId ? String(row.bookingId) : "";
		const amount = Number.isFinite(Number(row?.amount)) ? Number(row.amount) : null;
		setCashBookingId(bookingId);
		setCashBookingMeta(
			row
				? {
					patientName: row.patientName || "-",
					labName: row.centerName || "-",
					testName: row.testName || "-",
					amount,
				}
				: null,
		);
		setCashAmount(row && amount != null ? String(amount) : "");
		setCashNotes("");
		setIsRecordingCash(true);
	};

	const handleSubmitCashPayment = async (event) => {
		if (event) event.preventDefault();

		if (!cashBookingId.trim()) return;

		const amountNumber = Number(cashAmount);
		if (!Number.isFinite(amountNumber) || amountNumber < 0) {
			alert("Please enter a valid amount (>= 0). ");
			return;
		}

		try {
			setIsSubmittingCash(true);
			await recordCashPayment({
				bookingId: cashBookingId.trim(),
				amount: amountNumber,
				notes: cashNotes.trim() || undefined,
			});
			setIsRecordingCash(false);
			await reloadFinance({ methodFilter: paymentMethodFilter });
		} catch (err) {
			console.error("Failed to record cash payment", err);
			alert(err.message || "Failed to record cash payment");
		} finally {
			setIsSubmittingCash(false);
		}
	};

	return (
		<div className="space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Finance Management
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Monitor lab revenue, payments received, and pending balances.
					</p>
				</div>
				<button
					type="button"
					className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
					onClick={() => handleOpenCashModal()}
				>
					Record Cash Payment
				</button>
			</header>

			{/* Summary cards */}
			<section className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<SummaryCard
					label="Total Revenue"
					value={isLoading && !summary ? "-" : formatCurrency(totalRevenue)}
				/>
				<SummaryCard
					label="Total Payments Received"
					value={
						isLoading && !summary
							? "-"
							: formatCurrency(totalPaymentsReceived)
					}
				/>
				<SummaryCard
					label="Pending Payments"
					value={pendingDisplayValue}
					accent="warning"
				/>
			</section>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<TabButton
						active={activeMainTab === "PAYMENTS"}
						onClick={() => setActiveMainTab("PAYMENTS")}
					>
						Payments
					</TabButton>
					<TabButton
						active={activeMainTab === "UNPAID"}
						onClick={() => setActiveMainTab("UNPAID")}
					>
						Unpaid
					</TabButton>
				</div>

				{activeMainTab === "PAYMENTS" && (
					<div className="flex items-center gap-2">
						<TabButton
							active={activeTab === "ALL"}
							onClick={async () => {
								setActiveTab("ALL");
								await reloadFinance({ methodFilter: null });
							}}
						>
							All
						</TabButton>
						<TabButton
							active={activeTab === "ONLINE"}
							onClick={async () => {
								setActiveTab("ONLINE");
								await reloadFinance({ methodFilter: "ONLINE" });
							}}
						>
							Online
						</TabButton>
						<TabButton
							active={activeTab === "CASH"}
							onClick={async () => {
								setActiveTab("CASH");
								await reloadFinance({ methodFilter: "CASH" });
							}}
						>
							Cash
						</TabButton>
					</div>
				)}
			</div>

			{activeMainTab === "UNPAID" ? (
				<UnpaidBookingsPanel
					refreshKey={unpaidRefreshKey}
					onMarkPaid={(row) => handleOpenCashModal(row)}
				/>
			) : (
				<section className="rounded-xl bg-white p-4 shadow-sm">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-sm font-semibold text-slate-800">
							Payments
						</h2>
						<p className="text-xs text-slate-500">
							Showing all time payments.
						</p>
					</div>

				{/* Table header */}
				<div className="hidden border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:block">
					<div className="grid grid-cols-12 gap-4">
						<div className="col-span-2">Patient Name</div>
						<div className="col-span-2">Lab Name</div>
						<div className="col-span-2">Test Name</div>
						<div className="col-span-2">Amount</div>
						<div className="col-span-2">Payment Method</div>
						<div className="col-span-1">Status</div>
						<div className="col-span-1">Date</div>
					</div>
				</div>

					<div className="divide-y divide-slate-50">
						{error && (
							<div className="py-4 text-sm text-rose-700">
								{error}
							</div>
						)}
						{!error && isLoading && (
							<div className="py-4 text-sm text-slate-500">
								Loading payments...
							</div>
						)}
						{!error && !isLoading && payments.length === 0 && (
							<div className="py-4 text-sm text-slate-500">
								No payments found.
							</div>
						)}
						{!error &&
							!isLoading &&
							payments.map((payment) => (
								<PaymentRow
									key={payment.id}
									payment={payment}
									formatCurrency={formatCurrency}
								/>
							))}
					</div>
				</section>
			)}

			<Modal
				isOpen={isRecordingCash}
				title="Record Cash Payment"
				onClose={() => {
					if (isSubmittingCash) return;
					setIsRecordingCash(false);
				}}
			>
				<form onSubmit={handleSubmitCashPayment} className="space-y-4">
					<p className="text-sm text-slate-700">
						Mark an unpaid CASH booking as PAID.
					</p>
					{!cashBookingId.trim() ? (
						<div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
							Select a booking from the Unpaid list to mark as paid.
						</div>
					) : (
						<div className="grid grid-cols-1 gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
							<div>
								<span className="font-semibold">Patient:</span> {cashBookingMeta?.patientName}
							</div>
							<div>
								<span className="font-semibold">Lab:</span> {cashBookingMeta?.labName}
							</div>
							<div>
								<span className="font-semibold">Test:</span> {cashBookingMeta?.testName}
							</div>
						</div>
					)}
					<div>
						<label className="block text-xs font-medium text-slate-600">
							Amount (LKR)
						</label>
						<input
							type="number"
							min="0"
							className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
							value={cashAmount}
							onChange={(e) => setCashAmount(e.target.value)}
							placeholder="e.g. 1500"
						/>
					</div>
					<div>
						<label className="block text-xs font-medium text-slate-600">
							Notes (optional)
						</label>
						<textarea
							className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
							value={cashNotes}
							onChange={(e) => setCashNotes(e.target.value)}
							maxLength={500}
							rows={3}
							placeholder="Paid at counter"
						/>
					</div>
					<div className="flex justify-end gap-2">
						<button
							type="button"
							className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
							onClick={() => setIsRecordingCash(false)}
							disabled={isSubmittingCash}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
							disabled={isSubmittingCash || !cashBookingId.trim()}
						>
							{isSubmittingCash ? "Recording..." : "Confirm Payment"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

function TabButton({ active, onClick, children }) {
	const base =
		"rounded-full px-3 py-1 text-xs font-medium transition-colors";
	const activeStyles = active
		? "bg-slate-900 text-white"
		: "bg-slate-100 text-slate-700 hover:bg-slate-200";

	return (
		<button type="button" className={`${base} ${activeStyles}`} onClick={onClick}>
			{children}
		</button>
	);
}

function SummaryCard({ label, value, accent }) {
	const accentRing =
		accent === "warning"
			? "ring-amber-100 bg-amber-50"
			: "ring-teal-100 bg-teal-50";
	const accentText =
		accent === "warning" ? "text-amber-700" : "text-teal-700";

	return (
		<div className={`rounded-xl border border-slate-100 bg-white p-4 shadow-sm`}> 
			<div className="text-xs font-medium uppercase tracking-wide text-slate-500">
				{label}
			</div>
			<div className="mt-2 flex items-baseline justify-between">
				<div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${accentRing} ${accentText}`}>
					{value}
				</div>
			</div>
		</div>
	);
}

function getStatusClasses(status) {
	switch (status) {
		case "PAID":
			return "bg-emerald-100 text-emerald-700";
		case "UNPAID":
			return "bg-amber-100 text-amber-700";
		default:
			return "bg-slate-100 text-slate-700";
	}
}

function PaymentRow({ payment, formatCurrency }) {
	return (
		<div className="py-3 text-sm text-slate-700">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
				<div className="md:col-span-2">
					<div className="text-sm text-slate-800">
						{payment.patientName}
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="text-sm text-slate-800">
						{payment.labName}
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="text-sm text-slate-800">
						{payment.testName}
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="text-sm font-medium text-slate-900">
						{formatCurrency(payment.amount)}
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="text-xs text-slate-600">
						{payment.method}
					</div>
				</div>
				<div className="md:col-span-1">
					<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(payment.status)}`}>
						{payment.status}
					</span>
				</div>
				<div className="md:col-span-1">
					<div className="text-xs text-slate-500">{payment.date}</div>
				</div>
			</div>
		</div>
	);
}

export default AdminFinanceDashboard;
