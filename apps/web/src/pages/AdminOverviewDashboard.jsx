import React from "react";

function AdminOverviewDashboard() {
	const metrics = {
		totalRevenue: 1250000,
		totalBookings: 342,
		totalUsers: 58,
		lowStockItems: 7,
	};

	const recentBookings = [
		{
			id: "BK-1023",
			patient: "John Carter",
			status: "Completed",
			time: "10 min ago",
		},
		{
			id: "BK-1022",
			patient: "Emily Rose",
			status: "Pending",
			time: "25 min ago",
		},
		{
			id: "BK-1021",
			patient: "Michael Lee",
			status: "In Progress",
			time: "1 hr ago",
		},
	];

	const recentPayments = [
		{
			id: "PM-8901",
			label: "Invoice for BK-1020",
			status: "Paid",
			time: "5 min ago",
		},
		{
			id: "PM-8900",
			label: "Invoice for BK-1019",
			status: "Pending",
			time: "40 min ago",
		},
		{
			id: "PM-8899",
			label: "Refund for BK-1018",
			status: "Processed",
			time: "2 hrs ago",
		},
	];

	const lowStockItems = [
		{ id: "INV-2001", title: "Rapid Test Kits", status: "Low stock", time: "Needs restock" },
		{ id: "INV-2002", title: "Nitrile Gloves (M)", status: "Below threshold", time: "Monitor today" },
		{ id: "INV-2003", title: "Syringe Pack (5ml)", status: "Approaching low", time: "This week" },
	];

	const recentUsers = [
		{ id: "USR-301", title: "Dr. Anika Perera", status: "New doctor account", time: "30 min ago" },
		{ id: "USR-300", title: "Lab Tech - Jane Doe", status: "Role updated", time: "1 hr ago" },
		{ id: "USR-299", title: "Front Desk - Mark", status: "Activated", time: "3 hrs ago" },
	];

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
					<h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
					<p className="mt-1 text-sm text-slate-500">
						High-level snapshot of bookings, revenue, users, and inventory.
					</p>
				</div>
			</header>

			{/* Summary metrics */}
			<section className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<OverviewMetricCard
					label="Total Revenue"
					value={formatCurrency(metrics.totalRevenue)}
				/>
				<OverviewMetricCard
					label="Total Bookings"
					value={metrics.totalBookings.toString()}
				/>
				<OverviewMetricCard
					label="Total Users"
					value={metrics.totalUsers.toString()}
				/>
				<OverviewMetricCard
					label="Low Stock Items"
					value={metrics.lowStockItems.toString()}
					accent="warning"
				/>
			</section>

			{/* Recent activity */}
			<section className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<RecentList
					title="Recent Bookings"
					items={recentBookings.map((b) => ({
						id: b.id,
						title: `${b.id} - ${b.patient}`,
						status: b.status,
						time: b.time,
					}))}
				/>
				<RecentList
					title="Recent Payments"
					items={recentPayments.map((p) => ({
						id: p.id,
						title: p.label,
						status: p.status,
						time: p.time,
					}))}
				/>
				<RecentList
					title="Low Stock Items"
					items={lowStockItems}
				/>
				<RecentList
					title="Recent Users"
					items={recentUsers}
				/>
			</section>
		</div>
	);
}

function OverviewMetricCard({ label, value, accent }) {
	const bgClass = accent === "warning" ? "bg-amber-50" : "bg-slate-50";
	const borderClass = accent === "warning" ? "border-amber-100" : "border-slate-100";

	return (
		<div className={`rounded-xl border ${borderClass} bg-white p-4 shadow-sm`}>
			<div className="text-xs font-medium uppercase tracking-wide text-slate-500">
				{label}
			</div>
			<div className={`mt-3 inline-flex rounded-lg ${bgClass} px-3 py-2 text-xl font-semibold text-slate-900`}>
				{value}
			</div>
		</div>
	);
}

function RecentList({ title, items }) {
	return (
		<div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-sm font-semibold text-slate-800">{title}</h2>
				<span className="text-xs text-slate-400">Last 24 hours</span>
			</div>
			<ul className="space-y-2 text-sm text-slate-700">
				{items.map((item) => (
					<li
						key={item.id}
						className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
					>
						<div>
							<div className="font-medium text-slate-900">
								{item.title}
							</div>
							<div className="text-xs text-slate-500">{item.status}</div>
						</div>
						<div className="text-xs text-slate-400">{item.time}</div>
					</li>
					))}
			</ul>
		</div>
	);
}

export default AdminOverviewDashboard;
