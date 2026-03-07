import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

const NHIS_FORMULARY = [];

const STATS = {
  essentialMedicines: 0,
  commonDrugPercent: 0,
};

function ShieldIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function ExclamationIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function XCircleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function InfoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );
}

function CoverageResultCard({ drug }) {
  if (drug.coverage === "full") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.03] p-5 space-y-3 animate-stagger">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-display text-emerald-600 dark:text-emerald-400">
              Fully Covered
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
              NHIS Formulary - Category {drug.category}
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Category {drug.category}
          </span>
        </div>

        <div className="h-[1px] bg-emerald-500/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-body font-semibold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wider">Drug Name</p>
            <p className="text-sm font-body font-medium text-gray-900 dark:text-gray-100 mt-0.5">{drug.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-body font-semibold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wider">Generic Name</p>
            <p className="text-sm font-body text-gray-700 dark:text-gray-300 mt-0.5">{drug.genericName}</p>
          </div>
          <div>
            <p className="text-[11px] font-body font-semibold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wider">Drug Class</p>
            <p className="text-sm font-body text-gray-700 dark:text-gray-300 mt-0.5">{drug.drugClass}</p>
          </div>
          <div>
            <p className="text-[11px] font-body font-semibold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wider">Copay Amount</p>
            <p className="text-sm font-body font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {drug.copay === 0 ? "GH\u20B50.00 (No copay)" : `GH\u20B5${drug.copay.toFixed(2)}`}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-body font-semibold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wider mb-1.5">Covered Conditions</p>
          <div className="flex flex-wrap gap-1.5">
            {drug.conditions.map((cond) => (
              <span key={cond} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
                {cond}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 font-body leading-relaxed">{drug.notes}</p>
      </div>
    );
  }

  if (drug.coverage === "partial") {
    return (
      <div className="rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] p-5 space-y-3 animate-stagger">
        <div className="flex items-center gap-3">
          <ExclamationIcon className="w-6 h-6 text-[#C9A84C] shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-display text-[#A8893A] dark:text-[#E8D48B]">
              Partially Covered ({drug.coveragePercent}%)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
              NHIS Formulary - Category {drug.category}
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-[#C9A84C]/10 text-[#A8893A] dark:text-[#E8D48B] border border-[#C9A84C]/20">
            Category {drug.category}
          </span>
        </div>

        <div className="h-[1px] bg-[#C9A84C]/10" />

        {/* Coverage bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-body mb-1.5">
            <span className="text-gray-600 dark:text-gray-400">NHIS Coverage</span>
            <span className="font-semibold text-[#A8893A] dark:text-[#E8D48B]">{drug.coveragePercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] transition-all duration-700"
              style={{ width: `${drug.coveragePercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-body font-semibold text-[#C9A84C]/60 uppercase tracking-wider">Drug Name</p>
            <p className="text-sm font-body font-medium text-gray-900 dark:text-gray-100 mt-0.5">{drug.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-body font-semibold text-[#C9A84C]/60 uppercase tracking-wider">Generic Name</p>
            <p className="text-sm font-body text-gray-700 dark:text-gray-300 mt-0.5">{drug.genericName}</p>
          </div>
          <div>
            <p className="text-[11px] font-body font-semibold text-[#C9A84C]/60 uppercase tracking-wider">Estimated Retail Price</p>
            <p className="text-sm font-body text-gray-700 dark:text-gray-300 mt-0.5">GH&#8373;{drug.retailPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] font-body font-semibold text-[#C9A84C]/60 uppercase tracking-wider">Your Out-of-Pocket</p>
            <p className="text-sm font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] mt-0.5">GH&#8373;{drug.outOfPocket.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-body font-semibold text-[#C9A84C]/60 uppercase tracking-wider mb-1.5">Conditions for Coverage</p>
          <div className="flex flex-wrap gap-1.5">
            {drug.conditions.map((cond) => (
              <span key={cond} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body bg-[#C9A84C]/10 text-[#A8893A] dark:text-[#E8D48B] border border-[#C9A84C]/15">
                {cond}
              </span>
            ))}
          </div>
        </div>

        {drug.requiresAuth && (
          <div className="flex items-start gap-2 rounded-lg bg-[#C9A84C]/10 dark:bg-[#C9A84C]/5 p-3">
            <InfoIcon className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
            <p className="text-xs text-[#A8893A] dark:text-[#E8D48B] font-body">
              Specialist authorization required. Prior approval needed before dispensing.
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 font-body leading-relaxed">{drug.notes}</p>
      </div>
    );
  }

  // Not covered
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 dark:bg-red-500/[0.03] p-5 space-y-3 animate-stagger">
      <div className="flex items-center gap-3">
        <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-display text-red-600 dark:text-red-400">
            Not Covered
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
            Not on NHIS Essential Medicines List
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          Not Listed
        </span>
      </div>

      <div className="h-[1px] bg-red-500/10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-body font-semibold text-red-500/60 uppercase tracking-wider">Drug Name</p>
          <p className="text-sm font-body font-medium text-gray-900 dark:text-gray-100 mt-0.5">{drug.name}</p>
        </div>
        <div>
          <p className="text-[11px] font-body font-semibold text-red-500/60 uppercase tracking-wider">Generic Name</p>
          <p className="text-sm font-body text-gray-700 dark:text-gray-300 mt-0.5">{drug.genericName}</p>
        </div>
        <div>
          <p className="text-[11px] font-body font-semibold text-red-500/60 uppercase tracking-wider">Drug Class</p>
          <p className="text-sm font-body text-gray-700 dark:text-gray-300 mt-0.5">{drug.drugClass}</p>
        </div>
        <div>
          <p className="text-[11px] font-body font-semibold text-red-500/60 uppercase tracking-wider">Estimated Retail Price</p>
          <p className="text-sm font-body font-semibold text-red-600 dark:text-red-400 mt-0.5">GH&#8373;{drug.retailPrice.toFixed(2)}</p>
        </div>
      </div>

      {drug.alternative && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-body font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Covered Alternative</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body font-medium text-gray-900 dark:text-gray-100">{drug.alternative.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-0.5">
                {drug.alternative.genericName} &middot; Category {drug.alternative.category} &middot; Copay: GH&#8373;{drug.alternative.copay.toFixed(2)}
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Fully Covered
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 font-body leading-relaxed">{drug.notes}</p>
    </div>
  );
}

export default function NHISLookup() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentlyChecked, setRecentlyChecked] = useState([]);
  const [infoSection, setInfoSection] = useState(null);

  const filteredDrugs = searchQuery.length >= 2
    ? NHIS_FORMULARY.filter((drug) => {
        const q = searchQuery.toLowerCase();
        return (
          drug.name.toLowerCase().includes(q) ||
          drug.genericName.toLowerCase().includes(q) ||
          drug.drugClass.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSelectDrug = (drug) => {
    setSelectedDrug(drug);
    setSearchQuery(drug.name);
    setShowSuggestions(false);
    setRecentlyChecked((prev) => {
      const filtered = prev.filter((d) => d.id !== drug.id);
      return [drug, ...filtered].slice(0, 5);
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
    if (value.length < 2) {
      setSelectedDrug(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedDrug(null);
    setShowSuggestions(false);
  };

  const toggleInfoSection = (section) => {
    setInfoSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            <ShieldIcon className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            NHIS Coverage Checker
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-body">
            Check if your medication is covered by Ghana's National Health Insurance
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl dark-glass border border-[#C9A84C]/10 p-4 text-center">
            <p className="text-2xl font-display gold-text">{STATS.essentialMedicines}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1">Essential Medicines Covered</p>
          </div>
          <div className="rounded-xl dark-glass border border-[#C9A84C]/10 p-4 text-center">
            <p className="text-2xl font-display gold-text">{STATS.commonDrugPercent}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1">Of Common Drugs Included</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto">
        <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search for a medication
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            placeholder="Enter drug name (e.g. Metformin, Amlodipine, Coartem)..."
            className="admin-input w-full pl-12 pr-10 py-4 rounded-xl border border-warm-200/60 dark:border-white/10 bg-warm-50 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all text-base font-body"
            aria-label="Search for medications on NHIS formulary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Autocomplete suggestions */}
          {showSuggestions && filteredDrugs.length > 0 && (
            <div className="absolute z-30 mt-1 w-full dark-glass border border-white/10 rounded-xl shadow-lg max-h-72 overflow-y-auto">
              {filteredDrugs.map((drug) => (
                <button
                  key={drug.id}
                  type="button"
                  onClick={() => handleSelectDrug(drug)}
                  className="w-full text-left px-4 py-3 hover:bg-[#C9A84C]/5 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-body font-medium text-gray-900 dark:text-gray-100">
                      {drug.name}
                    </span>
                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-body">
                      {drug.genericName} &middot; {drug.drugClass}
                    </span>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-body font-semibold ${
                    drug.coverage === "full"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : drug.coverage === "partial"
                      ? "bg-[#C9A84C]/10 text-[#A8893A] dark:text-[#E8D48B]"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}>
                    {drug.coverage === "full" ? "Covered" : drug.coverage === "partial" ? "Partial" : "Not Covered"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showSuggestions && searchQuery.length >= 2 && filteredDrugs.length === 0 && (
            <div className="absolute z-30 mt-1 w-full dark-glass border border-white/10 rounded-xl shadow-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
                No medications found matching "{searchQuery}". Try a different search term.
              </p>
            </div>
          )}
        </div>

        {NHIS_FORMULARY.length === 0 && !selectedDrug && (
          <div className="dark-glass rounded-2xl border border-white/5 p-8 text-center mt-6">
            <svg className="w-12 h-12 mx-auto text-[#C9A84C]/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <h3 className="font-display text-lg font-bold text-warm-800 dark:text-warm-200 mb-2">No Results Found</h3>
            <p className="text-sm text-warm-500 dark:text-warm-400 max-w-md mx-auto">No NHIS formulary data available yet. Coverage information will appear here as it becomes available.</p>
          </div>
        )}
      </div>

      {/* Coverage Result */}
      {selectedDrug && (
        <div className="max-w-3xl mx-auto">
          <CoverageResultCard drug={selectedDrug} />
        </div>
      )}

      {/* Recently Checked */}
      {recentlyChecked.length > 0 && !selectedDrug && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[11px] font-body font-semibold text-[#8B7328] dark:text-[#C9A84C]/70 mb-3 uppercase tracking-[0.15em]">
            Recently Checked
          </h2>
          <div className="space-y-2">
            {recentlyChecked.map((drug) => (
              <button
                key={drug.id}
                type="button"
                onClick={() => handleSelectDrug(drug)}
                className="w-full text-left rounded-xl dark-glass border border-white/5 hover:border-[#C9A84C]/20 p-3.5 flex items-center gap-3 transition-all group"
              >
                <ClockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-gray-900 dark:text-gray-100 truncate">
                    {drug.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-body truncate">
                    {drug.genericName}
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-medium ${
                  drug.coverage === "full"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : drug.coverage === "partial"
                    ? "bg-[#C9A84C]/10 text-[#A8893A] dark:text-[#E8D48B]"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}>
                  {drug.coverage === "full" ? (
                    <><CheckCircleIcon className="w-3 h-3" /> Covered</>
                  ) : drug.coverage === "partial" ? (
                    <><ExclamationIcon className="w-3 h-3" /> Partial</>
                  ) : (
                    <><XCircleIcon className="w-3 h-3" /> Not Covered</>
                  )}
                </span>
                <ArrowRightIcon className="w-4 h-4 text-[#C9A84C]/40 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kente accent divider */}
      <div className="max-w-3xl mx-auto">
        <div className="h-[2px] w-full rounded-full overflow-hidden flex">
          <div className="flex-1 bg-ghana-red/40" />
          <div className="flex-1 bg-ghana-gold/40" />
          <div className="flex-1 bg-ghana-green/40" />
        </div>
      </div>

      {/* NHIS Information Section */}
      <div className="max-w-3xl mx-auto space-y-3">
        <h2 className="text-[11px] font-body font-semibold text-[#8B7328] dark:text-[#C9A84C]/70 uppercase tracking-[0.15em]">
          About NHIS Coverage
        </h2>

        {/* What is NHIS? */}
        <div className="rounded-xl dark-glass border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleInfoSection("what")}
            className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#C9A84C]/5 transition-colors"
            aria-expanded={infoSection === "what"}
          >
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
              <InfoIcon className="w-4 h-4 text-[#C9A84C]" />
            </div>
            <span className="flex-1 text-sm font-display text-gray-900 dark:text-gray-100">
              What is NHIS?
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${infoSection === "what" ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {infoSection === "what" && (
            <div className="px-5 pb-4 border-t border-white/5">
              <div className="pt-3 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-body leading-relaxed">
                  The National Health Insurance Scheme (NHIS) is Ghana's public healthcare financing system
                  established under Act 650 (2003) and revised under Act 852 (2012). It provides financial
                  access to quality healthcare for residents of Ghana, covering a broad range of diseases
                  and their treatments.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-body leading-relaxed">
                  NHIS covers approximately 95% of disease conditions in Ghana, including outpatient and
                  inpatient services, maternity care, emergencies, dental care, and essential medicines
                  listed on the National Health Insurance Medicines List.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Coverage Tiers */}
        <div className="rounded-xl dark-glass border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleInfoSection("tiers")}
            className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#C9A84C]/5 transition-colors"
            aria-expanded={infoSection === "tiers"}
          >
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm3 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-display text-gray-900 dark:text-gray-100">
              Coverage Tiers Explained
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${infoSection === "tiers" ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {infoSection === "tiers" && (
            <div className="px-5 pb-4 border-t border-white/5">
              <div className="pt-3 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/[0.03] border border-emerald-500/15">
                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-body font-bold">A</span>
                  <div>
                    <p className="text-sm font-body font-semibold text-emerald-600 dark:text-emerald-400">Category A &mdash; Essential Medicines</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-body mt-0.5 leading-relaxed">
                      Fully covered with no copayment. Includes critical medicines for malaria, hypertension,
                      diabetes, infections, and other priority conditions. Available at all NHIS-accredited facilities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/15">
                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#C9A84C]/10 text-[#A8893A] dark:text-[#E8D48B] text-xs font-body font-bold">B</span>
                  <div>
                    <p className="text-sm font-body font-semibold text-[#A8893A] dark:text-[#E8D48B]">Category B &mdash; Supplementary Medicines</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-body mt-0.5 leading-relaxed">
                      Partially covered, typically 60-80%. May require a small copayment or prior authorization
                      from a specialist. Includes some newer medications and specialized treatments.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 dark:bg-red-500/[0.03] border border-red-500/15">
                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-body font-bold">C</span>
                  <div>
                    <p className="text-sm font-body font-semibold text-red-600 dark:text-red-400">Category C &mdash; Non-covered Medicines</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-body mt-0.5 leading-relaxed">
                      Not covered by NHIS. Patient pays full retail price. Often includes brand-name drugs
                      where a generic alternative is available on the formulary. Ask your pharmacist about
                      covered alternatives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How to Register / Renew */}
        <div className="rounded-xl dark-glass border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleInfoSection("register")}
            className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#C9A84C]/5 transition-colors"
            aria-expanded={infoSection === "register"}
          >
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-display text-gray-900 dark:text-gray-100">
              How to Register / Renew Your NHIS Card
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${infoSection === "register" ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {infoSection === "register" && (
            <div className="px-5 pb-4 border-t border-white/5">
              <div className="pt-3 space-y-3">
                <div>
                  <p className="text-xs font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] uppercase tracking-wider mb-2">New Registration</p>
                  <ol className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 font-body list-decimal list-inside leading-relaxed">
                    <li>Visit any NHIS district office or accredited registration agent</li>
                    <li>Bring a valid Ghana Card (or birth certificate for children under 15)</li>
                    <li>Complete the registration form and pay the annual premium</li>
                    <li>Biometric data (fingerprints) will be captured</li>
                    <li>Your NHIS card will be issued within 2-4 weeks</li>
                  </ol>
                </div>
                <div className="h-[1px] bg-white/5" />
                <div>
                  <p className="text-xs font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] uppercase tracking-wider mb-2">Card Renewal</p>
                  <ol className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 font-body list-decimal list-inside leading-relaxed">
                    <li>Dial *929# on any mobile network to renew via mobile money</li>
                    <li>Alternatively, visit any NHIS office with your expired card</li>
                    <li>Pay the annual premium (varies by district, typically GH&#8373;30-50)</li>
                    <li>Renewal is instant when done via mobile money</li>
                  </ol>
                </div>
                <div className="rounded-lg bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/15 p-3">
                  <p className="text-xs text-[#A8893A] dark:text-[#E8D48B] font-body">
                    <strong>Exempt groups:</strong> Children under 18, pregnant women, elderly (70+), SSNIT contributors,
                    and indigents are exempt from premium payments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Find Accredited Pharmacies */}
        <div className="rounded-xl dark-glass border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleInfoSection("pharmacies")}
            className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#C9A84C]/5 transition-colors"
            aria-expanded={infoSection === "pharmacies"}
          >
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-display text-gray-900 dark:text-gray-100">
              Find NHIS-Accredited Pharmacies
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${infoSection === "pharmacies" ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {infoSection === "pharmacies" && (
            <div className="px-5 pb-4 border-t border-white/5">
              <div className="pt-3 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-body leading-relaxed">
                  Only NHIS-accredited (credentialed) pharmacies and health facilities can dispense
                  medicines under the scheme. To find an accredited pharmacy near you:
                </p>
                <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 font-body list-disc list-inside leading-relaxed">
                  <li>Look for the NHIS accreditation certificate displayed at the pharmacy</li>
                  <li>Call the NHIS hotline: <span className="font-semibold text-[#C9A84C]">0800-100-150</span> (toll-free)</li>
                  <li>Visit the NHIA website at <span className="font-semibold text-[#C9A84C]">www.nhis.gov.gh</span> for a provider directory</li>
                  <li>Use our Pharmacy Locator to find accredited pharmacies nearby</li>
                </ul>
                <a
                  href="/pharmacies"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] transition-all shadow-sm shadow-[#C9A84C]/20"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Find Nearby Pharmacies
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/20 p-4 flex items-start gap-3">
          <ExclamationIcon className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-display text-[#7A6520] dark:text-[#C9A84C]">
              Coverage Information Disclaimer
            </p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-body">
              This tool provides general guidance based on the NHIS Essential Medicines List. Actual coverage
              may vary depending on your registration status, facility accreditation, and specific clinical
              circumstances. Always confirm coverage with your healthcare provider or NHIS office before
              treatment. For emergencies, seek care immediately — NHIS covers all emergency treatments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
