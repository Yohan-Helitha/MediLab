import React from "react";

function TopBar() {
	return (
		<header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3 shadow-sm">
			<div className="text-sm font-medium text-slate-700">
				MediLab Staff Dashboard
			</div>
			<div className="flex items-center gap-4 text-sm">
				<button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
					<span className="text-lg">🔔</span>
					<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
				</button>
				<button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
					Logout
				</button>
			</div>
		</header>
	);
}

export default TopBar;

