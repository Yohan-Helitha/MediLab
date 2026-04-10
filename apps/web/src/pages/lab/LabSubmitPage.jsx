import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useLabCentre } from "../../context/LabCentreContext";
import { getBookingById } from "../../api/bookingApi";
import { submitTestResult } from "../../api/resultApi";
import { apiRequest } from "../../api/client";
import { getSafeErrorMessage } from "../../utils/errorHandler";
import LabCentrePicker from "./LabCentrePicker";
import {
  formatDate,
  FieldRow,
  BloodGlucoseForm,
  HemoglobinForm,
  BloodPressureForm,
  PregnancyForm,
  FileUploadForm,
  UPLOAD_TYPES,
  buildPayload,
  inputCls,
  textareaCls,
} from "./labFormHelpers";

export default function LabSubmitPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCentreId, selectedCentreName, handleCentreReset } =
    useLabCentre();

  const staffProfileId = user?.profile?._id || user?._id || null;
  const staffName = user?.fullName || user?.profile?.fullName || "Staff";

  // -------------------------------------------------------------------------
  // Pending bookings auto-list
  // -------------------------------------------------------------------------
  const [pendingBookings, setPendingBookings] = useState([]);
  const [pendingBookingsLoading, setPendingBookingsLoading] = useState(false);
  const pendingLoadedCentreRef = useRef("");

  const loadPendingBookings = useCallback(async () => {
    if (!selectedCentreId) return;
    setPendingBookingsLoading(true);
    let cancelled = false;
    try {
      const data = await apiRequest(`/api/bookings/center/${selectedCentreId}`);
      if (cancelled) return;
      const raw =
        data?.bookings?.bookings ||
        data?.bookings ||
        (Array.isArray(data) ? data : []);
      const pending = raw.filter(
        (b) => b.status !== "COMPLETED" && b.status !== "CANCELLED",
      );
      setPendingBookings(pending);
    } catch (err) {
      if (!cancelled) toast.error(getSafeErrorMessage(err));
    } finally {
      if (!cancelled) setPendingBookingsLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCentreId]);

  useEffect(() => {
    if (
      selectedCentreId &&
      pendingLoadedCentreRef.current !== selectedCentreId
    ) {
      pendingLoadedCentreRef.current = selectedCentreId;
      loadPendingBookings();
    }
  }, [selectedCentreId, loadPendingBookings]);

  // -------------------------------------------------------------------------
  // Booking selection + form state
  // -------------------------------------------------------------------------
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [bookingLookupLoading, setBookingLookupLoading] = useState(false);
  const [foundBooking, setFoundBooking] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1=find, 2=fill
  const [submitForm, setSubmitForm] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSelectPendingBooking = (booking) => {
    setBookingIdInput(booking._id);
    setFoundBooking(booking);
  };

  const handleFindBooking = async () => {
    if (!bookingIdInput.trim()) {
      toast.error("Enter a booking ID.");
      return;
    }
    if (!selectedCentreId) {
      toast.error("Select your health centre first.");
      return;
    }
    setBookingLookupLoading(true);
    setFoundBooking(null);
    try {
      const data = await getBookingById(bookingIdInput.trim());
      const booking = data?.booking || data;
      const centreId = booking?.healthCenterId?._id || booking?.healthCenterId;
      if (centreId && centreId.toString() !== selectedCentreId) {
        toast.error("Booking not found at this health centre.");
      } else {
        setFoundBooking(booking);
      }
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setBookingLookupLoading(false);
    }
  };

  const handleUseBooking = () => {
    setSubmitForm({});
    setBookingStep(2);
  };

  const handleSubmitResult = async () => {
    if (!foundBooking) return;
    const discriminatorType = foundBooking.diagnosticTestId?.discriminatorType;
    if (!discriminatorType) {
      toast.error(
        "Could not determine test type. Please contact Arani (TestType configuration).",
      );
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = buildPayload(
        discriminatorType,
        submitForm,
        foundBooking,
        staffProfileId,
        selectedCentreId,
      );
      await submitTestResult(payload);
      toast.success("Result submitted successfully!");
      // Reset form state
      setBookingIdInput("");
      setFoundBooking(null);
      setBookingStep(1);
      setSubmitForm({});
      // Invalidate cached centre so pending bookings reload on next visit
      pendingLoadedCentreRef.current = "";
      // Navigate to results page — LabResultsPage will load fresh data on mount
      navigate("/lab/results");
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setSubmitLoading(false);
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
            Submit New Result
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter results for bookings at{" "}
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

      {/* Step indicator */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${bookingStep === 1 ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}
            >
              1
            </span>
            <span
              className={`text-sm font-medium ${bookingStep === 1 ? "text-slate-800" : "text-slate-400"}`}
            >
              Select Booking
            </span>
            <span className="text-slate-300">›</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${bookingStep === 2 ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-400"}`}
            >
              2
            </span>
            <span
              className={`text-sm font-medium ${bookingStep === 2 ? "text-slate-800" : "text-slate-400"}`}
            >
              Enter Results
              {bookingStep === 2 && foundBooking && (
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  {foundBooking.patientProfileId?.full_name ||
                    foundBooking.patientNameSnapshot ||
                    ""}
                  {" · "}
                  {foundBooking.diagnosticTestId?.name ||
                    foundBooking.testNameSnapshot ||
                    ""}
                </span>
              )}
            </span>
          </div>
          {bookingStep === 2 && (
            <button
              type="button"
              onClick={() => {
                setBookingStep(1);
                setFoundBooking(null);
                setBookingIdInput("");
                setSubmitForm({});
              }}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              ← Back to booking selection
            </button>
          )}
        </div>
      </div>

      {/* Step 1 — Select booking */}
      {bookingStep === 1 && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 space-y-5">
            {/* Auto-list of pending bookings */}
            {pendingBookingsLoading && (
              <p className="text-xs text-slate-400">Loading bookings…</p>
            )}
            {pendingBookings.length > 0 && !foundBooking && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Pending Bookings at This Centre
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pendingBookings.map((b) => (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => handleSelectPendingBooking(b)}
                      className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-sm font-semibold text-slate-800">
                            {b.patientProfileId?.full_name ||
                              b.patientNameSnapshot ||
                              "—"}
                          </span>
                          <span className="ml-3 text-xs text-slate-500">
                            {b.diagnosticTestId?.name ||
                              b.testNameSnapshot ||
                              "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                          <span>{formatDate(b.bookingDate)}</span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-semibold capitalize">
                            {b.status?.toLowerCase() || "pending"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Search by Booking ID
              </p>
              <div className="flex gap-3 max-w-lg">
                <input
                  type="text"
                  placeholder="Booking ID (MongoDB ObjectId)"
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFindBooking();
                  }}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={handleFindBooking}
                  disabled={bookingLookupLoading}
                  className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {bookingLookupLoading ? "Searching…" : "Find"}
                </button>
              </div>
            </div>

            {foundBooking && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-teal-800">
                    Booking Found
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFoundBooking(null);
                      setBookingIdInput("");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    ← Choose different
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm">
                  <FieldRow
                    label="Patient"
                    value={
                      foundBooking.patientProfileId?.full_name ||
                      foundBooking.patientNameSnapshot ||
                      "—"
                    }
                  />
                  <FieldRow
                    label="Test"
                    value={
                      foundBooking.diagnosticTestId?.name ||
                      foundBooking.testNameSnapshot ||
                      "—"
                    }
                  />
                  <FieldRow
                    label="Booking Date"
                    value={formatDate(foundBooking.bookingDate)}
                  />
                  <FieldRow label="Type" value={foundBooking.bookingType} />
                  <FieldRow
                    label="Entry Method"
                    value={foundBooking.diagnosticTestId?.entryMethod || "—"}
                  />
                  <FieldRow
                    label="Discriminator"
                    value={
                      foundBooking.diagnosticTestId?.discriminatorType || "—"
                    }
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleUseBooking}
                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    Use This Booking →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2 — Enter results */}
      {bookingStep === 2 && foundBooking && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-800">
            Enter Results —{" "}
            {foundBooking.diagnosticTestId?.discriminatorType || ""}
          </h2>

          {/* Context row */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm sm:grid-cols-3">
            <FieldRow
              label="Patient"
              value={
                foundBooking.patientProfileId?.full_name ||
                foundBooking.patientNameSnapshot ||
                "—"
              }
            />
            <FieldRow
              label="Test"
              value={
                foundBooking.diagnosticTestId?.name ||
                foundBooking.testNameSnapshot ||
                "—"
              }
            />
            <FieldRow
              label="Booking Date"
              value={formatDate(foundBooking.bookingDate)}
            />
            <FieldRow label="Centre" value={selectedCentreName} />
            <FieldRow label="Entered By" value={staffName} />
          </div>

          {/* Discriminator-specific form */}
          {(() => {
            const dt = foundBooking.diagnosticTestId?.discriminatorType;
            if (dt === "BloodGlucose")
              return (
                <BloodGlucoseForm form={submitForm} setForm={setSubmitForm} />
              );
            if (dt === "Hemoglobin")
              return (
                <HemoglobinForm form={submitForm} setForm={setSubmitForm} />
              );
            if (dt === "BloodPressure")
              return (
                <BloodPressureForm form={submitForm} setForm={setSubmitForm} />
              );
            if (dt === "Pregnancy")
              return (
                <PregnancyForm form={submitForm} setForm={setSubmitForm} />
              );
            if (UPLOAD_TYPES.includes(dt))
              return (
                <FileUploadForm
                  discriminatorType={dt}
                  form={submitForm}
                  setForm={setSubmitForm}
                />
              );
            return (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                Test type <strong>{dt || "(unknown)"}</strong> does not have a
                form yet. Please ensure the test type was configured correctly
                by Arani.
              </div>
            );
          })()}

          {/* Observations */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Observations / Remarks
            </label>
            <textarea
              className={textareaCls}
              rows={3}
              maxLength={1000}
              value={submitForm.observations || ""}
              onChange={(e) =>
                setSubmitForm((p) => ({ ...p, observations: e.target.value }))
              }
              placeholder="Optional clinical notes…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setBookingStep(1);
                setFoundBooking(null);
                setBookingIdInput("");
                setSubmitForm({});
              }}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitResult}
              disabled={submitLoading}
              className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {submitLoading ? "Submitting…" : "Submit Result"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
