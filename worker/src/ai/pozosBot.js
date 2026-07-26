import { getDrugContext, getHerbContext } from './drugRAG.js';

/**
 * Classify whether a user message requires the larger, more capable model.
 * Returns 'complex' or 'simple'.
 */
function classifyComplexity(message, historyLength) {
  const complexPatterns = [
    /interact/i, /combination/i, /mix.*with/i, /together.*with/i,
    /pregnan/i, /breastfeed/i, /child.*dose/i, /pediatric/i,
    /kidney|renal|liver|hepat/i, /overdose/i, /emergency/i,
    /switch.*from|alternative.*to|replace/i,
    /3.*medication|multiple.*drug/i, /chronic.*condition/i,
    /sickle.*cell/i, /hiv.*tb/i, /cancer|oncology/i
  ];

  const isComplex = complexPatterns.some(p => p.test(message)) || historyLength > 6;
  return isComplex ? 'complex' : 'simple';
}

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
11. NEVER state specific numeric dosages, mg/kg calculations, or definitive drug-interaction verdicts for a drug UNLESS that drug's data is supplied in the "drug database information" section below. If it is not supplied, say you have no verified local record for that drug, give only general non-dosing guidance, and route the user to a verified pharmacist. Do not fill dosing gaps from memory.

RESPONSE FORMAT:
- Use markdown headings (##) for multi-part answers
- Use bullet lists for side effects and interaction lists
- End complex answers with:
  "💊 Want to speak with a verified pharmacist? Type /pharmacist"
- Keep responses clear and concise
- Emoji use: 💊 ⚠️ ✅ 🔴 (use sparingly)

BRANDING: You represent PozosPharma. Always be professional, warm, and never alarmist.
Greet users warmly when they start a new session.`;

const EMERGENCY_KEYWORDS = [
  'overdose', 'took too many', "can't breathe", 'allergic reaction',
  'swollen throat', 'chest pain', 'unconscious', 'want to die',
  'kill myself with', 'stop breathing', 'not responding',
  'swallowed bleach', 'drank poison', 'took all my pills',
  'heart attack', 'seizure right now', 'bleeding won\'t stop'
];

// Room-specific context to make PozosBot responses relevant to the chatroom topic
const ROOM_CONTEXT = {
  'general': 'You are in the **General Questions** room. Answer any pharmaceutical question the user has — medications, dosages, side effects, availability in Ghana, etc.',
  'interactions': 'You are in the **Drug Interactions** room. Focus on drug-drug, drug-food, and drug-supplement interactions. Always assess combination safety, severity, and recommend alternatives when interactions are dangerous. Ask what other medications the user takes.',
  'chronic': 'You are in the **Chronic Conditions** room. Focus on long-term medication management for conditions like diabetes, hypertension, sickle cell disease, asthma, and HIV/AIDS — all common in Ghana. Discuss adherence, lifestyle, and monitoring.',
  'mental-health': 'You are in the **Mental Health Medications** room. Focus on antidepressants, anxiolytics, antipsychotics, and mental wellness support. Be compassionate and non-judgmental. Discuss side effects, tapering, and when to seek professional help.',
  'pediatric': 'You are in the **Children\'s Health** room. Focus on pediatric dosing, age-appropriate formulations (syrups, suspensions), weight-based calculations, and child safety. Always ask for the child\'s age and weight before giving dosing advice.',
  'womens-health': 'You are in the **Women\'s Health** room. Focus on contraceptives, hormonal therapy, pregnancy-safe medications, breastfeeding drug safety, and reproductive health. Reference Ghana FDA pregnancy categories when relevant.',
  'otc': 'You are in the **OTC Medications** room. Focus on non-prescription medicines available at Ghanaian pharmacies — pain relief, cold remedies, antacids, antihistamines, etc. Help users choose appropriate OTC options and know when to see a doctor.',
  'oncology': 'You are in the **Cancer Support** room. Focus on oncology medications, managing chemotherapy side effects, supportive care, and palliative medications. Be empathetic. Always recommend working closely with an oncologist.',
  'herbal': 'You are in the **Herbal & Traditional Medicine** room. Focus on traditional Ghanaian remedies (neem, moringa, prekese, etc.), herb-drug interactions, and evidence-based assessment of herbal claims. Warn about unverified claims while being culturally respectful.',
};

export async function getPozosResponse(userMessage, sessionHistory, env, { language = 'en', roomSlug = 'general' } = {}) {
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
  let languageInstruction = '';
  if (language === 'tw') {
    languageInstruction = "\n\nLANGUAGE: The user's preferred language is Twi. Respond primarily in Twi with English medical terms. Always keep drug names, dosages, and medical terminology in English for safety. Use Twi for conversational parts.";
  } else if (language === 'ga') {
    languageInstruction = "\n\nLANGUAGE: The user's preferred language is Ga. Respond primarily in Ga with English medical terms. Always keep drug names, dosages, and medical terminology in English for safety. Greet with 'Ogbeke!' and use Ga for conversational parts.";
  }

  // 2b. RAG — fetch relevant drug + herbal info from the database
  let drugContext = '';
  try {
    drugContext = await getDrugContext(userMessage, env);
  } catch (ragErr) {
    console.error('Drug RAG lookup failed:', ragErr.message);
    // Non-fatal — continue without drug context
  }

  let herbContext = '';
  try {
    herbContext = await getHerbContext(userMessage, env);
  } catch (ragErr) {
    console.error('Herb RAG lookup failed:', ragErr.message);
    // Non-fatal — continue without herbal context
  }

  // Inject room-specific context
  const roomContext = ROOM_CONTEXT[roomSlug] || ROOM_CONTEXT['general'];

  let systemContent = SYSTEM_PROMPT + `\n\nROOM CONTEXT: ${roomContext}` + languageInstruction;
  if (drugContext) {
    systemContent += `\n\nThe following drug database information was retrieved for this question. Treat it as the source of truth for these specific drugs and, where an entry includes a source reference, cite it. Do NOT describe this data as "verified" unless the entry shows it was reviewed by a pharmacist:\n${drugContext}`;
  } else {
    systemContent += `\n\nNo matching drug entries were found in the PozosPharma database for this question. Per rule 11, do NOT provide specific numeric dosages, mg/kg calculations, or definitive interaction verdicts from memory. Give only general, non-dosing guidance, state clearly that you have no verified local record for this drug, and recommend the user confirm with a verified pharmacist (type /pharmacist).`;
  }

  if (herbContext) {
    systemContent += `\n\nThe following HERBAL / traditional medicine information was retrieved for this question. Use it, but follow these rules: (a) always state the evidence_level and do NOT present traditional use as proven treatment; (b) prominently warn about any herb-drug interactions and safety concerns listed; (c) be culturally respectful of traditional Ghanaian medicine while being honest about what is and isn't proven; (d) for any serious condition (e.g. malaria, high blood pressure, diabetes, pregnancy), advise the user not to rely on herbs alone and to consult a pharmacist or doctor:\n${herbContext}`;
  }

  const messages = [
    { role: 'system', content: systemContent },
    ...sessionHistory.slice(-10).map(m => ({
      role: m.sender_type === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ];

  // 3. Smart model routing based on complexity
  const complexity = classifyComplexity(userMessage, sessionHistory.length);

  let aiText = '';
  let modelUsed;
  let maxTokens;

  if (complexity === 'complex') {
    modelUsed = env.AI_COMPLEX_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    maxTokens = 1500;
  } else {
    modelUsed = env.AI_PRIMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct';
    maxTokens = 1024;
  }

  try {
    const response = await env.AI.run(modelUsed, {
      messages,
      max_tokens: maxTokens,
      temperature: 0.4,
      top_p: 0.9
    });
    aiText = response.response;
  } catch (primaryErr) {
    console.error(`Primary model (${modelUsed}) failed:`, primaryErr.message);
    // 4. Fallback chain: try the other primary, then the fallback model
    const fallbackModels = [
      complexity === 'complex'
        ? (env.AI_PRIMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct')
        : (env.AI_COMPLEX_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast'),
      env.AI_FALLBACK_MODEL || '@cf/mistral/mistral-7b-instruct-v0.1'
    ];

    let recovered = false;
    for (const fbModel of fallbackModels) {
      try {
        const fallback = await env.AI.run(fbModel, {
          messages,
          max_tokens: 1024,
          temperature: 0.4
        });
        aiText = fallback.response;
        modelUsed = fbModel;
        recovered = true;
        break;
      } catch (fbErr) {
        console.error(`Fallback model (${fbModel}) failed:`, fbErr.message);
      }
    }

    if (!recovered) {
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
