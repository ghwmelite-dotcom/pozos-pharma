import { useState } from "react";
import useChatStore from "../../store/chatStore";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Email Verification Banner
 *
 * Displays at the top of pages if user.email_verified === 0.
 * Shows "Please verify your email. Check your inbox or [Resend]".
 */
export default function EmailVerificationBanner() {
  const user = useChatStore((s) => s.user);
  const token = useChatStore((s) => s.token);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Only show if user is logged in and email is not verified
  if (!user || user.email_verified !== 0) return null;

  const handleResend = async () => {
    if (resending || resent) return;

    setResending(true);
    try {
      await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setResent(true);
    } catch (err) {
      console.error("[EmailVerificationBanner] Resend failed:", err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full bg-ghana-gold/90 dark:bg-yellow-900/80 border-b border-yellow-500 dark:border-yellow-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2 text-sm text-yellow-900 dark:text-yellow-100">
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          Please verify your email address. Check your inbox
          {resent ? (
            <span className="font-semibold"> — Verification email resent!</span>
          ) : (
            <>
              {" or "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend"}
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
