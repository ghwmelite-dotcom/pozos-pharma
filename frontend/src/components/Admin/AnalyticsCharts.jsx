import { useState, useEffect, useCallback } from "react";
import useAuth from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Analytics Charts Component
 *
 * Fetches /api/analytics/dashboard and displays analytics data
 * using CSS-only charts (no external chart libraries).
 */
export default function AnalyticsCharts() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("[AnalyticsCharts] error:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { summary, top_searched_drugs, page_views_by_page, daily_active_users, peak_hours } = data;

  const barColors = [
    "bg-brand-indigo",
    "bg-brand-teal",
    "bg-brand-emerald",
    "bg-ghana-gold",
    "bg-ghana-green",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-lime-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-fuchsia-500",
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Searches",
            value: summary?.total_searches ?? 0,
            icon: (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            ),
            color: "text-brand-indigo bg-indigo-50 dark:bg-indigo-900/20",
          },
          {
            label: "Total Page Views",
            value: summary?.total_page_views ?? 0,
            icon: (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ),
            color: "text-brand-teal bg-teal-50 dark:bg-teal-900/20",
          },
          {
            label: "Active Users Today",
            value: summary?.dau_today ?? 0,
            icon: (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            ),
            color: "text-brand-emerald bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            label: "New Users (Week)",
            value: summary?.new_users_week ?? 0,
            icon: (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            ),
            color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 p-4"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top Searched Drugs */}
      <div className="bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
          Top Searched Drugs (30 days)
        </h3>
        {(!top_searched_drugs || top_searched_drugs.length === 0) ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No search data available</p>
        ) : (
          <div className="space-y-3">
            {top_searched_drugs.slice(0, 10).map((item, index) => {
              const maxCount = top_searched_drugs[0]?.count || 1;
              const percentage = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.query || index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                      {item.query || "Unknown"}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs ml-2 shrink-0">
                      {item.count}
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

      {/* Page Views by Page */}
      <div className="bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
          Page Views by Page (30 days)
        </h3>
        {(!page_views_by_page || page_views_by_page.length === 0) ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No page view data available</p>
        ) : (
          <div className="space-y-3">
            {page_views_by_page.slice(0, 10).map((item, index) => {
              const maxCount = page_views_by_page[0]?.count || 1;
              const percentage = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.page || index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate font-mono text-xs">
                      {item.page || "/"}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs ml-2 shrink-0">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColors[(index + 3) % barColors.length]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Active Users Trend */}
      <div className="bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
          Daily Active Users (14 days)
        </h3>
        {(!daily_active_users || daily_active_users.length === 0) ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No active user data available</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {daily_active_users.map((item, index) => {
              const maxCount = Math.max(...daily_active_users.map((d) => d.count), 1);
              const heightPct = Math.max((item.count / maxCount) * 100, 4);
              const date = new Date(item.day * 86400 * 1000);
              const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
              return (
                <div key={item.day || index} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {item.count}
                  </span>
                  <div
                    className="w-full bg-brand-indigo dark:bg-indigo-500 rounded-t transition-all duration-500"
                    style={{ height: `${heightPct}%` }}
                    title={`${dayLabel}: ${item.count} users`}
                  />
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 truncate w-full text-center">
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Peak Hours Heatmap */}
      <div className="bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
          Peak Usage Hours (30 days)
        </h3>
        {(!peak_hours || peak_hours.length === 0) ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No usage hour data available</p>
        ) : (
          <div>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }, (_, h) => {
                const hourData = peak_hours.find((p) => p.hour === h);
                const count = hourData?.count || 0;
                const maxCount = Math.max(...peak_hours.map((p) => p.count), 1);
                const intensity = count / maxCount;

                let bgClass;
                if (intensity === 0) bgClass = "bg-gray-100 dark:bg-gray-800";
                else if (intensity < 0.25) bgClass = "bg-indigo-100 dark:bg-indigo-900/30";
                else if (intensity < 0.5) bgClass = "bg-indigo-200 dark:bg-indigo-800/50";
                else if (intensity < 0.75) bgClass = "bg-indigo-400 dark:bg-indigo-600";
                else bgClass = "bg-indigo-600 dark:bg-indigo-500";

                return (
                  <div key={h} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full aspect-square rounded ${bgClass} transition-colors`}
                      title={`${h}:00 - ${count} events`}
                    />
                    <span className="text-[8px] text-gray-400 dark:text-gray-500">
                      {h}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 dark:text-gray-500">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-900/30" />
                <div className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-800/50" />
                <div className="w-3 h-3 rounded bg-indigo-400 dark:bg-indigo-600" />
                <div className="w-3 h-3 rounded bg-indigo-600 dark:bg-indigo-500" />
              </div>
              <span>More</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
