# PozosPharma Platform Elevation - 15 Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate PozosPharma from MVP to a world-class Ghana-focused pharmaceutical platform with 15 new features.

**Architecture:** Each feature is grouped into backend (Worker routes + D1 schema) and frontend (React components + pages). Features are independent and can be built in parallel. All new API routes follow existing patterns in worker/src/routes/. All new components follow existing patterns in frontend/src/components/.

**Tech Stack:** React 18, Zustand, Tailwind CSS, Cloudflare Workers, D1 (SQLite), KV, R2, Workers AI (Llama 3.1/3.2/3.3, Whisper, embeddings), Durable Objects, Service Workers (PWA)

---

## Feature Groups for Parallel Execution

**Group A (Backend-heavy):** F1 Drug Interactions, F11 AI Upgrade, F12 RAG, F15 Email Verification
**Group B (Frontend-heavy):** F3 Medication Reminders, F9 Health Education, F13 PWA
**Group C (AI/Media):** F2 Pill Identifier, F6 Prescription Upload, F7 Voice Chat
**Group D (Data/Integration):** F4 Twi Language, F5 Pharmacy Locator, F10 NHIS, F14 Analytics
**Group E (Infrastructure):** F8 Video Consultations

---

## F1: Drug Interaction Checker

### Task 1.1: Backend - Interaction checking endpoint

**Files:**
- Modify: `worker/src/routes/drugs.js`

Add route handler in `handleDrugs()`:

```js
// Add to handleDrugs function, before return null
const interactionMatch = path.match(/^\/api\/drugs\/interactions$/);
if (interactionMatch && request.method === 'POST') {
  return checkInteractions(request, env);
}
```

Add function:

```js
async function checkInteractions(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { drugIds } = await request.json();
  if (!Array.isArray(drugIds) || drugIds.length < 2 || drugIds.length > 10) {
    return json({ error: 'Provide 2-10 drug IDs' }, 400);
  }

  const placeholders = drugIds.map(() => '?').join(',');
  const drugs = await env.DB.prepare(
    `SELECT id, generic_name, brand_names, drug_class, interactions FROM drugs WHERE id IN (${placeholders})`
  ).bind(...drugIds).all();

  const drugList = drugs.results || [];
  if (drugList.length < 2) return json({ error: 'Not enough valid drugs found' }, 400);

  // Cross-reference interactions
  const results = [];
  for (let i = 0; i < drugList.length; i++) {
    for (let j = i + 1; j < drugList.length; j++) {
      const a = drugList[i];
      const b = drugList[j];
      const aInteracts = (a.interactions || '').toLowerCase();
      const bInteracts = (b.interactions || '').toLowerCase();
      const aName = a.generic_name.toLowerCase();
      const bName = b.generic_name.toLowerCase();
      const aClass = a.drug_class.toLowerCase();
      const bClass = b.drug_class.toLowerCase();

      let severity = 'none';
      let description = '';

      if (aInteracts.includes(bName) || aInteracts.includes(bClass) ||
          bInteracts.includes(aName) || bInteracts.includes(aClass)) {
        severity = 'moderate';
        description = `${a.generic_name} lists interaction with ${b.generic_name}. ${aInteracts.includes(bName) || aInteracts.includes(bClass) ? a.interactions : b.interactions}`;
      }

      // Check for dangerous keyword combos
      const dangerWords = ['contraindicated', 'fatal', 'avoid', 'never', 'dangerous', 'do not'];
      if (severity !== 'none') {
        const combined = `${aInteracts} ${bInteracts}`;
        if (dangerWords.some(w => combined.includes(w))) {
          severity = 'severe';
        }
      }

      results.push({
        drugA: { id: a.id, name: a.generic_name },
        drugB: { id: b.id, name: b.generic_name },
        severity,
        description: description || 'No known interaction found in our database.'
      });
    }
  }

  // Also call AI for a comprehensive summary if 3+ drugs
  let aiSummary = null;
  if (drugIds.length >= 3) {
    try {
      const drugNames = drugList.map(d => `${d.generic_name} (${d.drug_class})`).join(', ');
      const aiRes = await env.AI.run(env.AI_PRIMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are a pharmacist. Given a list of medications, briefly summarize key interactions and safety concerns. Be concise (max 150 words). Include severity levels.' },
          { role: 'user', content: `Check interactions between: ${drugNames}` }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiSummary = aiRes.response;
    } catch (e) {
      console.error('AI interaction check failed:', e);
    }
  }

  return json({ interactions: results, aiSummary, drugs: drugList.map(d => ({ id: d.id, name: d.generic_name, brand_names: d.brand_names })) });
}
```

### Task 1.2: Frontend - Interaction Checker Page

**Files:**
- Create: `frontend/src/pages/InteractionChecker.jsx`
- Create: `frontend/src/components/Drugs/InteractionMatrix.jsx`
- Modify: `frontend/src/App.jsx` (add route)

### Task 1.3: Add route to App.jsx

Add to imports and routes:
```jsx
const InteractionChecker = lazy(() => import("./pages/InteractionChecker"));
// In Routes:
<Route path="/interactions" element={<InteractionChecker />} />
```

Add nav link after Drug Database in Navbar.

---

## F2: Pill Identifier / Photo Lookup

### Task 2.1: Backend - Vision endpoint

**Files:**
- Create: `worker/src/routes/vision.js`
- Modify: `worker/src/index.js` (add route)

Uses Cloudflare Workers AI vision model to identify pills from photos.

### Task 2.2: Frontend - Pill ID component

**Files:**
- Create: `frontend/src/components/Drugs/PillIdentifier.jsx`
- Modify: `frontend/src/pages/DrugDatabase.jsx` (add tab)

Camera/upload interface with drag-and-drop, preview, and results display.

---

## F3: Medication Reminders & Adherence

### Task 3.1: Backend - Reminders CRUD

**Files:**
- Modify: `worker/src/routes/drugs.js` (add reminder endpoints)
- D1 schema addition: `medication_reminders` table

```sql
CREATE TABLE IF NOT EXISTS medication_reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  drug_id TEXT REFERENCES drugs(id),
  drug_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL,
  times TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  active INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_taken TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS adherence_log (
  id TEXT PRIMARY KEY,
  reminder_id TEXT REFERENCES medication_reminders(id),
  scheduled_time TEXT NOT NULL,
  taken_at TEXT,
  skipped INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
```

### Task 3.2: Frontend - My Medications page

**Files:**
- Create: `frontend/src/pages/MyMedications.jsx`
- Create: `frontend/src/components/Medications/ReminderCard.jsx`
- Create: `frontend/src/components/Medications/AddMedicationModal.jsx`
- Create: `frontend/src/components/Medications/AdherenceCalendar.jsx`

---

## F4: Twi / Ga / Ewe Language Toggle

### Task 4.1: Create i18n system

**Files:**
- Create: `frontend/src/i18n/translations.js`
- Create: `frontend/src/i18n/useTranslation.js`
- Modify: `frontend/src/store/chatStore.js` (add language state)

### Task 4.2: Translate all UI strings

All pages and components updated to use `t('key')` pattern.

### Task 4.3: Update PozosBot system prompt

**Files:**
- Modify: `worker/src/ai/pozosBot.js`

Add language parameter to AI requests so PozosBot responds in the user's chosen language.

---

## F5: Pharmacy Locator

### Task 5.1: Backend - Pharmacy endpoints + schema

```sql
CREATE TABLE IF NOT EXISTS pharmacies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  lat REAL,
  lng REAL,
  phone TEXT,
  hours TEXT,
  is_partner INTEGER DEFAULT 0,
  nhis_accepted INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS pharmacy_stock (
  id TEXT PRIMARY KEY,
  pharmacy_id TEXT REFERENCES pharmacies(id),
  drug_id TEXT REFERENCES drugs(id),
  in_stock INTEGER DEFAULT 1,
  price_ghs REAL,
  updated_at INTEGER DEFAULT (unixepoch())
);
```

**Files:**
- Create: `worker/src/routes/pharmacies.js`
- Modify: `worker/src/index.js`

### Task 5.2: Frontend - Pharmacy Locator page

**Files:**
- Create: `frontend/src/pages/PharmacyLocator.jsx`
- Create: `frontend/src/components/Pharmacy/PharmacyCard.jsx`
- Create: `frontend/src/components/Pharmacy/PharmacyMap.jsx`

Uses OpenStreetMap/Leaflet for mapping (no API key needed).

---

## F6: Prescription Upload & Verification

### Task 6.1: Backend - OCR endpoint

**Files:**
- Modify: `worker/src/routes/drugs.js` (add /api/drugs/prescription endpoint)

Uses Workers AI vision model to OCR prescription images, extracts drug names, cross-references with drug database.

### Task 6.2: Frontend - Upload UI

**Files:**
- Create: `frontend/src/components/Drugs/PrescriptionUpload.jsx`
- Modify: `frontend/src/pages/DrugDatabase.jsx`

---

## F7: Voice Chat with PozosBot

### Task 7.1: Backend - Speech endpoints

**Files:**
- Create: `worker/src/routes/voice.js`
- Modify: `worker/src/index.js`

Uses @cf/openai/whisper for STT and AI for response generation.

### Task 7.2: Frontend - Voice UI

**Files:**
- Create: `frontend/src/components/Chat/VoiceInput.jsx`
- Modify: `frontend/src/components/Chat/ChatWindow.jsx`

MediaRecorder API for audio capture, sends to backend for processing.

---

## F8: Pharmacist Video Consultations

### Task 8.1: Backend - Video session management

**Files:**
- Create: `worker/src/routes/video.js`
- Modify: `worker/src/index.js`

WebRTC signaling via Durable Objects.

### Task 8.2: Frontend - Video call UI

**Files:**
- Create: `frontend/src/components/Pharmacist/VideoCall.jsx`
- Create: `frontend/src/components/Pharmacist/VideoControls.jsx`

---

## F9: Health Education Content

### Task 9.1: Backend - Content management

```sql
CREATE TABLE IF NOT EXISTS health_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  author_type TEXT DEFAULT 'system',
  author_id TEXT,
  featured INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

**Files:**
- Create: `worker/src/routes/articles.js`
- Modify: `worker/src/index.js`

### Task 9.2: Frontend - Education hub

**Files:**
- Create: `frontend/src/pages/HealthHub.jsx`
- Create: `frontend/src/components/Education/ArticleCard.jsx`
- Create: `frontend/src/components/Education/ArticleView.jsx`
- Create: `frontend/src/components/Education/DrugOfTheWeek.jsx`

---

## F10: NHIS Integration

### Task 10.1: Backend - Add NHIS column + endpoint

```sql
ALTER TABLE drugs ADD COLUMN nhis_covered INTEGER DEFAULT 0;
ALTER TABLE drugs ADD COLUMN nhis_tier TEXT;
ALTER TABLE drugs ADD COLUMN avg_price_ghs REAL;
```

**Files:**
- Modify: `worker/src/routes/drugs.js` (add NHIS filter endpoint)

### Task 10.2: Frontend - NHIS badges and filter

**Files:**
- Modify: `frontend/src/components/Community/DrugSearch.jsx` (add NHIS badge + filter toggle)

---

## F11: AI Model Upgrade (Hybrid Routing)

### Task 11.1: Implement smart model routing

**Files:**
- Modify: `worker/src/ai/pozosBot.js`

Route complex queries (interactions, multi-drug, emergency) to Llama 3.3 70B. Simple queries stay on 8B. Add complexity detection.

---

## F12: RAG on Drug Database

### Task 12.1: Backend - Vectorize integration

**Files:**
- Create: `worker/src/ai/drugRAG.js`
- Modify: `worker/src/ai/pozosBot.js`
- Modify: `worker/wrangler.toml` (add vectorize binding)

Embed drug descriptions and use semantic search to augment PozosBot context.

---

## F13: PWA + Offline Mode

### Task 13.1: Service Worker + Manifest

**Files:**
- Create: `frontend/public/manifest.json`
- Create: `frontend/src/sw.js`
- Modify: `frontend/index.html`
- Create: `frontend/src/utils/offlineDB.js`

Cache drug database for offline access using IndexedDB.

### Task 13.2: Install prompt UI

**Files:**
- Create: `frontend/src/components/UI/InstallPrompt.jsx`

---

## F14: Analytics Dashboard

### Task 14.1: Backend - Analytics endpoints + tracking

```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data TEXT,
  user_id TEXT,
  session_id TEXT,
  page TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
```

**Files:**
- Create: `worker/src/routes/analytics.js`
- Modify: `worker/src/index.js`

### Task 14.2: Frontend - Analytics dashboard (admin)

**Files:**
- Modify: `frontend/src/pages/AdminPanel.jsx` (add Analytics tab)
- Create: `frontend/src/components/Admin/AnalyticsCharts.jsx`

### Task 14.3: Frontend - Event tracking hook

**Files:**
- Create: `frontend/src/hooks/useAnalytics.js`

---

## F15: Email Verification + Password Reset

### Task 15.1: Backend - Email system

**Files:**
- Create: `worker/src/email/sendEmail.js`
- Modify: `worker/src/routes/auth.js`

```sql
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN reset_token TEXT;
ALTER TABLE users ADD COLUMN reset_token_expires INTEGER;
```

Endpoints:
- POST /api/auth/verify-email
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/verify/:token

### Task 15.2: Frontend - Verification + Reset flows

**Files:**
- Create: `frontend/src/components/Auth/ForgotPasswordModal.jsx`
- Create: `frontend/src/pages/VerifyEmail.jsx`
- Create: `frontend/src/pages/ResetPassword.jsx`
- Modify: `frontend/src/App.jsx` (add routes)
- Modify: `frontend/src/components/Auth/LoginModal.jsx` (add forgot password link)

---

## Execution Order (Parallel Groups)

**Wave 1 (Foundation):** F15 (Email), F10 (NHIS), F4 (i18n), F13 (PWA), F14 (Analytics)
**Wave 2 (Core Features):** F1 (Interactions), F3 (Reminders), F5 (Pharmacy Locator), F9 (Health Education)
**Wave 3 (AI/Media):** F2 (Pill ID), F6 (Prescription), F7 (Voice), F11 (AI Upgrade), F12 (RAG)
**Wave 4 (Premium):** F8 (Video Consultations)
