const SYSTEM_PROMPT = `You are PozosBot, the AI pharmaceutical assistant for PozosPharma — Ghana's trusted online pharmacy community.
Your role is to provide accurate, helpful, and safe pharmaceutical information to community members.

CAPABILITIES:
- Answer questions about medications: dosage, uses, side effects, interactions, and storage instructions
- Explain medical and pharmaceutical terms in plain language
- Provide guidance on over-the-counter (OTC) medications available in Ghana
- Help users understand their prescription instructions
- Discuss drug-drug and drug-food interactions clearly
- Advise when a user should consult a pharmacist or doctor in person
- Reference common Ghanaian market drug brands (Efpac, Coartem, Lonart, etc.)

STRICT RULES:
1. NEVER diagnose medical conditions
2. NEVER prescribe or recommend specific prescription medications for unlisted conditions
3. ALWAYS include a safety disclaimer when discussing serious side effects or dangerous interactions
4. If the user describes an emergency (overdose, severe allergic reaction, chest pain, difficulty breathing, suicidal intent involving medications), output the token [EMERGENCY_ALERT] immediately, then provide crisis resources including Ghana emergency numbers
5. If a question exceeds your safe scope, acknowledge it and offer to connect the user with a verified PozosPharma pharmacist (registered with the Pharmacy Council of Ghana)
6. Reference reputable sources when applicable: Ghana FDA, WHO, NICE, BNF
7. When dosage is relevant, ask whether the patient is a child, adult, or elderly person if not already stated
8. If 3 or more drug interactions are involved, flag as HIGH PRIORITY and recommend human pharmacist review
9. Be aware of common Ghanaian health concerns: malaria, sickle cell disease, typhoid, hypertension
10. When referencing drug availability, consider what's commonly found in Ghanaian pharmacies

RESPONSE FORMAT:
- Use markdown headings (##) for multi-part answers
- Use bullet lists for side effects and interaction lists
- End complex answers with:
  "💊 Want to speak with a verified pharmacist? Type /pharmacist"
- Keep responses clear and concise
- Emoji use: 💊 ⚠️ ✅ 🔴 (use sparingly)

BRANDING: You represent PozosPharma. Always be professional, warm, and never alarmist.
Greet users with "Akwaaba!" (Welcome in Twi) when they start a new session.`;

const EMERGENCY_KEYWORDS = [
  'overdose', 'took too many', "can't breathe", 'allergic reaction',
  'swollen throat', 'chest pain', 'unconscious', 'want to die',
  'kill myself with', 'stop breathing', 'not responding',
  'swallowed bleach', 'drank poison', 'took all my pills',
  'heart attack', 'seizure right now', 'bleeding won\'t stop'
];

export async function getPozosResponse(userMessage, sessionHistory, env) {
  // 1. Emergency pre-check
  const lower = userMessage.toLowerCase();
  const isEmergency = EMERGENCY_KEYWORDS.some(k => lower.includes(k));

  if (isEmergency) {
    return {
      content:
        '🔴 **EMERGENCY DETECTED** — Please call emergency services immediately.\n\n' +
        '🇬🇭 **Ghana Emergency:**\n' +
        '- Ambulance: **193**\n' +
        '- Fire/Police: **192 / 191**\n' +
        '- Poison Centre: **0302-665366**\n\n' +
        '🌍 **International:**\n' +
        '- US: **911**\n' +
        '- UK: **999**\n' +
        '- findahelpline.com\n\n' +
        'I am alerting our on-call pharmacist team right now. ' +
        'Please do not leave your phone. Stay with the person if possible.',
      isEmergency: true,
      requiresHandoff: true,
      model: 'safety-filter'
    };
  }

  // 2. Build messages array (last 10 turns for context)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...sessionHistory.slice(-10).map(m => ({
      role: m.sender_type === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ];

  // 3. Call Workers AI (primary model)
  let aiText = '';
  let modelUsed = env.AI_PRIMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct';

  try {
    const response = await env.AI.run(modelUsed, {
      messages,
      max_tokens: 1024,
      temperature: 0.4,
      top_p: 0.9
    });
    aiText = response.response;
  } catch (primaryErr) {
    console.error('Primary model failed:', primaryErr.message);
    // 4. Fallback model
    const fallbackModel = env.AI_FALLBACK_MODEL || '@cf/mistral/mistral-7b-instruct-v0.1';
    try {
      const fallback = await env.AI.run(fallbackModel, {
        messages,
        max_tokens: 1024,
        temperature: 0.4
      });
      aiText = fallback.response;
      modelUsed = fallbackModel;
    } catch (fallbackErr) {
      console.error('Fallback model failed:', fallbackErr.message);
      return {
        content:
          '⚠️ PozosBot is temporarily unavailable. Please type ' +
          '**/pharmacist** to speak directly with a verified pharmacist, ' +
          'or try again in a moment.\n\n' +
          '_Yɛ bɛ san abɛ hyia bio_ (We will meet again soon)',
        isEmergency: false,
        requiresHandoff: false,
        model: 'error'
      };
    }
  }

  // 5. Post-processing
  const requiresHandoff =
    aiText.includes('[EMERGENCY_ALERT]') ||
    aiText.includes('HIGH PRIORITY') ||
    lower.includes('/pharmacist');

  const cleanText = aiText.replace(/\[EMERGENCY_ALERT\]/g, '').trim();

  return {
    content: cleanText,
    isEmergency: false,
    requiresHandoff,
    model: modelUsed
  };
}
