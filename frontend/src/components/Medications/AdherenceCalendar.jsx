import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function AdherenceCalendar({ reminders, token }) {
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reminders.length || !token) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          reminders.map((r) =>
            fetch(`${API_URL}/api/reminders/${r.id}/history`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => data.history || [])
              .catch(() => [])
          )
        );
        setAllHistory(results.flat());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [reminders, token]);

  // Build 30-day grid
  const buildGrid = () => {
    const days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const isFuture = date > today;

      const dayLogs = allHistory.filter((h) => (h.scheduled_time || "").slice(0, 10) === dateStr);
      const takenCount = dayLogs.filter((h) => h.taken_at && !h.skipped).length;
      const skippedCount = dayLogs.filter((h) => h.skipped).length;
      const total = takenCount + skippedCount;

      let colorClass = "bg-gray-100 dark:bg-gray-800"; // no data
      if (isFuture) {
        colorClass = "bg-warm-100 dark:bg-gray-900";
      } else if (total > 0) {
        const rate = takenCount / total;
        if (rate >= 1) colorClass = "bg-green-500";
        else if (rate >= 0.75) colorClass = "bg-green-400";
        else if (rate >= 0.5) colorClass = "bg-green-300 dark:bg-green-600";
        else if (rate > 0) colorClass = "bg-yellow-400 dark:bg-yellow-600";
        else colorClass = "bg-red-400 dark:bg-red-600";
      }

      days.push({
        dateStr,
        colorClass,
        takenCount,
        skippedCount,
        dayOfMonth: date.getDate(),
        dayOfWeek: date.toLocaleDateString("en", { weekday: "short" }).slice(0, 2),
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="bg-warm-50 dark:bg-gray-800 rounded-xl border border-warm-200/60 dark:border-gray-700 p-4">
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const grid = buildGrid();

  return (
    <div className="bg-warm-50 dark:bg-gray-800 rounded-xl border border-warm-200/60 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        30-Day Adherence Overview
      </h3>

      {/* Grid */}
      <div className="flex flex-wrap gap-1.5">
        {grid.map((day) => (
          <div
            key={day.dateStr}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md ${day.colorClass} flex items-center justify-center cursor-default transition-colors`}
            title={`${day.dateStr}: ${day.takenCount} taken, ${day.skippedCount} skipped`}
          >
            <span className="text-[9px] sm:text-[10px] font-medium text-gray-600 dark:text-gray-400 select-none">
              {day.dayOfMonth}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> All taken
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-600 inline-block" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-600 inline-block" /> Missed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 inline-block border border-warm-200/60 dark:border-gray-700" /> No data
        </span>
      </div>
    </div>
  );
}
