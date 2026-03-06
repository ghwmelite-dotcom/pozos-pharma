import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ArticleCard, { CATEGORY_COLORS, CATEGORY_LABELS } from "../components/Education/ArticleCard";

const API_URL = import.meta.env.VITE_API_URL || "";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "malaria", label: "Malaria" },
  { key: "diabetes", label: "Diabetes" },
  { key: "hypertension", label: "Hypertension" },
  { key: "sickle-cell", label: "Sickle Cell" },
  { key: "maternal-health", label: "Maternal Health" },
  { key: "mental-health", label: "Mental Health" },
  { key: "nutrition", label: "Nutrition" },
  { key: "infectious-disease", label: "Infectious Disease" },
];

const CATEGORY_GRADIENTS = {
  malaria: "from-red-500 to-rose-600",
  diabetes: "from-blue-500 to-indigo-600",
  hypertension: "from-purple-500 to-violet-600",
  "sickle-cell": "from-amber-500 to-orange-600",
  "maternal-health": "from-pink-500 to-rose-600",
  "mental-health": "from-teal-500 to-cyan-600",
  nutrition: "from-green-500 to-emerald-600",
  "infectious-disease": "from-orange-500 to-red-600",
};

export default function HealthHub() {
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [drugOfWeek, setDrugOfWeek] = useState(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`${API_URL}/api/articles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setTotal(data.total || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/featured`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.articles?.length) setFeatured(data.articles[0]);
      })
      .catch(() => {});

    fetch(`${API_URL}/api/articles/drug-of-week`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.article) setDrugOfWeek(data.article);
      })
      .catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10 border border-[#C9A84C]/15 text-[#C9A84C] text-sm font-body font-medium mb-4">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Health Education
          </div>
          <h1 className="text-3xl sm:text-4xl font-display gold-text tracking-tight">
            Health Hub
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-body">
            Evidence-based health education articles curated for Ghana. Stay informed about diseases,
            medications, and healthy living.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Featured Article Hero */}
      {featured && (
        <Link to={`/health-hub/${featured.slug}`} className="block group">
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[featured.category] || "from-[#C9A84C] to-[#A8893A]"} text-white p-8 sm:p-10 hover:shadow-xl transition-shadow`}>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-warm-50/20 text-xs font-body font-semibold uppercase tracking-wide mb-3">
                Featured Article
              </span>
              <h2 className="text-2xl sm:text-3xl font-display leading-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed line-clamp-2 font-body">
                {featured.summary}
              </p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-body font-semibold text-white/90 group-hover:text-white transition-colors">
                Read Article
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-warm-50/5" />
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-warm-50/5" />
          </div>
        </Link>
      )}

      {/* Drug of the Week Spotlight */}
      {drugOfWeek && (
        <Link to={`/health-hub/${drugOfWeek.slug}`} className="block group">
          <div className="relative overflow-hidden rounded-xl gold-glass p-6 hover:shadow-[0_0_30px_rgba(201,168,76,0.08)] transition-shadow">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center ring-1 ring-[#C9A84C]/20">
                <svg className="w-7 h-7 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="1.5" width="12" height="21" rx="2.25" />
                  <line x1="6" y1="12" x2="18" y2="12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[#C9A84C] mb-2">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Drug of the Week
                </div>
                <h3 className="text-lg font-display text-gray-900 dark:text-white group-hover:text-[#C9A84C] transition-colors">
                  {drugOfWeek.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-body">
                  {drugOfWeek.summary}
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-sm font-body font-semibold text-[#C9A84C]">
                  Learn More
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search health articles..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-warm-200/60 dark:border-white/10 bg-warm-50 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 text-sm font-body focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-shadow placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setCategory(cat.key); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${
              category === cat.key
                ? "bg-[#C9A84C] text-gray-900 shadow-sm shadow-[#C9A84C]/20"
                : "bg-warm-50/50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#C9A84C]/30 hover:text-[#C9A84C]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#C9A84C]/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 dark-glass rounded-xl">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-body font-medium">No articles found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 font-body">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg text-sm font-body font-medium bg-warm-50/50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#C9A84C]/30 hover:text-[#C9A84C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-body">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg text-sm font-body font-medium bg-warm-50/50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#C9A84C]/30 hover:text-[#C9A84C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
