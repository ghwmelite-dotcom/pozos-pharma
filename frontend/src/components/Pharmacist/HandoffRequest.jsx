import { useState } from "react";
import Button from "../UI/Button";

const URGENCY_OPTIONS = [
  {
    value: "normal",
    label: "Normal",
    description: "General question, no rush",
    color: "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    selectedColor: "border-green-500 bg-green-100 dark:bg-green-900/40 ring-2 ring-green-400",
    dotColor: "bg-green-500",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Need timely professional advice",
    color: "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    selectedColor: "border-amber-500 bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-400",
    dotColor: "bg-amber-500",
  },
  {
    value: "emergency",
    label: "Emergency",
    description: "Possible adverse reaction or safety concern",
    color: "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    selectedColor: "border-red-500 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-400 animate-pulse",
    dotColor: "bg-red-500",
  },
];

/**
 * PozosPharma Handoff Request Form
 *
 * Form to request a pharmacist handoff from the AI chat session.
 * Includes urgency level selection, reason textarea, and AI conversation summary.
 *
 * @param {object} props
 * @param {string} props.sessionId
 * @param {string} [props.aiSummary] - AI-generated summary of the conversation
 * @param {(data: { sessionId: string, urgency: string, reason: string }) => Promise<void>} props.onSubmit
 * @param {() => void} props.onCancel
 */
export default function HandoffRequest({ sessionId, aiSummary, onSubmit, onCancel }) {
  const [urgency, setUrgency] = useState("normal");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please describe your reason for requesting a pharmacist.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ sessionId, urgency, reason: reason.trim() });
    } catch (err) {
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-warm-50 dark:bg-surface-card-dark rounded-xl border border-warm-200/60 dark:border-gray-700 shadow-lg p-5 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-emerald/10 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-brand-emerald dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Request Pharmacist
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connect with a verified pharmacist for professional guidance
            </p>
          </div>
        </div>

        {/* Ghana flag accent */}
        <div className="h-0.5 w-full rounded-full overflow-hidden flex">
          <div className="flex-1 bg-ghana-red" />
          <div className="flex-1 bg-ghana-gold" />
          <div className="flex-1 bg-ghana-green" />
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Urgency Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Urgency Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setUrgency(opt.value)}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-center ${
                  urgency === opt.value ? opt.selectedColor : opt.color
                } hover:shadow-sm cursor-pointer`}
                aria-pressed={urgency === opt.value}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor}`} aria-hidden="true" />
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-[10px] leading-tight opacity-80">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Conversation Summary */}
        {aiSummary && (
          <div className="rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-brand-teal" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 2a1 1 0 011 1v1.07A7.002 7.002 0 0117 11v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2a7.002 7.002 0 016-6.93V3a1 1 0 011-1z" />
              </svg>
              <span className="text-xs font-semibold text-brand-teal dark:text-teal-400">
                AI Conversation Summary
              </span>
            </div>
            <p className="text-xs text-teal-800 dark:text-teal-200 leading-relaxed">
              {aiSummary}
            </p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label
            htmlFor="handoff-reason"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Reason for Request
          </label>
          <textarea
            id="handoff-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe why you'd like to speak with a pharmacist..."
            rows={3}
            required
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-shadow resize-none"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            This information will be shared with the pharmacist to provide better help.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="flex-1"
          >
            Submit Request
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
          For life-threatening emergencies, call Ghana Emergency Services: 112 / 193
        </p>
      </form>
    </div>
  );
}
