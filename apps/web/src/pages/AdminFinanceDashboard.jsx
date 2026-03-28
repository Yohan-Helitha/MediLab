import React from "react";

function AdminFinanceDashboard() {
	const payments = [
		{
			id: "BK-1001",
			patientName: "John Carter",
			testName: "Full Blood Count",
			amount: 7500,
			method: "Credit Card",
			status: "PAID",
			date: "2026-03-20",
		},
		{
			id: "BK-1002",
			patientName: "Emily Rose",
			testName: "Lipid Profile",
			amount: 6400,
			method: "Cash",
			status: "PAID",
			date: "2026-03-21",
		},
		{
			id: "BK-1003",
			patientName: "Michael Lee",
			testName: "COVID-19 PCR",
			amount: 5200,
			method: "Online Transfer",
			status: "UNPAID",
			date: "2026-03-21",
		},
		{
			id: "BK-1004",
			patientName: "Sarah Ahmed",
			testName: "Thyroid Panel",
			amount: 8800,
			method: "Credit Card",
			status: "UNPAID",
			date: "2026-03-22",
		},
		{
			id: "BK-1005",
			patientName: "Daniel Kim",
			testName: "Renal Function Test",
			amount: 6100,
			method: "Cash",
			status: "PAID",
			date: "2026-03-22",
		},
	];

	const totalRevenue = payments
		.filter((p) => p.status === "PAID")
		.reduce((sum, p) => sum + p.amount, 0);
	const totalPaymentsReceived = totalRevenue;
	const pendingPayments = payments
		.filter((p) => p.status !== "PAID")
		.reduce((sum, p) => sum + p.amount, 0);

	const formatCurrency = (value) =>
		new Intl.NumberFormat("en-LK", {
			style: "currency",
			currency: "LKR",
			maximumFractionDigits: 0,
		}).format(value);

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
			</header>

			{/* Summary cards */}
			<section className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<SummaryCard
					label="Total Revenue"
					value={formatCurrency(totalRevenue)}
				/>
				<SummaryCard
					label="Total Payments Received"
					value={formatCurrency(totalPaymentsReceived)}
				/>
				<SummaryCard
					label="Pending Payments"
					value={formatCurrency(pendingPayments)}
					accent="warning"
				/>
			</section>

			{/* Payments table */}
			<section className="rounded-xl bg-white p-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-sm font-semibold text-slate-800">
						Recent Payments
					</h2>
					<p className="text-xs text-slate-500">
						Showing latest booking payments.
					</p>
				</div>

				{/* Table header */}
				<div className="hidden border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:block">
					<div className="grid grid-cols-12 gap-4">
						<div className="col-span-2">Booking ID</div>
						<div className="col-span-2">Patient Name</div>
						<div className="col-span-2">Test Name</div>
						<div className="col-span-2">Amount</div>
						<div className="col-span-2">Payment Method</div>
						<div className="col-span-1">Status</div>
						<div className="col-span-1">Date</div>
					</div>
				</div>

				<div className="divide-y divide-slate-50">
					{payments.map((payment) => (
						<PaymentRow
							key={payment.id}
							payment={payment}
							formatCurrency={formatCurrency}
						/>
					))}
				</div>
			</section>
		</div>
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
					<div className="font-medium text-slate-900">
						{payment.id}
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="text-sm text-slate-800">
						{payment.patientName}
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
