import React from "react";
import {
	HiBuildingOffice2,
	HiBeaker,
	HiAdjustmentsVertical,
	HiDocumentText,
	HiGlobeAlt,
} from "react-icons/hi2";

function Sidebar({ activePage, onChangePage }) {
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
				<SidebarItem
					label="Lab Management"
					Icon={HiBuildingOffice2}
					isActive={activePage === "labs"}
					onClick={() => onChangePage && onChangePage("labs")}
				/>
				<SidebarItem
					label="Test Management"
					Icon={HiBeaker}
					isActive={activePage === "tests"}
					onClick={() => onChangePage && onChangePage("tests")}
				/>
				<SidebarItem
					label="Test Availability"
					Icon={HiAdjustmentsVertical}
					isActive={activePage === "availability"}
					onClick={() => onChangePage && onChangePage("availability")}
				/>
				<SidebarItem
					label="Test Instructions"
					Icon={HiDocumentText}
					isActive={activePage === "instructions"}
					onClick={() => onChangePage && onChangePage("instructions")}
				/>
				<SidebarItem
					label="Language Management"
					Icon={HiGlobeAlt}
					isActive={false}
				/>
			</nav>

			{/* User summary at bottom */}
			<div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-4 text-xs">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D9488] text-[11px] font-semibold">
					JD
				</div>
				<div>
					<div className="font-semibold">Jane Doe</div>
					<div className="text-gray-400">Lab Technician</div>
				</div>
			</div>
		</aside>
	);
}

function SidebarItem({ label, isActive, Icon, onClick }) {
	const baseClasses =
		"flex items-center rounded-full px-3 py-2 text-sm cursor-pointer transition-colors";
	const activeClasses = isActive
		? " bg-[#16C79A] text-[#022135] font-semibold"
		: " text-gray-300 hover:bg-white/5";

	return (
		<button
			type="button"
			onClick={onClick}
			className={baseClasses + activeClasses}
		>
			{Icon && (
				<Icon
					className={
						"mr-2.5 h-4 w-4 " +
						(isActive ? "text-[#022135]" : "text-gray-400")
					}
				/>
			)}
			<span>{label}</span>
		</button>
	);
}

export default Sidebar;

