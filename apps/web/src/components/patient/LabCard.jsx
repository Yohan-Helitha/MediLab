import React from "react";
import { formatHours } from "../../utils/format";

function LabCard({ lab, onView }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{lab.name}</h3>
          <div className="mt-2 text-sm text-slate-500">{lab.district}</div>
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
            <div>{lab.phoneNumber || "-"}</div>
            <div>{lab.operationalStatus || ""}</div>
            <div>{lab.operatingHours && lab.operatingHours.length ? formatHours(lab.operatingHours) : "Hours not set"}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 text-xs">{lab.isActive ? 'Active' : 'Inactive'}</span>
          <button onClick={() => onView(lab)} className="text-teal-600 text-sm">View Details →</button>
        </div>
      </div>
    </div>
  );
}

export default LabCard;
