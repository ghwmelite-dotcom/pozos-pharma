import { useState } from "react";
import { Link } from "react-router-dom";

/* ================================================================
   PozosPharma Academy  -  E-Learning Portal Hub
   ================================================================
   Ghana's first AI-powered pharmacy learning platform.
   Design tokens: Adinkra Gold luxury aesthetic, dark-mode-first.
   Targets pharmacy students at KNUST, UG, and UHAS.
   ================================================================ */

/* ── Static Data ──────────────────────────────────────────────── */

const TOOLS = [
  {
    id: "courses",
    title: "Course Modules",
    to: "/learn/courses",
    description: "Structured curriculum from Pharmacology to Clinical Pharmacy",
    icon: "book",
  },
  {
    id: "calc",
    title: "Drug Calc Trainer",
    to: "/learn/calc-trainer",
    description: "Master dosage calculations with step-by-step guidance",
    icon: "calculator",
  },
  {
    id: "compounding",
    title: "Compounding Lab",
    to: "/learn/compounding",
    description: "Virtual compounding simulations",
    icon: "beaker",
  },
  {
    id: "quiz",
    title: "Quiz Engine",
    to: "/learn/quiz",
    description: "Timed assessments in KNUST/UG exam format",
    icon: "clipboard",
  },
  {
    id: "flashcards",
    title: "Flashcards",
    to: "/learn/flashcards",
    description: "Spaced repetition with 75+ pharmacy cards",
    icon: "cards",
  },
  {
    id: "tutor",
    title: "AI Tutor",
    to: "/chat/general",
    description: "Ask PozosBot any pharmacy question",
    icon: "robot",
  },
];

const COURSES = [
  {
    id: "pharmacology-1",
    title: "Pharmacology I",
    year: 2,
    lessons: 8,
    difficulty: "Beginner",
    progress: 0,
  },
  {
    id: "pharma-chemistry",
    title: "Pharmaceutical Chemistry",
    year: 2,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "pharmacognosy",
    title: "Pharmacognosy",
    year: 3,
    lessons: 5,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "clinical-pharmacy",
    title: "Clinical Pharmacy",
    year: 4,
    lessons: 6,
    difficulty: "Advanced",
    progress: 0,
  },
  {
    id: "pharmacy-practice",
    title: "Pharmacy Practice & Ethics",
    year: 3,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "biopharmaceutics",
    title: "Biopharmaceutics",
    year: 3,
    lessons: 6,
    difficulty: "Advanced",
    progress: 0,
  },
  {
    id: "pharma-microbiology",
    title: "Pharmaceutical Microbiology",
    year: 2,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "pharmaceutics",
    title: "Pharmaceutics & Dosage Forms",
    year: 2,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "pathophysiology",
    title: "Pathophysiology for Pharmacists",
    year: 3,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "pharmacokinetics",
    title: "Pharmacokinetics & Drug Metabolism",
    year: 3,
    lessons: 6,
    difficulty: "Advanced",
    progress: 0,
  },
  {
    id: "toxicology",
    title: "Toxicology & Poison Management",
    year: 4,
    lessons: 6,
    difficulty: "Advanced",
    progress: 0,
  },
  {
    id: "public-health-pharmacy",
    title: "Public Health Pharmacy",
    year: 4,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "herbal-medicine",
    title: "Traditional & Herbal Medicine Regulation",
    year: 3,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
  {
    id: "supply-chain",
    title: "Pharmaceutical Supply Chain Management",
    year: 4,
    lessons: 6,
    difficulty: "Intermediate",
    progress: 0,
  },
];

const LEADERBOARD = [];

const STUDY_GROUPS = [];

/* ── Inline SVG Icon Components ───────────────────────────────── */

function IconBook({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  );
}

function IconCalculator({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="7" y="5" width="10" height="4" rx="1" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" />
    </svg>
  );
}

function IconBeaker({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3h6M10 3v6.5L5 20a1 1 0 001 1h12a1 1 0 001-1l-5-10.5V3" />
      <path d="M7 15h10" />
    </svg>
  );
}

function IconClipboard({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconCards({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="16" height="16" rx="2" />
      <path d="M6 2h14a2 2 0 012 2v14" />
      <path d="M7 10h6M7 14h4" />
    </svg>
  );
}

function IconRobot({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="8" width="14" height="12" rx="2" />
      <path d="M12 8V5M9 13h.01M15 13h.01M10 17h4" />
      <circle cx="12" cy="3" r="1.5" />
    </svg>
  );
}

function IconChevronRight({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconUsers({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconTrophy({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
      <path d="M6 3h12v6a6 6 0 01-12 0V3zM12 15v3M8 21h8M10 18h4" />
    </svg>
  );
}

function IconStar({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconFire({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22c4.97 0 8-3.58 8-8 0-3.5-2-6.5-4-8-.5 2-2 3-3 3-1.5-2-2-5-1-8C8 3 4 7 4 14c0 4.42 3.03 8 8 8z" />
    </svg>
  );
}

function IconTarget({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconBrain({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a5 5 0 015 5c0 1.1-.4 2.1-1 2.9.6.8 1 1.8 1 2.9a5 5 0 01-2.3 4.2c.2.6.3 1.3.3 2a4 4 0 01-3 3.9M12 2a5 5 0 00-5 5c0 1.1.4 2.1 1 2.9-.6.8-1 1.8-1 2.9a5 5 0 002.3 4.2c-.2.6-.3 1.3-.3 2a4 4 0 003 3.9M12 2v20" />
    </svg>
  );
}

const ICON_MAP = {
  book: IconBook,
  calculator: IconCalculator,
  beaker: IconBeaker,
  clipboard: IconClipboard,
  cards: IconCards,
  robot: IconRobot,
};

/* ── Helper: Difficulty badge colours ─────────────────────────── */

function difficultyColor(level) {
  switch (level) {
    case "Beginner":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "Intermediate":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "Advanced":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

/* ── Helper: Rank colour ──────────────────────────────────────── */

function rankMedal(rank) {
  if (rank === 1) return "text-[#C9A84C]";
  if (rank === 2) return "text-gray-400 dark:text-gray-300";
  if (rank === 3) return "text-amber-700 dark:text-amber-500";
  return "text-gray-500 dark:text-gray-400";
}

/* ── CSS-Only Circular Progress ───────────────────────────────── */

function CircularProgress({ percent, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Overall progress: ${percent} percent`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="goldProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="50%" stopColor="#E8D48B" />
            <stop offset="100%" stopColor="#A8893A" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#goldProgressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold gold-text">{percent}%</span>
        <span className="text-[10px] uppercase tracking-wider text-warm-900/40 dark:text-gray-500 font-body">
          Overall
        </span>
      </div>
    </div>
  );
}

/* ── Kente Pattern Background ─────────────────────────────────── */

function KentePattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="kenteHero"
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width="60" height="8" fill="#C9A84C" />
          <rect x="0" y="8" width="60" height="4" fill="#CE1126" />
          <rect x="0" y="12" width="60" height="8" fill="#006B3F" />
          <rect x="0" y="20" width="60" height="8" fill="#C9A84C" />
          <rect x="0" y="28" width="60" height="4" fill="#CE1126" />
          <rect x="0" y="32" width="60" height="8" fill="#006B3F" />
          <rect x="0" y="40" width="60" height="8" fill="#C9A84C" />
          <rect x="0" y="48" width="60" height="4" fill="#CE1126" />
          <rect x="0" y="52" width="60" height="8" fill="#006B3F" />
          {/* Vertical accent lines */}
          <rect x="10" y="0" width="3" height="60" fill="#C9A84C" opacity="0.4" />
          <rect x="25" y="0" width="2" height="60" fill="#FCD116" opacity="0.25" />
          <rect x="40" y="0" width="3" height="60" fill="#006B3F" opacity="0.35" />
          <rect x="55" y="0" width="2" height="60" fill="#CE1126" opacity="0.2" />
          {/* Diamond accents */}
          <polygon points="30,5 35,10 30,15 25,10" fill="#FCD116" opacity="0.5" />
          <polygon points="30,35 35,40 30,45 25,40" fill="#FCD116" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kenteHero)" />
    </svg>
  );
}

/* ── Small stat helper ────────────────────────────────────────── */

function StatItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon && (
        <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-[#C9A84C]/10 dark:bg-[#C9A84C]/15 text-[#C9A84C]">
          <Icon className="w-4.5 h-4.5" />
        </div>
      )}
      <div>
        <p className="text-xs text-warm-900/50 dark:text-gray-500 font-body">{label}</p>
        <p className="text-base font-bold font-display text-warm-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function ELearningPortal() {
  const [joinedGroups, setJoinedGroups] = useState([]);

  function handleJoinGroup(groupId) {
    setJoinedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 text-warm-900 dark:text-gray-100 font-body transition-colors duration-300">

      {/* ──────────────────────────────────────────────────────────────
          SECTION 1 - HERO
          ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-warm-100 dark:bg-gray-900 border-b border-warm-200 dark:border-gray-800">
        <KentePattern />

        {/* Decorative radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.06] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.12] border border-[#C9A84C]/20 dark:border-[#C9A84C]/25">
            <span className="w-2 h-2 rounded-full bg-[#006B3F]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#A8893A] dark:text-[#E8D48B] font-body">
              Ghana&apos;s Premier Pharmacy Learning Platform
            </span>
            <span className="w-2 h-2 rounded-full bg-[#CE1126]" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-5">
            <span className="gold-text">PozosPharma</span>{" "}
            <span className="text-warm-900 dark:text-white">Academy</span>
          </h1>

          {/* Tagline */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-warm-900/70 dark:text-gray-400 mb-12 leading-relaxed font-body">
            Master pharmacy with Ghana&apos;s first AI-powered learning platform.
            Built for students at{" "}
            <strong className="text-warm-900 dark:text-gray-200">KNUST</strong>,{" "}
            <strong className="text-warm-900 dark:text-gray-200">UG</strong>, and{" "}
            <strong className="text-warm-900 dark:text-gray-200">UHAS</strong>.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
            {[
              { value: "14", label: "Courses" },
              { value: "75+", label: "Flashcards" },
              { value: "6", label: "Lab Simulations" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm border border-warm-200 dark:border-[#C9A84C]/15 shadow-sm"
              >
                <span className="font-display text-3xl sm:text-4xl font-bold gold-text">
                  {stat.value}
                </span>
                <span className="text-sm text-warm-900/60 dark:text-gray-400 mt-1 font-body">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Page body container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ──────────────────────────────────────────────────────────
            SECTION 2 - QUICK ACCESS TOOLS GRID
            ────────────────────────────────────────────────────── */}
        <section className="py-14 sm:py-20" aria-labelledby="tools-heading">
          <div className="text-center mb-10">
            <h2
              id="tools-heading"
              className="font-display text-2xl sm:text-3xl font-bold mb-3"
            >
              <span className="gold-text">Quick Access</span>{" "}
              <span className="text-warm-900 dark:text-white">Tools</span>
            </h2>
            <p className="text-warm-900/60 dark:text-gray-400 max-w-xl mx-auto font-body">
              Everything you need to ace your pharmacy exams, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map((tool) => {
              const Icon = ICON_MAP[tool.icon];
              return (
                <Link
                  key={tool.id}
                  to={tool.to}
                  className="group relative flex items-start gap-4 p-5 sm:p-6 rounded-2xl
                    bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm
                    border border-warm-200 dark:border-gray-800
                    hover:border-[#C9A84C]/40 dark:hover:border-[#C9A84C]/30
                    hover:shadow-lg hover:shadow-[#C9A84C]/5
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
                >
                  {/* Icon */}
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[#C9A84C]/10 dark:bg-[#C9A84C]/15 text-[#C9A84C] group-hover:bg-[#C9A84C]/20 dark:group-hover:bg-[#C9A84C]/25 transition-colors duration-300">
                    {Icon && <Icon />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-warm-900 dark:text-gray-100 group-hover:text-[#C9A84C] dark:group-hover:text-[#E8D48B] transition-colors duration-300 flex items-center gap-1.5">
                      {tool.title}
                      <IconChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    <p className="text-sm text-warm-900/60 dark:text-gray-400 mt-1 leading-relaxed font-body">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 3 - FEATURED COURSES
            ────────────────────────────────────────────────────── */}
        <section className="pb-14 sm:pb-20" aria-labelledby="courses-heading">
          <div className="text-center mb-10">
            <h2
              id="courses-heading"
              className="font-display text-2xl sm:text-3xl font-bold mb-3"
            >
              Featured{" "}
              <span className="gold-text">Courses</span>
            </h2>
            <p className="text-warm-900/60 dark:text-gray-400 max-w-xl mx-auto font-body">
              Comprehensive modules aligned with the PharmD curriculum at
              Ghana&apos;s top universities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course) => (
              <article
                key={course.id}
                className="flex flex-col rounded-2xl overflow-hidden
                  bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm
                  border border-warm-200 dark:border-gray-800
                  hover:border-[#C9A84C]/30 dark:hover:border-[#C9A84C]/20
                  hover:shadow-lg hover:shadow-[#C9A84C]/5
                  transition-all duration-300 group"
              >
                {/* Kente-inspired colour band */}
                <div
                  className="h-1.5 w-full bg-gradient-to-r from-[#CE1126] via-[#C9A84C] to-[#006B3F]"
                  aria-hidden="true"
                />

                <div className="flex-1 p-5 sm:p-6 flex flex-col">
                  {/* Meta row: year + difficulty */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[#A8893A] dark:text-[#E8D48B] bg-[#C9A84C]/10 dark:bg-[#C9A84C]/15 px-2.5 py-0.5 rounded-full font-body">
                      Year {course.year}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full font-body ${difficultyColor(
                        course.difficulty
                      )}`}
                    >
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-bold text-warm-900 dark:text-gray-100 mb-1 group-hover:text-[#C9A84C] dark:group-hover:text-[#E8D48B] transition-colors duration-300">
                    {course.title}
                  </h3>

                  {/* Lesson count */}
                  <p className="text-sm text-warm-900/60 dark:text-gray-400 mb-4 font-body">
                    {course.lessons} lessons
                  </p>

                  {/* Progress bar */}
                  <div className="mt-auto mb-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-warm-900/50 dark:text-gray-500 font-body">
                        Progress
                      </span>
                      <span className="font-medium text-[#A8893A] dark:text-[#E8D48B] font-body">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] transition-all duration-700"
                        style={{ width: `${Math.max(course.progress, 0)}%` }}
                        role="progressbar"
                        aria-valuenow={course.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${course.title} progress: ${course.progress}%`}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/learn/course/${course.id}`}
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold font-body
                      bg-[#C9A84C]/10 text-[#A8893A] dark:bg-[#C9A84C]/15 dark:text-[#E8D48B]
                      hover:bg-[#C9A84C] hover:text-white dark:hover:bg-[#C9A84C] dark:hover:text-gray-950
                      border border-[#C9A84C]/20 hover:border-[#C9A84C]
                      focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-950
                      transition-all duration-300"
                  >
                    Start Course
                    <IconChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 4 & 5 - PROGRESS DASHBOARD + LEADERBOARD
            ────────────────────────────────────────────────────── */}
        <section className="pb-14 sm:pb-20" aria-labelledby="dashboard-heading">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── 4. Progress Dashboard ─────────────────────────── */}
            <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm border border-warm-200 dark:border-gray-800">
              <h2
                id="dashboard-heading"
                className="font-display text-xl sm:text-2xl font-bold mb-8"
              >
                Your{" "}
                <span className="gold-text">Progress</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Circular chart */}
                <CircularProgress percent={0} size={140} strokeWidth={12} />

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 flex-1 w-full">
                  <StatItem
                    label="Courses Started"
                    value="0"
                    icon={IconBook}
                  />
                  <StatItem
                    label="Completed"
                    value="0"
                    icon={IconTarget}
                  />
                  <StatItem
                    label="Quizzes Taken"
                    value="0"
                    icon={IconClipboard}
                  />
                  <StatItem
                    label="Avg Score"
                    value="--"
                    icon={IconStar}
                  />
                  <StatItem
                    label="Flashcards Mastered"
                    value="0 / 75"
                    icon={IconBrain}
                  />
                  {/* Streak with fire icon */}
                  <div className="flex items-center gap-2.5">
                    <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-[#CE1126]/10 dark:bg-[#CE1126]/15 text-[#CE1126]">
                      <IconFire className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs text-warm-900/50 dark:text-gray-500 font-body">
                        Study Streak
                      </p>
                      <p className="text-base font-bold font-display text-warm-900 dark:text-gray-100">
                        0{" "}
                        <span className="text-sm font-normal text-warm-900/50 dark:text-gray-500">
                          days
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. Leaderboard ─────────────────────────────────── */}
            <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm border border-warm-200 dark:border-gray-800">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2.5">
                <IconTrophy className="w-6 h-6 text-[#C9A84C]" />
                <span>
                  <span className="gold-text">Leader</span>board
                </span>
              </h2>

              <div className="flex flex-col items-center justify-center py-10 text-center">
                <IconTrophy className="w-10 h-10 text-[#C9A84C]/30 mb-4" />
                <p className="text-sm font-medium text-warm-900/50 dark:text-gray-500 font-body mb-1">
                  No leaderboard data yet
                </p>
                <p className="text-xs text-warm-900/40 dark:text-gray-600 font-body max-w-xs">
                  Start completing courses, quizzes, and flashcard sessions to earn XP and appear on the leaderboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 6 - STUDY GROUPS
            ────────────────────────────────────────────────────── */}
        <section className="pb-16 sm:pb-24" aria-labelledby="groups-heading">
          <div className="text-center mb-10">
            <h2
              id="groups-heading"
              className="font-display text-2xl sm:text-3xl font-bold mb-3"
            >
              Study{" "}
              <span className="gold-text">Groups</span>
            </h2>
            <p className="text-warm-900/60 dark:text-gray-400 max-w-xl mx-auto font-body">
              Join your peers for collaborative learning and exam preparation.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl bg-white dark:bg-gray-900/50 border border-warm-200 dark:border-gray-800">
            <IconUsers className="w-10 h-10 text-[#006B3F]/30 dark:text-emerald-400/30 mb-4" />
            <p className="text-sm font-medium text-warm-900/50 dark:text-gray-500 font-body mb-1">
              No study groups yet
            </p>
            <p className="text-xs text-warm-900/40 dark:text-gray-600 font-body max-w-sm px-4">
              Study groups will appear here as students create and join them.
            </p>
          </div>
        </section>
      </div>

      {/* ── Ghana-flag footer accent ──────────────────────────────── */}
      <div
        className="h-1 w-full bg-gradient-to-r from-[#CE1126] via-[#C9A84C] to-[#006B3F]"
        aria-hidden="true"
      />
    </div>
  );
}
