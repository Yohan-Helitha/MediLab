import React from "react";
import AdminSidebar from "./AdminSidebar.jsx";

function AdminDashboardLayout({ title, children, onLogout }) {
	return (
		<div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
			<AdminSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<AdminTopBar title={title} onLogout={onLogout} />
				<main className="flex-1 overflow-y-auto px-10 py-6 bg-slate-50">
					<div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-sm">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}

function AdminTopBar({ title, onLogout }) {
	const handleLogout = () => {
		if (onLogout) {
			onLogout();
		}
	};

	return (
		<header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3 shadow-sm">
			<div className="flex flex-col">
				<h1 className="text-lg font-semibold text-slate-800">
					{title || "MediLab Admin Dashboard"}
				</h1>
				<p className="text-xs text-slate-500">
					Monitor operations, finance, inventory, and users in one place.
				</p>
			</div>
			<div className="flex items-center gap-4 text-sm">
				<button
					type="button"
					className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
					aria-label="Notifications"
				>
					<BellIcon className="h-4 w-4" />
					<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
				</button>
				<button
					type="button"
					onClick={handleLogout}
					className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
				>
					Logout
				</button>
			</div>
		</header>
	);
}

function BellIcon({ className }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M15 17H9a3 3 0 0 1-3-3V11a6 6 0 1 1 12 0v3a3 3 0 0 1-3 3z" />
			<path d="M10 17a2 2 0 0 0 4 0" />
		</svg>
	);
}

export default AdminDashboardLayout;
