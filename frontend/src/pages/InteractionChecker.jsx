import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";
import useChatStore from "../store/chatStore";
import InteractionMatrix from "../components/Drugs/InteractionMatrix";

const API_URL = import.meta.env.VITE_API_URL || "";

const SEVERITY_STYLES = {
  none: {
    bg: "bg-emerald-500/5 dark:bg-emerald-500/[0.03]",
    border: "border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "No Interaction",
  },
  moderate: {
    bg: "bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03]",
    border: "border-[#C9A84C]/20",
    text: "text-[#C9A84C]",
    dot: "bg-[#C9A84C]",
    label: "Moderate",
  },
  severe: {
    bg: "bg-red-500/5 dark:bg-red-500/[0.03]",
    border: "border-red-500/20",
    text: "text-red-500 dark:text-red-400",
    dot: "bg-red-500",
    label: "Severe",
  },
};

export default function InteractionChecker() {
  const { t } = useTranslation();
  const token = useChatStore((s) => s.token);
  const user = useChatStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const q = e.target.value;
      setSearchQuery(q);

      if (searchTimeout.current) clearTimeout(searchTimeout.current);

      if (q.length < 2) {
        setSearchResults([]);
        setDropdownOpen(false);
        return;
      }

      searchTimeout.current = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await fetch(
            `${API_URL}/api/drugs/search?q=${encodeURIComponent(q)}`
          );
          if (res.ok) {
            const data = await res.json();
            const filtered = (data.drugs || []).filter(
              (d) => !selectedDrugs.some((s) => s.id === d.id)
            );
            setSearchResults(filtered);
            setDropdownOpen(filtered.length > 0);
          }
        } catch {
          // Silently handle search errors
        } finally {
          setSearching(false);
        }
      }, 300);
    },
    [selectedDrugs]
  );

  const addDrug = useCallback(
    (drug) => {
      if (selectedDrugs.length >= 10) return;
      if (selectedDrugs.some((d) => d.id === drug.id)) return;
      setSelectedDrugs((prev) => [...prev, drug]);
      setSearchQuery("");
      setSearchResults([]);
      setDropdownOpen(false);
    },
    [selectedDrugs]
  );

  const removeDrug = useCallback((drugId) => {
    setSelectedDrugs((prev) => prev.filter((d) => d.id !== drugId));
    setResults(null);
  }, []);

  const checkInteractions = useCallback(async () => {
    if (selectedDrugs.length < 2 || !token) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(`${API_URL}/api/drugs/interactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          drugIds: selectedDrugs.map((d) => String(d.id)),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to check interactions");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDrugs, token]);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            <svg className="w-7 h-7 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 3l4 4-4 4" />
              <path d="M20 7H4" />
              <path d="M8 21l-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            Drug Interaction Checker
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto font-body">
            Check for potential interactions between your medications. Add 2-10 drugs to analyze.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Auth gate */}
      {!user ? (
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl dark-glass border border-[#C9A84C]/20 p-6 text-center">
            <p className="text-sm text-[#C9A84C] font-body font-medium">
              Please sign in to use the Drug Interaction Checker.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Drug Search & Add */}
          <div className="max-w-3xl mx-auto">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search and add medications
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Type a drug name to search..."
                  className="w-full px-4 py-3 rounded-xl border border-warm-200/60 dark:border-white/10 bg-warm-50 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all text-sm font-body"
                  disabled={selectedDrugs.length >= 10}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {dropdownOpen && searchResults.length > 0 && (
                <div className="absolute z-30 mt-1 w-full dark-glass border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((drug) => (
                    <button
                      key={drug.id}
                      onClick={() => addDrug(drug)}
                      className="w-full text-left px-4 py-3 hover:bg-[#C9A84C]/5 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      <span className="text-sm font-body font-medium text-gray-900 dark:text-gray-100">
                        {drug.generic_name}
                      </span>
                      {drug.brand_names && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-body">
                          ({drug.brand_names})
                        </span>
                      )}
                      {drug.drug_class && (
                        <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-body">
                          {drug.drug_class}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected drugs as chips */}
          {selectedDrugs.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 mb-3 uppercase tracking-[0.15em]">
                My Medications ({selectedDrugs.length}/10)
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map((drug) => (
                  <span
                    key={drug.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                  >
                    {drug.generic_name}
                    <button
                      onClick={() => removeDrug(drug.id)}
                      className="ml-1 w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-[#C9A84C]/20 transition-colors"
                      aria-label={`Remove ${drug.generic_name}`}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Check button */}
          <div className="max-w-3xl mx-auto">
            <button
              onClick={checkInteractions}
              disabled={selectedDrugs.length < 2 || loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#C9A84C]/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Check Interactions
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-3xl mx-auto">
              <div className="rounded-xl bg-red-500/5 dark:bg-red-500/[0.03] border border-red-500/20 p-4">
                <p className="text-sm text-red-500 dark:text-red-400 font-body">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Interaction Matrix */}
              <div className="rounded-xl dark-glass p-4 sm:p-6">
                <InteractionMatrix
                  drugs={results.drugs}
                  interactions={results.interactions}
                />
              </div>

              {/* Pairwise Results List */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">
                  Pairwise Results
                </h3>
                {results.interactions.map((inter, idx) => {
                  const style = SEVERITY_STYLES[inter.severity];
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        <span className="text-sm font-display text-gray-900 dark:text-gray-100">
                          {inter.drugA.generic_name} + {inter.drugB.generic_name}
                        </span>
                        <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </div>
                      {inter.description && (
                        <p className={`text-sm font-body ${style.text} leading-relaxed mt-1 pl-5`}>
                          {inter.description}
                        </p>
                      )}
                      {!inter.description && inter.severity === "none" && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-5 font-body">
                          No known interaction detected in our database.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* AI Summary */}
              {results.aiSummary && (
                <div className="rounded-xl gold-glass p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0112 2z" />
                    </svg>
                    <h3 className="text-sm font-display text-[#C9A84C]">
                      AI Pharmacist Summary
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-body">
                    {results.aiSummary}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/20 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-display text-[#C9A84C]">
              {t("disclaimer.title")}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-body">
              {t("disclaimer.text")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
