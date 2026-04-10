import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLabCentre } from "../../context/LabCentreContext";
import Modal from "../../components/Modal";
import { getUncollectedReports, markAsCollected } from "../../api/resultApi";
import { getSafeErrorMessage } from "../../utils/errorHandler";
import LabCentrePicker from "./LabCentrePicker";
import { formatDate, daysSince, inputCls } from "./labFormHelpers";

export default function LabUncollectedPage() {
  const { selectedCentreId, selectedCentreName, handleCentreReset } =
    useLabCentre();

  // -------------------------------------------------------------------------
  // Uncollected list state
  // -------------------------------------------------------------------------
  const [uncollected, setUncollected] = useState([]);
  const [uncollectedLoading, setUncollectedLoading] = useState(false);
  const [daysThreshold, setDaysThreshold] = useState("1");

  const loadUncollected = useCallback(async () => {
    if (!selectedCentreId) return;
    let cancelled = false;
    setUncollectedLoading(true);
    try {
      const data = await getUncollectedReports({
        centerId: selectedCentreId,
        daysThreshold,
      });
      if (!cancelled) {
        const list =
          data?.data || data?.results || (Array.isArray(data) ? data : []);
        setUncollected(list);
      }
    } catch (err) {
      if (!cancelled) toast.error(getSafeErrorMessage(err));
    } finally {
      if (!cancelled) setUncollectedLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCentreId, daysThreshold]);

  useEffect(() => {
    loadUncollected();
  }, [loadUncollected]);

  // -------------------------------------------------------------------------
  // Mark Collected
  // -------------------------------------------------------------------------
  const [collectTarget, setCollectTarget] = useState(null);
  const [collecting, setCollecting] = useState(false);

  const handleMarkCollected = async () => {
    if (!collectTarget) return;
    setCollecting(true);
    try {
      await markAsCollected(collectTarget._id);
      toast.success("Marked as collected.");
      setUncollected((prev) => prev.filter((r) => r._id !== collectTarget._id));
      setCollectTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setCollecting(false);
    }
  };

  // -------------------------------------------------------------------------
  // No centre selected
  // -------------------------------------------------------------------------
  if (!selectedCentreId) {
    return <LabCentrePicker />;
  }

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Uncollected Hard Copies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Printed reports awaiting collection at{" "}
            <span className="font-semibold text-teal-700">
              {selectedCentreName}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleCentreReset}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Change centre
        </button>
      </header>

      {/* Filter bar */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              Reports older than
            </label>
            <input
              type="number"
              min="0"
              max="365"
              className={`${inputCls} w-20`}
              value={daysThreshold}
              onChange={(e) => setDaysThreshold(e.target.value)}
            />
            <span className="text-sm text-slate-600">day(s)</span>
          </div>
          <button
            type="button"
            onClick={loadUncollected}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {uncollectedLoading && (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        )}
        {!uncollectedLoading && uncollected.length === 0 && (
          <div className="p-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              No uncollected hard copy reports found for this threshold.
            </div>
          </div>
        )}
        {!uncollectedLoading && uncollected.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Test
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Printed
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Days Waiting
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uncollected.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {r.patientProfileId?.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.testTypeId?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {r.patientProfileId?.contact_number || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(r.hardCopyCollection?.printedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {r.hardCopyCollection?.printedAt ? (
                        <span
                          className={`font-semibold ${
                            daysSince(r.hardCopyCollection.printedAt) >= 3
                              ? "text-rose-600"
                              : "text-amber-600"
                          }`}
                        >
                          {daysSince(r.hardCopyCollection.printedAt)} day(s)
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setCollectTarget(r)}
                        className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                      >
                        Mark Collected
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Collected Confirmation Modal */}
      <Modal
        isOpen={collectTarget !== null}
        title="Mark Hard Copy as Collected"
        onClose={() => setCollectTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Confirm that{" "}
            <span className="font-semibold">
              {collectTarget?.patientProfileId?.full_name ||
                collectTarget?.patientNameSnapshot ||
                "the patient"}
            </span>{" "}
            has collected their hard copy report?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCollectTarget(null)}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={collecting}
              onClick={handleMarkCollected}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40"
            >
              {collecting ? "Saving…" : "Mark Collected"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
