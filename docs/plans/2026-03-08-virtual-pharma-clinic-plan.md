# Virtual Pharma Clinic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a private 1:1 virtual consultation system where users can video/audio call verified pharmacists, with clinical tools, payment via Paystack, and AI-powered session summaries.

**Architecture:** New `/api/clinic/` route group in the Cloudflare Worker handles all clinic endpoints. Frontend gets two new pages (`/clinic` hub and `/clinic/session/:id` virtual office). WebRTC video uses existing Durable Object signaling with private `clinic-{id}` rooms. Paystack handles payment, 80/20 split with pharmacist wallet system.

**Tech Stack:** React 18, Tailwind CSS (Adinkra Gold), Cloudflare Workers, D1, Workers AI (Llama 3.3 70B), WebRTC, Paystack, Zustand

---

### Task 1: Database Schema -- Clinic Tables

**Files:**
- Create: `worker/src/migrations/clinic-tables.sql`
- Modify: `schema.sql` (append clinic tables)

**Step 1: Create the migration SQL file**

Create `worker/src/migrations/clinic-tables.sql`:

```sql
-- Virtual Pharma Clinic tables

CREATE TABLE IF NOT EXISTS clinic_consultations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pharmacist_id TEXT REFERENCES pharmacists(id),
  tier TEXT NOT NULL CHECK(tier IN ('quick', 'standard', 'comprehensive')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'waiting', 'active', 'completed', 'cancelled', 'expired', 'summarized')),
  mode TEXT NOT NULL DEFAULT 'on_demand' CHECK(mode IN ('on_demand', 'booking')),
  scheduled_at INTEGER,
  started_at INTEGER,
  ended_at INTEGER,
  pre_consult_reason TEXT,
  pre_consult_meds TEXT,
  pre_consult_allergies TEXT,
  payment_ref TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  user_rating INTEGER,
  user_review TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_vitals (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  patient_id TEXT NOT NULL REFERENCES users(id),
  blood_pressure TEXT,
  temperature REAL,
  pulse INTEGER,
  blood_sugar REAL,
  weight REAL,
  spo2 INTEGER,
  recorded_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_symptoms (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  symptom TEXT NOT NULL,
  onset TEXT,
  duration TEXT,
  severity INTEGER CHECK(severity BETWEEN 1 AND 5),
  location TEXT,
  aggravating TEXT,
  relieving TEXT,
  ai_suggestions TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_prescriptions (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  pharmacist_id TEXT NOT NULL REFERENCES pharmacists(id),
  recommendations TEXT,
  referral_notes TEXT,
  lifestyle_advice TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_notes (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  pharmacist_id TEXT NOT NULL REFERENCES pharmacists(id),
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_slots (
  id TEXT PRIMARY KEY,
  pharmacist_id TEXT NOT NULL REFERENCES pharmacists(id),
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_wallet (
  id TEXT PRIMARY KEY,
  pharmacist_id TEXT UNIQUE NOT NULL REFERENCES pharmacists(id),
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_withdrawn INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL REFERENCES clinic_wallet(id),
  consultation_id TEXT REFERENCES clinic_consultations(id),
  type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_consult_user ON clinic_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_consult_pharmacist ON clinic_consultations(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_clinic_consult_status ON clinic_consultations(status);
CREATE INDEX IF NOT EXISTS idx_clinic_consult_scheduled ON clinic_consultations(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_clinic_vitals_consult ON clinic_vitals(consultation_id);
CREATE INDEX IF NOT EXISTS idx_clinic_vitals_patient ON clinic_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinic_symptoms_consult ON clinic_symptoms(consultation_id);
CREATE INDEX IF NOT EXISTS idx_clinic_slots_pharmacist ON clinic_slots(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_clinic_wallet_pharmacist ON clinic_wallet(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_clinic_transactions_wallet ON clinic_transactions(wallet_id);
```

**Step 2: Run migration against D1**

```bash
cd worker
npx wrangler d1 execute pozospharma-db --remote --file=src/migrations/clinic-tables.sql
```

**Step 3: Append to schema.sql for reference**

Append the same SQL to `schema.sql` after the tutor tables section.

**Step 4: Commit**

```bash
git add worker/src/migrations/clinic-tables.sql schema.sql
git commit -m "feat(clinic): add database schema for virtual pharma clinic"
```

---

### Task 2: Backend -- Clinic Route Handler (Core CRUD)

**Files:**
- Create: `worker/src/routes/clinic.js`
- Modify: `worker/src/index.js` (add route)

**Step 1: Create clinic route handler**

Create `worker/src/routes/clinic.js` with these functions:

- `handleClinic(request, env, path)` -- route dispatcher
- `createConsultation(request, env)` -- POST `/api/clinic/request` -- on-demand consultation
- `bookConsultation(request, env)` -- POST `/api/clinic/book` -- scheduled booking
- `getSession(request, env, id)` -- GET `/api/clinic/session/:id` -- session details + all clinical data
- `getUserHistory(request, env)` -- GET `/api/clinic/history` -- user's past consultations
- `updateSessionStatus(request, env, id)` -- PUT `/api/clinic/session/:id/status` -- start/end/cancel

Route dispatcher pattern (match existing codebase style from `chat.js`):

```javascript
import { authMiddleware } from '../middleware/auth.js';

const TIERS = {
  quick: { price: 2000, duration: 15, label: 'Quick Consult', mode: 'audio' },
  standard: { price: 4000, duration: 30, label: 'Standard', mode: 'video' },
  comprehensive: { price: 7000, duration: 45, label: 'Comprehensive', mode: 'video' },
};

export async function handleClinic(request, env, path) {
  // Match routes and dispatch
  if (path === '/api/clinic/request' && request.method === 'POST') {
    return createConsultation(request, env);
  }
  if (path === '/api/clinic/book' && request.method === 'POST') {
    return bookConsultation(request, env);
  }
  // ... etc for all endpoints
  return null;
}
```

Key implementation details for `createConsultation`:
1. Auth required
2. Validate tier is one of: quick, standard, comprehensive
3. Accept: `{ tier, reason, currentMeds, allergies, preferredSpecialization }`
4. Create consultation record with status `pending`, mode `on_demand`
5. Return consultation ID + Paystack payment details

Key implementation for `bookConsultation`:
1. Auth required
2. Accept: `{ tier, pharmacistId, scheduledAt, reason, currentMeds, allergies }`
3. Validate pharmacist exists and is verified
4. Validate time slot is available
5. Create consultation with status `pending`, mode `booking`
6. Return consultation ID + Paystack payment details

Key implementation for `getSession`:
1. Auth required
2. Fetch consultation + join vitals, symptoms, prescriptions, notes
3. Only return notes if requesting user is the pharmacist
4. Return all data in one response

**Step 2: Register route in index.js**

Add to `worker/src/index.js`:
```javascript
import { handleClinic } from './routes/clinic.js';
// In the route chain:
} else if (path.startsWith('/api/clinic/')) {
  response = await handleClinic(request, env, path);
}
```

**Step 3: Commit**

```bash
git add worker/src/routes/clinic.js worker/src/index.js
git commit -m "feat(clinic): add core clinic route handler with CRUD endpoints"
```

---

### Task 3: Backend -- Payment & Wallet System

**Files:**
- Modify: `worker/src/routes/clinic.js` (add payment endpoints)

**Step 1: Add payment endpoints**

Add these functions to `clinic.js`:

- `initiatePayment(request, env)` -- POST `/api/clinic/pay`
  1. Auth required
  2. Find consultation by ID, verify it belongs to user, status is `pending`
  3. Call Paystack Initialize Transaction API
  4. Return authorization_url for frontend redirect or inline checkout
  5. Store payment reference in consultation

- `handleWebhook(request, env)` -- POST `/api/clinic/webhook`
  1. Verify Paystack HMAC-SHA512 signature (same pattern as tutor webhook in `routes/tutor.js`)
  2. On `charge.success`: update consultation status to `paid`
  3. Credit 80% to pharmacist wallet (get or create wallet)
  4. Create transaction record
  5. If on-demand: attempt to match pharmacist (call matchPharmacist helper)
  6. If booking: notify pharmacist via WebSocket

- `getEarnings(request, env)` -- GET `/api/clinic/earnings`
  1. Auth required, must be pharmacist
  2. Return wallet balance, total_earned, total_withdrawn
  3. Return recent transactions

- `requestWithdrawal(request, env)` -- POST `/api/clinic/withdraw`
  1. Auth required, must be pharmacist
  2. Validate amount <= balance
  3. Create debit transaction, reduce balance
  4. Store withdrawal request for admin processing

Helper function `getOrCreateWallet(pharmacistId, env)`:
```javascript
async function getOrCreateWallet(pharmacistId, env) {
  let wallet = await env.DB.prepare(
    'SELECT * FROM clinic_wallet WHERE pharmacist_id = ?'
  ).bind(pharmacistId).first();
  if (!wallet) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO clinic_wallet (id, pharmacist_id) VALUES (?, ?)'
    ).bind(id, pharmacistId).run();
    wallet = { id, pharmacist_id: pharmacistId, balance: 0, total_earned: 0, total_withdrawn: 0 };
  }
  return wallet;
}
```

**Step 2: Commit**

```bash
git add worker/src/routes/clinic.js
git commit -m "feat(clinic): add payment, webhook, wallet and earnings endpoints"
```

---

### Task 4: Backend -- Clinical Tools Endpoints

**Files:**
- Modify: `worker/src/routes/clinic.js` (add clinical endpoints)

**Step 1: Add clinical data endpoints**

- `saveVitals(request, env)` -- POST `/api/clinic/vitals`
  1. Auth required, must be pharmacist in this session
  2. Accept: `{ consultationId, bloodPressure, temperature, pulse, bloodSugar, weight, spo2 }`
  3. Insert into clinic_vitals

- `saveSymptoms(request, env)` -- POST `/api/clinic/symptoms`
  1. Auth required, must be pharmacist in this session
  2. Accept: `{ consultationId, symptom, onset, duration, severity, location, aggravating, relieving }`
  3. Call Workers AI for symptom suggestions (non-blocking)
  4. Insert into clinic_symptoms with ai_suggestions

- `savePrescription(request, env)` -- POST `/api/clinic/prescription`
  1. Auth required, must be pharmacist in this session
  2. Accept: `{ consultationId, recommendations, referralNotes, lifestyleAdvice }`
  3. Insert into clinic_prescriptions (upsert -- one per consultation)

- `saveNotes(request, env)` -- POST `/api/clinic/notes`
  1. Auth required, must be pharmacist in this session
  2. Accept: `{ consultationId, content }`
  3. Upsert into clinic_notes

- `getPatientHistory(request, env, patientId)` -- GET `/api/clinic/patient/:id/history`
  1. Auth required, must be pharmacist
  2. Return past consultations, vitals history, for this patient
  3. Useful for returning patients

**Step 2: Add AI symptom suggestion helper**

```javascript
async function getSymptomSuggestions(symptomData, env) {
  try {
    const prompt = `Based on these symptoms reported by a patient in Ghana, suggest 3-5 possible conditions (for pharmacist reference only, not diagnosis):
Symptom: ${symptomData.symptom}
Onset: ${symptomData.onset || 'Not specified'}
Duration: ${symptomData.duration || 'Not specified'}
Severity: ${symptomData.severity}/5
Location: ${symptomData.location || 'Not specified'}
Aggravating factors: ${symptomData.aggravating || 'None noted'}
Relieving factors: ${symptomData.relieving || 'None noted'}

Return a JSON array of objects with "condition" and "likelihood" (high/medium/low) fields. Consider conditions common in Ghana.`;

    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: 'You are a clinical decision support tool for pharmacists. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3
    });
    return response.response;
  } catch (err) {
    console.error('AI symptom suggestion failed:', err);
    return null;
  }
}
```

**Step 3: Commit**

```bash
git add worker/src/routes/clinic.js
git commit -m "feat(clinic): add clinical tools endpoints (vitals, symptoms, prescription, notes)"
```

---

### Task 5: Backend -- Pharmacist Matching, Slots & AI Summary

**Files:**
- Modify: `worker/src/routes/clinic.js` (add matching, slots, summary)

**Step 1: Add pharmacist availability/slots endpoints**

- `getSlots(request, env, pharmacistId)` -- GET `/api/clinic/slots/:pharmacistId`
  1. Public endpoint (no auth required)
  2. Return active slots for this pharmacist
  3. Cross-reference with existing bookings to mark unavailable times

- `setSlots(request, env)` -- POST `/api/clinic/slots`
  1. Auth required, must be pharmacist
  2. Accept: `{ slots: [{ dayOfWeek, startTime, endTime }] }`
  3. Replace all slots for this pharmacist (delete + insert)

**Step 2: Add pharmacist matching helper**

```javascript
async function matchPharmacist(consultation, env) {
  // Find online, verified pharmacists
  let query = `
    SELECT p.id, p.user_id, p.specialization, p.composite_score, p.response_time_avg
    FROM pharmacists p
    JOIN users u ON p.user_id = u.id
    WHERE p.is_verified = 1 AND p.is_online = 1 AND u.is_banned = 0
    ORDER BY p.composite_score DESC
    LIMIT 10
  `;
  const candidates = await env.DB.prepare(query).all();

  if (!candidates.results?.length) return null;

  // Prefer matching specialization if consultation has one
  let match = candidates.results[0];
  if (consultation.preferred_specialization) {
    const specMatch = candidates.results.find(
      p => p.specialization === consultation.preferred_specialization
    );
    if (specMatch) match = specMatch;
  }

  // Assign pharmacist to consultation
  await env.DB.prepare(
    'UPDATE clinic_consultations SET pharmacist_id = ?, status = ? WHERE id = ?'
  ).bind(match.id, 'waiting', consultation.id).run();

  // Notify pharmacist via Durable Object WebSocket
  try {
    const doId = env.CHAT_ROOM.idFromName('clinic-notifications');
    const doStub = env.CHAT_ROOM.get(doId);
    await doStub.fetch(new Request('https://internal/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'clinic_request',
        consultationId: consultation.id,
        tier: consultation.tier,
        reason: consultation.pre_consult_reason,
        targetPharmacistUserId: match.user_id
      })
    }));
  } catch (err) {
    console.error('Clinic notification failed:', err);
  }

  return match;
}
```

**Step 3: Add AI session summary endpoint**

- `generateSummary(request, env)` -- POST `/api/clinic/summary`
  1. Auth required
  2. Accept: `{ consultationId }`
  3. Fetch all clinical data: vitals, symptoms, prescription, notes
  4. Call Workers AI to generate patient-friendly summary
  5. Save to `clinic_consultations.summary`
  6. Update status to `summarized`

```javascript
async function generateSummary(request, env) {
  // ... auth check, fetch consultation ...

  // Gather all clinical data
  const vitals = await env.DB.prepare('SELECT * FROM clinic_vitals WHERE consultation_id = ?').bind(id).all();
  const symptoms = await env.DB.prepare('SELECT * FROM clinic_symptoms WHERE consultation_id = ?').bind(id).all();
  const prescription = await env.DB.prepare('SELECT * FROM clinic_prescriptions WHERE consultation_id = ?').bind(id).first();
  const notes = await env.DB.prepare('SELECT * FROM clinic_notes WHERE consultation_id = ?').bind(id).first();

  const prompt = `Generate a clear, patient-friendly consultation summary from this clinical data:

VITALS: ${JSON.stringify(vitals.results)}
SYMPTOMS: ${JSON.stringify(symptoms.results)}
RECOMMENDATIONS: ${prescription ? JSON.stringify(prescription) : 'None recorded'}
PHARMACIST NOTES: ${notes?.content || 'None'}

Format with markdown headings: Summary, Vitals Recorded, Key Findings, Recommendations, Next Steps.
Keep medical terms simple. Be warm and professional.`;

  const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: 'You are a clinical summary writer for PozosPharma, a Ghanaian pharmacy platform.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
    temperature: 0.3
  });

  await env.DB.prepare(
    'UPDATE clinic_consultations SET summary = ?, status = ? WHERE id = ?'
  ).bind(response.response, 'summarized', id).run();

  return json({ summary: response.response });
}
```

**Step 4: Commit**

```bash
git add worker/src/routes/clinic.js
git commit -m "feat(clinic): add pharmacist matching, availability slots, and AI summary"
```

---

### Task 6: Backend -- Deploy Worker

**Step 1: Deploy**

```bash
cd worker
npx wrangler deploy
```

**Step 2: Verify endpoints respond**

```bash
curl -s -o /dev/null -w "%{http_code}" https://pozospharma-worker.ghwmelite.workers.dev/api/clinic/history
# Expected: 401 (auth required)
```

---

### Task 7: Frontend -- Clinic Hub Page (`/clinic`)

**Files:**
- Create: `frontend/src/pages/Clinic.jsx`
- Modify: `frontend/src/App.jsx` (add lazy import + route)

**Step 1: Create Clinic.jsx**

The clinic hub page with three sections:

1. **Hero section** -- "Virtual Pharma Clinic" headline with description, tier cards
2. **On-Demand section** -- "Consult Now" flow: select tier -> pre-consultation form -> Paystack payment -> waiting for match
3. **Browse & Book section** -- Pharmacist cards with "Book" button, links to their availability
4. **My Consultations** -- Past and upcoming consultations list (for logged-in users)

Design requirements (Adinkra Gold system):
- Dark glass cards (`dark-glass` class)
- Gold accents for CTAs
- Tier cards with gradient borders: Quick (blue), Standard (emerald), Comprehensive (amber)
- Pre-consultation form in a modal or expandable section
- Paystack inline checkout integration (same pattern as AITutor.jsx)

Key states:
- `selectedTier` -- which tier card is selected
- `showPreConsult` -- show pre-consultation form
- `consultations` -- user's past/upcoming consultations
- `pharmacists` -- list of verified pharmacists for booking
- `matchingStatus` -- null/searching/matched/no_match

Pre-consultation form fields:
- Reason for visit (textarea, required)
- Current medications (textarea, optional)
- Known allergies (textarea, optional)

On-demand flow after payment:
- Show "Finding you a pharmacist..." with animated spinner
- Poll `/api/clinic/session/:id` every 3 seconds for status change to `waiting` or `active`
- When matched, show pharmacist info + "Join Session" button
- If no match after 60 seconds, offer to book instead

**Step 2: Add route to App.jsx**

Add lazy import:
```javascript
const Clinic = lazy(() => import("./pages/Clinic"));
```

Add route alongside other routes:
```jsx
<Route path="/clinic" element={<Clinic />} />
```

**Step 3: Commit**

```bash
git add frontend/src/pages/Clinic.jsx frontend/src/App.jsx
git commit -m "feat(clinic): add clinic hub page with tier selection, booking, and on-demand flow"
```

---

### Task 8: Frontend -- Virtual Office Page (`/clinic/session/:id`)

**Files:**
- Create: `frontend/src/pages/ClinicSession.jsx`
- Modify: `frontend/src/App.jsx` (add route)

**Step 1: Create ClinicSession.jsx**

Split-screen layout:
- **Left panel (70%)**: WebRTC video/audio feed
  - Local + remote video elements
  - Call controls bar: mute mic, toggle camera, end call, fullscreen
  - Session timer (counts up, shows warning at 2 min before tier limit)
  - Connection status indicator

- **Right panel (30%)**: Clinical toolkit tabs (pharmacist) or session info (patient)

WebRTC implementation:
- Connect to WebSocket room `clinic-{consultationId}` using existing `useWebSocket` hook
- On join, send `video_offer` via WebSocket signaling
- Handle `video_offer`, `video_answer`, `video_ice` messages
- Use `navigator.mediaDevices.getUserMedia()` for local stream
- For Quick tier (audio only): request audio only, hide video elements

Session lifecycle:
- On mount: fetch session data from `/api/clinic/session/:id`
- Verify user is participant (either the patient or the pharmacist)
- When both parties joined: update status to `active` via API
- On "End Call": update status to `completed`, trigger AI summary generation
- Show post-session screen with summary + rate pharmacist form

**Step 2: Add route to App.jsx**

```jsx
const ClinicSession = lazy(() => import("./pages/ClinicSession"));
// ...
<Route path="/clinic/session/:sessionId" element={<ClinicSession />} />
```

**Step 3: Commit**

```bash
git add frontend/src/pages/ClinicSession.jsx frontend/src/App.jsx
git commit -m "feat(clinic): add virtual office page with WebRTC video and session controls"
```

---

### Task 9: Frontend -- Clinical Toolkit Components

**Files:**
- Create: `frontend/src/components/Clinic/ClinicalToolkit.jsx`

**Step 1: Create ClinicalToolkit.jsx**

Tabbed sidebar component with 6 tabs. Only rendered for pharmacist role.

**Tab 1: PatientInfo**
- Display pre-consultation form answers
- Show patient's past consultations with this pharmacist (if any)
- Display allergies prominently with warning styling

**Tab 2: VitalsLogger**
- Form with fields: Blood Pressure (text, e.g., "120/80"), Temperature (number, celsius), Pulse (number, bpm), Blood Sugar (number, mmol/L), Weight (number, kg), SpO2 (number, %)
- "Record Vitals" button -- POST to `/api/clinic/vitals`
- Show previously recorded vitals for this session in a table
- For returning patients: show historical vitals chart (simple bar/line using CSS)

**Tab 3: SymptomChecker**
- Form: Symptom (text), Onset (text), Duration (text), Severity (1-5 slider), Location (text), Aggravating factors (text), Relieving factors (text)
- "Add Symptom" button -- POST to `/api/clinic/symptoms`
- Show AI suggestions when they arrive (rendered as cards with likelihood badges)
- List of recorded symptoms for this session

**Tab 4: MedicationReview**
- Fetch patient's medications from `/api/drugs/` or the pre-consultation meds field
- Display each medication as a card
- "Check Interactions" button -- calls existing `/api/drugs/interactions` endpoint
- Display interaction results with severity badges (same style as InteractionChecker page)

**Tab 5: PrescriptionPad**
- Form: Recommendations (textarea -- list of OTC meds with dosages), Referral Notes (textarea), Lifestyle Advice (textarea)
- "Save Recommendation" button -- POST to `/api/clinic/prescription`
- Preview of the recommendation card as it will appear to the patient
- Gold-bordered card design for the final recommendation

**Tab 6: SessionNotes**
- Simple textarea for private notes
- Auto-save on blur or every 30 seconds -- POST to `/api/clinic/notes`
- Note: "These notes are private and not visible to the patient"

For the patient side, show a simplified view:
- PatientInfo tab (their own info, read-only)
- Vitals tab (read-only, see what pharmacist recorded)
- Prescription tab (see recommendation card when pharmacist saves it)

**Step 2: Commit**

```bash
git add frontend/src/components/Clinic/ClinicalToolkit.jsx
git commit -m "feat(clinic): add clinical toolkit with 6 tabs (vitals, symptoms, meds, rx, notes)"
```

---

### Task 10: Frontend -- Pharmacist Availability & Earnings Dashboard

**Files:**
- Modify: `frontend/src/pages/PharmacistPortal.jsx` (or create a new section in PharmacistDashboard)

**Step 1: Add Clinic section to pharmacist dashboard**

Add a "Virtual Clinic" section to the existing PharmacistPortal/Dashboard with:

**My Availability:**
- Weekly slot grid (Mon-Sun, time slots)
- Toggle slots on/off
- "Available Now" toggle (uses existing is_online)
- Save slots button -- POST to `/api/clinic/slots`

**Incoming Requests:**
- Listen for `clinic_request` WebSocket messages
- Show incoming consultation card with: tier, reason, accept/decline buttons
- 60-second countdown timer to accept
- On accept: navigate to `/clinic/session/:id`

**My Consultations:**
- Upcoming bookings list with "Join" button
- Past consultations with summary links
- Filter by date range

**Earnings:**
- Wallet balance card (prominent, gold styling)
- Total earned, total withdrawn
- Recent transactions list
- "Request Withdrawal" button with amount input
- POST to `/api/clinic/withdraw`

**Step 2: Commit**

```bash
git add frontend/src/pages/PharmacistPortal.jsx
git commit -m "feat(clinic): add availability, consultations, and earnings to pharmacist dashboard"
```

---

### Task 11: Frontend -- Navigation & App Integration

**Files:**
- Modify: `frontend/src/App.jsx` (add Clinic to nav)

**Step 1: Add Clinic to navigation**

Add a "Clinic" link to the main navbar. Style it prominently -- this is a revenue-generating feature.

Options:
- Add to the existing nav bar alongside Community chat
- Or add to the LearnHub dropdown as a separate highlighted item
- Recommend: Standalone nav link with a distinctive icon (stethoscope or video camera) and a subtle pulse/glow to draw attention

For pharmacists: show a notification badge on the Clinic nav item when there are pending consultation requests.

**Step 2: Build, test locally**

```bash
cd frontend
npm run build
```

**Step 3: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat(clinic): add clinic navigation link with notification badge"
```

---

### Task 12: Deploy & Verify

**Step 1: Deploy worker**

```bash
cd worker
npx wrangler deploy
```

**Step 2: Deploy frontend**

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=pozospharma
```

**Step 3: Run diagnostics**

```bash
# Check clinic API responds
curl -s -o /dev/null -w "%{http_code}" https://pozospharma-worker.ghwmelite.workers.dev/api/clinic/history
# Expected: 401

# Check frontend routes
curl -s -o /dev/null -w "%{http_code}" https://pozospharma.pages.dev/clinic
# Expected: 200
```

**Step 4: Commit any fixes**

```bash
git add .
git commit -m "feat(clinic): deploy virtual pharma clinic v1"
```
