# AI Pharmacy Tutor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a freemium AI pharmacy tutor chat page at `/ai-tutor` powered by Cloudflare Workers AI (Llama 3.3 70B), with Paystack subscriptions (GHS 50/mo), subject/difficulty pickers, exam prep mode, voice input, and chat history.

**Architecture:** New route handler `worker/src/routes/tutor.js` with endpoints for chat, history, usage tracking, and Paystack subscription management. New D1 tables for conversations, messages, subscriptions, and usage. Frontend page `AITutor.jsx` with chat UI following existing Adinkra Gold design system. Auth uses existing JWT middleware from `worker/src/middleware/auth.js`.

**Tech Stack:** Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`), D1 (SQLite), Paystack Inline JS + webhooks, Web Speech API, React 18, Tailwind CSS, Zustand.

---

### Task 1: Database Schema — New Tutor Tables

**Files:**
- Create: `worker/src/migrations/tutor-tables.sql`
- Modify: `schema.sql` (append new tables)

**Step 1: Write the migration SQL**

Create `worker/src/migrations/tutor-tables.sql`:

```sql
-- AI Tutor tables
CREATE TABLE IF NOT EXISTS tutor_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'year1',
  title TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES tutor_conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
  paystack_sub_code TEXT,
  paystack_customer_code TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  question_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_tutor_conv_user ON tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conv_updated ON tutor_conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_conv ON tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_created ON tutor_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_tutor_sub_user ON tutor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_usage_user_date ON tutor_usage(user_id, date);
```

**Step 2: Append to schema.sql**

Add the same SQL block at the end of `schema.sql` (after the drug seed data) so the schema file remains the single source of truth.

**Step 3: Run migration against D1**

```bash
cd pozospharma/worker
npx wrangler d1 execute pozospharma-db --remote --file=src/migrations/tutor-tables.sql
```

Expected: Tables created successfully.

**Step 4: Commit**

```bash
git add worker/src/migrations/tutor-tables.sql schema.sql
git commit -m "feat(tutor): add D1 tables for conversations, messages, subscriptions, usage"
```

---

### Task 2: Tutor AI Module — System Prompt & Chat Logic

**Files:**
- Create: `worker/src/ai/pharmacyTutor.js`

**Step 1: Create the tutor AI module**

This module exports `getTutorResponse(message, history, env, options)` similar to the existing `getPozosResponse` in `worker/src/ai/pozosBot.js`, but with:
- Subject-specific system prompt sections
- Difficulty level adjustments
- Exam prep mode (generates MCQs when toggled)
- Always uses `@cf/meta/llama-3.3-70b-instruct-fp8-fast`

```javascript
// worker/src/ai/pharmacyTutor.js

const SUBJECTS = {
  pharmacology: "Pharmacology (drug mechanisms, pharmacokinetics, pharmacodynamics, drug classes)",
  pharmaceutics: "Pharmaceutics (drug formulation, dosage forms, drug delivery systems, compounding)",
  clinical: "Clinical Pharmacy (patient care, therapeutic drug monitoring, clinical decision-making)",
  pharmacognosy: "Pharmacognosy (natural products, medicinal plants, phytochemistry, herbal medicines)",
  practice: "Pharmacy Practice (dispensing, counselling, pharmacy law, ethics, Ghana Pharmacy Council regulations)",
  chemistry: "Pharmaceutical Chemistry (medicinal chemistry, drug design, structure-activity relationships, analytical chemistry)",
  general: "General Pharmacy (all topics)"
};

const DIFFICULTY_PROMPTS = {
  year1: "Explain concepts as if speaking to a first-year pharmacy student. Use simple language, define all technical terms, give relatable analogies. Build from the basics.",
  final_year: "Explain at the level of a final-year pharmacy student preparing for licensing exams. Assume foundational knowledge. Focus on clinical relevance, integration across topics, and exam-style reasoning.",
  practicing: "Address the user as a practicing pharmacist. Be concise and clinical. Focus on practical application, guidelines, evidence-based updates, and Ghana-specific practice context.",
  researcher: "Address the user as a pharmacy researcher or PhD candidate. Use precise scientific language, cite mechanisms at molecular level, discuss current research frontiers, and reference recent literature."
};

const BASE_SYSTEM_PROMPT = `You are the PozosPharma AI Pharmacy Tutor — an expert pharmacy educator specializing in pharmaceutical sciences with deep knowledge of Ghana's healthcare system.

ROLE: You are a patient, encouraging tutor. Your goal is to help the student truly understand concepts, not just memorize facts.

GHANA CONTEXT:
- Reference Ghana FDA regulations, Pharmacy Council of Ghana standards
- Use drugs commonly available in Ghanaian pharmacies (Coartem, Efpac, Lonart, etc.)
- Reference Ghanaian institutions (KNUST, UG School of Pharmacy, UHAS, Korle Bu)
- Consider Ghana's disease burden: malaria, sickle cell, hypertension, diabetes, typhoid
- Reference the Ghana Essential Medicines List and Standard Treatment Guidelines

TEACHING APPROACH:
- Break complex topics into digestible parts
- Use clinical scenarios and case studies for illustration
- Connect theory to real pharmacy practice in Ghana
- Encourage critical thinking with follow-up questions
- Correct misconceptions gently with clear explanations

CITATION RULES:
- Reference textbooks when relevant (Rang & Dale, Goodman & Gilman, BNF, Martindale)
- Cite WHO guidelines, Ghana STG, or Ghana FDA when applicable
- If uncertain about a specific fact, say so explicitly rather than guessing

RESPONSE FORMAT:
- Use markdown for structure (headings, bullets, bold for key terms)
- For multi-part answers, use numbered sections
- End with a thought-provoking follow-up question when appropriate
- Keep responses focused but thorough`;

const EXAM_PREP_ADDON = `

EXAM PREP MODE IS ACTIVE. After answering the user's question:
1. Generate 2 multiple-choice questions (MCQs) related to the topic discussed
2. Format each MCQ with 4 options (A-D), with the correct answer marked
3. Provide a brief explanation for why each correct answer is right
4. Questions should be at the level of Ghana Pharmacy Council licensing exams`;

export async function getTutorResponse(userMessage, conversationHistory, env, options = {}) {
  const { subject = 'general', difficulty = 'year1', examPrep = false } = options;

  const subjectDesc = SUBJECTS[subject] || SUBJECTS.general;
  const difficultyPrompt = DIFFICULTY_PROMPTS[difficulty] || DIFFICULTY_PROMPTS.year1;

  let systemPrompt = BASE_SYSTEM_PROMPT;
  systemPrompt += `\n\nCURRENT SUBJECT FOCUS: ${subjectDesc}`;
  systemPrompt += `\n\nDIFFICULTY LEVEL: ${difficultyPrompt}`;
  if (examPrep) {
    systemPrompt += EXAM_PREP_ADDON;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-20).map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ];

  const model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

  try {
    const response = await env.AI.run(model, {
      messages,
      max_tokens: examPrep ? 2000 : 1500,
      temperature: 0.5,
      top_p: 0.9
    });
    return {
      content: response.response,
      model,
      success: true
    };
  } catch (err) {
    console.error('Tutor AI error:', err.message);
    // Fallback to 8B model
    try {
      const fallback = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages,
        max_tokens: 1200,
        temperature: 0.5
      });
      return {
        content: fallback.response,
        model: '@cf/meta/llama-3.1-8b-instruct',
        success: true
      };
    } catch (fbErr) {
      console.error('Tutor fallback error:', fbErr.message);
      return {
        content: "I'm temporarily unavailable. Please try again in a moment, or visit the Academy courses for self-study.",
        model: 'error',
        success: false
      };
    }
  }
}
```

**Step 2: Commit**

```bash
git add worker/src/ai/pharmacyTutor.js
git commit -m "feat(tutor): add pharmacy tutor AI module with subject/difficulty/exam-prep support"
```

---

### Task 3: Worker Route — Tutor API Endpoints

**Files:**
- Create: `worker/src/routes/tutor.js`
- Modify: `worker/src/index.js` (add route)

**Step 1: Create the tutor route handler**

```javascript
// worker/src/routes/tutor.js

import { authMiddleware, requireAuth } from '../middleware/auth.js';
import { getTutorResponse } from '../ai/pharmacyTutor.js';

const FREE_DAILY_LIMIT = 10;

async function getOrCreateSubscription(userId, env) {
  let sub = await env.DB.prepare(
    'SELECT * FROM tutor_subscriptions WHERE user_id = ?'
  ).bind(userId).first();
  if (!sub) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO tutor_subscriptions (id, user_id, plan, status) VALUES (?, ?, ?, ?)'
    ).bind(id, userId, 'free', 'active').run();
    sub = { id, user_id: userId, plan: 'free', status: 'active' };
  }
  return sub;
}

async function getDailyUsage(userId, env) {
  const today = new Date().toISOString().split('T')[0];
  const row = await env.DB.prepare(
    'SELECT question_count FROM tutor_usage WHERE user_id = ? AND date = ?'
  ).bind(userId, today).first();
  return row?.question_count || 0;
}

async function incrementUsage(userId, env) {
  const today = new Date().toISOString().split('T')[0];
  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO tutor_usage (id, user_id, date, question_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(user_id, date) DO UPDATE SET question_count = question_count + 1
  `).bind(id, userId, today).run();
}

function isPremium(sub) {
  if (!sub || sub.plan === 'free') return false;
  if (sub.status !== 'active') return false;
  if (sub.current_period_end && sub.current_period_end < Math.floor(Date.now() / 1000)) return false;
  return true;
}

export async function handleTutor(request, env, path) {
  // POST /api/tutor/chat
  if (path === '/api/tutor/chat' && request.method === 'POST') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const sub = await getOrCreateSubscription(user.id, env);
    const premium = isPremium(sub);

    // Check usage limit for free users
    if (!premium) {
      const usage = await getDailyUsage(user.id, env);
      if (usage >= FREE_DAILY_LIMIT) {
        return new Response(JSON.stringify({
          error: 'daily_limit',
          message: 'You have reached your daily free limit of 10 questions. Upgrade to Premium for unlimited access.',
          usage,
          limit: FREE_DAILY_LIMIT
        }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const body = await request.json();
    const { message, conversationId, subject, difficulty, examPrep } = body;

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Block exam prep for free users
    if (examPrep && !premium) {
      return new Response(JSON.stringify({
        error: 'premium_required',
        message: 'Exam prep mode is a Premium feature.'
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      convId = crypto.randomUUID();
      const title = message.slice(0, 80);
      await env.DB.prepare(
        'INSERT INTO tutor_conversations (id, user_id, subject, difficulty, title) VALUES (?, ?, ?, ?, ?)'
      ).bind(convId, user.id, subject || 'general', difficulty || 'year1', title).run();
    } else {
      // Verify conversation belongs to user
      const conv = await env.DB.prepare(
        'SELECT id FROM tutor_conversations WHERE id = ? AND user_id = ?'
      ).bind(convId, user.id).first();
      if (!conv) {
        return new Response(JSON.stringify({ error: 'Conversation not found' }), {
          status: 404, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Save user message
    const userMsgId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO tutor_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
    ).bind(userMsgId, convId, 'user', message.trim()).run();

    // Fetch conversation history
    const historyRows = await env.DB.prepare(
      'SELECT role, content FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).bind(convId).all();

    // Get AI response
    const aiResult = await getTutorResponse(message.trim(), historyRows.results || [], env, {
      subject: subject || 'general',
      difficulty: difficulty || 'year1',
      examPrep: Boolean(examPrep)
    });

    // Save AI response
    const aiMsgId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO tutor_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
    ).bind(aiMsgId, convId, 'assistant', aiResult.content).run();

    // Update conversation timestamp
    await env.DB.prepare(
      'UPDATE tutor_conversations SET updated_at = unixepoch() WHERE id = ?'
    ).bind(convId).run();

    // Increment usage
    await incrementUsage(user.id, env);

    const usage = await getDailyUsage(user.id, env);

    return new Response(JSON.stringify({
      conversationId: convId,
      message: {
        id: aiMsgId,
        role: 'assistant',
        content: aiResult.content,
        model: aiResult.model
      },
      usage: {
        count: usage,
        limit: premium ? null : FREE_DAILY_LIMIT,
        isPremium: premium
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // GET /api/tutor/history
  if (path === '/api/tutor/history' && request.method === 'GET') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const sub = await getOrCreateSubscription(user.id, env);
    const premium = isPremium(sub);
    const limit = premium ? 50 : 3;

    const convos = await env.DB.prepare(
      'SELECT id, subject, difficulty, title, created_at, updated_at FROM tutor_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?'
    ).bind(user.id, limit).all();

    return new Response(JSON.stringify({
      conversations: convos.results || [],
      isPremium: premium
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // GET /api/tutor/history/:conversationId
  if (path.startsWith('/api/tutor/history/') && request.method === 'GET') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const convId = path.split('/api/tutor/history/')[1];
    const conv = await env.DB.prepare(
      'SELECT * FROM tutor_conversations WHERE id = ? AND user_id = ?'
    ).bind(convId, user.id).first();

    if (!conv) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    const messages = await env.DB.prepare(
      'SELECT id, role, content, created_at FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).bind(convId).all();

    return new Response(JSON.stringify({
      conversation: conv,
      messages: messages.results || []
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // GET /api/tutor/usage
  if (path === '/api/tutor/usage' && request.method === 'GET') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const sub = await getOrCreateSubscription(user.id, env);
    const premium = isPremium(sub);
    const usage = await getDailyUsage(user.id, env);

    return new Response(JSON.stringify({
      usage: usage,
      limit: premium ? null : FREE_DAILY_LIMIT,
      isPremium: premium,
      plan: sub.plan
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // POST /api/tutor/subscribe — initialize Paystack transaction
  if (path === '/api/tutor/subscribe' && request.method === 'POST') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    // Get user email
    const userRow = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(user.id).first();
    if (!userRow) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Paystack transaction
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userRow.email,
        amount: 5000 * 100, // GHS 50 in pesewas
        currency: 'GHS',
        plan: env.PAYSTACK_PLAN_CODE, // Created in Paystack dashboard
        metadata: {
          user_id: user.id,
          username: user.username,
          product: 'ai-tutor-premium'
        },
        callback_url: `${env.CORS_ORIGIN}/ai-tutor?payment=success`
      })
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return new Response(JSON.stringify({ error: 'Payment initialization failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // POST /api/tutor/webhook — Paystack webhook handler
  if (path === '/api/tutor/webhook' && request.method === 'POST') {
    // Verify Paystack signature
    const body = await request.text();
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(env.PAYSTACK_SECRET_KEY + body)
    );
    // NOTE: Paystack uses HMAC-SHA512 for signature verification
    // For production, implement proper HMAC verification
    const signature = request.headers.get('x-paystack-signature');

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(env.PAYSTACK_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (expectedSig !== signature) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'subscription.create' || event.event === 'charge.success') {
      const metadata = event.data.metadata || {};
      const userId = metadata.user_id;
      if (!userId) return new Response('OK', { status: 200 });

      const subCode = event.data.subscription_code || event.data.reference;
      const customerCode = event.data.customer?.customer_code || '';
      // Set expiry to 30 days from now
      const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

      await env.DB.prepare(`
        INSERT INTO tutor_subscriptions (id, user_id, paystack_sub_code, paystack_customer_code, plan, status, current_period_end, updated_at)
        VALUES (?, ?, ?, ?, 'premium', 'active', ?, unixepoch())
        ON CONFLICT(user_id) DO UPDATE SET
          paystack_sub_code = excluded.paystack_sub_code,
          paystack_customer_code = excluded.paystack_customer_code,
          plan = 'premium',
          status = 'active',
          current_period_end = excluded.current_period_end,
          updated_at = unixepoch()
      `).bind(crypto.randomUUID(), userId, subCode, customerCode, periodEnd).run();
    }

    if (event.event === 'subscription.disable' || event.event === 'subscription.not_renew') {
      const metadata = event.data.metadata || {};
      const userId = metadata.user_id;
      if (userId) {
        await env.DB.prepare(
          'UPDATE tutor_subscriptions SET status = ?, plan = ?, updated_at = unixepoch() WHERE user_id = ?'
        ).bind('cancelled', 'free', userId).run();
      }
    }

    return new Response('OK', { status: 200 });
  }

  return null;
}
```

**Step 2: Register the route in index.js**

Modify `worker/src/index.js`:

- Add import: `import { handleTutor } from './routes/tutor.js';`
- Add route in the `try` block after the analytics route:
```javascript
} else if (path.startsWith('/api/tutor/')) {
  response = await handleTutor(request, env, path);
}
```

**Step 3: Add Paystack secrets to wrangler.toml**

Add to `[vars]` section:
```toml
PAYSTACK_PLAN_CODE = ""  # To be set after creating plan in Paystack dashboard
```

The `PAYSTACK_SECRET_KEY` should be set as a secret via:
```bash
npx wrangler secret put PAYSTACK_SECRET_KEY
```

**Step 4: Commit**

```bash
git add worker/src/routes/tutor.js worker/src/index.js worker/wrangler.toml
git commit -m "feat(tutor): add tutor API routes — chat, history, usage, paystack subscription"
```

---

### Task 4: Frontend — AI Tutor Page (Core Chat UI)

**Files:**
- Create: `frontend/src/pages/AITutor.jsx`
- Modify: `frontend/src/App.jsx` (add route + nav link)

**Step 1: Create AITutor.jsx**

Build the full page component with:
- Chat message area with user/assistant bubbles (Adinkra Gold dark-glass styling)
- Message input with send button
- Subject picker dropdown (left sidebar on desktop, slide-out on mobile)
- Difficulty selector dropdown ("Explain like I'm a...")
- Exam prep toggle (premium badge, disabled for free)
- Daily usage counter badge (e.g. "7/10 questions today")
- Chat history sidebar (collapsible, shows past conversations)
- Voice input button (premium, uses `window.SpeechRecognition`)
- Paywall modal (triggered when free limit hit or premium feature tapped)
- Login prompt for unauthenticated users (reuse existing LoginModal/RegisterModal pattern from ChatRoom.jsx)

Design notes:
- Follow Adinkra Gold: `dark-glass` cards, `gold-text` headings, `font-display` (Instrument Serif) for headings, `font-body` (Outfit) for text
- Gold accent color: `#C9A84C`, light: `#E8D48B`, dark: `#A8893A`
- Assistant messages: dark-glass bubble with gold left border
- User messages: gold-glass bubble aligned right
- Markdown rendering: parse assistant markdown (headings, bold, bullets, code blocks) using simple regex-based renderer (no dependency needed — the existing codebase doesn't use a markdown library)
- Mobile-first responsive layout

The component is large. Key sections:

1. **State**: messages[], conversationId, subject, difficulty, examPrep, input, loading, usage, isPremium, showHistory, showPaywall, conversations[], showLogin, showRegister, isListening (voice)
2. **Auth**: Use `useAuth()` hook. Show login modal if not authenticated.
3. **API calls**: `sendMessage()`, `loadHistory()`, `loadConversation()`, `checkUsage()`
4. **Voice**: Web Speech API — `SpeechRecognition` with `lang: 'en-GH'`, insert transcript into input
5. **Paywall modal**: Show Paystack inline checkout button, or redirect to Paystack authorization_url from `/api/tutor/subscribe`

Use `const API_URL = import.meta.env.VITE_API_URL || ""` matching existing pattern.

**Step 2: Add route and nav link in App.jsx**

Add lazy import:
```javascript
const AITutor = lazy(() => import("./pages/AITutor.jsx"));
```

Add route (after the learn routes, before verify-email):
```jsx
<Route path="/ai-tutor" element={<AITutor />} />
```

Add nav link in both desktop and mobile nav sections:
```jsx
<NavLink to="/ai-tutor" className={navLinkClass}>AI Tutor</NavLink>
```

**Step 3: Commit**

```bash
git add frontend/src/pages/AITutor.jsx frontend/src/App.jsx
git commit -m "feat(tutor): add AI Tutor page with chat UI, subject/difficulty picker, paywall"
```

---

### Task 5: Frontend — Voice Input, Paystack Integration, Polish

**Files:**
- Modify: `frontend/src/pages/AITutor.jsx`

**Step 1: Implement voice input**

Add Web Speech API integration:
```javascript
const startListening = () => {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = 'en-GH';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(prev => prev + ' ' + transcript);
  };
  recognition.onend = () => setIsListening(false);
  recognition.start();
  setIsListening(true);
};
```

Microphone button in input area — pulsing gold ring animation when listening. Show lock icon + "Premium" badge if not premium.

**Step 2: Implement Paystack checkout**

When paywall is shown, call `POST /api/tutor/subscribe` to get `authorization_url`, then redirect:
```javascript
const handleSubscribe = async () => {
  const res = await fetch(`${API_URL}/api/tutor/subscribe`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (data.authorization_url) {
    window.location.href = data.authorization_url;
  }
};
```

On return (`?payment=success`), show success toast and re-check usage/subscription status.

**Step 3: Polish**

- Typing indicator (3 bouncing dots) while waiting for AI response
- Smooth scroll to latest message
- Empty state with suggested questions per subject
- Auto-generate conversation title from first message

**Step 4: Commit**

```bash
git add frontend/src/pages/AITutor.jsx
git commit -m "feat(tutor): add voice input, paystack checkout, typing indicator, polish"
```

---

### Task 6: Deploy & Test End-to-End

**Files:** No new files.

**Step 1: Build frontend**

```bash
cd pozospharma/frontend && npx vite build
```

Expected: Build succeeds.

**Step 2: Deploy worker**

```bash
cd pozospharma/worker && npx wrangler deploy
```

Expected: Worker deployed.

**Step 3: Deploy frontend**

```bash
cd pozospharma/frontend && npx wrangler pages deploy dist --project-name=pozospharma
```

Expected: Pages deployed.

**Step 4: Test flow**

1. Navigate to `/ai-tutor` — should see login prompt
2. Log in — should see chat interface with subject picker
3. Send a message — should get AI response
4. Send 10 messages — should hit free limit paywall
5. Check history sidebar — should show conversation
6. Test exam prep toggle — should show premium lock for free users
7. Test voice button — should show premium lock for free users

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(tutor): deploy AI pharmacy tutor v1"
git push origin main
```
