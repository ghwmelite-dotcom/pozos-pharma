import { useState, useRef } from "react";
import { useTranslation } from "../i18n/useTranslation";

const MOCK_MEDICATIONS = [
  {
    id: 1,
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "TDS (Three times daily)",
    duration: "7 days",
    explanation:
      "Take 1 tablet of Amoxicillin 500mg three times daily for 7 days \u2014 this is an antibiotic to fight your infection.",
    warnings: [
      "Complete the full 7-day course even if you feel better",
      "Take with or after food to reduce stomach upset",
      "Avoid alcohol while taking this medication",
    ],
    category: "Antibiotic",
  },
  {
    id: 2,
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "BD (Twice daily)",
    duration: "5 days",
    explanation:
      "Take 1 tablet of Ibuprofen 400mg twice daily for 5 days \u2014 this reduces pain and inflammation.",
    warnings: [
      "Always take with food to protect your stomach",
      "Do not exceed the recommended dose",
      "Not suitable if you have stomach ulcers or kidney problems",
    ],
    category: "Pain / Inflammation",
  },
  {
    id: 3,
    name: "Omeprazole",
    dosage: "20mg",
    frequency: "OD (Once daily)",
    duration: "14 days",
    explanation:
      "Take 1 capsule of Omeprazole 20mg once daily in the morning for 14 days \u2014 this protects your stomach lining.",
    warnings: [
      "Take 30 minutes before breakfast on an empty stomach",
      "Swallow whole, do not crush or chew",
      "Long-term use should be reviewed by your doctor",
    ],
    category: "Stomach Protection",
  },
];

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

const MOCK_DOCTOR_NOTES =
  "Patient to return for review after completing antibiotic course. Avoid spicy and acidic foods during treatment. Rest advised for 3 days. Drink plenty of fluids.";

export default function PrescriptionScanner() {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setResults(null);
    setSaved(false);
    setShared(false);
    setDownloaded(false);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleScan = () => {
    if (!image) return;
    setScanning(true);
    setResults(null);
    setTimeout(() => {
      setScanning(false);
      setResults({
        medications: MOCK_MEDICATIONS,
        doctorNotes: MOCK_DOCTOR_NOTES,
      });
    }, 3000);
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setScanning(false);
    setResults(null);
    setSaved(false);
    setShared(false);
    setDownloaded(false);
  };

  const handleSaveToMedications = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleShareWithPharmacist = () => {
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  const handleDownloadSummary = () => {
    if (!results) return;
    const lines = [
      "PRESCRIPTION SUMMARY",
      "=" .repeat(40),
      "",
      "Medications Found:",
      "",
    ];
    results.medications.forEach((med, i) => {
      lines.push(`${i + 1}. ${med.name} ${med.dosage}`);
      lines.push(`   Frequency: ${med.frequency}`);
      lines.push(`   Duration: ${med.duration}`);
      lines.push(`   ${med.explanation}`);
      lines.push(`   Warnings: ${med.warnings.join("; ")}`);
      lines.push("");
    });
    lines.push("Doctor's Notes:");
    lines.push(results.doctorNotes);
    lines.push("");
    lines.push("---");
    lines.push(
      "AI-assisted reading \u2014 always confirm with your pharmacist."
    );

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prescription-summary.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

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
              <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              <path d="M9 3.5h6" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            Prescription Scanner
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-body">
            Snap a photo of your prescription &mdash; we'll read and explain it
            for you
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        {!imagePreview ? (
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-10 sm:p-16 text-center ${
              dragOver
                ? "border-[#C9A84C] bg-[#C9A84C]/10 scale-[1.01]"
                : "border-[#C9A84C]/30 hover:border-[#C9A84C]/60 bg-warm-50 dark:bg-gray-900/50"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#C9A84C]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-base font-body font-medium text-gray-800 dark:text-gray-200">
                  Drag &amp; drop or tap to upload
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 font-body">
                  JPG, PNG or HEIC &mdash; max 10MB
                </p>
              </div>

              {/* Camera button for mobile */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 ring-1 ring-[#C9A84C]/30 text-[#C9A84C] text-sm font-body font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Take Photo
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          /* Image Preview */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden dark-glass p-2">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Uploaded prescription"
                  className="w-full max-h-[500px] object-contain bg-gray-950 rounded-xl"
                />

                {/* Scanning Animation Overlay */}
                {scanning && (
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent shadow-[0_0_15px_3px_rgba(201,168,76,0.5)]"
                        style={{
                          animation: "scanLine 2s ease-in-out infinite",
                        }}
                      />
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-[#C9A84C] border-t-transparent animate-spin" />
                      <p className="text-sm font-body font-medium text-[#E8D48B] bg-black/60 px-4 py-2 rounded-lg">
                        Reading your prescription...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action bar below image */}
            {!scanning && !results && (
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleScan}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-white font-body font-semibold text-sm shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h4V2H2v6h2V4zM20 4h-4V2h6v6h-2V4zM4 20h4v2H2v-6h2v4zM20 20h-4v2h6v-6h-2v4z" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  Scan Prescription
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-warm-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-body text-sm hover:bg-warm-200 dark:hover:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scanning animation keyframes */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      {/* Results Panel */}
      {results && (
        <div className="space-y-6 animate-stagger">
          {/* Medications Found */}
          <div className="rounded-2xl dark-glass p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-display gold-text">
                  Medications Found
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-body">
                  {results.medications.length} medications detected from your
                  prescription
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {results.medications.map((med) => (
                <div
                  key={med.id}
                  className="rounded-xl bg-warm-50 dark:bg-gray-900/60 border border-warm-200 dark:border-gray-800 p-5 space-y-3"
                >
                  {/* Drug Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-display font-semibold text-gray-900 dark:text-gray-100">
                        {med.name}{" "}
                        <span className="text-[#C9A84C]">{med.dosage}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-body px-2.5 py-1 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] ring-1 ring-[#C9A84C]/20">
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {med.frequency}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-body px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12z" />
                            <path
                              fillRule="evenodd"
                              d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {med.duration}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-body px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
                      {med.category}
                    </span>
                  </div>

                  {/* Plain Language Explanation */}
                  <div className="rounded-lg bg-[#C9A84C]/5 border border-[#C9A84C]/15 p-3.5">
                    <div className="flex gap-2">
                      <svg
                        className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-body leading-relaxed">
                        {med.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Warnings */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-body font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Warnings &amp; Notes
                    </p>
                    <ul className="space-y-1">
                      {med.warnings.map((warning, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 font-body"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor's Notes */}
          <div className="rounded-2xl dark-glass p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
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
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-lg font-display gold-text">
                Doctor's Notes
              </h2>
            </div>
            <div className="rounded-xl bg-warm-50 dark:bg-gray-900/60 border border-warm-200 dark:border-gray-800 p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-body leading-relaxed italic">
                "{results.doctorNotes}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleSaveToMedications}
              disabled={saved}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-white font-body font-semibold text-sm shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saved ? (
                <>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Save to My Medications
                </>
              )}
            </button>

            <button
              onClick={() => {
                /* Navigate to interaction checker with drugs pre-loaded */
              }}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-warm-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-body font-semibold text-sm ring-1 ring-warm-200 dark:ring-gray-700 hover:bg-warm-200 dark:hover:bg-gray-700 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg
                className="w-5 h-5 text-[#C9A84C]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              Check Interactions
            </button>

            <button
              onClick={handleShareWithPharmacist}
              disabled={shared}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-warm-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-body font-semibold text-sm ring-1 ring-warm-200 dark:ring-gray-700 hover:bg-warm-200 dark:hover:bg-gray-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {shared ? (
                <>
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sent to Chat!
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-[#C9A84C]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0 12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  Share with Pharmacist
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSummary}
              disabled={downloaded}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-warm-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-body font-semibold text-sm ring-1 ring-warm-200 dark:ring-gray-700 hover:bg-warm-200 dark:hover:bg-gray-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloaded ? (
                <>
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Downloaded!
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-[#C9A84C]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Summary
                </>
              )}
            </button>
          </div>

          {/* Scan another */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-sm font-body text-[#C9A84C] hover:text-[#E8D48B] transition-colors underline underline-offset-4"
            >
              Scan another prescription
            </button>
          </div>
        </div>
      )}

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
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-amber-700 dark:text-amber-400 font-body">
          AI-assisted reading &mdash; always confirm with your pharmacist.
          This tool provides general information and should not replace
          professional medical advice.
        </p>
      </div>
    </div>
  );
}
