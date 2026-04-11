import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  getAllNotifications,
  getFailedNotifications,
  getPatientNotifications,
  resendNotification,
} from "../../api/notificationApi";
import { getSafeErrorMessage } from "../../utils/errorHandler";
import { formatDateTime, inputCls } from "./labFormHelpers";

export default function LabNotificationsPage() {
  // -------------------------------------------------------------------------
  // Sub-tab: "all" | "failed" | "history"
  // -------------------------------------------------------------------------
  const [notifTab, setNotifTab] = useState("all");

  // -------------------------------------------------------------------------
  // All notifications
  // -------------------------------------------------------------------------
  const [allNotifs, setAllNotifs] = useState([]);
  const [allNotifsLoading, setAllNotifsLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Failed notifications
  // -------------------------------------------------------------------------
  const [failedNotifs, setFailedNotifs] = useState([]);
  const [failedLoading, setFailedLoading] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  // -------------------------------------------------------------------------
  // History (by patient profile ID)
  // -------------------------------------------------------------------------
  const [notifPatientId, setNotifPatientId] = useState("");
  const [notifHistory, setNotifHistory] = useState([]);
  const [notifHistoryLoading, setNotifHistoryLoading] = useState(false);

  // Guard so we only load once on mount
  const notifLoadedRef = useRef(false);

  // -------------------------------------------------------------------------
  // Load functions
  // -------------------------------------------------------------------------
  const loadFailedNotifs = useCallback(async () => {
    setFailedLoading(true);
    try {
      const data = await getFailedNotifications({ limit: 50 });
      const list =
        data?.data || data?.notifications || (Array.isArray(data) ? data : []);
      setFailedNotifs(list);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setFailedLoading(false);
    }
  }, []);

  const loadAllNotifs = useCallback(async () => {
    setAllNotifsLoading(true);
    try {
      const data = await getAllNotifications({ limit: 100 });
      const list =
        data?.data || data?.notifications || (Array.isArray(data) ? data : []);
      setAllNotifs(list);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setAllNotifsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!notifLoadedRef.current) {
      notifLoadedRef.current = true;
      loadFailedNotifs();
      loadAllNotifs();
    }
  }, [loadFailedNotifs, loadAllNotifs]);

  // -------------------------------------------------------------------------
  // Resend handler
  // -------------------------------------------------------------------------
  const handleResend = async (id) => {
    setResendingId(id);
    try {
      await resendNotification(id);
      toast.success("Notification resent successfully.");
      setFailedNotifs((prev) => prev.filter((n) => n._id !== id));
      setAllNotifs((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: "sent" } : n)),
      );
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setResendingId(null);
    }
  };

  // -------------------------------------------------------------------------
  // History search
  // -------------------------------------------------------------------------
  const handleLoadNotifHistory = async () => {
    if (!notifPatientId.trim()) {
      toast.error("Enter a patient profile ID.");
      return;
    }
    setNotifHistoryLoading(true);
    try {
      const data = await getPatientNotifications(notifPatientId.trim(), {
        limit: 50,
      });
      const list =
        data?.data || data?.notifications || (Array.isArray(data) ? data : []);
      setNotifHistory(list);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setNotifHistoryLoading(false);
    }
  };

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor and manage patient notification delivery.
        </p>
      </header>

      {/* Sub-tab bar + Refresh */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {[
              { key: "all", label: "All" },
              { key: "failed", label: "Failed" },
              { key: "history", label: "History" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setNotifTab(t.key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                  notifTab === t.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
                {t.key === "failed" && failedNotifs.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700">
                    {failedNotifs.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              notifLoadedRef.current = false;
              loadFailedNotifs();
              loadAllNotifs();
            }}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* All notifications sub-tab                                           */}
      {/* ------------------------------------------------------------------ */}
      {notifTab === "all" && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          {allNotifsLoading && (
            <div className="p-6 text-sm text-slate-500">
              Loading notifications…
            </div>
          )}
          {!allNotifsLoading && allNotifs.length === 0 && (
            <div className="p-6 text-sm text-slate-500">
              No notifications sent yet.
            </div>
          )}
          {!allNotifsLoading && allNotifs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Channel
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Recipient
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sent At
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allNotifs.map((n) => (
                    <tr
                      key={n._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                        {(n.type || "").replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-slate-500 capitalize">
                        {n.channel || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {n.recipient || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            n.status === "sent"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {n.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateTime(n.sentAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {n.status === "failed" && (
                          <button
                            type="button"
                            disabled={resendingId === n._id}
                            onClick={() => handleResend(n._id)}
                            className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                          >
                            {resendingId === n._id ? "Sending…" : "Resend"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Failed notifications sub-tab                                        */}
      {/* ------------------------------------------------------------------ */}
      {notifTab === "failed" && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          {failedLoading && (
            <div className="p-6 text-sm text-slate-500">Loading…</div>
          )}
          {!failedLoading && failedNotifs.length === 0 && (
            <div className="p-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                No failed notifications — all deliveries are up to date.
              </div>
            </div>
          )}
          {!failedLoading && failedNotifs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Channel
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Recipient
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sent At
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Error
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {failedNotifs.map((n) => (
                    <tr
                      key={n._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                        {(n.type || "").replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-slate-500 capitalize">
                        {n.channel || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {n.recipient || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateTime(n.sentAt)}
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-rose-600 max-w-[200px] truncate"
                        title={n.errorMessage}
                      >
                        {n.errorMessage || "Unknown error"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={resendingId === n._id}
                          onClick={() => handleResend(n._id)}
                          className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                          {resendingId === n._id ? "Sending…" : "Resend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* History sub-tab                                                     */}
      {/* ------------------------------------------------------------------ */}
      {notifTab === "history" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Patient Profile ID (MongoDB ObjectId)"
                value={notifPatientId}
                onChange={(e) => setNotifPatientId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLoadNotifHistory();
                }}
                className={`${inputCls} max-w-sm`}
              />
              <button
                type="button"
                onClick={handleLoadNotifHistory}
                disabled={notifHistoryLoading}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {notifHistoryLoading ? "Loading…" : "Search"}
              </button>
            </div>
          </div>

          {notifHistory.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Channel
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Recipient
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sent At
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notifHistory.map((n) => (
                      <tr
                        key={n._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                          {(n.type || "").replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-slate-500 capitalize">
                          {n.channel || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {n.recipient || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                              n.status === "sent"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDateTime(n.sentAt)}
                        </td>
                        <td
                          className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate"
                          title={n.messageContent}
                        >
                          {n.messageContent || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
