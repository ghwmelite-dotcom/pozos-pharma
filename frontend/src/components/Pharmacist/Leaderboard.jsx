import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "";

const TIER_COLORS = {
  specialist: { bg: "bg-purple-500/15", text: "text-purple-300", dot: "bg-purple-400" },
  lead: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
  senior: { bg: "bg-sky-500/15", text: "text-sky-300", dot: "bg-sky-400" },
  standard: { bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-500" },
};

export default function Leaderboard() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pharmacist/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.leaderboard || []);
        }
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchLeaderboard();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
          <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#C9A84C]/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="dark-glass rounded-xl p-10 text-center">
        <p className="text-sm text-gray-500 font-body">No leaderboard data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display gold-text">Leaderboard</h3>
          <p className="text-[11px] text-gray-500 font-body mt-0.5">Rankings by composite score</p>
        </div>
        <span className="text-[11px] text-gray-600 font-body">
          {data.length} pharmacist{data.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Top 3 Podium */}
      {data.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {[
            { p: data[1], position: 2, height: "h-20", delay: "100ms" },
            { p: data[0], position: 1, height: "h-28", delay: "0ms" },
            { p: data[2], position: 3, height: "h-16", delay: "200ms" },
          ].map(({ p, position, height, delay }) => (
            <div key={p.id} className="flex flex-col items-center animate-stagger" style={{ animationDelay: delay }}>
              {/* Avatar */}
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                position === 1
                  ? "bg-gradient-to-br from-[#C9A84C] to-[#A8893A] text-gray-900 crown-glow ring-2 ring-[#C9A84C]/30"
                  : position === 2
                  ? "bg-gradient-to-br from-gray-400 to-gray-500 text-gray-900 ring-2 ring-gray-400/30"
                  : "bg-gradient-to-br from-orange-400 to-orange-600 text-gray-900 ring-2 ring-orange-400/30"
              }`}>
                {p.full_name?.[0]?.toUpperCase() || "?"}
                {position === 1 && (
                  <div className="absolute -top-2 -right-1">
                    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                  </div>
                )}
              </div>
              <p className="text-xs font-body font-semibold text-gray-200 text-center truncate w-full">{p.full_name}</p>
              <p className="text-[10px] text-[#C9A84C] font-mono">{(p.composite_score || 0).toFixed(1)} pts</p>

              {/* Podium block */}
              <div
                className={`w-full ${height} rounded-t-lg mt-2 flex items-end justify-center pb-2 podium-rise ${
                  position === 1
                    ? "bg-gradient-to-t from-[#C9A84C]/20 to-[#C9A84C]/5 ring-1 ring-[#C9A84C]/20"
                    : position === 2
                    ? "bg-gradient-to-t from-gray-500/15 to-gray-500/5 ring-1 ring-gray-500/15"
                    : "bg-gradient-to-t from-orange-500/15 to-orange-500/5 ring-1 ring-orange-500/15"
                }`}
                style={{ animationDelay: delay }}
              >
                <span className={`text-lg font-display ${
                  position === 1 ? "gold-text" : position === 2 ? "text-gray-400" : "text-orange-400/70"
                }`}>
                  #{position}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="overflow-x-auto rounded-xl dark-glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3.5 text-left text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">#</th>
              <th className="px-4 py-3.5 text-left text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">Pharmacist</th>
              <th className="px-4 py-3.5 text-left text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">Tier</th>
              <th className="px-4 py-3.5 text-center text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">Rating</th>
              <th className="px-4 py-3.5 text-center text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">Sessions</th>
              <th className="px-4 py-3.5 text-center text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">Reviews</th>
              <th className="px-4 py-3.5 text-right text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((p, i) => {
              const tc = TIER_COLORS[p.tier] || TIER_COLORS.standard;
              return (
                <tr
                  key={p.id}
                  className={`transition-all animate-stagger ${
                    p.isCurrentUser
                      ? "bg-[#C9A84C]/[0.06] border-l-2 border-l-[#C9A84C]"
                      : "hover:bg-warm-50/[0.02]"
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="px-4 py-3">
                    {p.rank <= 3 ? (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        p.rank === 1 ? "bg-gradient-to-br from-[#C9A84C] to-[#A8893A] text-gray-900" :
                        p.rank === 2 ? "bg-gradient-to-br from-gray-400 to-gray-500 text-gray-900" :
                        "bg-gradient-to-br from-orange-400 to-orange-600 text-gray-900"
                      }`}>
                        {p.rank}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-warm-50/5 flex items-center justify-center ring-1 ring-white/10">
                        <span className="text-xs font-bold text-gray-500">{p.rank}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 flex items-center justify-center shrink-0 ring-1 ring-[#C9A84C]/20">
                        <span className="text-xs font-bold text-[#C9A84C]">{p.full_name?.[0]?.toUpperCase() || "?"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className={`font-body font-medium truncate ${p.isCurrentUser ? "text-[#C9A84C]" : "text-gray-200"}`}>
                          {p.full_name} {p.isCurrentUser && <span className="text-[10px] text-[#C9A84C]/60">(You)</span>}
                        </p>
                        <p className="text-[11px] text-gray-500 font-body truncate">{p.specialization}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${tc.bg} ${tc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                      {(p.tier || "standard").charAt(0).toUpperCase() + (p.tier || "standard").slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[#C9A84C] font-semibold font-mono">{(p.rating || 0).toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 font-mono">{p.total_sessions || 0}</td>
                  <td className="px-4 py-3 text-center text-gray-400 font-mono">{p.review_count || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-white font-mono">{(p.composite_score || 0).toFixed(1)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
