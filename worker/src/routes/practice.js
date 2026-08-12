import { requireRole } from '../middleware/auth.js';

const CONDITION_CATEGORIES = new Set([
  'cardiovascular',
  'diabetes',
  'infectious_disease',
  'malaria',
  'maternal_health',
  'mental_health',
  'pain_management',
  'respiratory',
  'other',
]);

const ISSUE_TYPES = new Set([
  'contraindication',
  'dose_adjustment',
  'duplicate_therapy',
  'interaction',
  'non_adherence',
  'prescribing_error',
  'other',
]);

const SEVERITIES = new Set(['low', 'moderate', 'high', 'critical']);
const OUTCOMES = new Set(['accepted', 'partially_accepted', 'referred', 'resolved', 'pending']);
const MAX_PAGE_SIZE = 100;
const DIRECT_IDENTIFIER_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?233|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/,
  /\b(?:nhis|membership|patient)\s*(?:id|number|no\.?|#)\b/i,
];

export async function handlePractice(request, env, path) {
  const auth = await requireVerifiedPharmacist(request, env);
  if (auth.error) return auth.error;

  if (path === '/api/practice/overview' && request.method === 'GET') {
    return getOverview(env, auth.pharmacist);
  }
  if (path === '/api/practice/interventions' && request.method === 'GET') {
    return listInterventions(request, env, auth.pharmacist);
  }
  if (path === '/api/practice/interventions' && request.method === 'POST') {
    return createIntervention(request, env, auth);
  }
  if (path === '/api/practice/interventions/export.csv' && request.method === 'GET') {
    return exportInterventions(env, auth.pharmacist);
  }

  return null;
}

async function requireVerifiedPharmacist(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return { error };

  const pharmacist = await env.DB.prepare(
    `SELECT id, full_name, license_number, specialization
     FROM pharmacists
     WHERE user_id = ? AND is_verified = 1`
  ).bind(user.userId).first();

  if (!pharmacist) {
    return { error: json({ error: 'A verified pharmacist account is required' }, 403) };
  }

  return { user, pharmacist };
}

async function getOverview(env, pharmacist) {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 86400);

  const [summary, conditionTrends, issueMix, recent] = await Promise.all([
    env.DB.prepare(
      `SELECT
         COUNT(*) AS total_30d,
         SUM(CASE WHEN severity IN ('high', 'critical') THEN 1 ELSE 0 END) AS safety_critical_30d,
         SUM(CASE WHEN reportable = 1 THEN 1 ELSE 0 END) AS reportable_30d,
         SUM(CASE WHEN outcome IN ('accepted', 'resolved') THEN 1 ELSE 0 END) AS accepted_or_resolved_30d
       FROM clinical_interventions
       WHERE pharmacist_id = ? AND occurred_at >= ?`
    ).bind(pharmacist.id, thirtyDaysAgo).first(),
    env.DB.prepare(
      `SELECT condition_category AS category, COUNT(*) AS count
       FROM clinical_interventions
       WHERE pharmacist_id = ? AND occurred_at >= ?
       GROUP BY condition_category
       ORDER BY count DESC, category ASC
       LIMIT 8`
    ).bind(pharmacist.id, thirtyDaysAgo).all(),
    env.DB.prepare(
      `SELECT issue_type AS type, COUNT(*) AS count
       FROM clinical_interventions
       WHERE pharmacist_id = ? AND occurred_at >= ?
       GROUP BY issue_type
       ORDER BY count DESC, type ASC
       LIMIT 8`
    ).bind(pharmacist.id, thirtyDaysAgo).all(),
    env.DB.prepare(
      `SELECT id, reference_code, condition_category, drug_names, issue_type, severity,
              action_taken, outcome, reportable, occurred_at
       FROM clinical_interventions
       WHERE pharmacist_id = ?
       ORDER BY occurred_at DESC, created_at DESC
       LIMIT 6`
    ).bind(pharmacist.id).all(),
  ]);

  const total = Number(summary?.total_30d || 0);
  const accepted = Number(summary?.accepted_or_resolved_30d || 0);

  return json({
    practitioner: {
      name: pharmacist.full_name,
      license_number: pharmacist.license_number,
      specialization: pharmacist.specialization,
    },
    period_days: 30,
    summary: {
      total_interventions: total,
      safety_critical: Number(summary?.safety_critical_30d || 0),
      reportable: Number(summary?.reportable_30d || 0),
      accepted_or_resolved: accepted,
      acceptance_rate: total > 0 ? Math.round((accepted / total) * 100) : 0,
    },
    condition_trends: conditionTrends.results || [],
    issue_mix: issueMix.results || [],
    recent_interventions: recent.results || [],
    privacy: 'Aggregates contain no patient identifiers.',
  });
}

async function listInterventions(request, env, pharmacist) {
  const url = new URL(request.url);
  const requestedLimit = Number.parseInt(url.searchParams.get('limit') || '25', 10);
  const requestedOffset = Number.parseInt(url.searchParams.get('offset') || '0', 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
    : 25;
  const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;

  const [rows, count] = await Promise.all([
    env.DB.prepare(
      `SELECT id, reference_code, condition_category, drug_names, issue_type, severity,
              action_taken, outcome, reportable, notes, occurred_at, created_at, updated_at
       FROM clinical_interventions
       WHERE pharmacist_id = ?
       ORDER BY occurred_at DESC, created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(pharmacist.id, limit, offset).all(),
    env.DB.prepare(
      'SELECT COUNT(*) AS count FROM clinical_interventions WHERE pharmacist_id = ?'
    ).bind(pharmacist.id).first(),
  ]);

  return json({
    interventions: rows.results || [],
    pagination: { limit, offset, total: Number(count?.count || 0) },
  });
}

async function createIntervention(request, env, auth) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validateIntervention(body);
  if (validation.error) return json({ error: validation.error }, 400);

  const data = validation.data;
  if (data.clientRequestId) {
    const existing = await env.DB.prepare(
      `SELECT id, reference_code FROM clinical_interventions
       WHERE pharmacist_id = ? AND client_request_id = ?`
    ).bind(auth.pharmacist.id, data.clientRequestId).first();

    if (existing) {
      return json({ intervention: existing, replayed: true });
    }
  }

  const id = crypto.randomUUID();
  const referenceCode = createReferenceCode();

  const insert = await env.DB.prepare(
    `INSERT OR IGNORE INTO clinical_interventions (
       id, pharmacist_id, recorded_by_user_id, client_request_id, reference_code,
       condition_category, drug_names, issue_type, severity, action_taken,
       outcome, reportable, notes, occurred_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    auth.pharmacist.id,
    auth.user.userId,
    data.clientRequestId,
    referenceCode,
    data.conditionCategory,
    data.drugNames,
    data.issueType,
    data.severity,
    data.actionTaken,
    data.outcome,
    data.reportable ? 1 : 0,
    data.notes,
    data.occurredAt
  ).run();

  if (!insert.meta?.changes && data.clientRequestId) {
    const existing = await env.DB.prepare(
      `SELECT id, reference_code FROM clinical_interventions
       WHERE pharmacist_id = ? AND client_request_id = ?`
    ).bind(auth.pharmacist.id, data.clientRequestId).first();
    if (existing) return json({ intervention: existing, replayed: true });
  }

  return json({
    intervention: { id, reference_code: referenceCode },
    message: 'Intervention recorded',
  }, 201);
}

async function exportInterventions(env, pharmacist) {
  const rows = await env.DB.prepare(
    `SELECT reference_code, occurred_at, condition_category, drug_names, issue_type,
            severity, action_taken, outcome, reportable, notes
     FROM clinical_interventions
     WHERE pharmacist_id = ?
     ORDER BY occurred_at DESC, created_at DESC`
  ).bind(pharmacist.id).all();

  const headers = [
    'Reference',
    'Occurred At',
    'Condition Category',
    'Medicines',
    'Issue Type',
    'Severity',
    'Action Taken',
    'Outcome',
    'Reportable',
    'Notes',
  ];

  const csvRows = [headers, ...(rows.results || []).map((row) => [
    row.reference_code,
    new Date(row.occurred_at * 1000).toISOString(),
    row.condition_category,
    row.drug_names,
    row.issue_type,
    row.severity,
    row.action_taken,
    row.outcome,
    row.reportable ? 'Yes' : 'No',
    row.notes || '',
  ])];

  const csv = csvRows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pharmacy-interventions-${date}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

function validateIntervention(body) {
  const lengthError = validateTextLengths(body);
  if (lengthError) return { error: lengthError };

  const conditionCategory = cleanText(body.conditionCategory, 60);
  const drugNames = cleanText(body.drugNames, 300);
  const issueType = cleanText(body.issueType, 60);
  const severity = cleanText(body.severity, 20);
  const actionTaken = cleanText(body.actionTaken, 1000);
  const outcome = cleanText(body.outcome, 40);
  const notes = cleanText(body.notes, 1500, true);
  const clientRequestId = cleanText(body.clientRequestId, 100, true);

  if (!CONDITION_CATEGORIES.has(conditionCategory)) return { error: 'Invalid condition category' };
  if (!drugNames) return { error: 'At least one medicine is required' };
  if (!ISSUE_TYPES.has(issueType)) return { error: 'Invalid issue type' };
  if (!SEVERITIES.has(severity)) return { error: 'Invalid severity' };
  if (!actionTaken) return { error: 'Action taken is required' };
  if (!OUTCOMES.has(outcome)) return { error: 'Invalid outcome' };
  if (containsDirectIdentifier([drugNames, actionTaken, notes].filter(Boolean).join(' '))) {
    return { error: 'Remove direct patient identifiers before saving' };
  }

  const occurred = body.occurredAt ? Date.parse(body.occurredAt) : Date.now();
  if (!Number.isFinite(occurred)) return { error: 'Invalid occurrence date' };
  if (occurred > Date.now() + 300000) return { error: 'Occurrence date cannot be in the future' };

  return {
    data: {
      conditionCategory,
      drugNames,
      issueType,
      severity,
      actionTaken,
      outcome,
      notes,
      clientRequestId,
      reportable: body.reportable === true,
      occurredAt: Math.floor(occurred / 1000),
    },
  };
}

function containsDirectIdentifier(value) {
  return DIRECT_IDENTIFIER_PATTERNS.some((pattern) => pattern.test(value));
}

function validateTextLengths(body) {
  const limits = {
    conditionCategory: 60,
    drugNames: 300,
    issueType: 60,
    severity: 20,
    actionTaken: 1000,
    outcome: 40,
    notes: 1500,
    clientRequestId: 100,
  };

  for (const [field, limit] of Object.entries(limits)) {
    const value = body[field];
    if (value != null && typeof value !== 'string') return `${field} must be text`;
    if (typeof value === 'string' && value.trim().length > limit) {
      return `${field} exceeds the ${limit} character limit`;
    }
  }
  return null;
}

function cleanText(value, maxLength, optional = false) {
  if (typeof value !== 'string') return optional ? null : '';
  const cleaned = value.trim();
  if (!cleaned) return optional ? null : '';
  return cleaned.slice(0, maxLength);
}

function createReferenceCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `PZI-${date}-${suffix}`;
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
    },
  });
}
