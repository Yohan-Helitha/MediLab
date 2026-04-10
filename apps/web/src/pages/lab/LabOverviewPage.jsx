import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiClipboardDocumentList,
  HiClock,
  HiCheckCircle,
  HiArchiveBox,
  HiBellAlert,
} from "react-icons/hi2";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useLabCentre } from "../../context/LabCentreContext";
import {
  getResultsByHealthCenter,
  getUncollectedReports,
} from "../../api/resultApi";
import { getFailedNotifications } from "../../api/notificationApi";
import { apiRequest } from "../../api/client";
import { getSafeErrorMessage } from "../../utils/errorHandler";
import LabCentrePicker from "./LabCentrePicker";
import { formatDate, formatDateTime, StatusBadge } from "./labFormHelpers";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({ label, value, loading, accent, to, icon }) {
  const accentMap = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };
  const badge = accentMap[accent] || accentMap.teal;
  const card = (
    <div
      className={`rounded-2xl border bg-white shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow ${to ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {icon && (
          <span
            className={`inline-flex items-center justify-center rounded-full p-2 text-lg ${badge}`}
          >
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <span className="text-3xl font-bold text-slate-900">
          {value ?? "—"}
        </span>
      )}
      {to && (
        <span className="text-xs text-teal-600 hover:underline font-medium">
          View →
        </span>
      )}
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}

// ---------------------------------------------------------------------------
// LabOverviewPage
// ---------------------------------------------------------------------------
export default function LabOverviewPage() {
  const { user } = useAuth();
  const { selectedCentreId, selectedCentreName, handleCentreReset } =
    useLabCentre();

  const staffName =
    user?.fullName || user?.profile?.fullName || "Lab Technician";

  // ---- summary counts ----
  const [pendingCount, setPendingCount] = useState(null);
  const [releasedTodayCount, setReleasedTodayCount] = useState(null);
  const [uncollectedCount, setUncollectedCount] = useState(null);
  const [failedNotifsCount, setFailedNotifsCount] = useState(null);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ---- recent results ----
  const [recentResults, setRecentResults] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!selectedCentreId) return;
    setStatsLoading(true);

    const today = new Date().toISOString().slice(0, 10);

    try {
      const [
        pendingRes,
        releasedTodayRes,
        uncollectedRes,
        failedRes,
        bookingsRes,
      ] = await Promise.allSettled([
        getResultsByHealthCenter(selectedCentreId, { status: "pending" }),
        getResultsByHealthCenter(selectedCentreId, {
          status: "released",
          startDate: today,
          endDate: today,
        }),
        getUncollectedReports({ centerId: selectedCentreId, daysThreshold: 1 }),
        getFailedNotifications({ limit: 200 }),
        apiRequest(`/api/bookings/center/${selectedCentreId}`),
      ]);

      if (pendingRes.status === "fulfilled") {
        const d = pendingRes.value;
        const list = d?.data || d?.results || (Array.isArray(d) ? d : []);
        setPendingCount(list.length);
      }
      if (releasedTodayRes.status === "fulfilled") {
        const d = releasedTodayRes.value;
        const list = d?.data || d?.results || (Array.isArray(d) ? d : []);
        setReleasedTodayCount(list.length);
      }
      if (uncollectedRes.status === "fulfilled") {
        const d = uncollectedRes.value;
        const list = d?.data || d?.results || (Array.isArray(d) ? d : []);
        setUncollectedCount(list.length);
      }
      if (failedRes.status === "fulfilled") {
        const d = failedRes.value;
        const list = d?.data || d?.notifications || (Array.isArray(d) ? d : []);
        setFailedNotifsCount(list.length);
      }
      if (bookingsRes.status === "fulfilled") {
        const d = bookingsRes.value;
        const raw =
          d?.bookings?.bookings || d?.bookings || (Array.isArray(d) ? d : []);
        const pending = raw.filter(
          (b) => b.status !== "COMPLETED" && b.status !== "CANCELLED",
        );
        setPendingBookingsCount(pending.length);
      }
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setStatsLoading(false);
    }
  }, [selectedCentreId]);

  const loadRecentResults = useCallback(async () => {
    if (!selectedCentreId) return;
    setRecentLoading(true);
    try {
      const data = await getResultsByHealthCenter(selectedCentreId, {});
      const list =
        data?.data || data?.results || (Array.isArray(data) ? data : []);
      // Show last 8 results, most recent first
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setRecentResults(sorted.slice(0, 8));
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setRecentLoading(false);
    }
  }, [selectedCentreId]);

  useEffect(() => {
    loadStats();
    loadRecentResults();
  }, [loadStats, loadRecentResults]);

  // ---- no centre selected ----
  if (!selectedCentreId) {
    return <LabCentrePicker />;
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {staffName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview for{" "}
            <span className="font-semibold text-teal-700">
              {selectedCentreName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              loadStats();
              loadRecentResults();
            }}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleCentreReset}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Change centre
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Pending Bookings"
          value={pendingBookingsCount}
          loading={statsLoading}
          accent="amber"
          to="/lab/submit"
          icon={<HiClipboardDocumentList className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Results"
          value={pendingCount}
          loading={statsLoading}
          accent="amber"
          to="/lab/results"
          icon={<HiClock className="h-5 w-5" />}
        />
        <StatCard
          label="Released Today"
          value={releasedTodayCount}
          loading={statsLoading}
          accent="emerald"
          to="/lab/results"
          icon={<HiCheckCircle className="h-5 w-5" />}
        />
        <StatCard
          label="Uncollected Hard Copies"
          value={uncollectedCount}
          loading={statsLoading}
          accent="teal"
          to="/lab/uncollected"
          icon={<HiArchiveBox className="h-5 w-5" />}
        />
        <StatCard
          label="Failed Notifications"
          value={failedNotifsCount}
          loading={statsLoading}
          accent="rose"
          to="/lab/notifications"
          icon={<HiBellAlert className="h-5 w-5" />}
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/lab/submit"
            className="rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
          >
            + Submit New Result
          </Link>
          <Link
            to="/lab/results"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View All Results
          </Link>
          <Link
            to="/lab/uncollected"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Uncollected Hard Copies
          </Link>
          <Link
            to="/lab/notifications"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Notification Log
          </Link>
        </div>
      </div>

      {/* Recent results */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent Results
          </h2>
          <Link
            to="/lab/results"
            className="text-xs text-teal-600 hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          {recentLoading && (
            <div className="p-6 text-sm text-slate-500">Loading…</div>
          )}
          {!recentLoading && recentResults.length === 0 && (
            <div className="p-6 text-sm text-slate-500">
              No results recorded yet for this health centre.
            </div>
          )}
          {!recentLoading && recentResults.length > 0 && (
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentResults.map((r) => {
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
