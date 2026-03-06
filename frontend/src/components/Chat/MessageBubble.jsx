import Badge from "../UI/Badge";
import {
  formatRelativeTime,
  parseMessageContent,
} from "../../utils/formatMessage";

/**
 * PozosPharma Message Bubble Component
 *
 * Renders a single chat message with distinct styles for user, AI, and pharmacist.
 *
 * @param {object} props
 * @param {object} props.message
 * @param {string} props.message.id
 * @param {string} props.message.content
 * @param {"user"|"ai"|"pharmacist"} props.message.senderType
 * @param {string} props.message.sender
 * @param {string} props.message.timestamp
 * @param {string} [props.message.model] - AI model name
 * @param {string} [props.message.badgeLevel] - Pharmacist badge level
 * @param {boolean} [props.message.isEmergency]
 * @param {string[]} [props.message.drugRefs] - Drug names referenced
 * @param {number} [props.message.rating] - Pharmacist star rating
 * @param {string} [props.message.countryFlag] - Pharmacist country flag emoji
 */
export default function MessageBubble({ message }) {
  const {
    id,
    content,
    senderType = "user",
    sender,
    timestamp,
    model,
    badgeLevel,
    isEmergency,
    drugRefs,
    rating,
    countryFlag,
    status,
    onRetry,
  } = message;

  const parsedContent = parseMessageContent(content);
  const relativeTime = formatRelativeTime(timestamp);

  if (senderType === "user") {
    return (
      <UserBubble
        id={id}
        sender={sender}
        content={parsedContent}
        rawContent={content}
        relativeTime={relativeTime}
        isEmergency={isEmergency}
        drugRefs={drugRefs}
        status={status}
        onRetry={onRetry}
      />
    );
  }

  if (senderType === "ai") {
    return (
      <AIBubble
        id={id}
        sender={sender}
        content={parsedContent}
        rawContent={content}
        relativeTime={relativeTime}
        model={model}
        isEmergency={isEmergency}
        drugRefs={drugRefs}
      />
    );
  }

  if (senderType === "pharmacist") {
    return (
      <PharmacistBubble
        id={id}
        sender={sender}
        content={parsedContent}
        rawContent={content}
        relativeTime={relativeTime}
        badgeLevel={badgeLevel}
        isEmergency={isEmergency}
        drugRefs={drugRefs}
        rating={rating}
        countryFlag={countryFlag}
      />
    );
  }

  // System / fallback
  return (
    <div className="flex justify-center my-2" aria-label="System message">
      <span className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-1 bg-warm-100 dark:bg-gray-800/50 rounded-full">
        {content}
      </span>
    </div>
  );
}

/* ── User Bubble (right-aligned) ───────────────────────────────── */

function UserBubble({ id, sender, content, relativeTime, isEmergency, status, onRetry }) {
  return (
    <div
      className="flex justify-end mb-3 px-2"
      data-message-id={id}
    >
      <div className="max-w-[80%] sm:max-w-[70%]">
        {/* Sender + time */}
        <div className="flex items-center justify-end gap-2 mb-1">
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {relativeTime}
          </span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {sender || "You"}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`
            relative px-4 py-2.5 rounded-2xl rounded-br-md
            bg-brand-indigo text-white
            shadow-sm
            ${isEmergency ? "ring-2 ring-red-500 ring-offset-2 dark:ring-offset-surface-dark" : ""}
          `}
        >
          {isEmergency && <EmergencyPulse />}
          <div
            className="text-sm leading-relaxed [&_code.drug-highlight]:font-mono [&_code.drug-highlight]:bg-warm-50/20 [&_code.drug-highlight]:px-1 [&_code.drug-highlight]:rounded [&_code.drug-highlight]:text-indigo-100"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tail */}
          <div
            className="absolute bottom-0 right-[-6px] w-3 h-3 bg-brand-indigo"
            style={{
              clipPath: "polygon(0 0, 0% 100%, 100% 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        {status === 'failed' && (
          <div className="flex items-center justify-end gap-2 mt-1">
            <span className="text-[11px] text-red-500">Failed to send</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-[11px] font-medium text-brand-indigo hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── AI Bubble (left-aligned, Adinkra pattern) ─────────────────── */

function AIBubble({ id, sender, content, relativeTime, model, isEmergency }) {
  return (
    <div
      className="flex justify-start mb-3 px-2"
      data-message-id={id}
    >
      <div className="max-w-[80%] sm:max-w-[70%]">
        {/* Sender + badge + time */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {sender || "PozosBot"}
          </span>
          <Badge type="ai" label="AI" />
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {relativeTime}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`
            relative px-4 py-2.5 rounded-2xl rounded-bl-md
            bg-warm-50 dark:bg-surface-card-dark
            border border-warm-200/60 dark:border-gray-700
            shadow-sm
            bg-kente-pattern
            ${isEmergency ? "ring-2 ring-red-500 ring-offset-2 dark:ring-offset-surface-dark" : ""}
          `}
          title={model ? `Model: ${model}` : undefined}
        >
          {isEmergency && <EmergencyPulse />}
          <div
            className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 [&_code.drug-highlight]:font-mono [&_code.drug-highlight]:bg-teal-100 [&_code.drug-highlight]:dark:bg-teal-900/40 [&_code.drug-highlight]:text-brand-teal [&_code.drug-highlight]:dark:text-teal-300 [&_code.drug-highlight]:px-1 [&_code.drug-highlight]:rounded"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Model tooltip indicator */}
          {model && (
            <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 italic">
              via {model}
            </span>
          )}

          {/* Tail */}
          <div
            className="absolute bottom-0 left-[-6px] w-3 h-3 bg-warm-50 dark:bg-surface-card-dark border-l border-b border-warm-200/60 dark:border-gray-700"
            style={{
              clipPath: "polygon(100% 0, 0% 100%, 100% 100%)",
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Pharmacist Bubble (left-aligned, emerald tint) ────────────── */

function PharmacistBubble({
  id,
  sender,
  content,
  relativeTime,
  badgeLevel,
  isEmergency,
  rating,
  countryFlag,
}) {
  return (
    <div
      className="flex justify-start mb-3 px-2"
      data-message-id={id}
    >
      <div className="max-w-[80%] sm:max-w-[70%]">
        {/* Sender + badge + rating + flag + time */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {sender || "Pharmacist"}
          </span>
          <Badge type="verified" label={badgeLevel || "Verified Pharmacist"} />
          {rating != null && <StarRating rating={rating} />}
          {countryFlag && (
            <span className="text-sm" aria-label="Country flag">
              {countryFlag}
            </span>
          )}
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {relativeTime}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`
            relative px-4 py-2.5 rounded-2xl rounded-bl-md
            bg-emerald-50 dark:bg-emerald-950/30
            border border-emerald-200 dark:border-emerald-800
            shadow-sm
            ${isEmergency ? "ring-2 ring-red-500 ring-offset-2 dark:ring-offset-surface-dark" : ""}
          `}
        >
          {isEmergency && <EmergencyPulse />}
          <div
            className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 [&_code.drug-highlight]:font-mono [&_code.drug-highlight]:bg-emerald-100 [&_code.drug-highlight]:dark:bg-emerald-900/40 [&_code.drug-highlight]:text-emerald-700 [&_code.drug-highlight]:dark:text-emerald-300 [&_code.drug-highlight]:px-1 [&_code.drug-highlight]:rounded"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tail */}
          <div
            className="absolute bottom-0 left-[-6px] w-3 h-3 bg-emerald-50 dark:bg-emerald-950/30 border-l border-b border-emerald-200 dark:border-emerald-800"
            style={{
              clipPath: "polygon(100% 0, 0% 100%, 100% 100%)",
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Emergency Pulse Indicator ─────────────────────────────────── */

function EmergencyPulse() {
  return (
    <span
      className="absolute -top-1 -right-1 flex h-3 w-3"
      aria-label="Emergency"
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  );
}

/* ── Star Rating ───────────────────────────────────────────────── */

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <span
      className="inline-flex items-center gap-0.5 text-amber-500"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) {
          return (
            <svg
              key={i}
              className="w-3 h-3"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        }
        if (i === fullStars && hasHalf) {
          return (
            <svg
              key={i}
              className="w-3 h-3 text-amber-300"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        }
        return (
          <svg
            key={i}
            className="w-3 h-3 text-gray-300 dark:text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
      <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-0.5">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}
