import { useEffect, useRef, useCallback } from "react";

/**
 * PozosPharma Modal Component
 *
 * Accessible modal dialog with backdrop, animated entrance, escape-key close,
 * and focus trap concept. Supports dark mode.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 * @param {React.ReactNode} props.children
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
}) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Small delay to allow animation to start
      const timer = setTimeout(() => {
        dialogRef.current?.focus();
      }, 50);

      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = "hidden";

      return () => {
        clearTimeout(timer);
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        // Restore previous focus
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  // Click on overlay (outside dialog) to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        className={`
          relative w-full ${sizeClasses[size] || sizeClasses.md}
          bg-white dark:bg-surface-card-dark
          rounded-2xl shadow-2xl
          border border-gray-200 dark:border-gray-700
          animate-[scaleIn_200ms_ease-out]
          focus:outline-none
        `}
        style={{
          animationFillMode: "both",
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-indigo"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>

      {/* Inline keyframe styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
