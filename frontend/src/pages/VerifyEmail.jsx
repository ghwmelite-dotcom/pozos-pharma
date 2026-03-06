import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Verify Email Page
 *
 * Reads token from URL params (/verify-email/:token).
 * Auto-calls the verify-email API on mount.
 * Shows success or error state.
 */
export default function VerifyEmail() {
  const { token } = useParams();

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error || "Verification failed");
        } else {
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("Network error. Please try again.");
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm bg-warm-50 dark:bg-surface-card-dark rounded-2xl shadow-2xl border border-warm-200/60 dark:border-gray-700 p-6 space-y-5 text-center">
        {/* Ghana flag accent stripe */}
        <div className="h-1 w-full rounded-full overflow-hidden flex">
          <div className="flex-1 bg-ghana-red" />
          <div className="flex-1 bg-ghana-gold" />
          <div className="flex-1 bg-ghana-green" />
        </div>

        {status === "loading" && (
          <div className="py-8 space-y-4">
            <div className="mx-auto w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verifying your email...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-green-600 dark:text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Email Verified!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your email has been successfully verified. You can now enjoy all features of PozosPharma.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-brand-indigo hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
            >
              Go to Home
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-red-600 dark:text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {errorMessage}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-brand-indigo hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
