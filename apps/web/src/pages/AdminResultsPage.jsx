import React, { useEffect, useState, useCallback } from "react";
import { getAllResultsAdmin, hardDeleteResult } from "../api/resultApi";
import { fetchLabs } from "../api/labApi";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "released", label: "Released" },
];

const statusBadge = (status) => {
  const cls =
    status === "released"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminResultsPage() {
  const [activeTab, setActiveTab] = useState("active"); // "active" | "deleted"

  // Filters
  const [healthCenterId, setHealthCenterId] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Labs for dropdown
  const [labs, setLabs] = useState([]);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hard delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // result object
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Load labs once
  useEffect(() => {
    fetchLabs()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setLabs(list);
      })
      .catch(() => {
        // non-critical — dropdown just won't populate
      });
  }, []);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        includeDeleted: activeTab === "deleted" ? "true" : undefined,
        ...(activeTab === "deleted" ? {} : {}), // active tab uses isDeleted:false (server default)
        healthCenterId: healthCenterId || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: LIMIT,
      };

      // When showing the "Soft Deleted" tab we need includeDeleted=true but we
      // also want ONLY deleted records. The service returns all (deleted + not)
      // when includeDeleted=true — we filter client-side.
      const res = await getAllResultsAdmin(params);
      let data = Array.isArray(res?.data) ? res.data : [];

      if (activeTab === "deleted") {
        data = data.filter((r) => r.isDeleted);
      } else {
        data = data.filter((r) => !r.isDeleted);
      }

      setResults(data);
      setTotal(res?.total ?? data.length);
    } catch (err) {
      setError(err.message || "Failed to load results");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, healthCenterId, status, startDate, endDate, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, healthCenterId, status, startDate, endDate]);

  // ── Hard delete handlers ──────────────────────────────────────────────────
  const openDeleteModal = (result) => {
    setDeleteTarget(result);
    setDeleteReason("");
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteReason("");
    setDeleteError(null);
    setDeleteLoading(false);
  };

  const confirmDelete = async () => {
    if (deleteReason.trim().length < 10) {
      setDeleteError("Reason must be at least 10 characters.");
      return;
    }
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await hardDeleteResult(deleteTarget._id, deleteReason.trim());
      closeDeleteModal();
      load();
    } catch (err) {
      setDeleteError(err.message || "Delete failed. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">Test Results</h2>
        <p className="text-sm text-slate-500">
          View and manage test results across all health centers.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {[
          { key: "active", label: "Active" },
          { key: "deleted", label: "Soft Deleted" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={healthCenterId}
          onChange={(e) => setHealthCenterId(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All health centers</option>
          {labs.map((lab) => (
            <option key={lab._id} value={lab._id}>
              {lab.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="From"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="To"
        />

        <button
          onClick={() => {
            setHealthCenterId("");
            setStatus("");
            setStartDate("");
            setEndDate("");
          }}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
        >
          Clear filters
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm">
        {isLoading && (
          <div className="p-6 text-sm text-slate-500">Loading results…</div>
        )}
        {error && (
          <div className="p-6 text-sm text-rose-600">{error}</div>
        )}

        {!isLoading && results.length === 0 && !error && (
          <div className="p-6 text-sm text-slate-500">No results found.</div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Test type</th>
                  <th className="px-4 py-3 font-medium">Health center</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Entered by</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  {activeTab === "deleted" && (
                    <th className="px-4 py-3 font-medium">Delete reason</th>
                  )}
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-slate-800">
                      {r.patientProfileId?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.testTypeId?.name ?? "—"}
                      {r.testTypeId?.code && (
                        <span className="ml-1 text-xs text-slate-400">
                          ({r.testTypeId.code})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.healthCenterId?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(r.currentStatus)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.enteredBy?.fullName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {fmt(r.createdAt)}
                    </td>
                    {activeTab === "deleted" && (
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {r.deleteReason ?? "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDeleteModal(r)}
                        className="rounded-md bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        Hard delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500 border-t">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border px-3 py-1 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hard Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-semibold text-slate-800">
              Permanently delete result?
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              This action{" "}
              <span className="font-semibold text-rose-600">cannot be undone</span>.
              The result record will be removed from the database.
            </p>

            {/* Summary */}
            <div className="mb-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 space-y-1">
              <div>
                <span className="font-medium">Patient:</span>{" "}
                {deleteTarget.patientProfileId?.full_name ?? "—"}
              </div>
              <div>
                <span className="font-medium">Test:</span>{" "}
                {deleteTarget.testTypeId?.name ?? "—"}
              </div>
              <div>
                <span className="font-medium">Health center:</span>{" "}
                {deleteTarget.healthCenterId?.name ?? "—"}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {deleteTarget.currentStatus}
              </div>
              <div>
                <span className="font-medium">Date:</span>{" "}
                {fmt(deleteTarget.createdAt)}
              </div>
            </div>

            {/* Reason input */}
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Reason for permanent deletion{" "}
              <span className="text-slate-400">(min 10 characters)</span>
            </label>
            <textarea
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Describe why this result is being permanently deleted…"
              className="mb-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <div className="mb-4 text-right text-xs text-slate-400">
              {deleteReason.trim().length} / 10 min
            </div>

            {deleteError && (
              <p className="mb-3 text-sm text-rose-600">{deleteError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="rounded-lg border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading || deleteReason.trim().length < 10}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
              >
                {deleteLoading ? "Deleting…" : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
