import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import React from "react";
import { useTranslation } from "react-i18next";
import PublicLayout from "../../layout/PublicLayout";
import {
  downloadResultPDF,
  downloadUploadedFile,
  getPatientResults,
  getUnviewedResults,
  markAsViewed,
} from "../../api/resultApi";
import {
  getPatientSubscriptions,
  subscribeToReminder,
  unsubscribeFromReminder,
} from "../../api/notificationApi";
import { getSafeErrorMessage } from "../../utils/errorHandler";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

// ---------------------------------------------------------------------------
// Small UI primitives
// ---------------------------------------------------------------------------
const StatusBadge = ({ status }) => {
  const styles =
    status === "released"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
};

const FieldRow = ({ label, value }) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div className="mt-0.5 text-sm text-slate-800">{value ?? "—"}</div>
  </div>
);

// ---------------------------------------------------------------------------
// ResultDetailView — mirrors the staff page component for consistency
// ---------------------------------------------------------------------------
function ResultDetailView({ result, onDownloadFile }) {
  if (!result) return null;
  const dt = result.discriminatorType || result.__t || result.testType || "";

  const renderFields = () => {
    if (dt === "BloodGlucose") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow label="Test Type" value={result.glucoseTestType} />
          <FieldRow
            label="Glucose Level"
            value={`${result.glucoseLevel} ${result.unit || "mg/dL"}`}
          />
          <FieldRow label="Interpretation" value={result.interpretation} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow label="Sample Type" value={result.sampleType} />
          <FieldRow label="Sample Quality" value={result.sampleQuality} />
          <FieldRow
            label="Collection Time"
            value={formatDateTime(result.sampleCollectionTime)}
          />
          {result.fastingDuration != null && (
            <FieldRow
              label="Fasting Duration"
              value={`${result.fastingDuration} hrs`}
            />
          )}
          {result.referenceRange && (
            <FieldRow
              label="Reference Range"
              value={`${result.referenceRange.normalMin}–${result.referenceRange.normalMax} ${result.unit || "mg/dL"}`}
            />
          )}
          {result.clinicalNotes && (
            <div className="col-span-full">
              <FieldRow label="Clinical Notes" value={result.clinicalNotes} />
            </div>
          )}
        </div>
      );
    }
    if (dt === "Hemoglobin") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow
            label="Hb Level"
            value={`${result.hemoglobinLevel} ${result.unit || "g/dL"}`}
          />
          <FieldRow label="Interpretation" value={result.interpretation} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow label="Patient Condition" value={result.patientCondition} />
          <FieldRow label="Sample Type" value={result.sampleType} />
          <FieldRow label="Sample Quality" value={result.sampleQuality} />
          <FieldRow
            label="Collection Time"
            value={formatDateTime(result.sampleCollectionTime)}
          />
        </div>
      );
    }
    if (dt === "BloodPressure") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow label="Systolic" value={`${result.systolicBP} mmHg`} />
          <FieldRow label="Diastolic" value={`${result.diastolicBP} mmHg`} />
          <FieldRow label="Pulse" value={`${result.pulseRate} bpm`} />
          <FieldRow label="Classification" value={result.classification} />
          <FieldRow label="Position" value={result.patientPosition} />
          <FieldRow label="Arm Used" value={result.armUsed} />
          <FieldRow label="Cuff Size" value={result.cuffSize} />
          <FieldRow label="Patient State" value={result.patientState} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow
            label="Measurement Time"
            value={formatDateTime(result.measurementTime)}
          />
        </div>
      );
    }
    if (dt === "Pregnancy") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow label="Result" value={result.result} />
          <FieldRow label="Test Type" value={result.pregnancyTestType} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow label="Sample Type" value={result.sampleType} />
          <FieldRow label="Sample Quality" value={result.sampleQuality} />
          <FieldRow
            label="Collection Time"
            value={formatDateTime(result.sampleCollectionTime)}
          />
          {result.hcgLevel != null && (
            <FieldRow
              label="hCG Level"
              value={`${result.hcgLevel} ${result.hcgUnit || "mIU/mL"}`}
            />
          )}
        </div>
      );
    }
    // Upload-based types: XRay, ECG, Ultrasound, AutomatedReport
    const files = result.uploadedFiles || [];
    return (
      <div className="space-y-4">
        {files.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Uploaded Files
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onDownloadFile && onDownloadFile(result, i)}
                  className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100"
                >
                  ↓ {f.fileName || `File ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}
        {dt === "XRay" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="Body Part" value={result.bodyPart} />
            <FieldRow label="Views" value={(result.views || []).join(", ")} />
            <FieldRow label="Interpretation" value={result.interpretation} />
            <FieldRow
              label="Clinical Indication"
              value={result.clinicalIndication}
            />
            <FieldRow label="Findings" value={result.findings} />
            <FieldRow label="Impression" value={result.impression} />
            {result.radiologistName && (
              <FieldRow label="Radiologist" value={result.radiologistName} />
            )}
          </div>
        )}
        {dt === "ECG" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="ECG Type" value={result.ecgType} />
            <FieldRow
              label="Heart Rate"
              value={result.heartRate ? `${result.heartRate} bpm` : "—"}
            />
            <FieldRow label="Rhythm" value={result.rhythm} />
            <FieldRow label="Interpretation" value={result.interpretation} />
            <FieldRow
              label="Clinical Indication"
              value={result.clinicalIndication}
            />
            <FieldRow label="Findings" value={result.findings} />
          </div>
        )}
        {dt === "Ultrasound" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="Study Type" value={result.studyType} />
            <FieldRow label="Interpretation" value={result.interpretation} />
            <FieldRow
              label="Clinical Indication"
              value={result.clinicalIndication}
            />
            <FieldRow label="Findings" value={result.findings} />
            <FieldRow label="Impression" value={result.impression} />
          </div>
        )}
        {dt === "AutomatedReport" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="Test Panel" value={result.testPanelName} />
            <FieldRow label="Category" value={result.testCategory} />
            <FieldRow label="Sample Type" value={result.sampleType} />
            <FieldRow
              label="Collection Time"
              value={formatDateTime(result.sampleCollectionTime)}
            />
            <FieldRow
              label="Analysis Time"
              value={formatDateTime(
                result.analysisTime || result.analysisCompletedTime,
              )}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
        <FieldRow label="Test" value={result.testTypeId?.name || dt || "—"} />
        <FieldRow
          label="Health Centre"
          value={result.healthCenterId?.name || "—"}
        />
        <FieldRow
          label="Status"
          value={<StatusBadge status={result.currentStatus} />}
        />
        <FieldRow label="Released" value={formatDateTime(result.releasedAt)} />
        <FieldRow
          label="Entered By"
          value={result.enteredBy?.fullName || "—"}
        />
      </div>
      {/* Discriminator-specific fields */}
      <div className="rounded-xl border border-slate-100 bg-white p-4">
        {renderFields()}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SubscriptionPrompt — shown inside the detail modal when monitoring recommended
// ---------------------------------------------------------------------------
function SubscriptionPrompt({ result, patientProfileId, onDone }) {
  const [busy, setBusy] = useState(false);
  const testTypeId = result?.testTypeId?._id;
  const testName = result?.testTypeId?.name || "This test";
  const freq = result?.testTypeId?.recommendedFrequency || "regularly";
  const dismissKey = `medilab.subDismissed.${testTypeId}`;

  const handleSubscribe = async () => {
    setBusy(true);
    try {
      await subscribeToReminder({
        patientProfileId,
        testTypeId,
        lastTestDate: result.releasedAt || new Date().toISOString(),
      });
      toast.success("Reminder set! We'll notify you when it's time.");
      onDone(true);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(dismissKey, "1");
    onDone(false);
  };

  return (
    <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
      <p className="text-sm font-medium text-teal-800">
        <span className="font-semibold">{testName}</span> should be monitored{" "}
        <span className="font-semibold">{freq}</span>. Set a reminder?
      </p>
      <div className="mt-3 flex gap-3">
        <button
          onClick={handleSubscribe}
          disabled={busy}
          className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Yes, Remind Me"}
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-full border border-teal-300 bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
        >
          No, Thanks
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// Main Page
// ===========================================================================
const HealthReportsPage = () => {
  const { user } = useAuth();
  const patientProfileId = user?.profile?._id || null;

  const [activeTab, setActiveTab] = useState("reports");

  // ---- Tab 1: reports state ----
  const [loadingReports, setLoadingReports] = useState(true);
  const [results, setResults] = useState([]);
  const [unviewedIds, setUnviewedIds] = useState(new Set());
  const [subscriptions, setSubscriptions] = useState([]);
  const [reportsError, setReportsError] = useState("");

  // ---- Detail modal ----
  const [detailResult, setDetailResult] = useState(null);
  const [showSubPrompt, setShowSubPrompt] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // ---- Tab 2: reminders state ----
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [remindersError, setRemindersError] = useState("");
  const [unsubscribingId, setUnsubscribingId] = useState(null);

  // -------------------------------------------------------------------------
  // Load reports + unviewed + subscriptions on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!patientProfileId) return;
    let cancelled = false;

    const load = async () => {
      setLoadingReports(true);
      setReportsError("");
      try {
        const [resultsRes, unviewedRes, subsRes] = await Promise.all([
          getPatientResults(patientProfileId),
          getUnviewedResults(patientProfileId),
          getPatientSubscriptions(patientProfileId),
        ]);

        if (cancelled) return;

        const list = Array.isArray(resultsRes?.data)
          ? resultsRes.data
          : Array.isArray(resultsRes?.results)
            ? resultsRes.results
            : Array.isArray(resultsRes)
              ? resultsRes
              : [];

        // Sort by releasedAt descending (fall back to createdAt)
        list.sort((a, b) => {
          const da = new Date(b.releasedAt || b.createdAt || 0);
          const db = new Date(a.releasedAt || a.createdAt || 0);
          return da - db;
        });

        const unviewedArr = Array.isArray(unviewedRes?.data)
          ? unviewedRes.data
          : Array.isArray(unviewedRes)
            ? unviewedRes
            : [];
        const unviewedSet = new Set(unviewedArr.map((r) => r._id || r));

        const subsList = Array.isArray(subsRes?.data)
          ? subsRes.data
          : Array.isArray(subsRes)
            ? subsRes
            : [];

        setResults(list);
        setUnviewedIds(unviewedSet);
        setSubscriptions(subsList);
      } catch (err) {
        if (!cancelled) setReportsError(getSafeErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingReports(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [patientProfileId]);

  // -------------------------------------------------------------------------
  // Open detail modal  — mark as viewed if needed
  // -------------------------------------------------------------------------
  const handleViewResult = useCallback(
    async (result) => {
      setDetailResult(result);

      if (unviewedIds.has(result._id)) {
        try {
          await markAsViewed(result._id, patientProfileId);
          setUnviewedIds((prev) => {
            const next = new Set(prev);
            next.delete(result._id);
            return next;
          });
        } catch {
          // non-critical, ignore silently
        }
      }

      // Decide whether to show subscription prompt
      const testTypeId = result.testTypeId?._id;
      const isRoutine = result.testTypeId?.isRoutineMonitoringRecommended;
      const alreadyDismissed = sessionStorage.getItem(
        `medilab.subDismissed.${testTypeId}`,
      );
      const hasActiveSub = subscriptions.some(
        (s) =>
          (s.testTypeId?._id || s.testTypeId) === testTypeId &&
          s.status === "active",
      );

      setShowSubPrompt(
        isRoutine && !alreadyDismissed && !hasActiveSub && !!testTypeId,
      );
    },
    [unviewedIds, subscriptions, patientProfileId],
  );

  const handleSubDone = (subscribed) => {
    if (subscribed) {
      // refresh subscriptions in state to prevent re-prompt
      const testTypeId = detailResult?.testTypeId?._id;
      if (testTypeId) {
        setSubscriptions((prev) => [...prev, { testTypeId, status: "active" }]);
      }
    }
    setShowSubPrompt(false);
  };

  // -------------------------------------------------------------------------
  // Download a single uploaded file by index
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
  // Download PDF (form-based) OR all uploaded files (upload-based)
  // -------------------------------------------------------------------------
  const handleDownload = async (result) => {
    const resultId = result._id?.toString?.() || result._id;
    const isUploadBased = (result.uploadedFiles?.length || 0) > 0;

    if (isUploadBased) {
      setDownloadingId(resultId);
      try {
        const files = result.uploadedFiles || [];
        for (let i = 0; i < files.length; i++) {
          await handleDownloadFile(result, i);
        }
      } finally {
        setDownloadingId(null);
      }
      return;
    }

    setDownloadingId(resultId);
    try {
      const blob = await downloadResultPDF(resultId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const testName = (result.testTypeId?.name || "Report").replace(
        /\s+/g,
        "_",
      );
      a.download = `MediLab_${testName}_${resultId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  // -------------------------------------------------------------------------
  // Tab 2: load reminders on tab switch (lazy)
  // -------------------------------------------------------------------------
  const remindersLoadedRef = useRef(false);

  useEffect(() => {
    if (activeTab !== "reminders" || remindersLoadedRef.current) return;
    if (!patientProfileId) return;
    remindersLoadedRef.current = true;
    let cancelled = false;

    const load = async () => {
      setLoadingReminders(true);
      setRemindersError("");
      try {
        const res = await getPatientSubscriptions(patientProfileId);
        if (cancelled) return;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setSubscriptions(list);
      } catch (err) {
        if (!cancelled) setRemindersError(getSafeErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingReminders(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, patientProfileId]);

  // -------------------------------------------------------------------------
  // Unsubscribe
  // -------------------------------------------------------------------------
  const handleUnsubscribe = async (sub) => {
    if (!window.confirm("Remove this reminder subscription?")) return;
    setUnsubscribingId(sub._id);
    try {
      await unsubscribeFromReminder(sub._id);
      setSubscriptions((prev) => prev.filter((s) => s._id !== sub._id));
      toast.success("Reminder removed.");
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setUnsubscribingId(null);
    }
  };

  // =========================================================================
  // Render
  // =========================================================================
  const tabs = [
    { key: "reports", label: "My Reports" },
    { key: "reminders", label: "Reminders" },
  ];

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-teal-600 px-5 py-3 text-white shadow-sm">
          <div>
            <h1 className="text-lg font-bold leading-tight">My Health Reports</h1>
            <p className="text-teal-100 text-xs mt-0.5">
              View lab results, imaging reports, and set up routine monitoring reminders.
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === t.key
                  ? "border-b-2 border-teal-600 text-teal-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
              {t.key === "reports" && unviewedIds.size > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-xs font-bold text-white">
                  {unviewedIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1 — My Reports                                                  */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "reports" && (
          <div>
            {loadingReports && (
              <div className="py-16 text-center text-slate-500 text-sm">
                Loading your reports…
              </div>
            )}
            {!loadingReports && reportsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
                {reportsError}
              </div>
            )}
            {!loadingReports && !reportsError && results.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-teal-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  No Reports Yet
                </h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Your results will appear here once the lab releases them. Book
                  a test to get started.
                </p>
              </div>
            )}

            {!loadingReports && !reportsError && results.length > 0 && (
              <div className="space-y-4">
                {results.map((r) => {
                  const isNew = unviewedIds.has(r._id);
                  const testName =
                    r.testTypeId?.name ||
                    r.discriminatorType ||
                    r.__t ||
                    "Test Result";
                  const centre = r.healthCenterId?.name || "—";
                  return (
                    <div
                      key={r._id}
                      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 px-6 py-4">
                        {/* Icon */}
                        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-teal-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800 text-sm">
                              {testName}
                            </span>
                            {isNew && (
                              <span className="inline-flex items-center rounded-full bg-teal-600 px-2 py-0.5 text-xs font-bold text-white">
                                New
                              </span>
                            )}
                            <StatusBadge status={r.currentStatus} />
                          </div>
                          <div className="mt-1 text-xs text-slate-500 flex gap-4 flex-wrap">
                            <span>{centre}</span>
                            <span>Released: {formatDate(r.releasedAt)}</span>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex shrink-0 gap-2 flex-wrap justify-end">
                          <button
                            onClick={() => handleViewResult(r)}
                            className="rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                          >
                            View Details
                          </button>
                          {r.currentStatus === "released" && (
                            <button
                              onClick={() => handleDownload(r)}
                              disabled={downloadingId === (r._id?.toString?.() || r._id)}
                              className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                              {downloadingId === (r._id?.toString?.() || r._id)
                                ? "Downloading…"
                                : (r.uploadedFiles?.length > 0 ? "Download All" : "Download PDF")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2 — Reminders                                                   */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "reminders" && (
          <div>
            {loadingReminders && (
              <div className="py-16 text-center text-slate-500 text-sm">
                Loading reminders…
              </div>
            )}
            {!loadingReminders && remindersError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
                {remindersError}
              </div>
            )}
            {!loadingReminders &&
              !remindersError &&
              subscriptions.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    No Reminders Set
                  </h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    When you view a test result that recommends routine
                    monitoring, you can subscribe to receive reminders.
                  </p>
                </div>
              )}

            {!loadingReminders &&
              !remindersError &&
              subscriptions.length > 0 && (
                <div className="space-y-4">
                  {subscriptions.map((sub) => {
                    const testName =
                      sub.testTypeId?.name || sub.testType?.name || "Test";
                    const freq =
                      sub.testTypeId?.recommendedFrequency ||
                      sub.recommendedFrequency ||
                      "Periodically";
                    const lastDate = formatDate(sub.lastTestDate);
                    const nextDate = formatDate(sub.nextReminderDate);
                    const isActive = sub.status === "active";
                    return (
                      <div
                        key={sub._id}
                        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                      >
                        <div className="flex items-center gap-4 px-6 py-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800 text-sm">
                                {testName}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                  isActive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {sub.status || "active"}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500 flex gap-4 flex-wrap">
                              <span>Frequency: {freq}</span>
                              <span>Last test: {lastDate}</span>
                              {nextDate !== "—" && (
                                <span>Next reminder: {nextDate}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnsubscribe(sub)}
                            disabled={unsubscribingId === sub._id}
                            className="shrink-0 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            {unsubscribingId === sub._id
                              ? "Removing…"
                              : "Unsubscribe"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Detail Modal                                                           */}
      {/* -------------------------------------------------------------------- */}
      {detailResult && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-12">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {detailResult.testTypeId?.name ||
                  detailResult.discriminatorType ||
                  "Result Details"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setDetailResult(null);
                  setShowSubPrompt(false);
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                &#10005;
              </button>
            </div>
            <div className="px-6 pb-6 pt-4 space-y-4">
              <ResultDetailView result={detailResult} onDownloadFile={handleDownloadFile} />

              {showSubPrompt && (
                <SubscriptionPrompt
                  result={detailResult}
                  patientProfileId={patientProfileId}
                  onDone={handleSubDone}
                />
              )}

              {detailResult.currentStatus === "released" && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDownload(detailResult)}
                    disabled={downloadingId === (detailResult._id?.toString?.() || detailResult._id)}
                    className="rounded-full bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    {downloadingId === (detailResult._id?.toString?.() || detailResult._id)
                      ? "Downloading…"
                      : (detailResult.uploadedFiles?.length > 0 ? "Download All" : "Download PDF")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default HealthReportsPage;
