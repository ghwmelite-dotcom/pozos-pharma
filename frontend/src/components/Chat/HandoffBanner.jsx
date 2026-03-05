/**
 * PozosPharma Handoff Banner Component
 *
 * Displays contextual banners for pharmacist handoff status.
 * Three visible states: REQUESTING, ACCEPTED, UNAVAILABLE. IDLE returns null.
 *
 * @param {object} props
 * @param {"IDLE"|"REQUESTING"|"ACCEPTED"|"UNAVAILABLE"} props.status
 * @param {{ name: string, rating: number, badge: string }} [props.pharmacist]
 * @param {number} [props.onlineCount=0]
 */
export default function HandoffBanner({
  status = "IDLE",
  pharmacist,
  onlineCount = 0,
}) {
  if (!status || status === "IDLE") return null;

  return (
    <div role="status" aria-live="polite">
      {status === "REQUESTING" && (
        <RequestingBanner onlineCount={onlineCount} />
      )}
      {status === "ACCEPTED" && <AcceptedBanner pharmacist={pharmacist} />}
      {status === "UNAVAILABLE" && <UnavailableBanner />}
    </div>
  );
}

/* ── REQUESTING State ──────────────────────────────────────────── */

function RequestingBanner({ onlineCount }) {
  return (
    <div className="relative overflow-hidden rounded-lg mx-2 my-2 px-4 py-3 bg-gradient-to-r from-amber-50 via-ghana-gold/10 to-amber-50 dark:from-amber-950/40 dark:via-yellow-900/20 dark:to-amber-950/40 border border-amber-300 dark:border-amber-700 animate-pulse-slow">
      {/* Ghana-themed loading bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 bg-kente-accent"
        aria-hidden="true"
      />

      <div className="flex items-center gap-3">
        {/* Spinning loader */}
        <div className="relative shrink-0" aria-hidden="true">
          <svg
            className="w-8 h-8 animate-spin text-ghana-gold"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {/* Adinkra symbol: Gye Nyame (supremacy of God) */}
          <span
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ghana-gold"
            title="Gye Nyame"
          >
            GN
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Connecting you to a verified pharmacist...
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            {onlineCount > 0
              ? `${onlineCount} pharmacist${onlineCount !== 1 ? "s" : ""} online right now`
              : "Searching for available pharmacists"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── ACCEPTED State ────────────────────────────────────────────── */

function AcceptedBanner({ pharmacist }) {
  return (
    <div className="relative overflow-hidden rounded-lg mx-2 my-2 px-4 py-3 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/40 dark:via-green-900/20 dark:to-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
      {/* Solid green top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 bg-brand-emerald"
        aria-hidden="true"
      />

      <div className="flex items-center gap-3">
        {/* Checkmark circle */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 shrink-0"
          aria-hidden="true"
        >
          <svg
            className="w-5 h-5 text-brand-emerald"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              {pharmacist?.name || "Pharmacist"}
            </span>

            {/* Verified badge inline */}
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
              <svg
                className="w-3 h-3"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a1 1 0 01.707.293l6 6a1 1 0 01.207.994l-2 7a1 1 0 01-.607.638l-4 1.5a1 1 0 01-.614 0l-4-1.5a1 1 0 01-.607-.638l-2-7a1 1 0 01.207-.994l6-6A1 1 0 0110 1z"
                  clipRule="evenodd"
                />
              </svg>
              {pharmacist?.badge || "Verified"}
            </span>

            {/* Star rating */}
            {pharmacist?.rating != null && (
              <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {pharmacist.rating.toFixed(1)}
              </span>
            )}
          </div>

          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
            {/* Adinkra: Mate Masie (wisdom) symbol reference */}
            <span className="font-bold" title="Mate Masie - What I hear, I keep" aria-hidden="true">
              MM
            </span>
            Now in your session
          </p>
        </div>

        {/* Ghana flag indicator */}
        <div
          className="flex flex-col gap-0.5 shrink-0"
          aria-label="Ghana"
          title="Ghana"
        >
          <div className="w-5 h-1 rounded-sm bg-ghana-red" />
          <div className="w-5 h-1 rounded-sm bg-ghana-gold" />
          <div className="w-5 h-1 rounded-sm bg-ghana-green" />
        </div>
      </div>
    </div>
  );
}

/* ── UNAVAILABLE State ─────────────────────────────────────────── */

function UnavailableBanner() {
  return (
    <div className="rounded-lg mx-2 my-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {/* Offline icon */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"
          aria-hidden="true"
        >
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            No pharmacists available right now
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            We will notify you when one becomes available.{" "}
            <a
              href="/schedule"
              className="underline hover:text-brand-indigo dark:hover:text-indigo-400 transition-colors"
            >
              View schedule
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
