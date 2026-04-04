import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
	HiBuildingOffice2,
	HiBeaker,
	HiAdjustmentsVertical,
	HiDocumentText,
	HiHome,
	HiGlobeAlt,
} from "react-icons/hi2";

function Sidebar() {
	const { user } = useAuth();
	const location = useLocation();

	const normalize = (value) =>
		(value || "")
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "_");

	const role = normalize(user?.role || user?.profile?.role);
	const isAdmin = role === "admin";
	const isPatient = role === "patient" || role === "member";
	const isStaffUser = !!role && !isPatient && !isAdmin;

	return (
		<aside className="flex min-h-screen w-64 flex-col bg-[#0F172A] px-5 py-6 text-white">
			{/* Logo */}
			<div className="mb-8 flex justify-center items-center text-2xl font-bold tracking-tight text-teal-600">
				<svg
					viewBox="0 0 24 24"
					aria-hidden="true"
					className="mr-2 h-4 w-4 text-teal-600"
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

				<div className="flex justify-center">
  					<span className="text-teal-600 text-2xl font-bold">MediLab</span>
				</div>
			</div>

			{/* Navigation */}
			<nav className="mt-2 flex-1 space-y-1">
				{isStaffUser && (
					<SidebarItem
						label="Lab Management"
						Icon={HiBuildingOffice2}
						isActive={location.pathname === "/staff/dashboard"}
						to="/staff/dashboard"
					/>
				)}

				<SidebarItem
					label="Household Registration"
					Icon={HiHome}
					isActive={location.pathname === "/household-registration"}
					to="/household-registration"
				/>

				{isStaffUser && (
					<>
						<SidebarItem
							label="Test Management"
							Icon={HiBeaker}
							isActive={location.pathname === "/staff/tests"}
							to="/staff/tests"
						/>
						<SidebarItem
							label="Test Availability"
							Icon={HiAdjustmentsVertical}
							isActive={location.pathname === "/staff/availability"}
							to="/staff/availability"
						/>
						<SidebarItem
							label="Test Instructions"
							Icon={HiDocumentText}
							isActive={location.pathname === "/staff/instructions"}
							to="/staff/instructions"
						/>
					</>
				)}

				<SidebarItem
					label="Language Management"
					Icon={HiGlobeAlt}
					isActive={false}
					to="#"
				/>
			</nav>

			{/* User summary at bottom */}
			<div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-4 text-xs">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D9488] text-[11px] font-semibold uppercase">
					{(user?.fullName || user?.firstName || "JD").substring(0, 2)}
				</div>
				<div>
					<div className="font-semibold">{user?.fullName || "Staff Member"}</div>
					<div className="text-gray-400">{user?.role?.replace('_', ' ') || "Health Professional"}</div>
				</div>
			</div>
		</aside>
	);
}

function SidebarItem({ label, isActive, Icon, to }) {
	const baseClasses =
		"flex items-center rounded-full px-3 py-2 text-sm cursor-pointer transition-all duration-200";
	const activeClasses = isActive
		? "bg-[#16C79A] text-[#022135] font-semibold"
		: "text-gray-400 hover:bg-white/5 hover:text-white";

	return (
		<Link to={to} className={`${baseClasses} ${activeClasses}`}>
			<Icon className={`mr-3 h-5 w-5 ${isActive ? "text-[#022135]" : "text-gray-400"}`} />
			<span>{label}</span>
		</Link>
	);
}

export default Sidebar;

