import { useNavigate } from "react-router-dom";

const CATEGORY_COLORS = {
  malaria: { border: "border-t-red-500", badge: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  diabetes: { border: "border-t-blue-500", badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  hypertension: { border: "border-t-purple-500", badge: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
  "sickle-cell": { border: "border-t-amber-500", badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  "maternal-health": { border: "border-t-pink-500", badge: "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400" },
  "mental-health": { border: "border-t-teal-500", badge: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" },
  nutrition: { border: "border-t-green-500", badge: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  "infectious-disease": { border: "border-t-orange-500", badge: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
};

const CATEGORY_LABELS = {
  malaria: "Malaria",
  diabetes: "Diabetes",
  hypertension: "Hypertension",
  "sickle-cell": "Sickle Cell",
  "maternal-health": "Maternal Health",
  "mental-health": "Mental Health",
  nutrition: "Nutrition",
  "infectious-disease": "Infectious Disease",
};

function estimateReadTime(content) {
  if (!content) return "2 min read";
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatViews(views) {
  if (!views) return "0 views";
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k views`;
  return `${views} views`;
}

export default function ArticleCard({ article }) {
  const navigate = useNavigate();
  const colors = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.nutrition;
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;

  return (
    <button
      type="button"
      onClick={() => navigate(`/health-hub/${article.slug}`)}
      className={`group relative text-left w-full bg-warm-50 dark:bg-gray-900 rounded-xl border border-warm-200/60 dark:border-gray-700 border-t-4 ${colors.border} p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950`}
    >
      {/* Drug of the week badge */}
      {article.drug_of_week === 1 && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ghana-gold/10 text-ghana-gold text-[10px] font-bold uppercase tracking-wide border border-ghana-gold/30">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-3.14 1.346 2.14.92a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
            </svg>
            Drug of the Week
          </span>
        </div>
      )}

      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 pr-4">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between pt-3 border-t border-warm-200 dark:border-gray-800">
          <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${colors.badge}`}>
            {categoryLabel}
          </span>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {formatViews(article.views)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {estimateReadTime(article.content || article.summary)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export { CATEGORY_COLORS, CATEGORY_LABELS, estimateReadTime, formatViews };
