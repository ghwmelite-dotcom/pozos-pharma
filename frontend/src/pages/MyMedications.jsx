import { useState, useEffect, useCallback } from "react";
import useChatStore from "../store/chatStore";
import ReminderCard from "../components/Medications/ReminderCard";
import AddMedicationModal from "../components/Medications/AddMedicationModal";
import AdherenceCalendar from "../components/Medications/AdherenceCalendar";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function MyMedications() {
  const { user, token } = useChatStore();
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ totalReminders: 0, bestStreak: 0, adherenceRate: 100 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/reminders`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/reminders/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchReminders(), fetchStats()]).finally(() => setLoading(false));
  }, [token, fetchReminders, fetchStats]);

  const handleTake = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/reminders/${id}/take`, { method: "POST", headers });
      if (res.ok) {
        await Promise.all([fetchReminders(), fetchStats()]);
      }
    } catch (err) {
      console.error("Failed to mark taken:", err);
    }
  };

  const handleSkip = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/reminders/${id}/skip`, { method: "POST", headers });
      if (res.ok) {
        await Promise.all([fetchReminders(), fetchStats()]);
      }
    } catch (err) {
      console.error("Failed to mark skipped:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/reminders/${id}`, { method: "DELETE", headers });
      if (res.ok) {
        await Promise.all([fetchReminders(), fetchStats()]);
      }
    } catch (err) {
      console.error("Failed to delete reminder:", err);
    }
  };

  const handleAdded = () => {
    setShowAddModal(false);
    fetchReminders();
    fetchStats();
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-display text-gray-700 dark:text-gray-300 mb-2">Sign in Required</h2>
        <p className="text-gray-500 dark:text-gray-400 font-body">Please sign in to manage your medication reminders.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#C9A84C]/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-display gold-text">My Medications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Track your medications and build healthy habits</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#E8D48B] text-gray-900 font-body font-semibold rounded-xl shadow-sm shadow-[#C9A84C]/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Medication
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
            bgIcon: "bg-sky-500/10",
            value: stats.totalReminders,
            label: "Active Medications",
          },
          {
            icon: <span className="text-lg">&#x1F525;</span>,
            bgIcon: "bg-orange-500/10",
            value: stats.bestStreak,
            label: "Best Streak",
          },
          {
            icon: <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            bgIcon: "bg-emerald-500/10",
            value: `${stats.adherenceRate}%`,
            label: "Adherence Rate",
          },
        ].map((stat, i) => (
          <div key={i} className="dark-glass rounded-xl p-4 flex items-center gap-3 animate-stagger" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-lg ${stat.bgIcon} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-display text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-body">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Adherence Calendar */}
      {reminders.length > 0 && <AdherenceCalendar reminders={reminders} token={token} />}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 dark-glass rounded-xl">
          <svg className="w-20 h-20 text-gray-200 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="text-lg font-display text-gray-700 dark:text-gray-300 mb-1">No medications yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-body">Add your first medication to start tracking your adherence.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#C9A84C] hover:bg-[#E8D48B] text-gray-900 font-body font-semibold rounded-xl transition-colors shadow-sm shadow-[#C9A84C]/20"
          >
            Add Your First Medication
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              token={token}
              onTake={() => handleTake(reminder.id)}
              onSkip={() => handleSkip(reminder.id)}
              onDelete={() => handleDelete(reminder.id)}
            />
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleAdded}
        token={token}
      />
    </div>
  );
}
