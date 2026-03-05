/**
 * PozosPharma Client-Side Safety Filter
 *
 * Pre-filters user input to detect crisis/danger patterns BEFORE sending
 * to the API. Shows immediate crisis resources to the user when matched.
 *
 * This mirrors the backend DANGER_PATTERNS to provide instant client-side
 * feedback without network latency.
 */

// ── Danger Patterns ───────────────────────────────────────────
// Keep in sync with the backend safety filter

const DANGER_PATTERNS = [
  // Suicidal ideation
  /\b(want|going|plan(?:ning)?|try(?:ing)?|going)\s+to\s+(kill|end|harm)\s+(myself|my\s*life|it\s*all)\b/i,
  /\b(sui[c]ide|suicidal|end\s+(?:my|it)\s+(?:life|all))\b/i,
  /\b(don'?t|do\s*not)\s+want\s+to\s+(live|be\s+alive|exist)\b/i,

  // Self-harm
  /\b(cut(?:ting)?\s+my(?:self)?|self[\s-]*harm|hurt(?:ing)?\s+my(?:self)?)\b/i,

  // Overdose intent
  /\b(overdose|od|take\s+(?:all|too\s+many|extra)\s+(?:pills?|tablets?|medication|medicine|drugs?))\b/i,
  /\b(poison(?:ing)?\s+(?:myself|me))\b/i,

  // Dangerous drug combinations or misuse intent
  /\b(mix(?:ing)?|combine?(?:ing)?)\s+.{0,30}(with\s+alcohol|to\s+(?:get\s+high|overdose|die))\b/i,

  // Harm to others
  /\b(kill|poison|harm|hurt)\s+(?:someone|(?:him|her|them|my\s+(?:child|baby|family)))\b/i,

  // Abuse disclosure
  /\b(being?\s+(?:abused|beaten|raped|assaulted|molested))\b/i,
];

// ── Crisis Resources ──────────────────────────────────────────

const CRISIS_RESOURCES = {
  title: "If you or someone you know is in immediate danger, please reach out:",
  contacts: [
    {
      name: "Ghana National Ambulance Service",
      number: "112 / 193",
      description: "Emergency services",
    },
    {
      name: "Ghana Health Service Helpline",
      number: "0800-000-000",
      description: "Health support and guidance",
    },
    {
      name: "Mental Health Authority Ghana",
      number: "+233 302 662 709",
      description: "Mental health crisis support",
    },
    {
      name: "Befrienders Worldwide (International)",
      number: "www.befrienders.org",
      description: "Find a helpline near you",
    },
  ],
  closingMessage:
    "You are not alone. Wo nkoa na wo nni saa (You are not the only one in this). " +
    "Please contact a healthcare professional or call emergency services immediately.",
};

// ── Filter Function ───────────────────────────────────────────

/**
 * Check user input against danger patterns.
 *
 * @param {string} text - The user's message content
 * @returns {{ blocked: boolean, message: string | null, resources: object | null }}
 *   - blocked: true if the message matches a danger pattern
 *   - message: A compassionate warning message if blocked, null otherwise
 *   - resources: Crisis resource info if blocked, null otherwise
 */
export function checkSafetyFilter(text) {
  if (!text || typeof text !== "string") {
    return { blocked: false, message: null, resources: null };
  }

  const normalised = text.trim().toLowerCase();

  // Skip very short inputs that are unlikely to be genuine matches
  if (normalised.length < 5) {
    return { blocked: false, message: null, resources: null };
  }

  for (const pattern of DANGER_PATTERNS) {
    if (pattern.test(text)) {
      return {
        blocked: true,
        message:
          "We care about your safety. It looks like you or someone may be in distress. " +
          "Please reach out to one of the crisis resources below. " +
          "Your message will still be processed by a pharmacist for medical guidance.",
        resources: CRISIS_RESOURCES,
      };
    }
  }

  return { blocked: false, message: null, resources: null };
}

/**
 * Format crisis resources into a readable string (e.g., for display in chat).
 *
 * @param {object} resources - The CRISIS_RESOURCES object
 * @returns {string} Formatted multi-line string
 */
export function formatCrisisResources(resources) {
  if (!resources) return "";

  const lines = [resources.title, ""];
  for (const contact of resources.contacts) {
    lines.push(`- ${contact.name}: ${contact.number}`);
    lines.push(`  ${contact.description}`);
  }
  lines.push("");
  lines.push(resources.closingMessage);
  return lines.join("\n");
}

export { DANGER_PATTERNS, CRISIS_RESOURCES };
