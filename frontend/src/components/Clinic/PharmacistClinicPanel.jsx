import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../../hooks/useWebSocket";

const API_URL = import.meta.env.VITE_API_URL || "";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am - 8pm

function formatGHS(amount) {
  return `GHS ${Number(amount || 0).toFixed(2)}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GH", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Availability Grid ──────────────────────────────────────────────
function AvailabilitySection({ token, pharmacistId, isOnline, onToggleOnline }) {
  const [grid, setGrid] = useState(() => {
    const g = {};
    DAYS.forEach((d) => { g[d] = {}; HOURS.forEach((h) => { g[d][h] = false; }); });
    return g;
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!pharmacistId) return;
    fetch(`${API_URL}/api/clinic/slots/${pharmacistId}`, { headers })
      .then((r) => r.ok ? r.json() : { slots: [] })
      .then((data) => {
        const g = {};
        DAYS.forEach((d) => { g[d] = {}; HOURS.forEach((h) => { g[d][h] = false; }); });
        (data.slots || []).forEach((s) => {
          const day = DAYS[s.dayOfWeek] || DAYS[s.day_of_week];
          const start = parseInt(s.startTime || s.start_time, 10);
          const end = parseInt(s.endTime || s.end_time, 10);
          if (day && g[day]) {
            for (let h = start; h < end; h++) {
              if (g[day][h] !== undefined) g[day][h] = true;
            }
          }
        });
        setGrid(g);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [pharmacistId]);

  const toggle = (day, hour) => {
    setGrid((prev) => ({ ...prev, [day]: { ...prev[day], [hour]: !prev[day][hour] } }));
  };

  const saveSlots = async () => {
    setSaving(true);
    const slots = [];
    DAYS.forEach((day, di) => {
      let start = null;
      HOURS.forEach((h) => {
        if (grid[day][h] && start === null) start = h;
        if ((!grid[day][h] || h === HOURS[HOURS.length - 1]) && start !== null) {
          const end = grid[day][h] ? h + 1 : h;
          slots.push({ dayOfWeek: di, startTime: `${String(start).padStart(2, "0")}:00`, endTime: `${String(end).padStart(2, "0")}:00` });
          start = null;
        }
      });
    });
    try {
      await fetch(`${API_URL}/api/clinic/slots`, {
        method: "POST", headers, body: JSON.stringify({ slots }),
      });
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold gold-text">My Availability</h3>
        <button
          onClick={onToggleOnline}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
            isOnline ? "bg-emerald-500" : "bg-gray-600"
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            isOnline ? "translate-x-8" : "translate-x-1"
          }`} />
          <span className="sr-only">Available Now</span>
        </button>
      </div>
      <p className="text-xs font-body text-gray-400">
        {isOnline ? "You are available for instant consultations" : "Toggle on to accept walk-in patients now"}
      </p>

      {/* Weekly grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-xs font-body">
          <thead>
            <tr>
              <th className="py-2 px-1 text-left text-gray-500 font-medium w-14">Time</th>
              {DAYS.map((d) => (
                <th key={d} className="py-2 px-1 text-center text-gray-400 font-medium">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h}>
                <td className="py-0.5 px-1 text-gray-500 whitespace-nowrap">
                  {h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`}
                </td>
                {DAYS.map((d) => (
                  <td key={d} className="py-0.5 px-0.5 text-center">
                    <button
                      onClick={() => toggle(d, h)}
                      className={`w-full h-7 rounded transition-all border ${
                        grid[d][h]
                          ? "bg-[#C9A84C]/30 border-[#C9A84C]/50 hover:bg-[#C9A84C]/40"
                          : "bg-gray-800/40 border-gray-700/30 hover:bg-gray-700/40"
                      }`}
                      aria-label={`${d} ${h}:00 ${grid[d][h] ? "available" : "unavailable"}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={saveSlots}
        disabled={saving}
        className="w-full py-2.5 rounded-xl font-body font-semibold text-sm text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save Availability"}
      </button>
    </div>
  );
}

// ── Incoming Requests ──────────────────────────────────────────────
function IncomingRequests({ token, navigate }) {
  const [requests, setRequests] = useState([]);
  const timersRef = useRef({});
  const { sendWsMessage } = useWebSocket("clinic-notifications");

  // Listen for clinic_request via WebSocket message events
  useEffect(() => {
    const handler = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "clinic_request") {
          setRequests((prev) => [...prev, { ...data, arrivedAt: Date.now() }]);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener("ws-clinic-request", handler);
    return () => window.removeEventListener("ws-clinic-request", handler);
  }, []);

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests((prev) =>
        prev.filter((r) => Date.now() - r.arrivedAt < 60000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const accept = async (req) => {
    try {
      await fetch(`${API_URL}/api/clinic/consultations/${req.consultationId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((r) => r.consultationId !== req.consultationId));
      navigate(`/clinic/session/${req.consultationId}`);
    } catch { /* silent */ }
  };

  const decline = (req) => {
    setRequests((prev) => prev.filter((r) => r.consultationId !== req.consultationId));
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-sm font-body text-gray-500">No incoming requests</p>
        <p className="text-xs font-body text-gray-600 mt-1">New consultation requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const elapsed = Math.floor((Date.now() - req.arrivedAt) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        const pct = (remaining / 60) * 100;

        return (
          <div
            key={req.consultationId}
            className="relative p-4 rounded-xl border-2 border-[#C9A84C]/60 bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10 animate-pulse-once"
          >
            {/* Countdown ring */}
            <div className="absolute top-3 right-3 w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="#C9A84C" strokeWidth="2.5"
                  strokeDasharray={`${pct * 0.94} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#C9A84C]">
                {remaining}s
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                req.tier === "premium" ? "bg-[#C9A84C]/20 text-[#C9A84C]" :
                req.tier === "standard" ? "bg-blue-500/20 text-blue-400" :
                "bg-gray-700/50 text-gray-400"
              }`}>
                {req.tier || "standard"}
              </span>
            </div>
            <p className="text-sm font-body text-gray-200 pr-12">{req.reason || "General consultation"}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => accept(req)}
                className="flex-1 py-2 rounded-lg font-body font-semibold text-sm text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => decline(req)}
                className="flex-1 py-2 rounded-lg font-body font-semibold text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── My Consultations ───────────────────────────────────────────────
function ConsultationsSection({ token }) {
  const [tab, setTab] = useState("upcoming");
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/clinic/history`, { headers })
      .then((r) => r.ok ? r.json() : { consultations: [] })
      .then((data) => setConsultations(data.consultations || data.history || []))
      .catch(() => setConsultations([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = consultations.filter(
    (c) => c.status !== "completed" && c.status !== "cancelled" && new Date(c.scheduled_at) > now
  );
  const past = consultations.filter(
    (c) => c.status === "completed" || new Date(c.scheduled_at) <= now
  );
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-bold gold-text">My Consultations</h3>
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg">
        {["upcoming", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-sm font-body font-medium capitalize transition-all ${
              tab === t
                ? "bg-[#C9A84C]/20 text-[#C9A84C] shadow-sm"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {t} ({t === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-6 font-body">
          No {tab} consultations
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/30"
            >
              <div className="min-w-0">
                <p className="text-sm font-body font-medium text-gray-200 truncate">
                  {c.patient_name || "Patient"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-body text-gray-500">{formatDate(c.scheduled_at || c.created_at)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    c.tier === "premium" ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-gray-700 text-gray-400"
                  }`}>
                    {c.tier || "standard"}
                  </span>
                  {tab === "past" && c.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-[#C9A84C]">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {c.rating}
                    </span>
                  )}
                </div>
              </div>
              {tab === "upcoming" && (
                <button
                  onClick={() => navigate(`/clinic/session/${c.id}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] transition-colors whitespace-nowrap"
                >
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Earnings & Wallet ──────────────────────────────────────────────
function EarningsSection({ token }) {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wMomo, setWMomo] = useState("");
  const [wSubmitting, setWSubmitting] = useState(false);
  const [wError, setWError] = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_URL}/api/clinic/earnings`, { headers })
      .then((r) => r.ok ? r.json() : { balance: 0, total_earned: 0, total_withdrawn: 0, transactions: [] })
      .then(setEarnings)
      .catch(() => setEarnings({ balance: 0, total_earned: 0, total_withdrawn: 0, transactions: [] }))
      .finally(() => setLoading(false));
  }, []);

  const submitWithdraw = async () => {
    if (!wAmount || parseFloat(wAmount) <= 0) { setWError("Enter a valid amount"); return; }
    if (parseFloat(wAmount) > (earnings?.balance || 0)) { setWError("Amount exceeds balance"); return; }
    if (!wMomo || wMomo.length < 10) { setWError("Enter a valid mobile money number"); return; }
    setWSubmitting(true);
    setWError("");
    try {
      const res = await fetch(`${API_URL}/api/clinic/withdraw`, {
        method: "POST", headers,
        body: JSON.stringify({ amount: parseFloat(wAmount), momo_number: wMomo }),
      });
      if (!res.ok) throw new Error("Failed");
      setEarnings((prev) => ({
        ...prev,
        balance: (prev?.balance || 0) - parseFloat(wAmount),
        total_withdrawn: (prev?.total_withdrawn || 0) + parseFloat(wAmount),
      }));
      setShowWithdraw(false);
      setWAmount("");
      setWMomo("");
    } catch {
      setWError("Withdrawal failed. Try again.");
    }
    setWSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
      </div>
    );
  }

  const balance = earnings?.balance || 0;
  const totalEarned = earnings?.total_earned || 0;
  const totalWithdrawn = earnings?.total_withdrawn || 0;
  const transactions = (earnings?.transactions || []).slice(0, 10);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-bold gold-text">Earnings</h3>

      {/* Balance card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#C9A84C]/15 to-[#A8893A]/10 border border-[#C9A84C]/25">
        <p className="text-xs font-body text-[#C9A84C]/70 uppercase tracking-wider mb-1">Wallet Balance</p>
        <p className="text-3xl font-display font-bold gold-text">{formatGHS(balance)}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 text-center">
          <p className="text-xs font-body text-gray-500 mb-0.5">Total Earned</p>
          <p className="text-sm font-body font-bold text-emerald-400">{formatGHS(totalEarned)}</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 text-center">
          <p className="text-xs font-body text-gray-500 mb-0.5">Total Withdrawn</p>
          <p className="text-sm font-body font-bold text-gray-300">{formatGHS(totalWithdrawn)}</p>
        </div>
      </div>

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div>
          <p className="text-xs font-body font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Transactions</p>
          <div className="space-y-1.5">
            {transactions.map((tx, i) => (
              <div key={tx.id || i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/20">
                <div>
                  <p className="text-xs font-body text-gray-300">{tx.description || tx.type || "Transaction"}</p>
                  <p className="text-[10px] font-body text-gray-600">{formatDate(tx.created_at)}</p>
                </div>
                <span className={`text-sm font-body font-bold ${
                  tx.type === "withdrawal" || tx.amount < 0 ? "text-red-400" : "text-emerald-400"
                }`}>
                  {tx.amount < 0 ? "" : "+"}{formatGHS(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw button / form */}
      {showWithdraw ? (
        <div className="p-4 rounded-xl border border-[#C9A84C]/20 bg-gray-800/30 space-y-3">
          <p className="text-sm font-body font-semibold text-gray-200">Request Withdrawal</p>
          {wError && <p className="text-xs text-red-400 font-body">{wError}</p>}
          <div>
            <label className="block text-xs font-body text-gray-400 mb-1">Amount (GHS)</label>
            <input
              type="number"
              value={wAmount}
              onChange={(e) => setWAmount(e.target.value)}
              max={balance}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="admin-input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-gray-400 mb-1">Mobile Money Number</label>
            <input
              type="tel"
              value={wMomo}
              onChange={(e) => setWMomo(e.target.value)}
              placeholder="0XX XXX XXXX"
              className="admin-input w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={submitWithdraw}
              disabled={wSubmitting}
              className="flex-1 py-2 rounded-lg font-body font-semibold text-sm text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] disabled:opacity-50 transition-colors"
            >
              {wSubmitting ? "Processing..." : "Submit"}
            </button>
            <button
              onClick={() => { setShowWithdraw(false); setWError(""); }}
              className="px-4 py-2 rounded-lg font-body text-sm text-gray-400 hover:text-gray-200 border border-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowWithdraw(true)}
          className="w-full py-2.5 rounded-xl font-body font-semibold text-sm text-[#C9A84C] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/10 transition-colors"
        >
          Request Withdrawal
        </button>
      )}
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────
export default function PharmacistClinicPanel({ user, token, pharmacistData }) {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(pharmacistData?.is_online || false);
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const toggleOnline = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pharmacist/toggle-online`, {
        method: "POST", headers,
      });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(data.is_online ?? !isOnline);
      } else {
        setIsOnline((prev) => !prev);
      }
    } catch {
      setIsOnline((prev) => !prev);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C]/30 to-[#A8893A]/20 border border-[#C9A84C]/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-gray-100">Virtual Clinic</h2>
          <p className="text-xs font-body text-gray-500">Manage consultations, availability & earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl dark-glass border border-gray-700/30">
            <AvailabilitySection
              token={token}
              pharmacistId={pharmacistData?.id}
              isOnline={isOnline}
              onToggleOnline={toggleOnline}
            />
          </div>

          <div className="p-5 rounded-2xl dark-glass border border-gray-700/30">
            <h3 className="text-lg font-display font-bold gold-text mb-4">Incoming Requests</h3>
            <IncomingRequests token={token} navigate={navigate} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl dark-glass border border-gray-700/30">
            <ConsultationsSection token={token} />
          </div>

          <div className="p-5 rounded-2xl dark-glass border border-gray-700/30">
            <EarningsSection token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
