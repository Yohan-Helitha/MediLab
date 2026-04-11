import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TopBar({ showNotificationBell = true }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	return (
		<header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3 shadow-sm">
			<div className="text-sm font-medium text-slate-700">
				{user?.role?.replace('_', ' ') || "MediLab Staff"} Dashboard
			</div>
			<div className="flex items-center gap-4 text-sm">
				{showNotificationBell && (
					<button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
						<span className="text-lg">🔔</span>
						<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
					</button>
				)}
				<button
					onClick={handleLogout}
					className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
				>
					Logout
				</button>
			</div>
		</header>
	);
}

export default TopBar;

