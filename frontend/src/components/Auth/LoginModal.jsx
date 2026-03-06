import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { useTranslation } from "../../i18n/useTranslation";

/**
 * PozosPharma Login Modal
 *
 * "Akwaaba! Welcome Back" themed login form with email + password,
 * error display, and link to switch to registration.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {() => void} props.onSwitchToRegister
 * @param {() => void} [props.onForgotPassword]
 */
export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onForgotPassword }) {
  const { login } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      setEmail("");
      setPassword("");
      onClose();
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    setError("");
    setEmail("");
    setPassword("");
    onSwitchToRegister();
  };

  const handleForgotPassword = () => {
    setError("");
    setEmail("");
    setPassword("");
    if (onForgotPassword) onForgotPassword();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="text-center">
          {/* Adinkra Akoko Nan symbol - nurturing */}
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t("auth.loginTitle")}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("auth.loginSubtitle")}
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

        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t("auth.email")}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-transparent transition-shadow"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t("auth.password")}
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-transparent transition-shadow"
          />
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm font-medium text-brand-indigo dark:text-indigo-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-indigo rounded"
          >
            {t("auth.forgotPassword")}
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {t("auth.signInButton")}
        </Button>

        {/* Switch to Register */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.noAccount")}{" "}
          <button
            type="button"
            onClick={handleSwitchToRegister}
            className="font-semibold text-brand-indigo dark:text-indigo-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-indigo rounded"
          >
            {t("auth.joinLink")}
          </button>
        </p>
      </form>
    </Modal>
  );
}
