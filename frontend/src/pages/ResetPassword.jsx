import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/UI/Button";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Reset Password Page
 *
 * Reads reset token from URL params (/reset-password/:token).
 * New password + confirm password form. On success, redirects to login.
 */
export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
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

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm bg-warm-50 dark:bg-surface-card-dark rounded-2xl shadow-2xl border border-warm-200/60 dark:border-gray-700 p-6 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-indigo/10 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
            <svg
              className="w-7 h-7 text-brand-indigo dark:text-indigo-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Reset Your Password
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose a new password for your account
          </p>
        </div>

        {/* Ghana flag accent stripe */}
        <div className="h-1 w-full rounded-full overflow-hidden flex">
          <div className="flex-1 bg-ghana-red" />
          <div className="flex-1 bg-ghana-gold" />
          <div className="flex-1 bg-ghana-green" />
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            <svg
              className="w-4 h-4 shrink-0"
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
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300"
              role="status"
            >
              <svg
                className="w-4 h-4 shrink-0"
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
              <span>Your password has been reset successfully!</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate("/?login=true")}
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label
                htmlFor="reset-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-transparent transition-shadow"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-transparent transition-shadow"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
