import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminOverview } from "../api/adminApi";

function formatTimeAgo(value) {
	if (!value) return "-";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	const diffMs = Date.now() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return "Just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr} hr ago`;
	const diffDay = Math.floor(diffHr / 24);
	return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

function AdminOverviewDashboard() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [data, setData] = useState(null);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		setError("");
		fetchAdminOverview({ windowHours: 24, limit: 3 })
			.then((payload) => {
				if (!isMounted) return;
				setData(payload);
			})
			.catch((err) => {
				console.error("Failed to load admin overview", err);
				if (isMounted) setError(err.message || "Failed to load overview");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const metrics = data?.metrics || {
		totalRevenue: 0,
		totalBookings: 0,
		totalUsers: 0,
		lowStockItems: 0,
	};

	const recentBookings = useMemo(() => {
		return (data?.recent?.bookings || []).map((b) => ({
			id: b.id,
			title: b.title,
			status: b.status,
			time: formatTimeAgo(b.timestamp),
		}));
	}, [data]);

	const recentPayments = useMemo(() => {
		return (data?.recent?.payments || []).map((p) => ({
			id: p.id,
			title: p.title,
			status: p.status,
			time: formatTimeAgo(p.timestamp),
		}));
	}, [data]);

	const lowStockItems = useMemo(() => {
		return (data?.recent?.lowStock || []).map((s) => ({
			id: s.id,
			title: s.title,
			status: s.status,
			time: s.meta
				? `${s.meta.availableQuantity}/${s.meta.minimumThreshold}`
				: formatTimeAgo(s.timestamp),
		}));
	}, [data]);

	const recentUsers = useMemo(() => {
		return (data?.recent?.users || []).map((u) => ({
			id: u.id,
			title: u.title,
			status: u.status,
			time: formatTimeAgo(u.timestamp),
		}));
	}, [data]);

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

			{error && (
				<div className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
					{error}
				</div>
			)}

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
						title: b.title,
						status: b.status,
						time: b.time,
					}))}
				/>
				<RecentList
					title="Recent Payments"
					items={recentPayments.map((p) => ({
						id: p.id,
						title: p.title,
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

			{isLoading && (
				<div className="text-sm text-slate-500">Loading overview...</div>
			)}
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
