/**
 * PozosPharma Message Formatting Utilities
 *
 * - Relative timestamps ("just now", "2m ago", etc.)
 * - Markdown-lite parsing (bold, headings, bullet lists, drug name highlighting)
 */

// ── Relative Time Formatting ──────────────────────────────────

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Format a timestamp as a human-readable relative string.
 *
 * @param {string | number | Date} timestamp - ISO string, Unix ms, or Date
 * @returns {string} Relative time string (e.g., "just now", "2m ago", "3h ago")
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return "";

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < 0) return "just now"; // future timestamps treated as now

  if (diff < 30 * SECOND) return "just now";
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;

  // Beyond a week, show the date
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format a timestamp as a short time string for chat messages (e.g., "2:34 PM").
 *
 * @param {string | number | Date} timestamp
 * @returns {string}
 */
export function formatMessageTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Markdown-lite Parsing ─────────────────────────────────────

/**
 * Common pharmaceutical drug names for highlighting.
 * This list can be extended or fetched from the backend.
 */
const COMMON_DRUG_NAMES = [
  "paracetamol", "acetaminophen", "ibuprofen", "amoxicillin", "metformin",
  "amlodipine", "omeprazole", "atorvastatin", "ciprofloxacin", "azithromycin",
  "doxycycline", "metronidazole", "diclofenac", "prednisolone", "artemether",
  "lumefantrine", "chloroquine", "artesunate", "quinine", "sulfadoxine",
  "pyrimethamine", "albendazole", "mebendazole", "cotrimoxazole", "fluconazole",
  "cetirizine", "loratadine", "salbutamol", "insulin", "lisinopril",
  "hydrochlorothiazide", "aspirin", "warfarin", "clopidogrel", "erythromycin",
  "gentamicin", "penicillin", "tetracycline", "nifedipine", "captopril",
];

// Build a regex pattern from drug names (case-insensitive, word boundaries)
const drugPattern = new RegExp(
  `\\b(${COMMON_DRUG_NAMES.join("|")})\\b`,
  "gi"
);

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Parse a plain text message into HTML with markdown-lite formatting.
 *
 * Supports:
 * - **bold** text
 * - # Headings (h3), ## Subheadings (h4)
 * - Bullet lists (lines starting with - or *)
 * - Drug name highlighting in monospace
 * - Line breaks
 *
 * @param {string} text - Raw message text
 * @returns {string} HTML string safe for dangerouslySetInnerHTML
 */
export function parseMessageContent(text) {
  if (!text) return "";

  const lines = text.split("\n");
  const htmlLines = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Close list if this line is not a bullet
    if (inList && !trimmed.match(/^[-*]\s/)) {
      htmlLines.push("</ul>");
      inList = false;
    }

    // Headings
    if (trimmed.startsWith("## ")) {
      htmlLines.push(
        `<h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1">${formatInline(escapeHtml(trimmed.slice(3)))}</h4>`
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      htmlLines.push(
        `<h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-2 mb-1">${formatInline(escapeHtml(trimmed.slice(2)))}</h3>`
      );
      continue;
    }

    // Bullet lists
    if (trimmed.match(/^[-*]\s/)) {
      if (!inList) {
        htmlLines.push('<ul class="list-disc list-inside space-y-0.5 ml-2">');
        inList = true;
      }
      htmlLines.push(
        `<li class="text-sm">${formatInline(escapeHtml(trimmed.slice(2)))}</li>`
      );
      continue;
    }

    // Empty lines
    if (trimmed === "") {
      htmlLines.push("<br />");
      continue;
    }

    // Regular paragraph
    htmlLines.push(`<p class="text-sm">${formatInline(escapeHtml(trimmed))}</p>`);
  }

  // Close any open list
  if (inList) {
    htmlLines.push("</ul>");
  }

  return htmlLines.join("\n");
}

/**
 * Format inline elements: bold and drug name highlighting.
 * Expects pre-escaped HTML.
 *
 * @param {string} html - HTML-escaped text
 * @returns {string}
 */
function formatInline(html) {
  // Bold: **text**
  let result = html.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-semibold">$1</strong>'
  );

  // Drug names: highlight in monospace
  result = result.replace(
    drugPattern,
    '<code class="drug-highlight">$1</code>'
  );

  return result;
}

/**
 * Strip all formatting and return plain text (useful for previews/notifications).
 *
 * @param {string} text - Raw message text
 * @returns {string} Plain text without markdown
 */
export function stripFormatting(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,2}\s/gm, "")
    .replace(/^[-*]\s/gm, "")
    .trim();
}
