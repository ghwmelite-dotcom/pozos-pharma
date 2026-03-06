import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const SPECIALIZATIONS = [
  "All Specializations",
  "Community Pharmacy", "Clinical Pharmacy", "Hospital Pharmacy",
  "Industrial Pharmacy", "Pharmaceutical Research", "Regulatory Affairs",
  "Pharmacovigilance", "Oncology Pharmacy", "Pediatric Pharmacy",
  "Geriatric Pharmacy", "Herbal Medicine",
];

const TIERS = [
  { value: "", label: "All Tiers" },
  { value: "specialist", label: "Specialist" },
  { value: "lead", label: "Lead" },
  { value: "senior", label: "Senior" },
  { value: "standard", label: "Standard" },
];

const TIER_COLORS = {
  specialist: { bg: "bg-purple-500/15", text: "text-purple-300", dot: "bg-purple-400", label: "Specialist" },
  lead: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400", label: "Lead" },
  senior: { bg: "bg-sky-500/15", text: "text-sky-300", dot: "bg-sky-400", label: "Senior" },
  standard: { bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-500", label: "Standard" },
};

function StarRating({ rating }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 0; i < 5; i++) {
    const filled = i < full || (i === full && half);
    stars.push(
      <svg key={i} className={`w-3.5 h-3.5 ${filled ? "text-[#C9A84C]" : "text-gray-700"}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

function RankMedal({ rank }) {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A8893A] flex items-center justify-center crown-glow ring-2 ring-[#C9A84C]/30">
      <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center ring-2 ring-gray-400/30">
      <span className="text-sm font-bold text-gray-900">2</span>
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ring-2 ring-orange-400/30">
      <span className="text-sm font-bold text-gray-900">3</span>
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-warm-50/5 flex items-center justify-center ring-1 ring-white/10">
      <span className="text-xs font-bold text-gray-500">{rank}</span>
    </div>
  );
}

export default function PharmacistDirectory() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState("");
  const [tier, setTier] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);

  useEffect(() => {
    const fetchPharmacists = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (specialization) params.set("specialization", specialization);
        if (tier) params.set("tier", tier);
        if (onlineOnly) params.set("online", "true");
        const res = await fetch(`${API_URL}/api/admin/pharmacists/ranked?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPharmacists(data.pharmacists || []);
        }
      } catch (err) {
        console.error("Failed to fetch pharmacists:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacists();
  }, [specialization, tier, onlineOnly]);

  const maxScore = pharmacists.length > 0 ? Math.max(...pharmacists.map(p => p.composite_score || 0), 1) : 1;

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 kente-weave pointer-events-none" />

      <div className="relative z-10 space-y-8 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-12 text-center">
          {/* Top gold line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          {/* Decorative glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#C9A84C]/5 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-ghana-green/5 blur-3xl" />

          <div className="relative">
            <p className="text-[11px] font-body font-semibold text-[#C9A84C] uppercase tracking-[0.3em] mb-3">Ghana's Finest</p>
            <h1 className="text-3xl sm:text-5xl font-display gold-text tracking-tight leading-tight">
              Our Pharmacists
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto font-body text-sm sm:text-base leading-relaxed">
              Meet our verified pharmacists ranked by expertise, response time, and community ratings.
              Connect with the best pharmaceutical care in Ghana.
            </p>
          </div>

          {/* Kente bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
            <div className="flex-1 bg-ghana-red/50" />
            <div className="flex-1 bg-ghana-gold/50" />
            <div className="flex-1 bg-ghana-green/50" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 dark-glass rounded-xl p-4">
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="admin-select flex-1 min-w-[180px]"
            aria-label="Filter by specialization"
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s === "All Specializations" ? "" : s}>{s}</option>
            ))}
          </select>

          <select value={tier} onChange={(e) => setTier(e.target.value)} className="admin-select" aria-label="Filter by tier">
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer font-body">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#C9A84C] focus:ring-[#C9A84C]/30"
            />
            Online Only
          </label>

          <span className="ml-auto text-[11px] text-gray-600 dark:text-gray-500 font-body">
            {pharmacists.length} pharmacist{pharmacists.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
              <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#C9A84C]/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>
          </div>
        ) : pharmacists.length === 0 ? (
          <div className="dark-glass rounded-xl p-16 text-center">
            <p className="text-gray-600 dark:text-gray-500 font-body">No pharmacists found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {pharmacists.map((pharm, index) => {
              const tierStyle = TIER_COLORS[pharm.tier] || TIER_COLORS.standard;
              const scorePercent = maxScore > 0 ? Math.round(((pharm.composite_score || 0) / maxScore) * 100) : 0;
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={pharm.id}
                  className={`group relative overflow-hidden rounded-xl p-5 transition-all duration-300 animate-stagger ${
                    isTop3
                      ? "gold-glass hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]"
                      : "dark-glass hover:bg-warm-50/[0.04]"
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Top gold line for top 3 */}
                  {isTop3 && (
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
                  )}

                  {/* Header: Rank + Name + Online */}
                  <div className="flex items-start gap-3">
                    <RankMedal rank={rank} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-display text-white truncate">{pharm.full_name}</h3>
                        {pharm.is_online && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#C9A84C]/80 font-body font-medium">{pharm.specialization}</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-500 font-body">{pharm.country}</p>
                    </div>
                  </div>

                  {/* Tier + Rating */}
                  <div className="flex items-center justify-between mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-full ${tierStyle.bg} ${tierStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot}`} />
                      {tierStyle.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={pharm.rating || 0} />
                      <span className="text-[11px] text-gray-500 font-body">
                        {(pharm.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-600 dark:text-gray-500 font-body">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg>
                      {pharm.total_sessions || 0} sessions
                    </span>
                    <span className="text-gray-700">&middot;</span>
                    <span>{pharm.review_count || 0} reviews</span>
                    {pharm.response_time_avg > 0 && (
                      <>
                        <span className="text-gray-700">&middot;</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                          {Math.round(pharm.response_time_avg / 60)}min
                        </span>
                      </>
                    )}
                  </div>

                  {/* Score bar */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-body text-gray-600 dark:text-gray-500 uppercase tracking-wider">Composite Score</span>
                      <span className="font-mono font-bold text-[#C9A84C]">{(pharm.composite_score || 0).toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full score-bar-gold transition-all duration-700"
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Hover kente accent */}
                  <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex h-full">
                      <div className="flex-1 bg-ghana-red/60" />
                      <div className="flex-1 bg-ghana-gold/60" />
                      <div className="flex-1 bg-ghana-green/60" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
