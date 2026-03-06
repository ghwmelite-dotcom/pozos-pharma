// --- Self-harm / suicide patterns ---
const DANGER_PATTERNS = [
  // Original patterns
  /how.*to.*overdose/i,
  /lethal.*dose/i,
  /kill.*myself.*with/i,
  /maximum.*dose.*to.*die/i,
  /how many.*pills.*to.*die/i,
  /want.*to.*end.*my.*life/i,
  /suicide.*with.*medication/i,
  /poison.*myself/i,
  // Expanded self-harm / suicide patterns
  /want\s+to\s+die/i,
  /want\s+to\s+kill\s+myself/i,
  /end\s+it\s+all/i,
  /no\s+reason\s+to\s+live/i,
  /harm\s+myself/i,
  /hurt\s+myself/i,
  /cut\s+myself/i,
  /best\s+way\s+to\s+die/i,
  /painless\s+death/i,
  /how\s+to\s+commit\s+suicide/i,
];

// --- Abuse / threat patterns ---
const ABUSE_PATTERNS = [
  /i('ll|.*will)\s+kill\s+you/i,
  /i('ll|.*will)\s+hurt\s+you/i,
  /i('ll|.*will)\s+find\s+you/i,
  /threaten/i,
  /where\s+do\s+you\s+live/i,
];

// --- Drug solicitation patterns ---
const SOLICITATION_PATTERNS = [
  /buy.*drugs.*illegally/i,
  /buy.*controlled\s+substances.*online/i,
  /fake\s+prescription/i,
  /sell\s+me\s+drugs/i,
  /get\s+high\s+on/i,
];

// --- Spam detection ---
export function detectSpam(text) {
  // All-caps message over 20 characters (ignore whitespace for the letter check)
  if (text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return { isSpam: true, reason: 'spam' };
  }
  // Same character repeated 10+ times in a row
  if (/(.)\1{9,}/.test(text)) {
    return { isSpam: true, reason: 'spam' };
  }
  return { isSpam: false };
}

// --- Response messages ---
const CRISIS_RESPONSE =
  "I'm concerned about your safety right now.\n\n" +
  "Please reach out for support:\n" +
  "🇬🇭 **Ghana Crisis Line:** 0800-111-222\n" +
  "🇬🇭 **Mental Health Authority:** 0302-662 358\n" +
  "🌍 **International:** findahelpline.com\n\n" +
  "A verified pharmacist from PozosPharma is also here " +
  "to talk — type **/pharmacist** to connect.\n\n" +
  "_Wo ho hia_ — You matter. 💚";

const ABUSE_RESPONSE =
  "Please keep our conversation respectful.\n\n" +
  "Threats and abusive language are not tolerated on this platform. " +
  "If you need help, I'm here — but let's communicate respectfully.";

const SOLICITATION_RESPONSE =
  "I can't help with obtaining medications illegally.\n\n" +
  "PozosPharma connects you with **licensed pharmacists** and " +
  "**verified pharmacies** so you can access medication safely and legally. " +
  "Type **/pharmacist** to speak with a professional.";

const SPAM_RESPONSE =
  "Please avoid spam. Send a clear message and I'll be happy to help.";

// --- Main filter ---
function matchesAny(text, patterns) {
  for (const pattern of patterns) {
    if (pattern.test(text)) return true;
  }
  return false;
}

export function filterMessage(text) {
  // 1. Self-harm / suicide — highest priority
  if (matchesAny(text, DANGER_PATTERNS)) {
    return { blocked: true, reason: 'safety', response: CRISIS_RESPONSE };
  }

  // 2. Abuse / threats
  if (matchesAny(text, ABUSE_PATTERNS)) {
    return { blocked: true, reason: 'abuse', response: ABUSE_RESPONSE };
  }

  // 3. Drug solicitation
  if (matchesAny(text, SOLICITATION_PATTERNS)) {
    return { blocked: true, reason: 'solicitation', response: SOLICITATION_RESPONSE };
  }

  // 4. Spam
  const spam = detectSpam(text);
  if (spam.isSpam) {
    return { blocked: true, reason: 'spam', response: SPAM_RESPONSE };
  }

  // 5. Nothing matched
  return { blocked: false };
}
