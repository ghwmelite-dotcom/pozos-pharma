import { useState, useMemo } from "react";
import useAuth from "../../hooks/useAuth";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

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

/**
 * PozosPharma Registration Modal
 *
 * "Join PozosPharma" with Adinkra symbol, username / email / password /
 * confirm password fields, password strength indicator, and link to login.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {() => void} props.onSwitchToLogin
 */
export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => evaluateStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
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

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onSwitchToLogin();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header with Adinkra Nkyinkyim ("Twisting") - initiative, dynamism */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-teal/10 dark:bg-teal-900/30 flex items-center justify-center mb-3">
            {/* Stylized Adinkra Nkyinkyim symbol */}
            <svg
              className="w-8 h-8 text-brand-teal dark:text-teal-400"
              viewBox="0 0 40 40"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 20c0-3 2-6 5-7s6 0 7 3c1-3 4-4 7-3s5 4 5 7-2 6-5 7-6 0-7-3c-1 3-4 4-7 3s-5-4-5-7z" />
              <circle cx="20" cy="20" r="3" fill="white" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Join PozosPharma
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ghana&apos;s trusted AI pharmaceutical community
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

        {/* Username */}
        <div>
          <label
            htmlFor="register-username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Username
          </label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email Address
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow"
          />

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Strength:{" "}
                <span
                  className={`font-medium ${
                    strength.score <= 1
                      ? "text-red-500"
                      : strength.score === 2
                        ? "text-yellow-500"
                        : "text-emerald-500"
                  }`}
                >
                  {strength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            className={`w-full rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow ${
              confirmPassword && confirmPassword !== password
                ? "border-red-400 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {confirmPassword && confirmPassword !== password && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Create Account
        </Button>

        {/* Terms */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          By joining, you agree to our Terms of Service and Privacy Policy.
          Medical information is for educational purposes only.
        </p>

        {/* Switch to Login */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className="font-semibold text-brand-teal dark:text-teal-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-teal rounded"
          >
            Sign In
          </button>
        </p>
      </form>
    </Modal>
  );
}
