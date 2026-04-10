import React from "react";
import { useLabCentre } from "../../context/LabCentreContext";

/**
 * LabCentrePicker
 *
 * Full-page prompt shown when no health centre is selected.
 * Any lab page can render this when selectedCentreId is empty.
 */
function LabCentrePicker() {
  const { labs, labsLoading, handleCentreSelect } = useLabCentre();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Select Health Centre
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose the health centre you are working at to continue.
        </p>
      </header>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Which health centre are you working at?
        </h2>
        {labsLoading && (
          <p className="text-sm text-slate-500">Loading health centres…</p>
        )}
        {!labsLoading && labs.length === 0 && (
          <p className="text-sm text-slate-500">No health centres found.</p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {labs.map((lab) => (
            <button
              key={lab._id}
              type="button"
              onClick={() => handleCentreSelect(lab._id, lab.name)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-left hover:border-teal-300 hover:bg-teal-50 transition-colors"
            >
              <div className="font-semibold text-slate-900 text-sm">
                {lab.name}
              </div>
              {lab.location && (
                <div className="mt-0.5 text-xs text-slate-500">
                  {lab.location}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LabCentrePicker;
