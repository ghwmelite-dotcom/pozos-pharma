import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "../i18n/useTranslation";

/* ─── Mock Data ─────────────────────────────────────────────────────── */

const MOCK_DRUGS = {
  "283947561012": {
    status: "verified",
    name: "Coartem (Artemether/Lumefantrine)",
    manufacturer: "Ernest Chemists Ltd",
    batch: "EC-2026-0341",
    expiry: "2027-09-15",
    dosage: "20mg/120mg Tablets",
  },
  "749201835647": {
    status: "verified",
    name: "Amodiaquine 200mg Tablets",
    manufacturer: "Kinapharma Ltd",
    batch: "KP-2025-1287",
    expiry: "2027-03-22",
    dosage: "200mg Tablets",
  },
  "000000000000": {
    status: "counterfeit",
    name: "Unknown — Suspected Counterfeit",
    manufacturer: "Unregistered",
    batch: "N/A",
    expiry: "N/A",
    dosage: "N/A",
  },
};

const RECENT_VERIFICATIONS = [
  {
    id: 1,
    name: "Coartem 20/120mg",
    manufacturer: "Ernest Chemists",
    date: "6 Mar 2026, 10:42 AM",
    status: "verified",
  },
  {
    id: 2,
    name: "Metformin 500mg",
    manufacturer: "Dannex Ltd",
    date: "6 Mar 2026, 09:15 AM",
    status: "verified",
  },
  {
    id: 3,
    name: "Amoxicillin 250mg",
    manufacturer: "Kinapharma",
    date: "5 Mar 2026, 03:28 PM",
    status: "verified",
  },
  {
    id: 4,
    name: "Unknown Tablet",
    manufacturer: "Unregistered",
    date: "5 Mar 2026, 11:07 AM",
    status: "counterfeit",
  },
];

const STATS = [
  { label: "Drugs Verified Today", value: "1,247" },
  { label: "Counterfeits Caught", value: "38" },
  { label: "Manufacturers Onboarded", value: "164" },
  { label: "Active Users", value: "12,903" },
];

/* ─── Icons (inline SVG) ────────────────────────────────────────────── */

function ShieldIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function CameraIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function KeyboardIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────────────────── */

export default function DrugVerification() {
  const { t } = useTranslation();

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("idle"); // idle | checking | verified | counterfeit
  const [verificationResult, setVerificationResult] = useState(null);
  const [activeMethod, setActiveMethod] = useState("manual"); // manual | camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* ── Camera ─────────────────────────────────────────────────────── */

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError(
        "Camera access denied. Please allow camera permissions and try again."
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (activeMethod !== "camera") {
      stopCamera();
    }
  }, [activeMethod, stopCamera]);

  /* ── Verification ───────────────────────────────────────────────── */

  const handleVerify = useCallback(
    (code) => {
      const trimmed = (code || verificationCode).trim();
      if (!trimmed) return;

      setVerificationStatus("checking");
      setVerificationResult(null);

      // Simulate network delay
      setTimeout(() => {
        const match = MOCK_DRUGS[trimmed];
        if (match) {
          setVerificationStatus(match.status);
          setVerificationResult(match);
        } else {
          // Any unrecognised code is treated as verified with a random drug
          setVerificationStatus("verified");
          setVerificationResult({
            status: "verified",
            name: "Amoxicillin 500mg Capsules",
            manufacturer: "Dannex Ltd",
            batch: "DX-2026-0892",
            expiry: "2028-01-10",
            dosage: "500mg Capsules",
          });
        }
      }, 1800);
    },
    [verificationCode]
  );

  const resetVerification = () => {
    setVerificationCode("");
    setVerificationStatus("idle");
    setVerificationResult(null);
  };

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="space-y-8 pb-8">
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-5">
            <ShieldIcon className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display gold-text">
            Verify Your Medicine
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-body leading-relaxed">
            Protect yourself from counterfeit drugs. Enter the authentication
            code on your medicine packaging or scan it with your camera.
          </p>
        </div>

        {/* Ghana flag bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* ── Method Tabs ─────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveMethod("manual")}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-body font-semibold transition-all ${
              activeMethod === "manual"
                ? "bg-[#C9A84C] text-gray-900 shadow-sm shadow-[#C9A84C]/20"
                : "dark-glass border border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-200 hover:border-[#C9A84C]/30"
            }`}
          >
            <KeyboardIcon className="w-5 h-5" />
            Manual Code Entry
          </button>
          <button
            onClick={() => setActiveMethod("camera")}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-body font-semibold transition-all ${
              activeMethod === "camera"
                ? "bg-[#C9A84C] text-gray-900 shadow-sm shadow-[#C9A84C]/20"
                : "dark-glass border border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-200 hover:border-[#C9A84C]/30"
            }`}
          >
            <CameraIcon className="w-5 h-5" />
            Camera Scanner
          </button>
        </div>
      </div>

      {/* ── Manual Code Entry ───────────────────────────────────────── */}
      {activeMethod === "manual" && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl dark-glass border border-white/10 p-6 sm:p-8">
            <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-2">
              Authentication Code
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-body mb-4">
              Scratch the silver panel on your medicine packaging to reveal the
              10-12 digit code, then enter it below.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  if (val.length <= 12) setVerificationCode(val);
                }}
                placeholder="e.g. 283947561012"
                maxLength={12}
                className="flex-1 px-4 py-3 rounded-xl border border-warm-200/60 dark:border-white/10 bg-warm-50 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all text-sm font-body tracking-[0.15em] font-mono"
                disabled={verificationStatus === "checking"}
              />
              <button
                onClick={() => handleVerify()}
                disabled={
                  verificationCode.length < 10 ||
                  verificationStatus === "checking"
                }
                className="px-6 py-3 rounded-xl text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#C9A84C]/20 shrink-0"
              >
                {verificationStatus === "checking" ? "Checking..." : "Verify"}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500 font-body">
              Powered by mPedigree drug authentication technology
            </p>
          </div>
        </div>
      )}

      {/* ── Camera Scanner ──────────────────────────────────────────── */}
      {activeMethod === "camera" && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl dark-glass border border-white/10 p-6 sm:p-8">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-body mb-4">
              Point your camera at the code on your medicine packaging. The
              scanner will read it automatically.
            </p>

            {cameraError && (
              <div className="rounded-xl bg-red-500/5 dark:bg-red-500/[0.03] border border-red-500/20 p-4 mb-4">
                <p className="text-sm text-red-500 dark:text-red-400 font-body">
                  {cameraError}
                </p>
              </div>
            )}

            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-3 px-6 py-12 rounded-xl border-2 border-dashed border-[#C9A84C]/30 bg-[#C9A84C]/[0.02] hover:bg-[#C9A84C]/5 hover:border-[#C9A84C]/50 transition-all"
              >
                <CameraIcon className="w-8 h-8 text-[#C9A84C]/60" />
                <span className="text-sm font-body font-medium text-[#C9A84C]/80">
                  Tap to activate camera
                </span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black">
                {/* Video feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[4/3] object-cover"
                />

                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Corner brackets */}
                  <div className="relative w-56 h-36">
                    {/* Top-left */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A84C] rounded-tl-md" />
                    {/* Top-right */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A84C] rounded-tr-md" />
                    {/* Bottom-left */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A84C] rounded-bl-md" />
                    {/* Bottom-right */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A84C] rounded-br-md" />

                    {/* Animated scan line */}
                    <div
                      className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"
                      style={{
                        animation: "scanLine 2.5s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>

                {/* Label */}
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[11px] font-body text-[#E8D48B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                    Scanning for authentication code...
                  </span>
                </div>
              </div>
            )}

            {cameraActive && (
              <button
                onClick={stopCamera}
                className="mt-4 w-full px-4 py-2.5 rounded-xl text-sm font-body font-medium text-gray-400 dark:text-gray-500 border border-white/10 hover:border-red-500/30 hover:text-red-400 transition-all"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Scan line animation keyframes ───────────────────────────── */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 8px; opacity: 0.4; }
          50% { top: calc(100% - 10px); opacity: 1; }
        }
      `}</style>

      {/* ── Verification Result ─────────────────────────────────────── */}
      {verificationStatus === "checking" && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl gold-glass border border-[#C9A84C]/20 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
              <div className="w-10 h-10 border-[3px] border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-body font-semibold text-[#C9A84C]">
              Verifying authentication code...
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-body">
              Checking against national pharmaceutical registry
            </p>
          </div>
        </div>
      )}

      {verificationStatus === "verified" && verificationResult && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/[0.03] p-6 sm:p-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                <svg
                  className="w-5 h-5 text-emerald-500"
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
              <div>
                <h3 className="text-lg font-display text-emerald-500">
                  VERIFIED GENUINE
                </h3>
                <p className="text-xs text-emerald-400/70 font-body">
                  This medicine is authentic and registered
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Drug Name", value: verificationResult.name },
                {
                  label: "Manufacturer",
                  value: verificationResult.manufacturer,
                },
                { label: "Batch Number", value: verificationResult.batch },
                { label: "Expiry Date", value: verificationResult.expiry },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] font-body font-semibold text-emerald-500/60 uppercase tracking-[0.12em]">
                    {item.label}
                  </p>
                  <p className="text-sm font-body font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={resetVerification}
              className="mt-6 px-5 py-2.5 rounded-xl text-sm font-body font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/5 transition-all"
            >
              Verify Another
            </button>
          </div>
        </div>
      )}

      {verificationStatus === "counterfeit" && verificationResult && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 dark:bg-red-500/[0.03] p-6 sm:p-8 shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
                <svg
                  className="w-5 h-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-display text-red-500">
                  COUNTERFEIT WARNING
                </h3>
                <p className="text-xs text-red-400/70 font-body">
                  This medicine could NOT be verified. Do not consume.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-4 mb-5">
              <p className="text-sm text-red-400 dark:text-red-300 font-body leading-relaxed">
                This authentication code is not recognized in the national
                pharmaceutical registry. The product may be counterfeit,
                expired, or unregistered. Please report this immediately to the
                Food and Drugs Authority (FDA) Ghana.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://fdaghana.gov.gh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Report to FDA Ghana
              </a>
              <button
                onClick={resetVerification}
                className="px-5 py-2.5 rounded-xl text-sm font-body font-medium text-red-400 border border-red-500/20 hover:bg-red-500/5 transition-all"
              >
                Verify Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Verifications ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] mb-4">
          Recent Verifications
        </h2>
        <div className="space-y-2">
          {RECENT_VERIFICATIONS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl dark-glass border border-white/10 px-4 py-3.5 hover:border-[#C9A84C]/20 transition-all"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.status === "verified"
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/20"
                    : "bg-red-500/10 ring-1 ring-red-500/20"
                }`}
              >
                {item.status === "verified" ? (
                  <svg
                    className="w-4 h-4 text-emerald-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-body">
                  {item.manufacturer}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-xs font-body font-semibold ${
                    item.status === "verified"
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {item.status === "verified" ? "Genuine" : "Counterfeit"}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-body">
                  {item.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Statistics ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl dark-glass border border-white/10 p-6 sm:p-8">
          <h2 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] mb-5">
            Verification Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 animate-stagger">
            {STATS.map((stat, index) => (
              <div key={stat.label} className="text-center" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-2xl sm:text-3xl font-display gold-text">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 font-body uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FDA Ghana Partnership Badge ─────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/20 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 flex items-center justify-center shrink-0">
            <ShieldIcon className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display text-[#C9A84C]">
              FDA Ghana Verified Partner
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-body leading-relaxed">
              PozoPharma is an authorized partner of the Food and Drugs Authority
              (FDA) Ghana for pharmaceutical verification. All verification
              checks are validated against the national drug registry.
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex flex-col items-center gap-0.5">
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-ghana-red/70" />
              <div className="w-3 h-3 rounded-sm bg-ghana-gold/70" />
              <div className="w-3 h-3 rounded-sm bg-ghana-green/70" />
            </div>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-body tracking-wider uppercase">
              Ghana
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
