const DANGER_PATTERNS = [
  /how.*to.*overdose/i,
  /lethal.*dose/i,
  /kill.*myself.*with/i,
  /maximum.*dose.*to.*die/i,
  /how many.*pills.*to.*die/i,
  /want.*to.*end.*my.*life/i,
  /suicide.*with.*medication/i,
  /poison.*myself/i
];

export function filterMessage(text) {
  for (const pattern of DANGER_PATTERNS) {
    if (pattern.test(text)) {
      return {
        blocked: true,
        reason: 'safety',
        response:
          "I'm concerned about your safety right now.\n\n" +
          "Please reach out for support:\n" +
          "🇬🇭 **Ghana Crisis Line:** 0800-111-222\n" +
          "🇬🇭 **Mental Health Authority:** 0302-662 358\n" +
          "🌍 **International:** findahelpline.com\n\n" +
          "A verified pharmacist from PozosPharma is also here " +
          "to talk — type **/pharmacist** to connect.\n\n" +
          "_Wo ho hia_ — You matter. 💚"
      };
    }
  }
  return { blocked: false };
}
