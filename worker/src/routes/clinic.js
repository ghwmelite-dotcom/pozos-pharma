import { authMiddleware, requireRole } from '../middleware/auth.js';

const TIERS = {
  quick: { price: 2000, duration: 15, label: 'Quick Consult', mode: 'audio' },
  standard: { price: 4000, duration: 30, label: 'Standard', mode: 'video' },
  comprehensive: { price: 7000, duration: 45, label: 'Comprehensive', mode: 'video' },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function handleClinic(request, env, path) {
  // --- CORE CRUD ---
  if (path === '/api/clinic/request' && request.method === 'POST') {
    return createConsultation(request, env);
  }
  if (path === '/api/clinic/book' && request.method === 'POST') {
    return bookConsultation(request, env);
  }
  if (path === '/api/clinic/history' && request.method === 'GET') {
    return getUserHistory(request, env);
  }

  // GET /api/clinic/session/:id
  const sessionMatch = path.match(/^\/api\/clinic\/session\/([^/]+)$/);
  if (sessionMatch && request.method === 'GET') {
    return getSession(request, env, sessionMatch[1]);
  }

  // PUT /api/clinic/session/:id/status
  const statusMatch = path.match(/^\/api\/clinic\/session\/([^/]+)\/status$/);
  if (statusMatch && request.method === 'PUT') {
    return updateSessionStatus(request, env, statusMatch[1]);
  }

  // --- PAYMENT & WALLET ---
  if (path === '/api/clinic/pay' && request.method === 'POST') {
    return initiatePayment(request, env);
  }
  if (path === '/api/clinic/webhook' && request.method === 'POST') {
    return handleWebhook(request, env);
  }
  if (path === '/api/clinic/earnings' && request.method === 'GET') {
    return getEarnings(request, env);
  }
  if (path === '/api/clinic/withdraw' && request.method === 'POST') {
    return requestWithdrawal(request, env);
  }

  // --- CLINICAL TOOLS ---
  if (path === '/api/clinic/vitals' && request.method === 'POST') {
    return saveVitals(request, env);
  }
  if (path === '/api/clinic/symptoms' && request.method === 'POST') {
    return saveSymptoms(request, env);
  }
  if (path === '/api/clinic/prescription' && request.method === 'POST') {
    return savePrescription(request, env);
  }
  if (path === '/api/clinic/notes' && request.method === 'POST') {
    return saveNotes(request, env);
  }

  // GET /api/clinic/patient/:id/history
  const patientMatch = path.match(/^\/api\/clinic\/patient\/([^/]+)\/history$/);
  if (patientMatch && request.method === 'GET') {
    return getPatientHistory(request, env, patientMatch[1]);
  }

  // --- MATCHING, SLOTS & SUMMARY ---
  // GET /api/clinic/slots/:pharmacistId
  const slotsMatch = path.match(/^\/api\/clinic\/slots\/([^/]+)$/);
  if (slotsMatch && request.method === 'GET') {
    return getSlots(request, env, slotsMatch[1]);
  }
  if (path === '/api/clinic/slots' && request.method === 'POST') {
    return setSlots(request, env);
  }
  if (path === '/api/clinic/summary' && request.method === 'POST') {
    return generateSummary(request, env);
  }

  return null;
}

// ===================== HELPER FUNCTIONS =====================

async function getOrCreateWallet(pharmacistId, env) {
  let wallet = await env.DB.prepare(
    'SELECT * FROM clinic_wallets WHERE pharmacist_id = ?'
  ).bind(pharmacistId).first();
  if (!wallet) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO clinic_wallets (id, pharmacist_id, balance) VALUES (?, ?, 0)'
    ).bind(id, pharmacistId).run();
    wallet = { id, pharmacist_id: pharmacistId, balance: 0 };
  }
  return wallet;
}

async function matchPharmacist(consultation, env) {
  // Find online verified pharmacists, prefer matching specialization
  let pharmacist = null;

  if (consultation.preferred_specialization) {
    pharmacist = await env.DB.prepare(
      `SELECT p.* FROM pharmacists p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_verified = 1 AND p.is_online = 1 AND u.is_banned = 0
         AND p.specialization = ?
       ORDER BY p.composite_score DESC
       LIMIT 1`
    ).bind(consultation.preferred_specialization).first();
  }

  if (!pharmacist) {
    pharmacist = await env.DB.prepare(
      `SELECT p.* FROM pharmacists p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_verified = 1 AND p.is_online = 1 AND u.is_banned = 0
       ORDER BY p.composite_score DESC
       LIMIT 1`
    ).first();
  }

  if (!pharmacist) return null;

  // Assign pharmacist to consultation
  await env.DB.prepare(
    'UPDATE clinic_consultations SET pharmacist_id = ?, status = ? WHERE id = ?'
  ).bind(pharmacist.id, 'waiting', consultation.id).run();

  // Broadcast via Durable Object
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
        reason: consultation.reason,
        targetPharmacistUserId: pharmacist.user_id
      })
    }));
  } catch (err) {
    console.error('Clinic DO broadcast failed:', err);
  }

  return pharmacist;
}

async function getSymptomSuggestions(symptomData, env) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a clinical decision support tool for pharmacists in Ghana. Given symptom information, suggest possible conditions. Return ONLY a JSON array of objects with "condition" and "likelihood" (high/medium/low) fields. No other text.'
      },
      {
        role: 'user',
        content: `Patient reports: ${symptomData.symptom}. Onset: ${symptomData.onset || 'unknown'}. Duration: ${symptomData.duration || 'unknown'}. Severity: ${symptomData.severity || 'unknown'}/10. Location: ${symptomData.location || 'not specified'}. Aggravating factors: ${symptomData.aggravating || 'none'}. Relieving factors: ${symptomData.relieving || 'none'}.`
      }
    ];

    const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      max_tokens: 500,
      temperature: 0.3
    });

    const text = result.response || '';
    // Try to parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (err) {
    console.error('AI symptom suggestions failed:', err);
    return [];
  }
}

// ===================== CORE CRUD =====================

async function createConsultation(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { tier, reason, currentMeds, allergies, preferredSpecialization } = await request.json();

  if (!tier || !TIERS[tier]) {
    return json({ error: 'Invalid tier. Must be quick, standard, or comprehensive.' }, 400);
  }
  if (!reason || !reason.trim()) {
    return json({ error: 'Reason is required' }, 400);
  }

  const id = crypto.randomUUID();
  const tierInfo = TIERS[tier];

  await env.DB.prepare(
    `INSERT INTO clinic_consultations (id, patient_id, tier, mode, status, reason, current_meds, allergies, preferred_specialization, duration_minutes, amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.userId, tier, 'on_demand', 'pending',
    reason.trim(), currentMeds || null, allergies || null,
    preferredSpecialization || null, tierInfo.duration, tierInfo.price
  ).run();

  return json({ consultationId: id, tier: tierInfo });
}

async function bookConsultation(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { tier, pharmacistId, scheduledAt, reason, currentMeds, allergies } = await request.json();

  if (!tier || !TIERS[tier]) {
    return json({ error: 'Invalid tier' }, 400);
  }
  if (!pharmacistId || !scheduledAt || !reason) {
    return json({ error: 'pharmacistId, scheduledAt, and reason are required' }, 400);
  }

  // Validate pharmacist exists and is verified
  const pharmacist = await env.DB.prepare(
    'SELECT id FROM pharmacists WHERE id = ? AND is_verified = 1'
  ).bind(pharmacistId).first();
  if (!pharmacist) {
    return json({ error: 'Pharmacist not found or not verified' }, 404);
  }

  const id = crypto.randomUUID();
  const tierInfo = TIERS[tier];

  const status = user.role === 'admin' ? 'paid' : 'pending';

  await env.DB.prepare(
    `INSERT INTO clinic_consultations (id, patient_id, pharmacist_id, tier, mode, status, reason, current_meds, allergies, scheduled_at, duration_minutes, amount, payment_ref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.userId, pharmacistId, tier, 'booking', status,
    reason.trim(), currentMeds || null, allergies || null,
    scheduledAt, tierInfo.duration, tierInfo.price,
    user.role === 'admin' ? `admin_bypass_${Date.now()}` : null
  ).run();

  return json({ consultationId: id, tier: tierInfo, adminBypass: user.role === 'admin' });
}

async function getSession(request, env, consultationId) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const consultation = await env.DB.prepare(
    'SELECT * FROM clinic_consultations WHERE id = ?'
  ).bind(consultationId).first();
  if (!consultation) return json({ error: 'Consultation not found' }, 404);

  // Verify user is participant
  const pharmacist = await env.DB.prepare(
    'SELECT id FROM pharmacists WHERE user_id = ?'
  ).bind(user.userId).first();
  const isPatient = consultation.patient_id === user.userId;
  const isPharmacist = pharmacist && consultation.pharmacist_id === pharmacist.id;

  if (!isPatient && !isPharmacist && user.role !== 'admin') {
    return json({ error: 'Access denied' }, 403);
  }

  const vitals = await env.DB.prepare(
    'SELECT * FROM clinic_vitals WHERE consultation_id = ? ORDER BY recorded_at DESC'
  ).bind(consultationId).all();

  const symptoms = await env.DB.prepare(
    'SELECT * FROM clinic_symptoms WHERE consultation_id = ? ORDER BY created_at DESC'
  ).bind(consultationId).all();

  const prescriptions = await env.DB.prepare(
    'SELECT * FROM clinic_prescriptions WHERE consultation_id = ?'
  ).bind(consultationId).first();

  const result = {
    consultation,
    vitals: vitals.results || [],
    symptoms: symptoms.results || [],
    prescription: prescriptions || null
  };

  // Only include notes if requester is the pharmacist
  if (isPharmacist || user.role === 'admin') {
    const notes = await env.DB.prepare(
      'SELECT * FROM clinic_notes WHERE consultation_id = ?'
    ).bind(consultationId).first();
    result.notes = notes || null;
  }

  return json(result);
}

async function getUserHistory(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const consultations = await env.DB.prepare(
    `SELECT c.*, p.full_name as pharmacist_name
     FROM clinic_consultations c
     LEFT JOIN pharmacists p ON c.pharmacist_id = p.id
     WHERE c.patient_id = ?
     ORDER BY c.created_at DESC`
  ).bind(user.userId).all();

  return json({ consultations: consultations.results || [] });
}

async function updateSessionStatus(request, env, consultationId) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { status } = await request.json();
  if (!status) return json({ error: 'Status is required' }, 400);

  const consultation = await env.DB.prepare(
    'SELECT * FROM clinic_consultations WHERE id = ?'
  ).bind(consultationId).first();
  if (!consultation) return json({ error: 'Consultation not found' }, 404);

  // Verify user is participant
  const pharmacist = await env.DB.prepare(
    'SELECT id FROM pharmacists WHERE user_id = ?'
  ).bind(user.userId).first();
  const isPatient = consultation.patient_id === user.userId;
  const isPharmacist = pharmacist && consultation.pharmacist_id === pharmacist.id;

  if (!isPatient && !isPharmacist && user.role !== 'admin') {
    return json({ error: 'Access denied' }, 403);
  }

  // Allowed transitions
  const allowed = {
    paid: ['waiting'],
    waiting: ['active'],
    active: ['completed']
  };

  if (!allowed[consultation.status] || !allowed[consultation.status].includes(status)) {
    return json({ error: `Cannot transition from ${consultation.status} to ${status}` }, 400);
  }

  let extraSql = '';
  if (status === 'active') {
    extraSql = ', started_at = datetime(\'now\')';
  } else if (status === 'completed') {
    extraSql = ', ended_at = datetime(\'now\')';
  }

  await env.DB.prepare(
    `UPDATE clinic_consultations SET status = ?${extraSql} WHERE id = ?`
  ).bind(status, consultationId).run();

  return json({ success: true, status });
}

// ===================== PAYMENT & WALLET =====================

async function initiatePayment(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { consultationId } = await request.json();
  if (!consultationId) return json({ error: 'consultationId is required' }, 400);

  const consultation = await env.DB.prepare(
    'SELECT * FROM clinic_consultations WHERE id = ? AND patient_id = ?'
  ).bind(consultationId, user.userId).first();

  if (!consultation) return json({ error: 'Consultation not found' }, 404);
  if (consultation.status !== 'pending') {
    return json({ error: 'Consultation is not in pending status' }, 400);
  }

  // Admin bypass — skip payment, mark as paid directly
  if (user.role === 'admin') {
    await env.DB.prepare(
      'UPDATE clinic_consultations SET status = ?, payment_ref = ? WHERE id = ?'
    ).bind('paid', `admin_bypass_${Date.now()}`, consultationId).run();
    return json({ adminBypass: true, consultationId });
  }

  // Get user email
  const userRow = await env.DB.prepare(
    'SELECT email FROM users WHERE id = ?'
  ).bind(user.userId).first();
  if (!userRow) return json({ error: 'User not found' }, 404);

  const reference = `clinic_${consultationId}_${Date.now()}`;

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: userRow.email,
      amount: consultation.amount,
      currency: 'GHS',
      reference,
      metadata: {
        user_id: user.userId,
        consultation_id: consultationId,
        product: 'virtual-clinic'
      },
      callback_url: `${env.CORS_ORIGIN}/clinic?payment=success&consultation=${consultationId}`
    })
  });

  const paystackData = await paystackRes.json();
  if (!paystackData.status) {
    return json({ error: 'Payment initialization failed' }, 500);
  }

  // Store payment reference
  await env.DB.prepare(
    'UPDATE clinic_consultations SET payment_ref = ? WHERE id = ?'
  ).bind(reference, consultationId).run();

  return json({
    authorization_url: paystackData.data.authorization_url,
    access_code: paystackData.data.access_code,
    reference: paystackData.data.reference
  });
}

async function handleWebhook(request, env) {
  // No auth — Paystack calls this directly. Verify HMAC-SHA512 signature.
  const body = await request.text();

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(env.PAYSTACK_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
  );
  const hash = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const signature = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  const paystackSig = request.headers.get('x-paystack-signature');

  if (signature !== paystackSig) {
    return json({ error: 'Invalid signature' }, 401);
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const metadata = event.data.metadata || {};
    const consultationId = metadata.consultation_id;
    if (!consultationId) return new Response('OK', { status: 200 });

    // Only process clinic payments
    if (metadata.product !== 'virtual-clinic') return new Response('OK', { status: 200 });

    const consultation = await env.DB.prepare(
      'SELECT * FROM clinic_consultations WHERE id = ?'
    ).bind(consultationId).first();
    if (!consultation) return new Response('OK', { status: 200 });

    // Update consultation status to paid
    await env.DB.prepare(
      'UPDATE clinic_consultations SET status = ? WHERE id = ?'
    ).bind('paid', consultationId).run();

    // If pharmacist is already assigned (booking mode), credit wallet
    if (consultation.pharmacist_id) {
      const earnings = Math.floor(consultation.amount * 0.8);
      const wallet = await getOrCreateWallet(consultation.pharmacist_id, env);

      await env.DB.prepare(
        'UPDATE clinic_wallets SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(earnings, wallet.id).run();

      await env.DB.prepare(
        `INSERT INTO clinic_transactions (id, wallet_id, consultation_id, type, amount, description)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(), wallet.id, consultationId,
        'credit', earnings,
        `Earnings from ${consultation.tier} consultation`
      ).run();
    }

    // If on_demand mode, match a pharmacist
    if (consultation.mode === 'on_demand') {
      await matchPharmacist(consultation, env);
    }
  }

  return new Response('OK', { status: 200 });
}

async function getEarnings(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const pharmacist = await env.DB.prepare(
    'SELECT id FROM pharmacists WHERE user_id = ?'
  ).bind(user.userId).first();
  if (!pharmacist) return json({ error: 'Pharmacist profile not found' }, 404);

  const wallet = await getOrCreateWallet(pharmacist.id, env);

  const transactions = await env.DB.prepare(
    `SELECT * FROM clinic_transactions WHERE wallet_id = ?
     ORDER BY created_at DESC LIMIT 50`
  ).bind(wallet.id).all();

  return json({
    wallet,
    transactions: transactions.results || []
  });
}

async function requestWithdrawal(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const { amount } = await request.json();
  if (!amount || amount <= 0) return json({ error: 'Valid amount is required' }, 400);

  const pharmacist = await env.DB.prepare(
    'SELECT id FROM pharmacists WHERE user_id = ?'
  ).bind(user.userId).first();
  if (!pharmacist) return json({ error: 'Pharmacist profile not found' }, 404);

  const wallet = await getOrCreateWallet(pharmacist.id, env);

  if (amount > wallet.balance) {
    return json({ error: 'Insufficient balance' }, 400);
  }

  // Create debit transaction and reduce balance
  await env.DB.prepare(
    'UPDATE clinic_wallets SET balance = balance - ?, updated_at = datetime(\'now\') WHERE id = ?'
  ).bind(amount, wallet.id).run();

  await env.DB.prepare(
    `INSERT INTO clinic_transactions (id, wallet_id, type, amount, description)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(), wallet.id,
    'debit', amount, 'Withdrawal request'
  ).run();

  return json({ success: true, newBalance: wallet.balance - amount });
}

// ===================== CLINICAL TOOLS =====================

async function saveVitals(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { consultationId, bloodPressure, temperature, pulse, bloodSugar, weight, spo2 } = await request.json();
  if (!consultationId) return json({ error: 'consultationId is required' }, 400);

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO clinic_vitals (id, consultation_id, blood_pressure, temperature, pulse, blood_sugar, weight, spo2)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, consultationId,
    bloodPressure || null, temperature || null, pulse || null,
    bloodSugar || null, weight || null, spo2 || null
  ).run();

  return json({ id, success: true });
}

async function saveSymptoms(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { consultationId, symptom, onset, duration, severity, location, aggravating, relieving } = await request.json();
  if (!consultationId || !symptom) {
    return json({ error: 'consultationId and symptom are required' }, 400);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO clinic_symptoms (id, consultation_id, symptom, onset, duration, severity, location, aggravating, relieving)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, consultationId,
    symptom, onset || null, duration || null, severity || null,
    location || null, aggravating || null, relieving || null
  ).run();

  // Get AI suggestions non-blocking — store result
  const symptomData = { symptom, onset, duration, severity, location, aggravating, relieving };
  const suggestions = await getSymptomSuggestions(symptomData, env);

  if (suggestions.length > 0) {
    await env.DB.prepare(
      'UPDATE clinic_symptoms SET ai_suggestions = ? WHERE id = ?'
    ).bind(JSON.stringify(suggestions), id).run();
  }

  return json({ id, suggestions, success: true });
}

async function savePrescription(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { consultationId, recommendations, referralNotes, lifestyleAdvice } = await request.json();
  if (!consultationId) return json({ error: 'consultationId is required' }, 400);

  // Upsert into clinic_prescriptions
  const existing = await env.DB.prepare(
    'SELECT id FROM clinic_prescriptions WHERE consultation_id = ?'
  ).bind(consultationId).first();

  if (existing) {
    await env.DB.prepare(
      `UPDATE clinic_prescriptions SET recommendations = ?, referral_notes = ?, lifestyle_advice = ?, updated_at = datetime('now')
       WHERE consultation_id = ?`
    ).bind(
      recommendations || null, referralNotes || null,
      lifestyleAdvice || null, consultationId
    ).run();
    return json({ id: existing.id, success: true });
  } else {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO clinic_prescriptions (id, consultation_id, recommendations, referral_notes, lifestyle_advice)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      id, consultationId,
      recommendations || null, referralNotes || null, lifestyleAdvice || null
    ).run();
    return json({ id, success: true });
  }
}

async function saveNotes(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { consultationId, content } = await request.json();
  if (!consultationId || !content) {
    return json({ error: 'consultationId and content are required' }, 400);
  }

  // Upsert into clinic_notes
  const existing = await env.DB.prepare(
    'SELECT id FROM clinic_notes WHERE consultation_id = ?'
  ).bind(consultationId).first();

  if (existing) {
    await env.DB.prepare(
      `UPDATE clinic_notes SET content = ?, updated_at = datetime('now') WHERE consultation_id = ?`
    ).bind(content, consultationId).run();
    return json({ id: existing.id, success: true });
  } else {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO clinic_notes (id, consultation_id, content) VALUES (?, ?, ?)`
    ).bind(id, consultationId, content).run();
    return json({ id, success: true });
  }
}

async function getPatientHistory(request, env, patientId) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const consultations = await env.DB.prepare(
    `SELECT * FROM clinic_consultations WHERE patient_id = ?
     ORDER BY created_at DESC`
  ).bind(patientId).all();

  // Get vitals for each consultation
  const results = [];
  for (const c of (consultations.results || [])) {
    const vitals = await env.DB.prepare(
      'SELECT * FROM clinic_vitals WHERE consultation_id = ? ORDER BY recorded_at DESC'
    ).bind(c.id).all();
    results.push({ ...c, vitals: vitals.results || [] });
  }

  return json({ consultations: results });
}

// ===================== MATCHING, SLOTS & SUMMARY =====================

async function getSlots(request, env, pharmacistId) {
  // Public — no auth required
  const slots = await env.DB.prepare(
    'SELECT * FROM clinic_slots WHERE pharmacist_id = ? AND is_active = 1 ORDER BY day_of_week, start_time'
  ).bind(pharmacistId).all();

  return json({ slots: slots.results || [] });
}

async function setSlots(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const pharmacist = await env.DB.prepare(
    'SELECT id FROM pharmacists WHERE user_id = ?'
  ).bind(user.userId).first();
  if (!pharmacist) return json({ error: 'Pharmacist profile not found' }, 404);

  const { slots } = await request.json();
  if (!Array.isArray(slots)) return json({ error: 'slots must be an array' }, 400);

  // Delete existing slots
  await env.DB.prepare(
    'DELETE FROM clinic_slots WHERE pharmacist_id = ?'
  ).bind(pharmacist.id).run();

  // Insert new slots
  for (const slot of slots) {
    if (slot.dayOfWeek == null || !slot.startTime || !slot.endTime) continue;
    await env.DB.prepare(
      `INSERT INTO clinic_slots (id, pharmacist_id, day_of_week, start_time, end_time, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`
    ).bind(
      crypto.randomUUID(), pharmacist.id,
      slot.dayOfWeek, slot.startTime, slot.endTime
    ).run();
  }

  return json({ success: true, count: slots.length });
}

async function generateSummary(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { consultationId } = await request.json();
  if (!consultationId) return json({ error: 'consultationId is required' }, 400);

  const consultation = await env.DB.prepare(
    'SELECT * FROM clinic_consultations WHERE id = ?'
  ).bind(consultationId).first();
  if (!consultation) return json({ error: 'Consultation not found' }, 404);

  // Gather all clinical data
  const vitals = await env.DB.prepare(
    'SELECT * FROM clinic_vitals WHERE consultation_id = ?'
  ).bind(consultationId).all();

  const symptoms = await env.DB.prepare(
    'SELECT * FROM clinic_symptoms WHERE consultation_id = ?'
  ).bind(consultationId).all();

  const prescription = await env.DB.prepare(
    'SELECT * FROM clinic_prescriptions WHERE consultation_id = ?'
  ).bind(consultationId).first();

  const notes = await env.DB.prepare(
    'SELECT * FROM clinic_notes WHERE consultation_id = ?'
  ).bind(consultationId).first();

  // Build context for AI
  const vitalsText = (vitals.results || []).map(v =>
    `BP: ${v.blood_pressure || 'N/A'}, Temp: ${v.temperature || 'N/A'}°C, Pulse: ${v.pulse || 'N/A'}, SpO2: ${v.spo2 || 'N/A'}%, Blood Sugar: ${v.blood_sugar || 'N/A'}, Weight: ${v.weight || 'N/A'}kg`
  ).join('\n');

  const symptomsText = (symptoms.results || []).map(s =>
    `${s.symptom} (severity: ${s.severity || 'N/A'}/10, onset: ${s.onset || 'N/A'}, duration: ${s.duration || 'N/A'})`
  ).join('\n');

  const prescriptionText = prescription
    ? `Recommendations: ${prescription.recommendations || 'N/A'}\nReferral: ${prescription.referral_notes || 'N/A'}\nLifestyle: ${prescription.lifestyle_advice || 'N/A'}`
    : 'No prescription recorded.';

  const notesText = notes ? notes.content : 'No clinical notes.';

  const messages = [
    {
      role: 'system',
      content: 'You are a clinical summary generator for a Ghanaian pharmaceutical teleconsultation platform. Generate a clear, patient-friendly summary in markdown format with these headings: ## Summary, ## Vitals Recorded, ## Key Findings, ## Recommendations, ## Next Steps. Be professional, concise, and use plain language.'
    },
    {
      role: 'user',
      content: `Please generate a consultation summary.\n\nReason for visit: ${consultation.reason}\nCurrent medications: ${consultation.current_meds || 'None reported'}\nAllergies: ${consultation.allergies || 'None reported'}\n\nVitals:\n${vitalsText || 'No vitals recorded'}\n\nSymptoms:\n${symptomsText || 'No symptoms recorded'}\n\nPrescription/Recommendations:\n${prescriptionText}\n\nClinical Notes:\n${notesText}`
    }
  ];

  try {
    const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      max_tokens: 500,
      temperature: 0.3
    });

    const summary = result.response || 'Summary could not be generated.';

    // Save summary to consultation and update status
    await env.DB.prepare(
      'UPDATE clinic_consultations SET summary = ?, status = ? WHERE id = ?'
    ).bind(summary, 'summarized', consultationId).run();

    return json({ summary, success: true });
  } catch (err) {
    console.error('AI summary generation failed:', err);
    return json({ error: 'Failed to generate summary' }, 500);
  }
}
