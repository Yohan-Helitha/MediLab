import React from "react";
import { NavLink } from "react-router-dom";
import {
	HiBuildingOffice2,
	HiBeaker,
	HiAdjustmentsVertical,
	HiDocumentText,
	HiClipboardDocumentList,
	HiTableCells,
} from "react-icons/hi2";

function AdminSidebar() {
	return (
		<aside className="flex min-h-screen w-64 flex-col bg-[#0F172A] px-5 py-6 text-white">
			{/* Logo */}
			<div className="mb-8 flex items-center justify-center text-2xl font-bold tracking-tight text-teal-500">
				<svg
					viewBox="0 0 24 24"
					aria-hidden="true"
					className="mr-2 h-5 w-5 text-teal-500"
				>
					<path
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3 13h3.5L9 9l3 6 2-4 2 4H21"
					/>
				</svg>
				<span className="text-2xl font-extrabold text-teal-400">MediLab</span>
			</div>

			{/* Navigation */}
			<nav className="mt-2 flex-1 space-y-1 text-sm">
				<AdminNavItem
					to="/admin/overview"
					label="Overview"
					Icon={HiBuildingOffice2}
				/>
				<AdminNavItem
					to="/admin/finance"
					label="Finance"
					Icon={HiAdjustmentsVertical}
				/>
				<AdminNavItem
					to="/admin/inventory"
					label="Inventory"
					Icon={HiBeaker}
					end
				/>
				<AdminNavItem
					to="/admin/inventory/equipment"
					label="Equipment Catalog"
					Icon={HiClipboardDocumentList}
				/>
				<AdminNavItem
					to="/admin/inventory/requirements"
					label="Test Requirements"
					Icon={HiDocumentText}
				/>
				<AdminNavItem
					to="/admin/users"
					label="Users"
					Icon={HiDocumentText}
				/>
				<AdminNavItem
					to="/admin/results"
					label="Test Results"
					Icon={HiTableCells}
				/>
			</nav>

			{/* User summary at bottom */}
			<div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-4 text-xs">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D9488] text-[11px] font-semibold">
					AD
				</div>
				<div>
					<div className="font-semibold">Alex Admin</div>
					<div className="text-gray-400">Administrator</div>
				</div>
			</div>
		</aside>
	);
}

function AdminNavItem({ to, label, Icon, end = false }) {
	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive }) => {
				const baseClasses =
					"flex items-center gap-2 rounded-full px-3 py-2 transition-colors cursor-pointer";
				const inactive = " text-gray-300 hover:bg-white/5";
				const active = " bg-[#16C79A] text-[#022135] font-semibold";

				return baseClasses + (isActive ? active : inactive);
			}}
		>
			{Icon && (
				<Icon
					className="h-4 w-4 text-inherit"
				/>
			)}
			<span>{label}</span>
		</NavLink>
	);
}

export default AdminSidebar;
