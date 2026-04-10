import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  HiChartBarSquare,
  HiDocumentText,
  HiPlusCircle,
  HiArchiveBox,
  HiBell,
} from "react-icons/hi2";

const NAV_ITEMS = [
  { label: "Overview", Icon: HiChartBarSquare, to: "/lab/overview" },
  { label: "Results", Icon: HiDocumentText, to: "/lab/results" },
  { label: "Submit New", Icon: HiPlusCircle, to: "/lab/submit" },
  { label: "Uncollected", Icon: HiArchiveBox, to: "/lab/uncollected" },
  { label: "Notifications", Icon: HiBell, to: "/lab/notifications" },
];

function LabTechnicianSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const displayName =
    user?.profile?.fullName ||
    user?.fullName ||
    user?.firstName ||
    "Lab Technician";

  const initials = displayName
    .split(" ")
    .filter((w) => w.length > 0 && !w.endsWith("."))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "LT";

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
        <div className="flex flex-col">
          <span className="text-teal-600 text-2xl font-bold">MediLab</span>
          <span className="text-[10px] font-normal text-slate-400 -mt-1 tracking-widest uppercase">
            Lab Technician
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, Icon, to }) => (
          <SidebarItem
            key={to}
            label={label}
            Icon={Icon}
            isActive={location.pathname === to}
            to={to}
          />
        ))}
      </nav>

      {/* User summary at bottom */}
      <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-4 text-xs">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D9488] text-[11px] font-semibold">
          {initials}
        </div>
        <div>
          <div className="font-semibold">{displayName}</div>
          <div className="text-gray-400">Lab Technician</div>
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
      <Icon
        className={`mr-3 h-5 w-5 ${isActive ? "text-[#022135]" : "text-gray-400"}`}
      />
      <span>{label}</span>
    </Link>
  );
}

export default LabTechnicianSidebar;
