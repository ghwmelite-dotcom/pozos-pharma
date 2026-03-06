import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CATEGORY_COLORS, CATEGORY_LABELS, formatViews, estimateReadTime } from "../components/Education/ArticleCard";

const API_URL = import.meta.env.VITE_API_URL || "";

function renderMarkdown(content) {
  if (!content) return "";

  let html = content
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-3">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 pl-2 text-gray-700 dark:text-gray-300">$1</li>')
    // Paragraphs (blank lines)
    .replace(/\n\n/g, '</p><p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">')
    // Single newlines within paragraphs
    .replace(/\n/g, "<br />");

  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /(<li[^>]*>.*?<\/li>(?:\s*<br \/>\s*<li[^>]*>.*?<\/li>)*)/gs,
    (match) => {
      const cleaned = match.replace(/<br \/>/g, "");
      return `<ul class="list-disc space-y-1 my-3">${cleaned}</ul>`;
    }
  );

  return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">${html}</p>`;
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/articles/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      })
      .then((data) => {
        setArticle(data.article);
        setRelated(data.related || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error || "Article not found"}
        </p>
        <button
          onClick={() => navigate("/health-hub")}
          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
        >
          Back to Health Hub
        </button>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.nutrition;
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate("/health-hub")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back to Health Hub
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${colors.badge}`}>
              {categoryLabel}
            </span>
            {article.drug_of_week === 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ghana-gold/10 text-ghana-gold text-xs font-bold border border-ghana-gold/30">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Drug of the Week
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
            {article.title}
          </h1>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500 mb-6 pb-6 border-b border-warm-200/60 dark:border-gray-800">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {formatViews(article.views)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {estimateReadTime(article.content)}
            </span>
          </div>

          {/* Article content */}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />

          {/* Tags */}
          {article.tags && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-warm-200/60 dark:border-gray-800">
              {article.tags.split(",").map((tag) => (
                <span
                  key={tag.trim()}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Medical Disclaimer</p>
                <p className="mt-1 text-xs leading-relaxed">
                  This article is for educational purposes only and does not replace professional medical advice.
                  Always consult a qualified healthcare provider or pharmacist before making decisions about your health
                  or medications. If you have a medical emergency, contact the Ghana National Ambulance Service (112/193)
                  or visit your nearest health facility immediately.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar - Related Articles */}
        {related.length > 0 && (
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
                Related Articles
              </h3>
              <div className="space-y-3">
                {related.map((rel) => {
                  const relColors = CATEGORY_COLORS[rel.category] || CATEGORY_COLORS.nutrition;
                  return (
                    <Link
                      key={rel.id}
                      to={`/health-hub/${rel.slug}`}
                      className={`block p-4 rounded-lg bg-warm-50 dark:bg-gray-900 border border-warm-200/60 dark:border-gray-700 border-l-4 ${relColors.border.replace("border-t-", "border-l-")} hover:shadow-md transition-shadow`}
                    >
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                        {rel.title}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {rel.summary}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">
                        {formatViews(rel.views)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
