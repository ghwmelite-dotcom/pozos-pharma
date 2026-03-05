/**
 * PozosPharma Badge Component
 *
 * Displays contextual badges for verification, AI, urgency, online status, and roles.
 *
 * @param {object} props
 * @param {"verified"|"ai"|"urgency"|"online"|"role"} props.type
 * @param {string} [props.label] - Display text (auto-generated if omitted for some types)
 * @param {"low"|"medium"|"high"|"critical"} [props.level] - Urgency level (for type="urgency")
 * @param {string} [props.className]
 */
export default function Badge({ type, label, level, className = "" }) {
  switch (type) {
    case "verified":
      return <VerifiedBadge label={label} className={className} />;
    case "ai":
      return <AIBadge label={label} className={className} />;
    case "urgency":
      return <UrgencyBadge level={level} label={label} className={className} />;
    case "online":
      return <OnlineBadge label={label} className={className} />;
    case "role":
      return <RoleBadge label={label} className={className} />;
    default:
      return null;
  }
}

/* ── Verified Pharmacist Badge ─────────────────────────────────── */

function VerifiedBadge({ label = "Verified Pharmacist", className }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700 ${className}`}
      role="status"
      aria-label={label}
    >
      {/* Shield icon */}
      <svg
        className="w-3.5 h-3.5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 1a1 1 0 01.707.293l6 6a1 1 0 01.207.994l-2 7a1 1 0 01-.607.638l-4 1.5a1 1 0 01-.614 0l-4-1.5a1 1 0 01-.607-.638l-2-7a1 1 0 01.207-.994l6-6A1 1 0 0110 1zm0 2.414L5.414 8l1.672 5.85L10 15.067l2.914-1.217L14.586 8 10 3.414z"
          clipRule="evenodd"
        />
        <path d="M9 9.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 9.586z" />
      </svg>
      <span>{label}</span>
    </span>
  );
}

/* ── AI Badge ──────────────────────────────────────────────────── */

function AIBadge({ label = "AI", className }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-brand-teal dark:bg-teal-900/40 dark:text-teal-300 ring-1 ring-teal-300 dark:ring-teal-700 ${className}`}
      role="status"
      aria-label={`${label} generated`}
    >
      {/* Robot / AI icon */}
      <svg
        className="w-3.5 h-3.5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M10 2a1 1 0 011 1v1.07A7.002 7.002 0 0117 11v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2a7.002 7.002 0 016-6.93V3a1 1 0 011-1z" />
        <path
          fillRule="evenodd"
          d="M7 9a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z"
          clipRule="evenodd"
        />
        <path d="M8 13h4a1 1 0 010 2H8a1 1 0 010-2z" />
      </svg>
      <span>{label}</span>
    </span>
  );
}

/* ── Urgency Badge ─────────────────────────────────────────────── */

const urgencyConfig = {
  low: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-800 dark:text-green-300",
    ring: "ring-green-300 dark:ring-green-700",
    defaultLabel: "Low",
  },
  medium: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-800 dark:text-amber-300",
    ring: "ring-amber-300 dark:ring-amber-700",
    defaultLabel: "Medium",
  },
  high: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
    ring: "ring-red-300 dark:ring-red-700",
    defaultLabel: "High",
  },
  critical: {
    bg: "bg-red-200 dark:bg-red-900/60",
    text: "text-red-900 dark:text-red-200",
    ring: "ring-red-400 dark:ring-red-600",
    defaultLabel: "Critical",
  },
};

function UrgencyBadge({ level = "low", label, className }) {
  const config = urgencyConfig[level] || urgencyConfig.low;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${config.bg} ${config.text} ring-1 ${config.ring} ${level === "critical" ? "animate-pulse" : ""} ${className}`}
      role="status"
      aria-label={`Urgency: ${displayLabel}`}
    >
      {/* Exclamation icon */}
      <svg
        className="w-3 h-3 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{displayLabel}</span>
    </span>
  );
}

/* ── Online Indicator Badge ────────────────────────────────────── */

function OnlineBadge({ label = "Online", className }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ${className}`}
      role="status"
      aria-label={label}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>{label}</span>
    </span>
  );
}

/* ── Role Badge ────────────────────────────────────────────────── */

function RoleBadge({ label = "Member", className }) {
  const roleColors = {
    admin:
      "bg-purple-100 text-purple-800 ring-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-700",
    moderator:
      "bg-blue-100 text-blue-800 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-700",
    pharmacist:
      "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700",
    member:
      "bg-gray-100 text-gray-700 ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600",
  };

  const key = label.toLowerCase();
  const colors = roleColors[key] || roleColors.member;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ring-1 ${colors} ${className}`}
      role="status"
      aria-label={`Role: ${label}`}
    >
      {label}
    </span>
  );
}
