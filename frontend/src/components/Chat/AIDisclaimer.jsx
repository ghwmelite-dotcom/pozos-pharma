import { useState, useEffect } from "react";

const STORAGE_KEY = "pozospharma-ai-disclaimer-dismissed";

/**
 * PozosPharma AI Disclaimer Bar
 *
 * Persistent top bar in chat view warning that AI responses are informational only.
 * Dismissible with localStorage memory. Includes Ghana FDA reference.
 *
 * @param {object} [props]
 * @param {string} [props.className]
 */
export default function AIDisclaimer({ className = "" }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    if (dismissed) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // localStorage unavailable
      }
    }
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`relative flex items-start gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-950/30 border-b border-teal-200 dark:border-teal-800 ${className}`}
      role="alert"
      aria-label="AI disclaimer"
    >
      {/* Info icon */}
      <svg
        className="w-4 h-4 text-brand-teal dark:text-teal-400 shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>

      <p className="flex-1 text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
        <strong className="font-semibold">PozosBot</strong> provides general
        information only. For personal medical decisions, consult a qualified
        pharmacist.{" "}
        <a
          href="https://fdaghana.gov.gh"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-brand-teal dark:hover:text-teal-200 transition-colors"
        >
          Ghana FDA
        </a>
      </p>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded text-teal-500 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal shrink-0"
        aria-label="Dismiss disclaimer"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
