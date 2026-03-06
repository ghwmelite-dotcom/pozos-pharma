import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

/* ───────────────────── Mock Data ───────────────────── */

const MOCK_DRUGS = [];
const MOCK_PRICES = {};
const MOST_COMPARED = [];
const MOCK_TREND = [];

const SAVINGS_TIPS = [
  {
    title: "Buy Generic Brands",
    desc: "Generic medicines contain the same active ingredients as branded ones but cost 30-70% less. Ask your pharmacist for generic alternatives.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: "Check NHIS Coverage",
    desc: "Many essential medicines are covered under the National Health Insurance Scheme. Verify your coverage before paying out of pocket.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Compare Prices",
    desc: "Medicine prices can vary 3-5x between pharmacies. Always compare before buying, especially for chronic medications you take regularly.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    title: "Buy in Bulk",
    desc: "For chronic medications, buying a 3-month supply is often cheaper per tablet than buying monthly. Ask pharmacies about bulk discounts.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

/* ───────────────────── Helpers ───────────────────── */

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

function formatCurrency(val) {
  return `GH\u20B5${val.toFixed(2)}`;
}

/* ───────────────────── SVG Price Trend Chart ───────────────────── */

function PriceTrendChart({ data }) {
  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices) - 1;
  const maxP = Math.max(...prices) + 1;
  const range = maxP - minP || 1;

  const w = 360;
  const h = 160;
  const padX = 40;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * chartW;
    const y = padY + chartH - ((d.price - minP) / range) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-label="Price trend chart">
      <defs>
        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A8893A" />
          <stop offset="100%" stopColor="#E8D48B" />
        </linearGradient>
      </defs>

      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = padY + chartH * (1 - frac);
        const label = (minP + range * frac).toFixed(1);
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
            <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-gray-400 dark:fill-gray-500" fontSize="9" fontFamily="Outfit, sans-serif">
              {label}
            </text>
          </g>
        );
      })}

      {/* area */}
      <path d={areaPath} fill="url(#trendGradient)" />

      {/* line */}
      <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* dots + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#C9A84C" stroke="#1a1a1a" strokeWidth="1.5" />
          <text x={p.x} y={padY + chartH + 14} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="9" fontFamily="Outfit, sans-serif">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────── Main Component ───────────────────── */

export default function DrugPrices() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [priceResults, setPriceResults] = useState([]);

  // Report a Price form state
  const [reportForm, setReportForm] = useState({
    drug: "",
    pharmacy: "",
    price: "",
    date: "",
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  /* ── Search handlers ── */

  function handleSearchInput(e) {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      const filtered = MOCK_DRUGS.filter((d) => d.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function selectDrug(drug) {
    setQuery(drug);
    setSelectedDrug(drug);
    setShowSuggestions(false);
    setPriceResults(MOCK_PRICES[drug] || []);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const match = MOCK_DRUGS.find((d) => d.toLowerCase() === query.toLowerCase());
    if (match) {
      selectDrug(match);
    }
  }

  /* ── Price analysis ── */

  const sortedPrices = [...priceResults].sort((a, b) => a.price - b.price);
  const bestPrice = sortedPrices.length > 0 ? sortedPrices[0].price : 0;
  const worstPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1].price : 0;
  const savings = worstPrice - bestPrice;

  /* ── Report form handlers ── */

  function handleReportChange(e) {
    setReportForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleReportSubmit(e) {
    e.preventDefault();
    setReportSubmitted(true);
    setReportForm({ drug: "", pharmacy: "", price: "", date: "" });
    setTimeout(() => setReportSubmitted(false), 4000);
  }

  return (
    <div className="space-y-8 pb-8">
      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            {/* Price tag / compare icon */}
            <svg className="w-7 h-7 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            Drug Price Compare
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-body">
            Compare medicine prices across pharmacies in Ghana
          </p>
        </div>

        {/* Ghana flag accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="max-w-2xl mx-auto relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleSearchInput}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search for a medicine (e.g. Metformin, Paracetamol)..."
              className="admin-input w-full pl-12 pr-24 py-4 text-base rounded-xl bg-warm-50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]/50 transition-all"
              aria-label="Search for medicine prices"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#A8893A] to-[#C9A84C] text-white text-sm font-body font-medium hover:from-[#C9A84C] hover:to-[#E8D48B] hover:text-gray-900 transition-all shadow-sm"
            >
              Compare
            </button>
          </div>
        </form>

        {/* Autocomplete dropdown */}
        {showSuggestions && (
          <div className="absolute z-50 top-full mt-1 w-full rounded-xl overflow-hidden dark-glass border border-warm-200/60 dark:border-white/10 shadow-xl">
            {suggestions.map((drug) => (
              <button
                key={drug}
                type="button"
                onMouseDown={() => selectDrug(drug)}
                className="w-full text-left px-4 py-3 text-sm font-body text-gray-700 dark:text-gray-300 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] transition-colors border-b border-warm-200/30 dark:border-white/5 last:border-b-0"
              >
                <span className="mr-2 opacity-50">{"\uD83D\uDC8A"}</span>
                {drug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Price Results ─── */}
      {selectedDrug && priceResults.length > 0 && (
        <div className="space-y-6 animate-stagger">
          {/* Drug name + savings banner */}
          <div className="relative overflow-hidden rounded-2xl dark-glass p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-display gold-text">{selectedDrug}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1">
                  Showing prices from {priceResults.length} pharmacies
                </p>
              </div>
              {savings > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-body font-medium">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  Save up to {formatCurrency(savings)} by comparing
                </div>
              )}
            </div>
          </div>

          {/* Price comparison cards + bar chart */}
          <div className="grid gap-3">
            {sortedPrices.map((item, idx) => {
              const isBest = item.price === bestPrice;
              const barWidth = worstPrice > 0 ? (item.price / worstPrice) * 100 : 0;

              return (
                <div
                  key={item.pharmacy}
                  className={`relative overflow-hidden rounded-xl p-4 transition-all ${
                    isBest
                      ? "dark-glass ring-1 ring-[#C9A84C]/40 shadow-[0_0_20px_rgba(201,168,76,0.08)]"
                      : "dark-glass"
                  }`}
                >
                  {/* Best price badge */}
                  {isBest && (
                    <div className="absolute top-0 right-0">
                      <div className="px-3 py-1 text-[10px] font-body font-semibold uppercase tracking-wider bg-gradient-to-r from-[#A8893A] to-[#C9A84C] text-white rounded-bl-lg">
                        Best Price
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-bold ${
                      isBest
                        ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                        : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400"
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-body font-semibold ${
                          isBest ? "text-[#C9A84C]" : "text-gray-800 dark:text-gray-200"
                        }`}>
                          {item.pharmacy}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-body">
                          {item.location}
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="mt-2 h-2.5 rounded-full bg-gray-100 dark:bg-white/[0.04] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isBest
                              ? "bg-gradient-to-r from-[#A8893A] to-[#C9A84C]"
                              : "bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-body mt-1">
                        Updated {formatDate(item.updated)}
                      </p>
                    </div>

                    {/* Price */}
                    <div className={`flex-shrink-0 text-right ${
                      isBest ? "text-[#C9A84C]" : "text-gray-700 dark:text-gray-300"
                    }`}>
                      <span className="text-lg font-display font-semibold">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Price Trend Chart ─── */}
          <div className="relative overflow-hidden rounded-2xl dark-glass p-6">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
            <h3 className="text-base font-display gold-text mb-1">Price Trend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-body mb-4">
              Average price over the last 6 months (GH{"\u20B5"})
            </p>
            <PriceTrendChart data={MOCK_TREND} />
          </div>
        </div>
      )}

      {/* ─── Most Compared Drugs ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
            </svg>
          </div>
          <h2 className="text-lg font-display gold-text">Most Compared Drugs</h2>
        </div>

        {MOST_COMPARED.length === 0 && (
          <div className="text-center py-8">
            <p className="text-warm-500 dark:text-warm-400 text-sm">Drug price comparisons are being collected from pharmacies across Ghana. Check back soon.</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOST_COMPARED.map((drug) => (
            <button
              key={drug.name}
              type="button"
              onClick={() => {
                const fullName = MOCK_DRUGS.find((d) => d.toLowerCase().includes(drug.name.toLowerCase().split(" ")[0]));
                if (fullName) selectDrug(fullName);
              }}
              className="group relative overflow-hidden rounded-xl dark-glass p-4 text-left hover:ring-1 hover:ring-[#C9A84C]/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl" role="img" aria-hidden="true">{drug.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-body font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#C9A84C] transition-colors">
                    {drug.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1">
                    Avg: <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(drug.avg)}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Low: {formatCurrency(drug.low)}
                    </span>
                    <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
                      High: {formatCurrency(drug.high)}
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#C9A84C] transition-colors flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Report a Price ─── */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-display gold-text">Report a Price</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
              Help others save money. Share a price you saw at a pharmacy.
            </p>
          </div>
        </div>

        {reportSubmitted && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-body flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Thank you! Your price report has been submitted for verification.
          </div>
        )}

        <form onSubmit={handleReportSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Drug Name
            </label>
            <input
              type="text"
              name="drug"
              required
              value={reportForm.drug}
              onChange={handleReportChange}
              placeholder="e.g. Metformin 500mg"
              className="admin-input w-full px-3 py-2.5 text-sm rounded-lg bg-warm-50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Pharmacy Name & Location
            </label>
            <input
              type="text"
              name="pharmacy"
              required
              value={reportForm.pharmacy}
              onChange={handleReportChange}
              placeholder="e.g. Ernest Chemists, Osu"
              className="admin-input w-full px-3 py-2.5 text-sm rounded-lg bg-warm-50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Price (GH{"\u20B5"})
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={reportForm.price}
              onChange={handleReportChange}
              placeholder="e.g. 18.50"
              className="admin-input w-full px-3 py-2.5 text-sm rounded-lg bg-warm-50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Date Seen
            </label>
            <input
              type="date"
              name="date"
              required
              value={reportForm.date}
              onChange={handleReportChange}
              className="admin-input w-full px-3 py-2.5 text-sm rounded-lg bg-warm-50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]/50 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#A8893A] to-[#C9A84C] text-white text-sm font-body font-medium hover:from-[#C9A84C] hover:to-[#E8D48B] hover:text-gray-900 transition-all shadow-sm"
            >
              Submit Price Report
            </button>
          </div>
        </form>
      </div>

      {/* ─── Tips: How to Save on Medicines ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-display gold-text">How to Save on Medicines in Ghana</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAVINGS_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="relative overflow-hidden rounded-xl dark-glass p-5 group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]">
                  {tip.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-body font-semibold text-gray-800 dark:text-gray-200">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1 leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
