import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function DrugOfTheWeek() {
  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/drug-of-week`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.drug) setDrug(data.drug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !drug) return null;

  const tags = [
    drug.drug_class,
    drug.otc ? "OTC" : "Prescription",
    drug.nhis_covered ? `NHIS Tier ${drug.nhis_tier || "A"}` : null,
    drug.pregnancy_category ? `Pregnancy Cat. ${drug.pregnancy_category}` : null,
  ].filter(Boolean);

  return (
    <section className="max-w-3xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/50 p-6">
        {/* Ghana gold accent top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-ghana-gold" />

        <div className="flex items-start gap-4">
          {/* Pill icon */}
          <div className="shrink-0 w-12 h-12 rounded-full bg-ghana-gold/15 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-ghana-gold"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="1.5" width="12" height="21" rx="2.25" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ghana-gold/15 border border-ghana-gold/30 text-[11px] font-bold uppercase tracking-wider text-ghana-gold mb-2">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Drug of the Week
            </div>

            {/* Drug name */}
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {drug.generic_name}
            </h2>

            {/* Brand names */}
            {drug.brand_names && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                {drug.brand_names}
              </p>
            )}

            {/* Uses */}
            <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-400 leading-relaxed line-clamp-2">
              <span className="font-medium text-gray-800 dark:text-gray-300">Uses:</span>{" "}
              {drug.uses}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40"
                >
                  {tag}
                </span>
              ))}
              {drug.avg_price_ghs != null && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200/60 dark:border-green-700/40">
                  ~GH₵{Number(drug.avg_price_ghs).toFixed(2)}
                </span>
              )}
            </div>

            {/* CTA */}
            <Link
              to="/drugs"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#7A6520] dark:text-ghana-gold hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              aria-label={`View ${drug.generic_name} in the drug database`}
            >
              View in Drug Database
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
