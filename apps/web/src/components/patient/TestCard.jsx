import React from "react";
import { HiBeaker } from "react-icons/hi2";

function TestCard({ test }) {
  const price = test.price ? Number(test.price).toFixed(2) : "-";
  const time = test.estimatedResultTimeHours
    ? `${test.estimatedResultTimeHours} hours`
    : "";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md border border-slate-200">
      {/* Top row: icon + name */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
          <HiBeaker className="h-5 w-5 text-teal-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">
            {test.name}
          </div>
          <div className="mt-1 inline-flex items-center gap-2 text-[11px] text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide">
              {test.category || ""}
            </span>
            {price !== "-" && (
              <span className="text-emerald-600 font-medium text-xs">
                Rs {price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {test.description && (
        <div className="mt-3 text-xs leading-relaxed text-slate-600">
          {test.description}
        </div>
      )}

      {/* Footer: result time */}
      {time && (
        <div className="mt-3 text-xs text-slate-400">Estimated result time: {time}</div>
      )}
    </div>
  );
}

export default TestCard;
