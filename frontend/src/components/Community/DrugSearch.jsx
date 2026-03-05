import { useState, useRef, useCallback, useEffect } from "react";
import useChatStore from "../../store/chatStore";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Drug Search Component
 *
 * Search input with debounced API call to /api/drugs/search?q=
 * Results as cards with generic name, brand names, drug class,
 * uses summary, OTC/prescription badge, and controlled substance warning.
 * Click to expand full details.
 */
export default function DrugSearch() {
  const token = useChatStore((s) => s.token);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Debounced search
  const doSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        setError("");
        return;
      }

      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");
      setHasSearched(true);

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(
          `${API_URL}/api/drugs/search?q=${encodeURIComponent(searchQuery.trim())}`,
          { headers, signal: controller.signal }
        );

        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        setResults(Array.isArray(data) ? data : data.drugs || data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Failed to search drugs. Please try again.");
          console.error("[DrugSearch] error:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      doSearch(val);
    }, 400);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for any medication..."
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-transparent transition-shadow shadow-sm"
          aria-label="Search for medications"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <div className="w-4 h-4 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && results.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No medications found for &quot;{query}&quot;
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Try a different name or spelling
          </p>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !loading && (
        <div className="text-center py-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-indigo/10 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-brand-indigo dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Search for any medication...
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Find drug information, interactions, and dosage guidelines
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((drug) => {
            const isExpanded = expandedId === (drug.id || drug.generic_name);
            const drugKey = drug.id || drug.generic_name;

            return (
              <div
                key={drugKey}
                className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(drugKey)}
                  className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-indigo"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {drug.generic_name}
                        </h3>
                        {/* OTC / Prescription badge */}
                        {drug.otc != null && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              drug.otc
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-300 dark:ring-green-700"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-700"
                            }`}
                          >
                            {drug.otc ? "OTC" : "Prescription"}
                          </span>
                        )}
                        {/* Controlled substance warning */}
                        {drug.controlled && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-700">
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Controlled
                          </span>
                        )}
                      </div>

                      {/* Brand names */}
                      {drug.brand_names?.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="font-medium">Brands:</span>{" "}
                          {drug.brand_names.map((b, i) => (
                            <span key={i}>
                              <span className={drug.ghana_brand ? "text-brand-emerald dark:text-emerald-400 font-medium" : ""}>
                                {b}
                              </span>
                              {i < drug.brand_names.length - 1 && ", "}
                            </span>
                          ))}
                        </p>
                      )}

                      {/* Drug class */}
                      {drug.drug_class && (
                        <p className="text-xs text-brand-teal dark:text-teal-400 font-medium mt-0.5">
                          {drug.drug_class}
                        </p>
                      )}

                      {/* Uses summary */}
                      {drug.uses && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {drug.uses}
                        </p>
                      )}
                    </div>

                    <svg
                      className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Details */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/50 pt-3 space-y-3">
                    {/* Side Effects */}
                    {drug.side_effects && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                          Side Effects
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {drug.side_effects}
                        </p>
                      </div>
                    )}

                    {/* Interactions */}
                    {drug.interactions && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                          Drug Interactions
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {drug.interactions}
                        </p>
                      </div>
                    )}

                    {/* Dosage */}
                    {drug.dosage && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                          Dosage
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {drug.dosage}
                        </p>
                      </div>
                    )}

                    {/* Pregnancy Category */}
                    {drug.pregnancy_category && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Pregnancy Category:
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${
                            drug.pregnancy_category === "X"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : drug.pregnancy_category === "D"
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {drug.pregnancy_category}
                        </span>
                      </div>
                    )}

                    {/* Ghana-specific info */}
                    {drug.ghana_info && (
                      <div className="rounded-lg bg-ghana-gold/10 dark:bg-yellow-900/20 border border-ghana-gold/30 dark:border-yellow-700/40 p-3">
                        <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-0.5">
                          Ghana-Specific Information
                        </p>
                        <p className="text-sm text-yellow-900 dark:text-yellow-200">
                          {drug.ghana_info}
                        </p>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 italic pt-1 border-t border-gray-100 dark:border-gray-700/50">
                      Always consult a pharmacist or healthcare provider before starting, stopping, or changing medication.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
