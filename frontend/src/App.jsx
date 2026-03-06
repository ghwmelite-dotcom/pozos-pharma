import { Routes, Route, Link, NavLink } from "react-router-dom";
import { lazy, Suspense, useState, useRef, useEffect } from "react";
import useChatStore from "./store/chatStore";
import { useTranslation } from "./i18n/useTranslation";
import InstallPrompt from "./components/UI/InstallPrompt";
import NotificationBell from "./components/UI/NotificationBell";
import EmailVerificationBanner from "./components/Auth/EmailVerificationBanner";
import { usePageView } from "./hooks/useAnalytics";
import { useNotifications } from "./hooks/useNotifications";

const Home = lazy(() => import("./pages/Home"));
const ChatRoom = lazy(() => import("./pages/ChatRoom"));
const PharmacistPortal = lazy(() => import("./pages/PharmacistPortal"));
const DrugDatabase = lazy(() => import("./pages/DrugDatabase"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const InteractionChecker = lazy(() => import("./pages/InteractionChecker"));
const MyMedications = lazy(() => import("./pages/MyMedications"));
const PharmacyLocator = lazy(() => import("./pages/PharmacyLocator"));
const HealthHub = lazy(() => import("./pages/HealthHub"));
const ArticleView = lazy(() => import("./pages/ArticleView"));
const PharmacistDirectory = lazy(() => import("./pages/PharmacistDirectory"));
const DrugVerification = lazy(() => import("./pages/DrugVerification"));
const HerbalInteractions = lazy(() => import("./pages/HerbalInteractions"));
const EmergencyDrugFinder = lazy(() => import("./pages/EmergencyDrugFinder"));
const NHISLookup = lazy(() => import("./pages/NHISLookup"));
const PrescriptionScanner = lazy(() => import("./pages/PrescriptionScanner"));
const DrugPrices = lazy(() => import("./pages/DrugPrices"));
const ShortageRadar = lazy(() => import("./pages/ShortageRadar"));
const CHWMode = lazy(() => import("./pages/CHWMode"));
const ELearningPortal = lazy(() => import("./pages/ELearningPortal"));
const CourseView = lazy(() => import("./pages/CourseView"));
const DrugCalcTrainer = lazy(() => import("./pages/DrugCalcTrainer"));
const CompoundingLab = lazy(() => import("./pages/CompoundingLab"));
const QuizEngine = lazy(() => import("./pages/QuizEngine"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const AITutor = lazy(() => import("./pages/AITutor"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-[#C9A84C]/30 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-body">Loading...</p>
      </div>
    </div>
  );
}

const LANGUAGE_OPTIONS = [
  { code: "en", flag: "\u{1F1EC}\u{1F1E7}", label: "EN" },
  { code: "tw", flag: "\u{1F1EC}\u{1F1ED}", label: "Twi" },
  { code: "ga", flag: "\u{1F1EC}\u{1F1ED}", label: "Ga" },
];

function LanguageSwitcher() {
  const { language, setLanguage } = useChatStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-body font-medium text-gray-500 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 dark:text-gray-400 dark:hover:text-[#C9A84C] dark:hover:bg-[#C9A84C]/10 transition-all"
        aria-label="Select language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-warm-50 dark:bg-gray-900 border border-warm-300/40 dark:border-gray-700/50 rounded-xl shadow-xl shadow-warm-400/10 dark:shadow-black/30 py-1 z-50">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => { setLanguage(opt.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-body transition-colors ${
                language === opt.code
                  ? "bg-[#C9A84C]/10 text-[#C9A84C] font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-warm-200/50 dark:hover:bg-gray-800"
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MoreDropdown({ items, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-body font-medium text-gray-600 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 dark:text-gray-400 dark:hover:text-[#C9A84C] dark:hover:bg-[#C9A84C]/10 transition-all"
      >
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-52 bg-warm-50 dark:bg-gray-900 border border-warm-300/40 dark:border-gray-700/50 rounded-xl shadow-xl shadow-warm-400/10 dark:shadow-black/30 py-1.5 z-50">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-body transition-colors ${
                  isActive
                    ? "bg-[#C9A84C]/10 text-[#C9A84C] font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-warm-200/50 dark:hover:bg-gray-800 hover:text-[#C9A84C]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useChatStore();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-body font-medium transition-all ${
      isActive
        ? "bg-[#C9A84C]/10 text-[#C9A84C] dark:bg-[#C9A84C]/15 dark:text-[#E8D48B]"
        : "text-gray-600 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 dark:text-gray-400 dark:hover:text-[#C9A84C] dark:hover:bg-[#C9A84C]/10"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `block px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
      isActive
        ? "bg-[#C9A84C]/10 text-[#C9A84C] dark:bg-[#C9A84C]/15 dark:text-[#E8D48B]"
        : "text-gray-600 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 dark:text-gray-400 dark:hover:text-[#C9A84C]"
    }`;

  const exploreItems = [
    { to: "/pharmacists", label: "Our Pharmacists" },
    { to: "/pharmacies", label: "Pharmacies" },
    { to: "/health-hub", label: "Health Hub" },
    { to: "/drug-prices", label: "Drug Prices" },
    { to: "/shortage-radar", label: "Shortage Radar" },
  ];
  if (user) {
    exploreItems.push({ to: "/my-medications", label: "My Meds" });
  }

  const toolsItems = [
    { to: "/interactions", label: t("nav.interactions") },
    { to: "/herbal-interactions", label: "Herbal Interactions" },
    { to: "/verify-drug", label: "Verify Medicine" },
    { to: "/drug-finder", label: "Emergency Finder" },
    { to: "/nhis", label: "NHIS Coverage" },
    { to: "/prescription-scanner", label: "Rx Scanner" },
    { to: "/chw", label: "CHW Mode" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-warm-50/90 dark:bg-gray-950/85 backdrop-blur-xl border-b border-warm-300/40 dark:border-[#C9A84C]/10">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] flex">
        <div className="flex-1 bg-ghana-red/40" />
        <div className="flex-1 bg-ghana-gold/40" />
        <div className="flex-1 bg-ghana-green/40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#0D0B12] ring-1 ring-[#C9A84C]/20 flex items-center justify-center relative overflow-hidden shadow-lg shadow-[#C9A84C]/5 group-hover:ring-[#C9A84C]/40 transition-all">
              {/* Kente cross lines */}
              <div className="absolute inset-0 opacity-[0.06]">
                <div className="absolute inset-0" style={{background: 'linear-gradient(45deg, transparent 48%, #C9A84C 48%, #C9A84C 52%, transparent 52%), linear-gradient(-45deg, transparent 48%, #C9A84C 48%, #C9A84C 52%, transparent 52%)'}} />
              </div>
              {/* Gold ring */}
              <div className="absolute w-7 h-7 rounded-full ring-1 ring-[#C9A84C]/15" />
              {/* Medical cross */}
              <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="navGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A8893A"/>
                    <stop offset="50%" stopColor="#E8D48B"/>
                    <stop offset="100%" stopColor="#C9A84C"/>
                  </linearGradient>
                </defs>
                <rect x="9" y="2" width="6" height="20" rx="1.5" fill="url(#navGold)"/>
                <rect x="2" y="9" width="20" height="6" rx="1.5" fill="url(#navGold)"/>
              </svg>
              {/* Ghana stripe */}
              <div className="absolute bottom-0.5 left-1.5 right-1.5 h-[2px] flex rounded-full overflow-hidden opacity-60">
                <div className="flex-1 bg-ghana-red"/>
                <div className="flex-1 bg-ghana-gold"/>
                <div className="flex-1 bg-ghana-green"/>
              </div>
            </div>
            <span className="text-lg font-display text-warm-900 dark:text-white tracking-tight">
              Pozos<span className="gold-text">Pharma</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            <NavLink to="/" end className={navLinkClass}>{t("nav.home")}</NavLink>
            <NavLink to="/drugs" className={navLinkClass}>{t("nav.drugs")}</NavLink>
            <NavLink to="/learn" className={navLinkClass}>Academy</NavLink>
            <NavLink to="/ai-tutor" className={navLinkClass}>AI Tutor</NavLink>
            <MoreDropdown items={exploreItems} label="Explore" />
            <MoreDropdown items={toolsItems} label="Tools" />
            {user && <NavLink to="/chat/general" className={navLinkClass}>{t("nav.chat")}</NavLink>}
            {user?.role === "pharmacist" && <NavLink to="/pharmacist-portal" className={navLinkClass}>{t("nav.pharmacist")}</NavLink>}
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <LanguageSwitcher />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 dark:hover:bg-[#C9A84C]/10 transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {user && <NotificationBell />}

            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10">
                  <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#C9A84C]">{user.username?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-body font-medium text-[#C9A84C]">{user.username}</span>
                </div>
                <button onClick={logout} className="px-3 py-1.5 text-sm font-body font-medium text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/?login=true" className="px-3.5 py-1.5 text-sm font-body font-medium text-gray-600 hover:text-[#C9A84C] dark:text-gray-400 rounded-lg transition-colors">
                  {t("nav.login")}
                </Link>
                <Link to="/?register=true" className="px-4 py-1.5 text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] rounded-lg transition-colors shadow-sm">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 dark:text-gray-400 transition-all"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-warm-200 dark:border-gray-800 mt-1">
            <div className="py-2 space-y-0.5">
              <NavLink to="/" end className={mobileNavClass} onClick={() => setMobileOpen(false)}>{t("nav.home")}</NavLink>
              <NavLink to="/drugs" className={mobileNavClass} onClick={() => setMobileOpen(false)}>{t("nav.drugs")}</NavLink>
              <NavLink to="/learn" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Academy</NavLink>
              <NavLink to="/ai-tutor" className={mobileNavClass} onClick={() => setMobileOpen(false)}>AI Tutor</NavLink>
              {user && <NavLink to="/chat/general" className={mobileNavClass} onClick={() => setMobileOpen(false)}>{t("nav.chat")}</NavLink>}
            </div>
            <div className="border-t border-warm-200 dark:border-gray-800 my-1.5" />
            <p className="px-3 py-1.5 text-[10px] font-body font-semibold text-[#C9A84C]/60 uppercase tracking-[0.2em]">Explore</p>
            <div className="space-y-0.5">
              <NavLink to="/pharmacists" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Our Pharmacists</NavLink>
              <NavLink to="/pharmacies" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Pharmacies</NavLink>
              <NavLink to="/health-hub" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Health Hub</NavLink>
              <NavLink to="/drug-prices" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Drug Prices</NavLink>
              <NavLink to="/shortage-radar" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Shortage Radar</NavLink>
              {user && <NavLink to="/my-medications" className={mobileNavClass} onClick={() => setMobileOpen(false)}>My Meds</NavLink>}
            </div>
            <div className="border-t border-warm-200 dark:border-gray-800 my-1.5" />
            <p className="px-3 py-1.5 text-[10px] font-body font-semibold text-[#C9A84C]/60 uppercase tracking-[0.2em]">Tools</p>
            <div className="space-y-0.5">
              <NavLink to="/interactions" className={mobileNavClass} onClick={() => setMobileOpen(false)}>{t("nav.interactions")}</NavLink>
              <NavLink to="/herbal-interactions" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Herbal Interactions</NavLink>
              <NavLink to="/verify-drug" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Verify Medicine</NavLink>
              <NavLink to="/drug-finder" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Emergency Finder</NavLink>
              <NavLink to="/nhis" className={mobileNavClass} onClick={() => setMobileOpen(false)}>NHIS Coverage</NavLink>
              <NavLink to="/prescription-scanner" className={mobileNavClass} onClick={() => setMobileOpen(false)}>Rx Scanner</NavLink>
              <NavLink to="/chw" className={mobileNavClass} onClick={() => setMobileOpen(false)}>CHW Mode</NavLink>
            </div>
            {user?.role === "pharmacist" && (
              <>
                <div className="border-t border-warm-200 dark:border-gray-800 my-1.5" />
                <NavLink to="/pharmacist-portal" className={mobileNavClass} onClick={() => setMobileOpen(false)}>{t("nav.pharmacist")}</NavLink>
              </>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
            <div className="flex items-center gap-2 px-3 py-1">
              <LanguageSwitcher />
              {user && <NotificationBell />}
              <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-400 hover:text-[#C9A84C] text-sm font-body">
                {darkMode ? t("common.lightMode") : t("common.darkMode")}
              </button>
            </div>
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-body font-medium text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/10 rounded-lg">
                {t("nav.logout")}
              </button>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/?login=true" className="px-4 py-2 text-sm font-body font-medium text-gray-600 dark:text-gray-400 rounded-lg" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                <Link to="/?register=true" className="px-4 py-2 text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] rounded-lg" onClick={() => setMobileOpen(false)}>{t("nav.register")}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  usePageView();
  useNotifications();

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-gray-950 text-warm-900 dark:text-gray-100 transition-colors font-body">
      <Navbar />
      <EmailVerificationBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:roomSlug" element={<ChatRoom />} />
            <Route path="/pharmacist-portal" element={<PharmacistPortal />} />
            <Route path="/drugs" element={<DrugDatabase />} />
            <Route path="/pharmacies" element={<PharmacyLocator />} />
            <Route path="/interactions" element={<InteractionChecker />} />
            <Route path="/my-medications" element={<MyMedications />} />
            <Route path="/health-hub" element={<HealthHub />} />
            <Route path="/health-hub/:slug" element={<ArticleView />} />
            <Route path="/pharmacists" element={<PharmacistDirectory />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/verify-drug" element={<DrugVerification />} />
            <Route path="/herbal-interactions" element={<HerbalInteractions />} />
            <Route path="/drug-finder" element={<EmergencyDrugFinder />} />
            <Route path="/nhis" element={<NHISLookup />} />
            <Route path="/prescription-scanner" element={<PrescriptionScanner />} />
            <Route path="/drug-prices" element={<DrugPrices />} />
            <Route path="/shortage-radar" element={<ShortageRadar />} />
            <Route path="/chw" element={<CHWMode />} />
            <Route path="/learn" element={<ELearningPortal />} />
            <Route path="/learn/courses" element={<ELearningPortal />} />
            <Route path="/learn/course/:courseId" element={<CourseView />} />
            <Route path="/learn/calc-trainer" element={<DrugCalcTrainer />} />
            <Route path="/learn/compounding" element={<CompoundingLab />} />
            <Route path="/learn/quiz" element={<QuizEngine />} />
            <Route path="/learn/flashcards" element={<Flashcards />} />
            <Route path="/ai-tutor" element={<AITutor />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </Suspense>
      </main>
      <InstallPrompt />
    </div>
  );
}
