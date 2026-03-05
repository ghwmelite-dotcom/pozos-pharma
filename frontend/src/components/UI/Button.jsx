import { forwardRef } from "react";

/**
 * PozosPharma Button Component
 *
 * Reusable button with brand variants, sizes, loading state, and dark mode support.
 *
 * @param {object} props
 * @param {"primary"|"secondary"|"danger"|"outline"|"ghost"} [props.variant="primary"]
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    children,
    className = "",
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-dark select-none";

  const variantClasses = {
    primary:
      "bg-brand-indigo text-white hover:bg-indigo-600 active:bg-indigo-700 focus:ring-brand-indigo shadow-sm hover:shadow-md disabled:bg-indigo-300 dark:disabled:bg-indigo-800 dark:disabled:text-indigo-400",
    secondary:
      "bg-brand-teal text-white hover:bg-teal-600 active:bg-teal-700 focus:ring-brand-teal shadow-sm hover:shadow-md disabled:bg-teal-300 dark:disabled:bg-teal-800 dark:disabled:text-teal-400",
    danger:
      "bg-brand-danger text-white hover:bg-red-600 active:bg-red-700 focus:ring-brand-danger shadow-sm hover:shadow-md disabled:bg-red-300 dark:disabled:bg-red-800 dark:disabled:text-red-400",
    outline:
      "border-2 border-brand-indigo text-brand-indigo bg-transparent hover:bg-indigo-50 active:bg-indigo-100 focus:ring-brand-indigo dark:text-indigo-300 dark:border-indigo-400 dark:hover:bg-indigo-950 dark:active:bg-indigo-900 disabled:border-gray-300 disabled:text-gray-400 dark:disabled:border-gray-600 dark:disabled:text-gray-500",
    ghost:
      "text-brand-indigo bg-transparent hover:bg-indigo-50 active:bg-indigo-100 focus:ring-brand-indigo dark:text-indigo-300 dark:hover:bg-indigo-950 dark:active:bg-indigo-900 disabled:text-gray-400 dark:disabled:text-gray-500",
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    isDisabled ? "cursor-not-allowed opacity-75" : "cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

export default Button;
