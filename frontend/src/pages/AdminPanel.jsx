import { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";

const API_URL = import.meta.env.VITE_API_URL || "";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "verification", label: "Pharmacist Verification" },
  { key: "flagged", label: "Flagged Messages" },
  { key: "ai-stats", label: "AI Stats" },
];

/**
 * PozosPharma Admin Panel Page
 *
 * Admin-only page with tabs for Dashboard, Pharmacist Verification,
 * Flagged Messages, and AI Stats.
 */
export default function AdminPanel() {
  const { isAdmin, token, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topTopics, setTopTopics] = useState([]);

  // Verification data
  const [pendingPharmacists, setPendingPharmacists] = useState([]);
  const [verifyLoading, setVerifyLoading] = useState({});

  // Flagged messages
  const [flaggedMessages, setFlaggedMessages] = useState([]);

  // AI stats
  const [aiStats, setAiStats] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard`, { headers });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();
      setDashboardStats(data.stats || data);
      setTopTopics(data.top_topics || []);
    } catch (err) {
      console.error("[AdminPanel] fetchDashboard:", err);
    }
  }, [token]);

  // Fetch pending pharmacists
  const fetchPendingPharmacists = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/pharmacists/pending`, { headers });
      if (!res.ok) throw new Error("Failed to fetch pending pharmacists");
      const data = await res.json();
      setPendingPharmacists(Array.isArray(data) ? data : data.pharmacists || []);
    } catch (err) {
      console.error("[AdminPanel] fetchPendingPharmacists:", err);
    }
  }, [token]);

  // Fetch flagged messages
  const fetchFlaggedMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/flagged`, { headers });
      if (!res.ok) throw new Error("Failed to fetch flagged messages");
      const data = await res.json();
      setFlaggedMessages(Array.isArray(data) ? data : data.messages || []);
    } catch (err) {
      console.error("[AdminPanel] fetchFlaggedMessages:", err);
    }
  }, [token]);

  // Fetch AI stats
  const fetchAiStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/ai-stats`, { headers });
      if (!res.ok) throw new Error("Failed to fetch AI stats");
      const data = await res.json();
      setAiStats(data);
    } catch (err) {
      console.error("[AdminPanel] fetchAiStats:", err);
    }
  }, [token]);

  // Load all data on mount
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([
          fetchDashboard(),
          fetchPendingPharmacists(),
          fetchFlaggedMessages(),
          fetchAiStats(),
        ]);
      } catch {
        setError("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [isAdmin, fetchDashboard, fetchPendingPharmacists, fetchFlaggedMessages, fetchAiStats]);

  // Approve/Reject pharmacist
  const handleVerifyAction = async (pharmacistId, action) => {
    setVerifyLoading((prev) => ({ ...prev, [pharmacistId]: action }));
    try {
      const res = await fetch(`${API_URL}/api/admin/pharmacists/${pharmacistId}/${action}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error(`Failed to ${action} pharmacist`);
      // Refresh list
      await fetchPendingPharmacists();
    } catch (err) {
      console.error(`[AdminPanel] ${action} pharmacist:`, err);
    } finally {
      setVerifyLoading((prev) => ({ ...prev, [pharmacistId]: null }));
    }
  };

  // Not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Access Denied
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage PozosPharma platform, pharmacists, and content moderation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-brand-indigo text-brand-indigo dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {tab.label}
            {tab.key === "verification" && pendingPharmacists.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-brand-indigo rounded-full">
                {pendingPharmacists.length}
              </span>
            )}
            {tab.key === "flagged" && flaggedMessages.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {flaggedMessages.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ── Dashboard Tab ───────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: dashboardStats?.total_users ?? 0, color: "text-brand-indigo bg-indigo-50 dark:bg-indigo-900/20" },
              { label: "Total Sessions", value: dashboardStats?.total_sessions ?? 0, color: "text-brand-teal bg-teal-50 dark:bg-teal-900/20" },
              { label: "Total Messages", value: dashboardStats?.total_messages ?? 0, color: "text-brand-emerald bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Pharmacists", value: dashboardStats?.total_pharmacists ?? 0, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
              { label: "Flagged", value: dashboardStats?.flagged_count ?? 0, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
              { label: "Handoff Rate", value: `${dashboardStats?.handoff_rate ?? 0}%`, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
              { label: "Avg Satisfaction", value: dashboardStats?.avg_satisfaction?.toFixed(1) ?? "N/A", color: "text-ghana-gold bg-yellow-50 dark:bg-yellow-900/20" },
              { label: "Active Today", value: dashboardStats?.active_today ?? 0, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Top Topics Bar Chart */}
          <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
              Top Topics
            </h3>
            {topTopics.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No topic data available</p>
            ) : (
              <div className="space-y-3">
                {topTopics.slice(0, 8).map((topic, index) => {
                  const maxCount = topTopics[0]?.count || 1;
                  const percentage = Math.round((topic.count / maxCount) * 100);
                  const barColors = [
                    "bg-brand-indigo",
                    "bg-brand-teal",
                    "bg-brand-emerald",
                    "bg-ghana-gold",
                    "bg-ghana-green",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-orange-500",
                  ];

                  return (
                    <div key={topic.name || index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                          {topic.name}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs ml-2 shrink-0">
                          {topic.count}
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColors[index % barColors.length]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Verification Tab ────────────────────────────────────── */}
      {activeTab === "verification" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pending Pharmacist Verifications
          </h2>

          {pendingPharmacists.length === 0 ? (
            <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No pending verification requests
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPharmacists.map((pharm) => (
                <div
                  key={pharm.id}
                  className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {pharm.full_name}
                        </h3>
                        <Badge type="role" label="Pending" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">License: </span>
                          <span className="text-gray-900 dark:text-gray-100">{pharm.license_number}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Country: </span>
                          <span className="text-gray-900 dark:text-gray-100">{pharm.country}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Specialization: </span>
                          <span className="text-gray-900 dark:text-gray-100">{pharm.specialization}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Submitted: </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {pharm.created_at ? new Date(pharm.created_at).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>

                      {pharm.bio && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {pharm.bio}
                        </p>
                      )}

                      {/* License document link */}
                      {pharm.license_doc_url && (
                        <a
                          href={pharm.license_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-brand-indigo dark:text-indigo-400 hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          View License Document
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerifyAction(pharm.id, "approve")}
                        loading={verifyLoading[pharm.id] === "approve"}
                        disabled={!!verifyLoading[pharm.id]}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleVerifyAction(pharm.id, "reject")}
                        loading={verifyLoading[pharm.id] === "reject"}
                        disabled={!!verifyLoading[pharm.id]}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Flagged Messages Tab ─────────────────────────────────── */}
      {activeTab === "flagged" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Flagged Messages
          </h2>

          {flaggedMessages.length === 0 ? (
            <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No flagged messages
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white dark:bg-surface-card-dark rounded-xl border border-red-200 dark:border-red-800 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        type="urgency"
                        level={msg.severity === "high" ? "critical" : msg.severity === "medium" ? "high" : "medium"}
                        label={msg.flag_reason || "Flagged"}
                      />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Room: {msg.room_slug || "N/A"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 mb-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {msg.sender} ({msg.sender_type || "user"})
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {msg.content}
                    </p>
                  </div>

                  {/* Context messages */}
                  {msg.context && msg.context.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Context:</p>
                      <div className="space-y-1">
                        {msg.context.map((ctx, i) => (
                          <div key={i} className="text-xs text-gray-500 dark:text-gray-400 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                            <span className="font-medium">{ctx.sender}:</span> {ctx.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm">
                      Dismiss
                    </Button>
                    <Button variant="danger" size="sm">
                      Ban User
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI Stats Tab ─────────────────────────────────────────── */}
      {activeTab === "ai-stats" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Performance & Usage
          </h2>

          {!aiStats ? (
            <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No AI stats available
              </p>
            </div>
          ) : (
            <>
              {/* Model Usage */}
              <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                  Model Usage
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(aiStats.model_usage || []).map((model) => (
                    <div
                      key={model.model_name || model.model}
                      className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {model.model_name || model.model}
                      </p>
                      <p className="text-2xl font-bold text-brand-indigo dark:text-indigo-400 mt-1">
                        {(model.count || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">requests</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Rates */}
              <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                  Error Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {(aiStats.total_requests || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {(aiStats.total_errors || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                    <p className={`text-2xl font-bold ${
                      (aiStats.error_rate || 0) > 5
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {(aiStats.error_rate || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              {aiStats.avg_response_ms != null && (
                <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Average Response Time
                  </h3>
                  <p className="text-3xl font-bold text-brand-teal dark:text-teal-400">
                    {aiStats.avg_response_ms}ms
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Average AI model response latency
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
