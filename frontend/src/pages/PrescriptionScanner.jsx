import PrescriptionUpload from "../components/Drugs/PrescriptionUpload";

// Common Latin/medical abbreviations found on prescriptions (educational reference).
const ABBREVIATIONS = [
  { abbr: "OD", meaning: "Once daily" },
  { abbr: "BD", meaning: "Twice daily" },
  { abbr: "TDS", meaning: "Three times daily" },
  { abbr: "QDS", meaning: "Four times daily" },
  { abbr: "PRN", meaning: "As needed" },
  { abbr: "PO", meaning: "By mouth" },
  { abbr: "STAT", meaning: "Immediately" },
  { abbr: "AC", meaning: "Before meals" },
  { abbr: "PC", meaning: "After meals" },
  { abbr: "HS", meaning: "At bedtime" },
  { abbr: "IM", meaning: "Intramuscular injection" },
  { abbr: "IV", meaning: "Intravenous" },
  { abbr: "SL", meaning: "Under the tongue" },
  { abbr: "TOP", meaning: "Applied to skin" },
  { abbr: "Caps", meaning: "Capsule" },
  { abbr: "Tab", meaning: "Tablet" },
];

/**
 * Prescription Scanner page.
 *
 * Uses the real AI vision endpoint (/api/vision/read-prescription) via the
 * PrescriptionUpload component — it reads the uploaded image, extracts the
 * medication text, and cross-references the drug database. No mock data.
 */
export default function PrescriptionScanner() {
  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            <svg
              className="w-7 h-7 text-[#C9A84C]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            Prescription Scanner
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-body">
            Upload a photo of your prescription &mdash; our AI reads the
            medications and matches them to the drug database.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Real prescription reader (AI vision -> drug database) */}
      <div className="rounded-2xl dark-glass p-6 sm:p-8">
        <PrescriptionUpload />
      </div>

      {/* Prescription Abbreviation Guide */}
      <div className="rounded-2xl dark-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#C9A84C]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-display gold-text">
              Prescription Abbreviation Guide
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 font-body">
              Common medical abbreviations found on prescriptions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {ABBREVIATIONS.map((item) => (
            <div
              key={item.abbr}
              className="flex items-center gap-2.5 rounded-lg bg-warm-50 dark:bg-gray-900/60 border border-warm-200 dark:border-gray-800 px-3 py-2.5"
            >
              <span className="text-sm font-display font-bold text-[#C9A84C] min-w-[3rem]">
                {item.abbr}
              </span>
              <span className="text-xs font-body text-gray-600 dark:text-gray-400">
                {item.meaning}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20 p-4 flex gap-3">
        <svg
          className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-amber-700 dark:text-amber-400 font-body">
          AI-assisted reading &mdash; always confirm with your pharmacist. This
          tool provides general information and should not replace professional
          medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  );
}
