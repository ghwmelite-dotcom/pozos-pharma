/**
 * PozosPharma Typing Indicator Component
 *
 * Shows animated bouncing dots with the name of who is typing.
 * Supports PozosBot "thinking" state and regular user typing.
 *
 * @param {object} props
 * @param {Array<{userId: string, username: string, role: string}>} props.typingUsers
 */
export default function TypingIndicator({ typingUsers = [] }) {
  if (!typingUsers || typingUsers.length === 0) return null;

  const label = buildLabel(typingUsers);

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 animate-[slideUp_200ms_ease-out]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {/* Bouncing dots */}
      <span className="flex items-center gap-0.5" aria-hidden="true">
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-teal dark:bg-teal-400 animate-bounce-dot"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-teal dark:bg-teal-400 animate-bounce-dot"
          style={{ animationDelay: "160ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-teal dark:bg-teal-400 animate-bounce-dot"
          style={{ animationDelay: "320ms" }}
        />
      </span>

      {/* Label */}
      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
        {label}
      </span>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Build a human-readable label from the list of typing users.
 */
function buildLabel(typingUsers) {
  const hasBot = typingUsers.some(
    (u) => u.role === "ai" || u.role === "bot" || u.username === "PozosBot"
  );

  if (hasBot && typingUsers.length === 1) {
    return "PozosBot is thinking\u2026";
  }

  const names = typingUsers
    .filter((u) => u.username !== "PozosBot")
    .map((u) => u.username);

  if (hasBot) {
    names.unshift("PozosBot");
  }

  if (names.length === 1) {
    return `${names[0]} is typing\u2026`;
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing\u2026`;
  }

  return `${names[0]} and ${names.length - 1} others are typing\u2026`;
}
