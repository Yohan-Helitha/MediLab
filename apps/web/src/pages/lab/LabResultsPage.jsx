import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useLabCentre } from "../../context/LabCentreContext";
import Modal from "../../components/Modal";
import {
  getResultsByHealthCenter,
  getResultById,
  getStatusHistory,
  markAsPrinted,
  markAsCollected,
  softDeleteResult,
  updateResultStatus,
  updateTestResult,
  downloadUploadedFile,
} from "../../api/resultApi";
import { getSafeErrorMessage } from "../../utils/errorHandler";
import LabCentrePicker from "./LabCentrePicker";
import {
  formatDate,
  formatDateTime,
  StatusBadge,
  FieldRow,
  ResultDetailView,
  BloodGlucoseForm,
  HemoglobinForm,
  BloodPressureForm,
  PregnancyForm,
  FileUploadForm,
  UPLOAD_TYPES,
  buildPayload,
  validateFormDates,
  inputCls,
  selectCls,
  labelCls,
  textareaCls,
} from "./labFormHelpers";

export default function LabResultsPage() {
  const { user } = useAuth();
  const { selectedCentreId, selectedCentreName, handleCentreReset } =
    useLabCentre();

  const staffProfileId = user?.profile?._id || user?._id || null;

  // -------------------------------------------------------------------------
  // Results list state
  // -------------------------------------------------------------------------
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const loadResults = useCallback(async () => {
    if (!selectedCentreId) return;
    let cancelled = false;
    setResultsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (startFilter) params.startDate = startFilter;
      if (endFilter) params.endDate = endFilter;
      const data = await getResultsByHealthCenter(selectedCentreId, params);
      if (!cancelled) {
        const list =
          data?.data || data?.results || (Array.isArray(data) ? data : []);
        setResults(list);
      }
    } catch (err) {
      if (!cancelled) toast.error(getSafeErrorMessage(err));
    } finally {
      if (!cancelled) setResultsLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCentreId, statusFilter, startFilter, endFilter]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const filteredResults = useMemo(() => {
    const term = searchText.toLowerCase();
    return results.filter((r) => {
      if (!term) return true;
      const name = (
        r.patientProfileId?.full_name ||
        r.patientNameSnapshot ||
        ""
      ).toLowerCase();
      const test = (
        r.testTypeId?.name ||
        r.testNameSnapshot ||
        ""
      ).toLowerCase();
      return name.includes(term) || test.includes(term);
    });
  }, [results, searchText]);

  // -------------------------------------------------------------------------
  // View Modal
  // -------------------------------------------------------------------------
  const [viewResult, setViewResult] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const handleView = async (id) => {
    setViewLoading(true);
    setViewResult(null);
    setViewHistory(null);
    try {
      const [rRes, hRes] = await Promise.all([
        getResultById(id),
        getStatusHistory(id),
      ]);
      setViewResult(rRes?.data || rRes);
      setViewHistory(hRes?.data || hRes?.statusHistory || hRes || []);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setViewLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Download individual uploaded file
  // -------------------------------------------------------------------------
  const handleDownloadFile = async (result, fileIndex) => {
    const resultId = result._id?.toString?.() || result._id;
    const file = (result.uploadedFiles || [])[fileIndex];
    const fileName = file?.fileName || `file-${fileIndex}`;
    try {
      const blob = await downloadUploadedFile(resultId, fileIndex);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    }
  };

  // -------------------------------------------------------------------------
  // Release
  // -------------------------------------------------------------------------
  const [releaseTarget, setReleaseTarget] = useState(null);
  const [releasing, setReleasing] = useState(false);

  const handleRelease = async () => {
    if (!releaseTarget) return;
    setReleasing(true);
    try {
      await updateResultStatus(releaseTarget._id, "released", staffProfileId);
      toast.success("Result released. Patient can now view it.");
      setResults((prev) =>
        prev.map((r) =>
          r._id === releaseTarget._id
            ? {
                ...r,
                currentStatus: "released",
                releasedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      setReleaseTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setReleasing(false);
    }
  };

  // -------------------------------------------------------------------------
  // Mark Printed
  // -------------------------------------------------------------------------
  const [printTarget, setPrintTarget] = useState(null);
  const [printing, setPrinting] = useState(false);

  const handleMarkPrinted = async () => {
    if (!printTarget) return;
    setPrinting(true);
    try {
      await markAsPrinted(printTarget._id);
      toast.success("Marked as printed.");
      setResults((prev) =>
        prev.map((r) =>
          r._id === printTarget._id
            ? {
                ...r,
                hardCopyCollection: {
                  ...(r.hardCopyCollection || {}),
                  isPrinted: true,
                  printedAt: new Date().toISOString(),
                },
              }
            : r,
        ),
      );
      setPrintTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setPrinting(false);
    }
  };

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
      setResults((prev) =>
        prev.map((r) =>
          r._id === collectTarget._id
            ? {
                ...r,
                hardCopyCollection: {
                  ...(r.hardCopyCollection || {}),
                  isCollected: true,
                  collectedAt: new Date().toISOString(),
                },
              }
            : r,
        ),
      );
      setCollectTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setCollecting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete Modal
  // -------------------------------------------------------------------------
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteReason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters.");
      return;
    }
    setDeleting(true);
    try {
      await softDeleteResult(deleteTarget._id, deleteReason.trim());
      toast.success("Result deleted.");
      setResults((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
      setDeleteReason("");
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Edit Modal
  // -------------------------------------------------------------------------
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (result) => {
    const prefilled = {
      observations: result.observations || "",
      uploadedFiles: result.uploadedFiles || [],
      glucoseTestType: result.glucoseTestType,
      glucoseLevel: result.glucoseLevel,
      unit: result.unit,
      sampleType: result.sampleType,
      sampleQuality: result.sampleQuality,
      sampleCollectionTime: result.sampleCollectionTime
        ? new Date(result.sampleCollectionTime).toISOString().slice(0, 16)
        : "",
      fastingDuration: result.fastingDuration,
      method: result.method,
      interpretation: result.interpretation,
      referenceRangeNormalMin: result.referenceRange?.normalMin,
      referenceRangeNormalMax: result.referenceRange?.normalMax,
      clinicalNotes: result.clinicalNotes,
      hemoglobinLevel: result.hemoglobinLevel,
      patientCondition: result.patientCondition,
      systolicBP: result.systolicBP,
      diastolicBP: result.diastolicBP,
      pulseRate: result.pulseRate,
      patientPosition: result.patientPosition,
      armUsed: result.armUsed,
      cuffSize: result.cuffSize,
      patientState: result.patientState,
      measurementTime: result.measurementTime
        ? new Date(result.measurementTime).toISOString().slice(0, 16)
        : "",
      classification: result.classification,
      result: result.result,
      pregnancyTestType: result.pregnancyTestType,
      hcgLevel: result.hcgLevel,
      hcgUnit: result.hcgUnit,
      bodyPart: result.bodyPart,
      clinicalIndication: result.clinicalIndication,
      views: result.views || [],
      findings: result.findings,
      impression: result.impression,
      radiologistName: result.radiologistName,
      ecgType: result.ecgType,
      heartRate: result.heartRate,
      rhythm: result.rhythm,
      studyType: result.studyType,
      testPanelName: result.testPanelName,
      testCategory: result.testCategory,
      analysisCompletedTime: result.analysisTime
        ? new Date(result.analysisTime).toISOString().slice(0, 16)
        : "",
    };
    setEditForm(prefilled);
    setEditTarget(result);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    const dt =
      editTarget.discriminatorType ||
      editTarget.__t ||
      editTarget.testType ||
      "";
    setEditSaving(true);
    try {
      const dateError = validateFormDates(dt, editForm);
      if (dateError) {
        toast.error(dateError);
        setEditSaving(false);
        return;
      }
      const payload = {
        observations: editForm.observations || "",
        ...buildPayload(
          dt,
          editForm,
          editTarget,
          staffProfileId,
          selectedCentreId,
        ),
      };
      const res = await updateTestResult(editTarget._id, payload);
      const updated = res?.data || res;
      toast.success("Result updated.");
      setResults((prev) =>
        prev.map((r) => (r._id === editTarget._id ? { ...r, ...updated } : r)),
      );
      setEditTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setEditSaving(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Test Results</h1>
          <p className="mt-1 text-sm text-slate-500">
            Managing results for{" "}
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

      {/* Filters */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search patient or test…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={`${inputCls} max-w-xs`}
          />
          <select
            className={`${selectCls} max-w-[160px]`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="released">Released</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className={`${inputCls} w-38`}
              value={startFilter}
              onChange={(e) => setStartFilter(e.target.value)}
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              className={`${inputCls} w-38`}
              value={endFilter}
              onChange={(e) => setEndFilter(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={loadResults}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {resultsLoading && (
          <div className="p-6 text-sm text-slate-500">Loading results…</div>
        )}
        {!resultsLoading && filteredResults.length === 0 && (
          <div className="p-6 text-sm text-slate-500">
            No results found for this health centre.
          </div>
        )}
        {!resultsLoading && filteredResults.length > 0 && (
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
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hard Copy
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r) => {
                  const isPrinted = r.hardCopyCollection?.isPrinted;
                  const isCollected = r.hardCopyCollection?.isCollected;
                  return (
                    <tr
                      key={r._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.patientProfileId?.full_name ||
                          r.patientNameSnapshot ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.testTypeId?.name || r.testNameSnapshot || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.currentStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {isPrinted ? (
                          <span className="text-emerald-600 font-medium">
                            {isCollected ? "Collected" : "Printed"}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleView(r._id)}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          {r.currentStatus === "pending" && (
                            <button
                              type="button"
                              onClick={() => setReleaseTarget(r)}
                              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Release
                            </button>
                          )}
                          {r.currentStatus === "released" && !isPrinted && (
                            <button
                              type="button"
                              onClick={() => setPrintTarget(r)}
                              className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                            >
                              Mark Printed
                            </button>
                          )}
                          {isPrinted && !isCollected && (
                            <button
                              type="button"
                              onClick={() => setCollectTarget(r)}
                              className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                            >
                              Mark Collected
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(r);
                              setDeleteReason("");
                            }}
                            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================================
          MODALS
      ================================================================ */}

      {/* View Modal */}
      <Modal
        isOpen={viewResult !== null || viewLoading}
        title="Result Details"
        onClose={() => {
          setViewResult(null);
          setViewHistory(null);
        }}
      >
        {viewLoading ? (
          <p className="py-4 text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <ResultDetailView result={viewResult} onDownloadFile={handleDownloadFile} />
            {Array.isArray(viewHistory) && viewHistory.length > 0 && (
              <div>
                <div className={labelCls}>Status History</div>
                <div className="space-y-2">
                  {viewHistory.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs text-slate-600"
                    >
                      <StatusBadge status={h.status} />
                      <span>{formatDateTime(h.changedAt)}</span>
                      {h.changedBy?.fullName && (
                        <span>by {h.changedBy.fullName}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        title="Delete Result"
        onClose={() => {
          setDeleteTarget(null);
          setDeleteReason("");
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            This will soft-delete the result for{" "}
            <span className="font-semibold">
              {deleteTarget?.patientProfileId?.full_name ||
                deleteTarget?.patientNameSnapshot ||
                "this patient"}
            </span>
            . Results can only be permanently deleted by an Admin.
          </p>
          <div>
            <label className={labelCls}>
              Reason for deletion * (minimum 10 characters)
            </label>
            <textarea
              className={textareaCls}
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Provide a reason…"
            />
            {deleteReason.length > 0 && deleteReason.trim().length < 10 && (
              <p className="mt-1 text-xs text-rose-500">
                {10 - deleteReason.trim().length} more characters needed.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteReason("");
              }}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteReason.trim().length < 10 || deleting}
              onClick={handleDelete}
              className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editTarget !== null}
        title={`Edit Result — ${editTarget?.testTypeId?.name || editTarget?.testNameSnapshot || ""}`}
        onClose={() => setEditTarget(null)}
      >
        {editTarget && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {(() => {
              const dt =
                editTarget.discriminatorType ||
                editTarget.__t ||
                editTarget.testType ||
                "";
              if (dt === "BloodGlucose")
                return (
                  <BloodGlucoseForm form={editForm} setForm={setEditForm} />
                );
              if (dt === "Hemoglobin")
                return <HemoglobinForm form={editForm} setForm={setEditForm} />;
              if (dt === "BloodPressure")
                return (
                  <BloodPressureForm form={editForm} setForm={setEditForm} />
                );
              if (dt === "Pregnancy")
                return <PregnancyForm form={editForm} setForm={setEditForm} />;
              if (UPLOAD_TYPES.includes(dt))
                return (
                  <FileUploadForm
                    discriminatorType={dt}
                    form={editForm}
                    setForm={setEditForm}
                  />
                );
              return (
                <p className="text-sm text-rose-600">
                  Cannot determine test type for editing.
                </p>
              );
            })()}
            <div>
              <label className={labelCls}>Observations / Remarks</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={editForm.observations || ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, observations: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={editSaving}
                className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Release Confirmation Modal */}
      <Modal
        isOpen={releaseTarget !== null}
        title="Release Result to Patient"
        onClose={() => setReleaseTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Release the result for{" "}
            <span className="font-semibold">
              {releaseTarget?.patientProfileId?.full_name ||
                releaseTarget?.patientNameSnapshot ||
                "this patient"}
            </span>{" "}
            (
            <span className="font-semibold">
              {releaseTarget?.testTypeId?.name ||
                releaseTarget?.testNameSnapshot ||
                "test"}
            </span>
            ) to the patient portal? The patient will be able to view and
            download the report.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setReleaseTarget(null)}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={releasing}
              onClick={handleRelease}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              {releasing ? "Releasing…" : "Release"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Mark Printed Confirmation Modal */}
      <Modal
        isOpen={printTarget !== null}
        title="Mark Hard Copy as Printed"
        onClose={() => setPrintTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Mark the hard copy for{" "}
            <span className="font-semibold">
              {printTarget?.patientProfileId?.full_name ||
                printTarget?.patientNameSnapshot ||
                "this patient"}
            </span>{" "}
            as printed? The patient will be notified to collect their report.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPrintTarget(null)}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={printing}
              onClick={handleMarkPrinted}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40"
            >
              {printing ? "Saving…" : "Mark Printed"}
            </button>
          </div>
        </div>
      </Modal>

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
