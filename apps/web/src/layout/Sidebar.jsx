import React from "react";
import {
	HiBuildingOffice2,
	HiBeaker,
	HiAdjustmentsVertical,
	HiDocumentText,
	HiGlobeAlt,
} from "react-icons/hi2";

function Sidebar() {
	return (
		<aside className="flex min-h-screen w-64 flex-col bg-[#0F172A] px-5 py-6 text-white">
			{/* Logo */}
			<div className="mb-8 flex items-center text-xl font-semibold tracking-tight">
				<div className="mr-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#0D9488]">
					{/* Simple heartbeat icon */}
					<svg
						viewBox="0 0 24 24"
						aria-hidden="true"
						className="h-4 w-4 text-white"
					>
						<path
							fill="currentColor"
							d="M3 12h4l1.5-3 3 6 2-4h7"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				<span className="text-[#0D9488]">MediLab</span>
			</div>

			{/* Navigation */}
			<nav className="mt-2 flex-1 space-y-1">
				<SidebarItem
					label="Lab Management"
					Icon={HiBuildingOffice2}
					isActive
				/>
				<SidebarItem
					label="Test Management"
					Icon={HiBeaker}
					isActive={false}
				/>
				<SidebarItem
					label="Test Availability"
					Icon={HiAdjustmentsVertical}
					isActive={false}
				/>
				<SidebarItem
					label="Test Instructions"
					Icon={HiDocumentText}
					isActive={false}
				/>
				<SidebarItem
					label="Language Management"
					Icon={HiGlobeAlt}
					isActive={false}
				/>
			</nav>

			{/* User summary at bottom */}
			<div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-4 text-xs">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F2347] text-[11px] font-semibold">
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

function SidebarItem({ label, isActive, Icon }) {
	const baseClasses =
		"flex items-center rounded-full px-3 py-2 text-sm cursor-pointer transition-colors";
	const activeClasses = isActive
		? " bg-[#16C79A] text-[#022135] font-semibold"
		: " text-gray-300 hover:bg-white/5";

	return (
		<div className={baseClasses + activeClasses}>
			{Icon && (
				<Icon
					className={
						"mr-2.5 h-4 w-4 " +
						(isActive ? "text-[#022135]" : "text-gray-400")
					}
				/>
			)}
			<span>{label}</span>
		</div>
	);
}

export default Sidebar;

