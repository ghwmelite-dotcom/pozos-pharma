import { useState, useEffect, useCallback, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import Button from "../UI/Button";
import Badge from "../UI/Badge";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Pharmacist Dashboard
 *
 * Full dashboard page for verified pharmacists including:
 * - Stats cards (sessions today, avg rating, avg response time, pending queue)
 * - Online/Offline toggle
 * - Live handoff queue with urgency badges
 * - Active sessions sidebar
 *
 * Auto-refreshes the handoff queue every 10 seconds.
 */
export default function PharmacistDashboard() {
  const { user, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const intervalRef = useRef(null);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/pharmacist/stats`, { headers });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
      setIsOnline(data.is_online ?? false);
    } catch (err) {
      console.error("[PharmacistDashboard] fetchStats:", err);
    }
  }, [token]);

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/handoff/queue`, { headers });
      if (!res.ok) throw new Error("Failed to fetch queue");
      const data = await res.json();
      setQueue(Array.isArray(data) ? data : data.queue || []);
    } catch (err) {
      console.error("[PharmacistDashboard] fetchQueue:", err);
    }
  }, [token]);

  // Fetch active sessions
  const fetchActiveSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/pharmacist/sessions`, { headers });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setActiveSessions(Array.isArray(data) ? data : data.sessions || []);
    } catch (err) {
      console.error("[PharmacistDashboard] fetchActiveSessions:", err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchStats(), fetchQueue(), fetchActiveSessions()]);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [fetchStats, fetchQueue, fetchActiveSessions]);

  // Auto-refresh queue every 10 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchQueue();
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQueue]);

  // Toggle online status
  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const res = await fetch(`${API_URL}/api/pharmacist/toggle-online`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      const data = await res.json();
      setIsOnline(data.is_online ?? !isOnline);
    } catch (err) {
      console.error("[PharmacistDashboard] toggleOnline:", err);
    } finally {
      setTogglingOnline(false);
    }
  };

  // Accept handoff
  const handleAccept = async (handoffId) => {
    setAcceptingId(handoffId);
    try {
      const res = await fetch(`${API_URL}/api/handoff/${handoffId}/accept`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to accept handoff");
      // Refresh queue and sessions
      await Promise.all([fetchQueue(), fetchActiveSessions()]);
    } catch (err) {
      console.error("[PharmacistDashboard] acceptHandoff:", err);
    } finally {
      setAcceptingId(null);
    }
  };

  // Format wait time
  const formatWaitTime = (createdAt) => {
    if (!createdAt) return "Just now";
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  // Urgency to badge level map
  const urgencyToBadgeLevel = {
    normal: "low",
    urgent: "high",
    emergency: "critical",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-3">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Sessions Today",
      value: stats?.sessions_today ?? 0,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      ),
      color: "text-brand-indigo bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      label: "Avg Rating",
      value: stats?.avg_rating?.toFixed(1) ?? "N/A",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      color: "text-ghana-gold bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: "Avg Response",
      value: stats?.avg_response_time ? `${stats.avg_response_time}s` : "N/A",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      color: "text-brand-teal bg-teal-50 dark:bg-teal-900/20",
    },
    {
      label: "Pending Queue",
      value: queue.length,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      color: "text-brand-emerald bg-emerald-50 dark:bg-emerald-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Online Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Pharmacist Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Akwaaba, {user?.username || "Pharmacist"}! Manage your sessions and handoff requests.
          </p>
        </div>
        <Button
          variant={isOnline ? "secondary" : "outline"}
          size="md"
          onClick={handleToggleOnline}
          loading={togglingOnline}
          className={isOnline ? "" : ""}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-gray-400"}`} aria-hidden="true" />
          {isOnline ? "Online" : "Go Online"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Handoff Queue (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Handoff Queue
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Auto-refreshes every 10s
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-brand-emerald" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No pending handoff requests</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">New requests will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-surface-card-dark rounded-xl border p-4 transition-shadow hover:shadow-md ${
                    item.urgency === "emergency"
                      ? "border-red-300 dark:border-red-700"
                      : item.urgency === "urgent"
                        ? "border-amber-300 dark:border-amber-700"
                        : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge
                          type="urgency"
                          level={urgencyToBadgeLevel[item.urgency] || "low"}
                          label={item.urgency?.charAt(0).toUpperCase() + item.urgency?.slice(1)}
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Waiting {formatWaitTime(item.created_at)}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {item.topic || item.reason || "Handoff Request"}
                      </h3>
                      {item.ai_summary && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          <span className="font-medium text-brand-teal">AI Summary:</span> {item.ai_summary}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        User: {item.username || "Anonymous"}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAccept(item.id)}
                      loading={acceptingId === item.id}
                      disabled={!isOnline}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Sessions Sidebar (1/3 width) */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Active Sessions
          </h2>

          {activeSessions.length === 0 ? (
            <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No active sessions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className="w-full text-left bg-white dark:bg-surface-card-dark rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {session.username || session.user_id || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.topic || session.room_slug || "Chat"}
                      </p>
                    </div>
                    {session.unread_count > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-brand-indigo rounded-full shrink-0">
                        {session.unread_count > 9 ? "9+" : session.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
