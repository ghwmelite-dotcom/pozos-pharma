import { useState, useMemo } from "react";
import useAuth from "../../hooks/useAuth";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { useTranslation } from "../../i18n/useTranslation";

/**
 * Password strength evaluator.
 * Returns { score: 0-4, label, color }.
 */
function evaluateStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Very Weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-yellow-400" },
    { label: "Good", color: "bg-emerald-400" },
    { label: "Strong", color: "bg-emerald-600" },
  ];

  const clamped = Math.min(score, 4);
  return { score: clamped, ...levels[clamped] };
}

const ACCOUNT_TYPES = [
  {
    key: "general_public",
    label: "General Public",
    desc: "Get medication help from AI & pharmacists",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    color: "from-blue-500 to-cyan-500",
    ring: "ring-blue-400",
  },
  {
    key: "pharmacy_student",
    label: "Pharmacy Student",
    desc: "Access courses, quizzes & certificates",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-400",
  },
  {
    key: "pharmacist",
    label: "Pharmacist",
    desc: "Get listed & provide consultations",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    color: "from-amber-500 to-yellow-500",
    ring: "ring-amber-400",
    badge: "Requires Approval",
  },
];

const SPECIALIZATIONS = [
  "Clinical Pharmacy",
  "Community Pharmacy",
  "Hospital Pharmacy",
  "Industrial Pharmacy",
  "Pharmaceutical Chemistry",
  "Pharmacognosy",
  "Pharmacology",
  "Pharmacy Practice",
  "Public Health Pharmacy",
];

const UNIVERSITIES = [
  "KNUST - Kwame Nkrumah University of Science and Technology",
  "University of Ghana (Legon)",
  "UHAS - University of Health and Allied Sciences",
  "University of Cape Coast",
  "Central University",
  "Other",
];

/**
 * PozosPharma Registration Modal
 *
 * Step 1: Choose account type (General Public / Pharmacy Student / Pharmacist)
 * Step 2: Fill in registration fields (conditional on account type)
 */
export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const { t } = useTranslation();

  // Step tracking
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState(null);

  // Common fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Student fields
  const [university, setUniversity] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");

  // Pharmacist fields
  const [fullName, setFullName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [bio, setBio] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const strength = useMemo(() => evaluateStrength(password), [password]);

  const resetForm = () => {
    setStep(1);
    setAccountType(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUniversity("");
    setYearOfStudy("");
    setFullName("");
    setLicenseNumber("");
    setSpecialization("");
    setCustomSpecialization("");
    setBio("");
    setError("");
    setShowSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (accountType === "pharmacist" && (!fullName.trim() || !licenseNumber.trim())) {
      setError("Full name and license number are required.");
      return;
    }

    setLoading(true);
    try {
      const extras = { accountType };

      if (accountType === "pharmacy_student") {
        extras.university = university || undefined;
        extras.yearOfStudy = yearOfStudy || undefined;
      }

      if (accountType === "pharmacist") {
        extras.fullName = fullName.trim();
        extras.licenseNumber = licenseNumber.trim();
        const resolvedSpec = specialization === '__other__' ? customSpecialization.trim() : specialization;
        extras.specialization = resolvedSpec || undefined;
        extras.bio = bio.trim() || undefined;
      }

      const result = await register(username.trim(), email.trim(), password, extras);

      if (result.pendingApproval) {
        setShowSuccess(true);
      } else {
        resetForm();
        onClose();
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    resetForm();
    onSwitchToLogin();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Pharmacist pending approval success screen
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Application Submitted!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Your pharmacist application is under review. You can use the platform while we verify your credentials. Once approved, you'll be listed in our pharmacist directory.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
            License: <span className="font-mono font-semibold">{licenseNumber}</span>
          </div>
          <Button variant="secondary" size="lg" className="w-full" onClick={handleClose}>
            Start Exploring
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      {/* ── Step 1: Choose Account Type ────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-teal/10 dark:bg-teal-900/30 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-brand-teal dark:text-teal-400" viewBox="0 0 40 40" fill="currentColor">
                <path d="M8 20c0-3 2-6 5-7s6 0 7 3c1-3 4-4 7-3s5 4 5 7-2 6-5 7-6 0-7-3c-1 3-4 4-7 3s-5-4-5-7z" />
                <circle cx="20" cy="20" r="3" fill="white" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t("auth.registerTitle")}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              How will you be using PozosPharma?
            </p>
          </div>

          {/* Ghana flag accent stripe */}
          <div className="h-1 w-full rounded-full overflow-hidden flex">
            <div className="flex-1 bg-ghana-red" />
            <div className="flex-1 bg-ghana-gold" />
            <div className="flex-1 bg-ghana-green" />
          </div>

          {/* Account type cards */}
          <div className="space-y-3">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => {
                  setAccountType(type.key);
                  setStep(2);
                  setError("");
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group ${
                  accountType === type.key
                    ? `border-transparent ring-2 ${type.ring} bg-gradient-to-r ${type.color} text-white shadow-lg`
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    accountType === type.key
                      ? "bg-white/20"
                      : `bg-gradient-to-br ${type.color} text-white`
                  }`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        accountType === type.key ? "text-white" : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {type.label}
                      </span>
                      {type.badge && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          accountType === type.key
                            ? "bg-white/20 text-white"
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}>
                          {type.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 ${
                      accountType === type.key ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {type.desc}
                    </p>
                  </div>
                  <svg className={`w-5 h-5 transition-transform group-hover:translate-x-0.5 ${
                    accountType === type.key ? "text-white/80" : "text-gray-400"
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Switch to Login */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-1">
            {t("auth.hasAccount")}{" "}
            <button type="button" onClick={handleSwitchToLogin} className="font-semibold text-brand-teal dark:text-teal-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-teal rounded">
              {t("auth.signInLink")}
            </button>
          </p>
        </div>
      )}

      {/* ── Step 2: Registration Form ────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header with back button and account type badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create Account</h2>
            </div>
            {accountType && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r ${
                ACCOUNT_TYPES.find(t => t.key === accountType)?.color
              } text-white`}>
                {ACCOUNT_TYPES.find(t => t.key === accountType)?.label}
              </span>
            )}
          </div>

          {/* Ghana flag accent stripe */}
          <div className="h-1 w-full rounded-full overflow-hidden flex">
            <div className="flex-1 bg-ghana-red" />
            <div className="flex-1 bg-ghana-gold" />
            <div className="flex-1 bg-ghana-green" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300" role="alert">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── Pharmacist-specific fields ────────────── */}
          {accountType === "pharmacist" && (
            <>
              <div>
                <label htmlFor="reg-fullname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input id="reg-fullname" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Kwame Asante"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-license" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License No. <span className="text-red-400">*</span>
                  </label>
                  <input id="reg-license" type="text" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="PCG/12345"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow" />
                </div>
                <div>
                  <label htmlFor="reg-spec" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specialization
                  </label>
                  <select id="reg-spec" value={SPECIALIZATIONS.includes(specialization) || specialization === '' ? specialization : '__other__'} onChange={(e) => {
                    if (e.target.value === '__other__') {
                      setSpecialization('__other__');
                    } else {
                      setSpecialization(e.target.value);
                      setCustomSpecialization('');
                    }
                  }}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow">
                    <option value="">Select...</option>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    <option value="__other__">Other</option>
                  </select>
                  {(specialization === '__other__' || (!SPECIALIZATIONS.includes(specialization) && specialization !== '')) && (
                    <input type="text" value={customSpecialization} onChange={(e) => setCustomSpecialization(e.target.value)}
                      placeholder="Enter your specialization"
                      className="w-full mt-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow" />
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="reg-bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Bio <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea id="reg-bio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description of your practice and experience..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow resize-none" />
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
            </>
          )}

          {/* ── Student-specific fields ────────────── */}
          {accountType === "pharmacy_student" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-uni" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    University
                  </label>
                  <select id="reg-uni" value={university} onChange={(e) => setUniversity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow">
                    <option value="">Select...</option>
                    {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="reg-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year of Study
                  </label>
                  <select id="reg-year" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow">
                    <option value="">Select...</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Year 5">Year 5</option>
                    <option value="Year 6">Year 6</option>
                    <option value="Intern">Intern</option>
                    <option value="Postgrad">Postgraduate</option>
                  </select>
                </div>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
            </>
          )}

          {/* ── Common fields ────────────── */}
          <div>
            <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.username")} <span className="text-red-400">*</span>
            </label>
            <input id="register-username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder={t("auth.usernamePlaceholder")}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow" />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.email")} <span className="text-red-400">*</span>
            </label>
            <input id="register-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow" />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.password")} <span className="text-red-400">*</span>
            </label>
            <input id="register-password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordMinLength")}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow" />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("auth.strength")}:{" "}
                  <span className={`font-medium ${strength.score <= 1 ? "text-red-500" : strength.score === 2 ? "text-yellow-500" : "text-emerald-500"}`}>
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.confirmPassword")} <span className="text-red-400">*</span>
            </label>
            <input id="register-confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.repeatPassword")}
              className={`w-full rounded-lg border bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow ${
                confirmPassword && confirmPassword !== password
                  ? "border-red-400 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              }`} />
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{t("auth.passwordsNoMatch")}</p>
            )}
          </div>

          {/* Pharmacist approval notice */}
          {accountType === "pharmacist" && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-700 dark:text-amber-400">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>Your credentials will be reviewed by our admin team. You can use the platform while we verify your license.</span>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" variant="secondary" size="lg" loading={loading} className="w-full">
            {accountType === "pharmacist" ? "Submit Application" : t("auth.createAccount")}
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            {t("auth.termsNotice")}
          </p>

          {/* Switch to Login */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("auth.hasAccount")}{" "}
            <button type="button" onClick={handleSwitchToLogin} className="font-semibold text-brand-teal dark:text-teal-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-teal rounded">
              {t("auth.signInLink")}
            </button>
          </p>
        </form>
      )}
    </Modal>
  );
}
