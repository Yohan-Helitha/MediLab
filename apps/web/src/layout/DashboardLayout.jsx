import React from "react";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

function DashboardLayout({ children, activePage, onChangePage }) {
	return (
		<div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
			<Sidebar activePage={activePage} onChangePage={onChangePage} />
			<div className="flex flex-1 flex-col overflow-hidden">
				<TopBar />
				<main className="flex-1 overflow-y-auto px-10 py-6">{children}</main>
			</div>
		</div>
	);
}

export default DashboardLayout;

