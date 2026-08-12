import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "";
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_KEY || "";

/* ── Session Tiers ─────────────────────────────────────────────── */
const TIERS = [
  {
    id: "quick",
    name: "Quick Consult",
    price: 20,
    duration: "15 min",
    mode: "Audio",
    gradient: "from-blue-600/80 to-blue-800/80",
    ring: "ring-blue-400",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
    features: [
      "Audio-only consultation",
      "Quick symptom assessment",
      "OTC medication guidance",
      "Session notes summary",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 40,
    duration: "30 min",
    mode: "Video + Tools",
    gradient: "from-emerald-600/80 to-emerald-800/80",
    ring: "ring-emerald-400",
    popular: true,
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    features: [
      "HD Video consultation",
      "Drug interaction checker",
      "Prescription review",
      "Follow-up notes & summary",
      "Dosage calculator access",
    ],
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    price: 70,
    duration: "45 min",
    mode: "Full Workup",
    gradient: "from-[#A8893A]/80 to-[#C9A84C]/80",
    ring: "ring-[#C9A84C]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    features: [
      "Extended video consultation",
      "Full medication review",
      "All clinical tools included",
      "AI-powered session summary",
      "Priority rebooking",
      "Written care plan",
    ],
  },
];

const STATUS_BADGE = {
  pending: "bg-yellow-500/15 text-yellow-300",
  paid: "bg-blue-500/15 text-blue-300",
  waiting: "bg-cyan-500/15 text-cyan-300",
  active: "bg-green-500/15 text-green-300",
  completed: "bg-gray-500/15 text-gray-400",
  cancelled: "bg-red-500/15 text-red-400",
  no_show: "bg-red-500/15 text-red-400",
};

/* ── Star Rating ───────────────────────────────────────────────── */
function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg key={i} className={`w-3.5 h-3.5 ${filled ? "text-[#C9A84C]" : "text-gray-700"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

/* ── Animated Spinner ──────────────────────────────────────────── */
function MatchingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#E8D48B] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <p className="text-[#E8D48B] font-display text-lg animate-pulse">Finding your pharmacist...</p>
      <p className="text-gray-400 text-sm font-body">This usually takes less than a minute</p>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function Clinic() {
  const { user, token, isAuthenticated } = useAuth();

  // Core state
  const [selectedTier, setSelectedTier] = useState(null);
  const [showPreConsult, setShowPreConsult] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState("idle"); // idle | searching | matched | timeout
  const [activeConsultation, setActiveConsultation] = useState(null);

  // Pre-consult form
  const [reason, setReason] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");

  // Browse & Book
  const [pharmacists, setPharmacists] = useState([]);
  const [pharmaLoading, setPharmaLoading] = useState(true);
  const [bookingTarget, setBookingTarget] = useState(null); // pharmacist object
  const [bookingTier, setBookingTier] = useState("standard");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  // History
  const [consultations, setConsultations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Errors
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const pollRef = useRef(null);
  const paystackLoaded = useRef(false);

  /* ── Load Paystack Script ──────────────────────────────── */
  useEffect(() => {
    if (paystackLoaded.current) return;
    if (document.querySelector('script[src*="paystack"]')) {
      paystackLoaded.current = true;
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => { paystackLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  /* ── Fetch pharmacists & history ───────────────────────── */
  useEffect(() => {
    fetchPharmacists();
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

  const fetchPharmacists = async () => {
    setPharmaLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/pharmacist/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setPharmacists(data.leaderboard || data || []);
      }
    } catch {
      /* silently fail — section will show empty */
    } finally {
      setPharmaLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clinic/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.sessions || data || []);
      }
    } catch {
      /* silent */
    } finally {
      setHistoryLoading(false);
    }
  };

  /* ── Polling for match ─────────────────────────────────── */
  const pollForMatch = useCallback(
    (sessionId) => {
      let attempts = 0;
      const maxAttempts = 20; // ~60 seconds
      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`${API_URL}/api/clinic/session/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const session = data.session || data;
            if (session.status === "waiting" || session.status === "active") {
              clearInterval(pollRef.current);
              setMatchingStatus("matched");
              setActiveConsultation(session);
              fetchHistory();
            }
          }
        } catch {
          /* retry */
        }
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          setMatchingStatus("timeout");
        }
      }, 3000);
    },
    [token]
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ── Payment ───────────────────────────────────────────── */
  const handleConsultNow = () => {
    if (!isAuthenticated) {
      setError("Please log in to start a consultation.");
      return;
    }
    if (!selectedTier) {
      setError("Please select a consultation tier.");
      return;
    }
    setError("");
    setShowPreConsult(true);
  };

  const handleProceedToPayment = async () => {
    if (!reason.trim()) {
      setFormError("Please describe your reason for visit.");
      return;
    }
    setFormError("");
    setPaymentLoading(true);

    try {
      const tier = TIERS.find((t) => t.id === selectedTier);

      // Step 1: Create consultation
      const createRes = await fetch(`${API_URL}/api/clinic/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: selectedTier,
          reason: reason.trim(),
          currentMeds: medications.trim(),
          allergies: allergies.trim(),
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create consultation.");
      }

      const createData = await createRes.json();
      const consultationId = createData.consultationId;

      // Step 2: Admin bypass — skip payment
      if (user.role === "admin") {
        const payRes = await fetch(`${API_URL}/api/clinic/pay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ consultationId }),
        });
        if (!payRes.ok) {
          const errData = await payRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to bypass payment.");
        }
        setShowPreConsult(false);
        setMatchingStatus("searching");
        pollForMatch(consultationId);
        return;
      }

      // Step 2 (regular users): Paystack checkout
      if (!window.PaystackPop) {
        throw new Error("Payment system not loaded. Please refresh and try again.");
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: user.email || `${user.username}@pozospharma.com`,
        amount: tier.price * 100, // pesewas
        currency: "GHS",
        ref: String(consultationId),
        callback: () => {
          setShowPreConsult(false);
          setMatchingStatus("searching");
          pollForMatch(consultationId);
        },
        onClose: () => {
          setPaymentLoading(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ── Booking ───────────────────────────────────────────── */
  const handleBookConsultation = async () => {
    if (!isAuthenticated) {
      setError("Please log in to book a consultation.");
      return;
    }
    if (!reason.trim()) {
      setFormError("Please describe your reason for visit.");
      return;
    }
    if (!bookingDate || !bookingTime) {
      setFormError("Please select a date and time.");
      return;
    }
    setFormError("");
    setPaymentLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/clinic/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pharmacistId: bookingTarget.id || bookingTarget._id,
          tier: bookingTier,
          date: bookingDate,
          time: bookingTime,
          reason: reason.trim(),
          medications: medications.trim(),
          allergies: allergies.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to book consultation.");
      }

      setBookingTarget(null);
      resetForm();
      fetchHistory();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const resetForm = () => {
    setReason("");
    setMedications("");
    setAllergies("");
    setBookingDate("");
    setBookingTime("");
    setFormError("");
  };

  /* ── Generate min date (today) ─────────────────────────── */
  const today = new Date().toISOString().split("T")[0];

  /* ═════════════════════════════ RENDER ═════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-950 font-body text-white">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Kente-weave background pattern */}
        <div className="absolute inset-0 kente-weave opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-transparent to-gray-950" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#E8D48B] text-sm font-body mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Pharmacists Online Now
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl gold-text mb-4 leading-tight">
            Virtual Pharma Clinic
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto font-body leading-relaxed">
            Private consultations with verified Ghanaian pharmacists — video, audio, or chat
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-16">
        {/* ── Session Tiers ─────────────────────────────────── */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl gold-text text-center mb-8">Choose Your Session</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    setSelectedTier(tier.id);
                    setError("");
                  }}
                  className={`relative text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer
                    bg-gradient-to-br ${tier.gradient} backdrop-blur
                    ${isSelected ? `ring-2 ${tier.ring} border-transparent scale-[1.02] shadow-lg` : "border-white/10 hover:border-white/20 hover:scale-[1.01]"}
                  `}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#C9A84C] text-gray-900 text-xs font-bold rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-white/90">{tier.icon}</div>
                    <div>
                      <h3 className="font-display text-xl text-white">{tier.name}</h3>
                      <p className="text-white/60 text-sm font-body">{tier.mode}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-white">GHS {tier.price}</span>
                    <span className="text-white/50 text-sm">/ session</span>
                  </div>
                  <p className="text-white/60 text-sm mb-4">{tier.duration}</p>

                  <ul className="space-y-2">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <svg className="w-4 h-4 mt-0.5 text-white/60 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Consult Now Button */}
          <div className="mt-8 text-center">
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button
              onClick={handleConsultNow}
              disabled={!selectedTier}
              className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300
                ${selectedTier
                  ? "bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 hover:scale-105"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
            >
              Consult Now
            </button>
          </div>
        </section>

        {/* ── Pre-Consultation Modal ────────────────────────── */}
        {showPreConsult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPreConsult(false)}>
            <div
              className="bg-gray-900/95 border border-gray-700/50 rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl gold-text">Pre-Consultation</h3>
                <button onClick={() => setShowPreConsult(false)} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Selected tier summary */}
              {selectedTier && (
                <div className="mb-6 p-3 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20">
                  <p className="text-sm text-[#E8D48B]">
                    {TIERS.find((t) => t.id === selectedTier)?.name} — GHS {TIERS.find((t) => t.id === selectedTier)?.price} ({TIERS.find((t) => t.id === selectedTier)?.duration})
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                    Reason for Visit <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your symptoms or what you need help with..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Current Medications</label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="List any medications you are currently taking..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Known Allergies</label>
                  <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="List any known drug or food allergies..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>
              </div>

              {formError && <p className="text-red-400 text-sm mt-3">{formError}</p>}

              <button
                onClick={handleProceedToPayment}
                disabled={paymentLoading}
                className="mt-6 w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? "Processing..." : user?.role === "admin" ? "Start Consultation (Admin)" : "Proceed to Payment"}
              </button>
            </div>
          </div>
        )}

        {/* ── Matching Status ───────────────────────────────── */}
        {matchingStatus !== "idle" && (
          <section className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 sm:p-8">
            {matchingStatus === "searching" && <MatchingSpinner />}

            {matchingStatus === "matched" && activeConsultation && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl text-green-300">Pharmacist Found!</h3>
                {activeConsultation.pharmacist_name && (
                  <p className="text-gray-300">
                    You have been matched with <span className="text-white font-semibold">{activeConsultation.pharmacist_name}</span>
                  </p>
                )}
                <Link
                  to={`/clinic/session/${activeConsultation.id || activeConsultation._id}`}
                  className="inline-block px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
                >
                  Join Session
                </Link>
              </div>
            )}

            {matchingStatus === "timeout" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-yellow-300">No Pharmacists Available Right Now</h3>
                <p className="text-gray-400">Would you like to book a specific pharmacist instead?</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setMatchingStatus("idle")}
                    className="px-6 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Dismiss
                  </button>
                  <a
                    href="#browse-book"
                    onClick={() => setMatchingStatus("idle")}
                    className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900"
                  >
                    Browse Pharmacists
                  </a>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Browse & Book ─────────────────────────────────── */}
        <section id="browse-book">
          <h2 className="font-display text-2xl sm:text-3xl gold-text text-center mb-2">Book a Specific Pharmacist</h2>
          <p className="text-gray-400 text-center mb-8 font-body">Choose from our verified pharmacist network</p>

          {pharmaLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-700/50 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-8 bg-gray-700/30 rounded-lg" />
                </div>
              ))}
            </div>
          ) : pharmacists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pharmacists available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pharmacists.map((pharm, idx) => (
                <div
                  key={pharm.id || pharm._id || idx}
                  className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 hover:border-[#C9A84C]/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A84C]/20 to-[#A8893A]/20 border border-[#C9A84C]/20 flex items-center justify-center">
                        <span className="text-[#E8D48B] font-bold text-lg">
                          {(pharm.name || pharm.username || "P").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {pharm.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-gray-900 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{pharm.name || pharm.username}</h4>
                      <p className="text-sm text-gray-400 truncate">{pharm.specialization || "General Pharmacy"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={pharm.rating || 0} />
                    <span className="text-xs text-gray-500">({(pharm.rating || 0).toFixed(1)})</span>
                  </div>

                  {pharm.composite_score != null && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-gray-500">Score</span>
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] rounded-full"
                          style={{ width: `${Math.min(100, (pharm.composite_score || 0))}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#E8D48B] font-semibold">{(pharm.composite_score || 0).toFixed(0)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${pharm.online ? "bg-green-500/15 text-green-300" : "bg-gray-500/15 text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pharm.online ? "bg-green-400" : "bg-gray-500"}`} />
                      {pharm.online ? "Online" : "Offline"}
                    </span>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          setError("Please log in to book a consultation.");
                          return;
                        }
                        setBookingTarget(pharm);
                        resetForm();
                      }}
                      className="px-4 py-1.5 text-sm rounded-lg font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-md hover:shadow-[#C9A84C]/20 transition-all duration-300"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Booking Modal ─────────────────────────────────── */}
        {bookingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setBookingTarget(null)}>
            <div
              className="bg-gray-900/95 border border-gray-700/50 rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl gold-text">Book Consultation</h3>
                <button onClick={() => setBookingTarget(null)} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Pharmacist info */}
              <div className="mb-6 p-3 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C]/30 to-[#A8893A]/30 flex items-center justify-center">
                  <span className="text-[#E8D48B] font-bold">
                    {(bookingTarget.name || bookingTarget.username || "P").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{bookingTarget.name || bookingTarget.username}</p>
                  <p className="text-sm text-[#E8D48B]">{bookingTarget.specialization || "General Pharmacy"}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Tier selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Session Tier</label>
                  <select
                    value={bookingTier}
                    onChange={(e) => setBookingTier(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors appearance-none"
                  >
                    {TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — GHS {t.price} ({t.duration})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={today}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                      Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                    Reason for Visit <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your symptoms or what you need help with..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>

                {/* Medications */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Current Medications</label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="List any current medications..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Known Allergies</label>
                  <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="List any known allergies..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>
              </div>

              {formError && <p className="text-red-400 text-sm mt-3">{formError}</p>}

              <button
                onClick={handleBookConsultation}
                disabled={paymentLoading}
                className="mt-6 w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? "Booking..." : "Book Consultation"}
              </button>
            </div>
          </div>
        )}

        {/* ── My Consultations ──────────────────────────────── */}
        {isAuthenticated && (
          <section>
            <h2 className="font-display text-2xl sm:text-3xl gold-text text-center mb-2">My Consultations</h2>
            <p className="text-gray-400 text-center mb-8 font-body">Your consultation history and upcoming sessions</p>

            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-700 rounded w-24" />
                      <div className="h-4 bg-gray-700/50 rounded w-32" />
                      <div className="h-4 bg-gray-700/30 rounded w-16 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl">
                <svg className="w-12 h-12 mx-auto text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <p className="text-gray-500 font-body">No consultations yet</p>
                <p className="text-gray-600 text-sm mt-1">Book your first consultation above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map((c, idx) => {
                  const status = c.status || "pending";
                  const badgeClass = STATUS_BADGE[status] || STATUS_BADGE.pending;
                  return (
                    <div
                      key={c.id || c._id || idx}
                      className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-gray-600/50 transition-colors"
                    >
                      {/* Date */}
                      <div className="flex items-center gap-2 sm:w-36">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        <span className="text-sm text-gray-300">
                          {c.created_at || c.date
                            ? new Date(c.created_at || c.date).toLocaleDateString("en-GH", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>

                      {/* Pharmacist */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {c.pharmacist_name || "Awaiting match"}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{c.tier || "standard"} session</p>
                      </div>

                      {/* Status */}
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${badgeClass}`}>
                        {status.replace("_", " ")}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:ml-2">
                        {(status === "waiting" || status === "active") && (
                          <Link
                            to={`/clinic/session/${c.id || c._id}`}
                            className="px-4 py-1.5 text-sm rounded-lg font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-md transition-all"
                          >
                            Join
                          </Link>
                        )}
                        {status === "completed" && (
                          <Link
                            to={`/clinic/session/${c.id || c._id}`}
                            className="px-4 py-1.5 text-sm rounded-lg font-semibold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            View Summary
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
