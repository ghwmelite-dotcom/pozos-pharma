import { useState } from "react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Forgot Password Modal
 *
 * Email input form to request a password reset link.
 * Follows the same modal pattern as LoginModal.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {() => void} props.onBackToLogin
 */
export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setError("");
    setEmail("");
    setSuccess(false);
    onBackToLogin();
  };

  const handleClose = () => {
    setError("");
    setEmail("");
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center">
          {/* Lock icon */}
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
            Forgot Password?
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your email and we&apos;ll send you a reset link
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

        {/* Success */}
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
              <span>If an account with that email exists, a reset link has been sent. Check your inbox.</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleBackToLogin}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              Send Reset Link
            </Button>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{" "}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="font-semibold text-brand-indigo dark:text-indigo-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-indigo rounded"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
}
