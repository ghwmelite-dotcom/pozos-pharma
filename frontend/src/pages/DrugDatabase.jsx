import { useCallback } from "react";
import DrugSearch from "../components/Community/DrugSearch";

const CATEGORIES = [
  { name: "Antimalarials", icon: "🦟", query: "antimalarial" },
  { name: "Antibiotics", icon: "💊", query: "antibiotic" },
  { name: "Analgesics", icon: "🩹", query: "analgesic pain" },
  { name: "Antihypertensives", icon: "❤️", query: "antihypertensive" },
  { name: "Diabetes", icon: "🩸", query: "diabetes antidiabetic" },
  { name: "OTC", icon: "🏪", query: "over the counter" },
];

/**
 * PozosPharma Drug Database Page
 *
 * Full-page drug search with category quick-links and DrugSearch component.
 * Includes disclaimer banner.
 */
export default function DrugDatabase() {
  // Quick-link handler: set search input value
  const handleCategoryClick = useCallback((query) => {
    // Find the search input and programmatically set its value + trigger change
    const input = document.querySelector('input[aria-label="Search for medications"]');
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(input, query);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-indigo/10 dark:bg-indigo-900/20 mb-4">
          {/* Medical cross icon */}
          <svg
            className="w-7 h-7 text-brand-indigo dark:text-indigo-400"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Drug Database
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Search our comprehensive database for drug information, interactions,
          dosage guidelines, and more. Ghana-specific brands highlighted.
        </p>
      </div>

      {/* Category Quick Links */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider text-center">
          Common Categories
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryClick(cat.query)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white dark:bg-surface-card-dark border border-gray-200 dark:border-gray-700 rounded-full hover:border-brand-indigo dark:hover:border-indigo-500 hover:shadow-sm transition-all text-gray-700 dark:text-gray-300 hover:text-brand-indigo dark:hover:text-indigo-400"
            >
              <span aria-hidden="true">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ghana flag accent */}
      <div className="max-w-3xl mx-auto">
        <div className="h-0.5 w-full rounded-full overflow-hidden flex">
          <div className="flex-1 bg-ghana-red" />
          <div className="flex-1 bg-ghana-gold" />
          <div className="flex-1 bg-ghana-green" />
        </div>
      </div>

      {/* Drug Search */}
      <div className="max-w-3xl mx-auto">
        <DrugSearch />
      </div>

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Always consult your pharmacist
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              This database is for informational purposes only and should not replace
              professional medical advice. Always consult a qualified pharmacist or
              healthcare provider before starting, stopping, or changing any medication.
              For emergencies, call Ghana Emergency Services: 112 / 193.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
