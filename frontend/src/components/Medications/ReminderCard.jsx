import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const FREQUENCY_LABELS = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "Three times daily",
  every_8_hours: "Every 8 hours",
  weekly: "Weekly",
  as_needed: "As needed",
};

export default function ReminderCard({ reminder, token, onTake, onSkip, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [acting, setActing] = useState(false);

  const parsedTimes = (() => {
    try { return JSON.parse(reminder.times); } catch { return []; }
  })();

  const frequencyLabel = FREQUENCY_LABELS[reminder.frequency] || reminder.frequency;

  // Find next dose time
  const getNextDose = () => {
    if (parsedTimes.length === 0) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const t of parsedTimes) {
      const [h, m] = t.split(":").map(Number);
      if (h * 60 + m > currentTime) return t;
    }
    return parsedTimes[0] + " (tomorrow)";
  };

  const nextDose = getNextDose();

  const handleTake = async () => {
    setActing(true);
    try { await onTake(); } finally { setActing(false); }
  };

  const handleSkip = async () => {
    setActing(true);
    try { await onSkip(); } finally { setActing(false); }
  };

  // Fetch 7-day history when expanded
  useEffect(() => {
    if (!expanded || history.length > 0) return;
    setLoadingHistory(true);
    fetch(`${API_URL}/api/reminders/${reminder.id}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [expanded, reminder.id, token]);

  // Build 7-day adherence dots
  const buildDots = () => {
    const dots = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      const dayLogs = history.filter((h) => (h.scheduled_time || "").slice(0, 10) === dateStr);
      const taken = dayLogs.some((h) => h.taken_at && !h.skipped);
      const skipped = dayLogs.some((h) => h.skipped);

      let color = "bg-gray-200 dark:bg-gray-700"; // pending/no data
      if (taken) color = "bg-green-500";
      else if (skipped) color = "bg-red-500";

      const dayLabel = date.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
      dots.push({ color, label: dayLabel, date: dateStr });
    }
    return dots;
  };

  return (
    <div className="bg-warm-50 dark:bg-gray-800 rounded-xl border border-warm-200/60 dark:border-gray-700 p-4 space-y-3 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {reminder.drug_name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {reminder.dosage && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{reminder.dosage}</span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">{frequencyLabel}</span>
          </div>
          {parsedTimes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {parsedTimes.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 ml-3">
          <div className="flex items-center gap-1 text-lg" title={`Streak: ${reminder.streak || 0}`}>
            <span>🔥</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{reminder.streak || 0}</span>
          </div>
          {nextDose && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Next: {nextDose}</span>
          )}
        </div>
      </div>

      {/* Last Taken */}
      {reminder.last_taken && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Last taken: {new Date(reminder.last_taken).toLocaleString()}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTake}
          disabled={acting}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          {acting ? "..." : "Take Now"}
        </button>
        <button
          onClick={handleSkip}
          disabled={acting}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
        >
          Skip
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-warm-200/60 dark:hover:bg-gray-700 transition-colors"
          title="Show history"
        >
          <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-warm-200/60 dark:hover:bg-gray-700 transition-colors"
          title="Remove medication"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Expanded History */}
      {expanded && (
        <div className="pt-2 border-t border-warm-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Last 7 days</p>
          {loadingHistory ? (
            <div className="flex justify-center py-2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              {buildDots().map((dot, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full ${dot.color}`} title={dot.date} />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{dot.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Taken</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Skipped</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 inline-block" /> No data</span>
          </div>
        </div>
      )}
    </div>
  );
}
