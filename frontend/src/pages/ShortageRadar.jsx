import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Oti",
  "Western North",
];

const SEVERITY_CONFIG = {
  CRITICAL: {
    bg: "bg-red-500/10 dark:bg-red-500/[0.08]",
    border: "border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    badge: "bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/30",
    pulse: true,
    dot: "bg-red-500",
  },
  WARNING: {
    bg: "bg-amber-500/10 dark:bg-amber-500/[0.08]",
    border: "border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30",
    pulse: false,
    dot: "bg-amber-500",
  },
  WATCH: {
    bg: "bg-blue-500/10 dark:bg-blue-500/[0.08]",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30",
    pulse: false,
    dot: "bg-blue-500",
  },
};

const SHORTAGE_DATA = [];

const STATS = {
  activeAlerts: 0,
  reportsThisWeek: 0,
  drugsMonitored: 0,
};

/* ------------------------------------------------------------------ */
/*  REGION SHORTAGE MAP                                                */
/* ------------------------------------------------------------------ */

function getRegionSeverity(regionName) {
  for (const s of SHORTAGE_DATA) {
    if (s.regions.includes(regionName)) {
      if (s.severity === "CRITICAL") return "CRITICAL";
    }
  }
  for (const s of SHORTAGE_DATA) {
    if (s.regions.includes(regionName)) {
      if (s.severity === "WARNING") return "WARNING";
    }
  }
  for (const s of SHORTAGE_DATA) {
    if (s.regions.includes(regionName)) {
      if (s.severity === "WATCH") return "WATCH";
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  ICONS (inline SVG)                                                 */
/* ------------------------------------------------------------------ */

function RadarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
  );
}

function TrendArrow({ direction }) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-500" title="Increasing">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-body font-semibold">Rising</span>
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-green-500" title="Decreasing">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-body font-semibold">Declining</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-gray-400" title="Stable">
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-body font-semibold">Stable</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  CSS-only sparkline bar chart                                       */
/* ------------------------------------------------------------------ */

function SparkBars({ data, severity }) {
  const max = Math.max(...data);
  const colorMap = {
    CRITICAL: "bg-red-500",
    WARNING: "bg-amber-500",
    WATCH: "bg-blue-500",
  };
  const barColor = colorMap[severity] || "bg-gray-400";

  return (
    <div className="flex items-end gap-[2px] h-6" aria-hidden="true">
      {data.map((val, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-t-sm ${barColor} transition-all`}
          style={{
            height: `${Math.max((val / max) * 100, 8)}%`,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function ShortageRadar() {
  const { t } = useTranslation();

  // Report form state
  const [reportDrug, setReportDrug] = useState("");
  const [reportRegion, setReportRegion] = useState("");
  const [reportPharmacy, setReportPharmacy] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Alert subscription toggle
  const [subscribed, setSubscribed] = useState(false);

  // Expanded card
  const [expandedId, setExpandedId] = useState(null);

  function handleReportSubmit(e) {
    e.preventDefault();
    if (!reportDrug.trim() || !reportRegion) return;
    setReportSubmitted(true);
    setReportDrug("");
    setReportRegion("");
    setReportPharmacy("");
    setTimeout(() => setReportSubmitted(false), 4000);
  }

  function daysAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          {/* Pulsing concentric circles */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
            <span className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/20 animate-ping" style={{ animationDuration: "2.5s" }} />
            <span className="absolute inset-2 rounded-full border-2 border-[#C9A84C]/30 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
            <span className="absolute inset-4 rounded-full border-2 border-[#C9A84C]/40 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.6s" }} />
            <span className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/30">
              <RadarIcon className="w-6 h-6 text-[#C9A84C]" />
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            Drug Shortage Radar
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-body">
            Crowdsourced early warning system for medicine shortages in Ghana
          </p>
        </div>

        {/* Ghana flag accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* ============================================================ */}
      {/*  STATS BAR                                                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Active Alerts", value: STATS.activeAlerts, color: "text-red-500 dark:text-red-400" },
          { label: "Reports This Week", value: STATS.reportsThisWeek, color: "text-amber-500 dark:text-amber-400" },
          { label: "Drugs Monitored", value: STATS.drugsMonitored, color: "text-[#C9A84C]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl dark-glass p-4 text-center"
          >
            <p className={`text-2xl sm:text-3xl font-display ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[11px] sm:text-xs font-body text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  ACTIVE SHORTAGE ALERTS                                      */}
      {/* ============================================================ */}
      <section>
        <h2 className="text-[11px] font-body font-semibold text-[#8B7328] dark:text-[#C9A84C]/70 mb-4 uppercase tracking-[0.15em]">
          Active Shortage Alerts
        </h2>

        <div className="space-y-3 animate-stagger">
          {SHORTAGE_DATA.length === 0 && (
            <div className="dark-glass rounded-2xl border border-white/5 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-[#C9A84C]/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <h3 className="font-display text-lg font-bold text-warm-800 dark:text-warm-200 mb-2">No Active Shortage Alerts</h3>
              <p className="text-sm text-warm-500 dark:text-warm-400 max-w-md mx-auto">No shortage alerts have been reported yet. Community-reported drug shortages across Ghana will appear here.</p>
            </div>
          )}
          {SHORTAGE_DATA.map((item) => {
            const sev = SEVERITY_CONFIG[item.severity];
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`relative rounded-xl border ${sev.border} ${sev.bg} overflow-hidden transition-all`}
              >
                {/* Pulse bar for CRITICAL */}
                {sev.pulse && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                )}

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full text-left p-4 sm:p-5"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {/* Severity badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider ${sev.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} ${sev.pulse ? "animate-pulse" : ""}`} />
                          {item.severity}
                        </span>
                        <TrendArrow direction={item.trend} />
                      </div>

                      <h3 className="text-base sm:text-lg font-display text-gray-900 dark:text-white leading-tight">
                        {item.drug}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-body text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {item.regions.join(", ")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
                          </svg>
                          {item.reports} reports
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {daysAgo(item.firstReported)}
                        </span>
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div className="shrink-0 pt-1">
                      <SparkBars data={item.trendData} severity={item.severity} />
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-inherit">
                    <div className="pt-3 space-y-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs font-body font-semibold text-gray-700 dark:text-gray-300">
                            Suggested Alternative
                          </p>
                          <p className="text-sm font-body text-green-600 dark:text-green-400">
                            {item.alternative}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs font-body font-semibold text-gray-700 dark:text-gray-300">
                            First Reported
                          </p>
                          <p className="text-sm font-body text-gray-600 dark:text-gray-400">
                            {new Date(item.firstReported).toLocaleDateString("en-GH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Trend timeline (CSS only) */}
                      <div>
                        <p className="text-xs font-body font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          7-Day Trend
                        </p>
                        <div className="flex items-end gap-1 h-10">
                          {item.trendData.map((val, i) => {
                            const max = Math.max(...item.trendData);
                            const sevColor = {
                              CRITICAL: "bg-red-500",
                              WARNING: "bg-amber-500",
                              WATCH: "bg-blue-500",
                            }[item.severity];
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                <div
                                  className={`w-full max-w-[16px] rounded-t-sm ${sevColor}`}
                                  style={{
                                    height: `${Math.max((val / max) * 100, 6)}%`,
                                    opacity: 0.4 + (i / item.trendData.length) * 0.6,
                                  }}
                                />
                                <span className="text-[8px] font-body text-gray-400">{val}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[8px] font-body text-gray-400">7d ago</span>
                          <span className="text-[8px] font-body text-gray-400">Today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Kente divider */}
      <div className="h-[2px] w-full rounded-full overflow-hidden flex">
        <div className="flex-1 bg-ghana-red/40" />
        <div className="flex-1 bg-ghana-gold/40" />
        <div className="flex-1 bg-ghana-green/40" />
      </div>

      {/* ============================================================ */}
      {/*  SHORTAGE TREND TIMELINE                                     */}
      {/* ============================================================ */}
      <section>
        <h2 className="text-[11px] font-body font-semibold text-[#8B7328] dark:text-[#C9A84C]/70 mb-4 uppercase tracking-[0.15em]">
          Shortage Timeline
        </h2>

        <div className="rounded-xl dark-glass p-4 sm:p-5 space-y-4">
          {SHORTAGE_DATA.map((item) => {
            const sev = SEVERITY_CONFIG[item.severity];
            const daysActive = Math.floor(
              (Date.now() - new Date(item.firstReported).getTime()) / 86400000
            );
            const maxDays = 20;
            const barWidth = Math.min((daysActive / maxDays) * 100, 100);

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-gray-800 dark:text-gray-200 truncate max-w-[60%]">
                    {item.drug}
                  </span>
                  <div className="flex items-center gap-2">
                    <TrendArrow direction={item.trend} />
                    <span className={`text-[10px] font-body font-bold uppercase ${sev.text}`}>
                      {item.severity}
                    </span>
                  </div>
                </div>
                {/* CSS timeline bar */}
                <div className="relative h-2 rounded-full bg-gray-200/50 dark:bg-white/[0.05] overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full ${sev.dot} transition-all`}
                    style={{ width: `${barWidth}%`, opacity: 0.7 }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] font-body text-gray-400">
                    {new Date(item.firstReported).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-[9px] font-body text-gray-400">
                    {daysActive} day{daysActive !== 1 ? "s" : ""} active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  REGIONAL HEATMAP                                            */}
      {/* ============================================================ */}
      <section>
        <h2 className="text-[11px] font-body font-semibold text-[#8B7328] dark:text-[#C9A84C]/70 mb-4 uppercase tracking-[0.15em]">
          Regional Shortage Heatmap
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {GHANA_REGIONS.map((region) => {
            const severity = getRegionSeverity(region);
            const sev = severity ? SEVERITY_CONFIG[severity] : null;

            return (
              <div
                key={region}
                className={`relative rounded-lg p-3 text-center transition-all border ${
                  sev
                    ? `${sev.bg} ${sev.border}`
                    : "bg-warm-50/50 dark:bg-white/[0.02] border-warm-200/40 dark:border-white/[0.06]"
                }`}
              >
                {/* Indicator dot */}
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sev ? `${sev.dot} ${sev.pulse ? "animate-pulse" : ""}` : "bg-green-500/50"
                    }`}
                  />
                  {severity && (
                    <span className={`text-[9px] font-body font-bold uppercase ${sev.text}`}>
                      {severity}
                    </span>
                  )}
                  {!severity && (
                    <span className="text-[9px] font-body font-bold uppercase text-green-600 dark:text-green-400">
                      OK
                    </span>
                  )}
                </div>
                <p className="text-xs font-body font-medium text-gray-700 dark:text-gray-300 leading-tight">
                  {region}
                </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
          {[
            { label: "Critical", color: "bg-red-500" },
            { label: "Warning", color: "bg-amber-500" },
            { label: "Watch", color: "bg-blue-500" },
            { label: "No Issues", color: "bg-green-500/50" },
          ].map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-[10px] font-body text-gray-500 dark:text-gray-400">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </section>

      {/* Kente divider */}
      <div className="h-[2px] w-full rounded-full overflow-hidden flex">
        <div className="flex-1 bg-ghana-red/40" />
        <div className="flex-1 bg-ghana-gold/40" />
        <div className="flex-1 bg-ghana-green/40" />
      </div>

      {/* ============================================================ */}
      {/*  REPORT A SHORTAGE                                           */}
      {/* ============================================================ */}
      <section>
        <h2 className="text-[11px] font-body font-semibold text-[#8B7328] dark:text-[#C9A84C]/70 mb-4 uppercase tracking-[0.15em]">
          Report a Shortage
        </h2>

        <div className="rounded-xl dark-glass p-5 sm:p-6">
          {reportSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 ring-1 ring-green-500/20">
                <svg className="w-7 h-7 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-display text-gray-900 dark:text-white">
                Thank You!
              </h3>
              <p className="text-sm font-body text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                Your shortage report has been submitted. This helps the community stay informed about medicine availability across Ghana.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <p className="text-sm font-body text-gray-600 dark:text-gray-400">
                Could not find a medicine at your pharmacy? Report it here to alert others and help track developing shortages.
              </p>

              <div>
                <label
                  htmlFor="report-drug"
                  className="block text-xs font-body font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Drug Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="report-drug"
                  type="text"
                  value={reportDrug}
                  onChange={(e) => setReportDrug(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg"
                  required
                  className="admin-input w-full rounded-lg px-3 py-2.5 text-sm font-body bg-warm-50 dark:bg-white/[0.04] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="report-region"
                  className="block text-xs font-body font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Region <span className="text-red-400">*</span>
                </label>
                <select
                  id="report-region"
                  value={reportRegion}
                  onChange={(e) => setReportRegion(e.target.value)}
                  required
                  className="admin-input w-full rounded-lg px-3 py-2.5 text-sm font-body bg-warm-50 dark:bg-white/[0.04] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all appearance-none"
                >
                  <option value="" disabled>
                    Select your region
                  </option>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="report-pharmacy"
                  className="block text-xs font-body font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Pharmacy Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="report-pharmacy"
                  type="text"
                  value={reportPharmacy}
                  onChange={(e) => setReportPharmacy(e.target.value)}
                  placeholder="e.g. Ernest Chemists, Osu"
                  className="admin-input w-full rounded-lg px-3 py-2.5 text-sm font-body bg-warm-50 dark:bg-white/[0.04] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-body font-semibold bg-[#C9A84C] hover:bg-[#A8893A] text-white shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:ring-offset-2 focus:ring-offset-warm-50 dark:focus:ring-offset-gray-950"
              >
                Submit Report
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SUBSCRIBE TO ALERTS                                         */}
      {/* ============================================================ */}
      <section>
        <div className="rounded-xl gold-glass p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center ring-1 ring-[#C9A84C]/20">
                <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-display text-gray-900 dark:text-white">
                  Subscribe to Shortage Alerts
                </h3>
                <p className="text-xs font-body text-gray-600 dark:text-gray-400 mt-0.5">
                  Get notified when a shortage affects drugs in your medication list
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={subscribed}
              onClick={() => setSubscribed(!subscribed)}
              className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:ring-offset-2 focus:ring-offset-warm-50 dark:focus:ring-offset-gray-950 ${
                subscribed
                  ? "bg-[#C9A84C]"
                  : "bg-gray-300 dark:bg-white/10"
              }`}
            >
              <span className="sr-only">Subscribe to alerts</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  subscribed ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {subscribed && (
            <div className="mt-3 pt-3 border-t border-[#C9A84C]/20">
              <p className="text-xs font-body text-green-600 dark:text-green-400 inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                You will receive alerts for shortages affecting your saved medications.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DISCLAIMER                                                  */}
      {/* ============================================================ */}
      <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/20 p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-display text-[#7A6520] dark:text-[#C9A84C]">
            Community Data Notice
          </p>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-body">
            Shortage data is crowdsourced from community reports and may not reflect official supply chain information. Always consult your pharmacist or the Pharmacy Council of Ghana for confirmed availability. Alternative medications should only be used under professional guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
