import React from "react";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

function DashboardLayout({ children }) {
	return (
		<div className="flex min-h-screen bg-slate-50 text-slate-900">
			<Sidebar />
			<div className="flex flex-1 flex-col">
				<TopBar />
				<main className="flex-1 px-10 py-6">{children}</main>
			</div>
		</div>
	);
}

export default DashboardLayout;

