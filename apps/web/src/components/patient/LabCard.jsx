import React from "react";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { formatHours } from "../../utils/format";

function LabCard({ lab, onView }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-md border border-slate-200 hover:scale-[1.02] hover:shadow-lg hover:border-teal-500/50 hover:bg-slate-50/50 transition-all duration-300">
      {/* Top: icon + name + location */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
          <HiBuildingOffice2 className="h-6 w-6 text-teal-600" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{lab.name}</h3>
          <div className="mt-1 text-xs text-slate-500">{lab.district}</div>
        </div>
      </div>

      {/* Middle: contact + status + hours */}
      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 19.72V23a2 2 0 01-2 2h-1C9.82 25 3 18.18 3 10V5z"
            />
          </svg>
          <span>{lab.phoneNumber || "-"}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {lab.operatingHours && lab.operatingHours.length
              ? formatHours(lab.operatingHours)
              : "Hours not set"}
          </span>
        </div>

        <div className="ml-auto text-xs font-semibold text-emerald-600">
          {lab.operationalStatus || ""}
        </div>
      </div>

      {/* Bottom: status + action */}
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs">
          {lab.isActive ? "Active" : "Inactive"}
        </span>
        <button
          type="button"
          onClick={() => onView(lab)}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          View Details 
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export default LabCard;
