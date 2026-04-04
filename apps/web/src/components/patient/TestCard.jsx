import React from "react";
import { HiBeaker } from "react-icons/hi2";

function TestCard({
  test,
  availabilityStatus,
  preInstructions = [],
  postInstructions = [],
  onBookTest,
}) {
  const price = test.price ? Number(test.price).toFixed(2) : "-";
  const time = test.estimatedResultTimeHours
    ? `${test.estimatedResultTimeHours} hours`
    : "";

  const normalizedStatus = availabilityStatus || "";
  const isUnavailable =
    normalizedStatus && normalizedStatus !== "AVAILABLE";
  const statusLabel =
    normalizedStatus === "AVAILABLE" ? "Available" : normalizedStatus || "";
  const statusClasses = isUnavailable
    ? "bg-red-50 text-red-600"
    : "bg-emerald-50 text-emerald-700";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md border border-slate-200 hover:scale-[1.02] hover:shadow-lg hover:border-teal-500/50 hover:bg-slate-50/50 transition-all duration-300">
      {/* Top row: icon + name + optional availability */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
          <HiBeaker className="h-5 w-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {test.name}
            </div>
            {statusLabel && (
              <span
                className={`ml-2 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClasses}`}
              >
                {statusLabel}
              </span>
            )}
          </div>
          <div className="mt-1 inline-flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
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
        <div className="mt-3 text-xs text-slate-400">
          Estimated result time: {time}
        </div>
      )}

      {/* Pre/Post instructions (lab details page) */}
      {(preInstructions.length > 0 || postInstructions.length > 0) && (
        <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
          {preInstructions.length > 0 && (
            <div>
              <div className="font-semibold text-slate-800 mb-1">
                Before the test
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {preInstructions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {postInstructions.length > 0 && (
            <div>
              <div className="font-semibold text-slate-800 mb-1">
                After the test
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {postInstructions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {onBookTest && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onBookTest}
            className={`w-full rounded-full px-4 py-2 text-sm font-medium text-center ${
              isUnavailable
                ? "bg-slate-300 text-slate-700 hover:bg-slate-300"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            Book Test
          </button>
        </div>
      )}
    </div>
  );
}

export default TestCard;
