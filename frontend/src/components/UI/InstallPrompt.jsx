import { useState, useEffect } from "react";

/**
 * PWA Install Prompt
 *
 * Dismissable banner shown when the app can be installed (beforeinstallprompt).
 * Ghana flag accent colors, brand-indigo Install button.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="rounded-xl border border-warm-200/60 dark:border-gray-700 bg-warm-50 dark:bg-surface-card-dark shadow-lg overflow-hidden">
          {/* Ghana flag stripe accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#006B3F]" />

          <div className="p-4 flex items-center gap-3">
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-indigo/10 dark:bg-indigo-900/30 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-brand-indigo dark:text-indigo-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Install PozosPharma
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get offline drug lookups and faster access
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1.5 rounded-lg transition-colors"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="text-xs font-semibold text-white bg-brand-indigo hover:bg-indigo-600 active:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
