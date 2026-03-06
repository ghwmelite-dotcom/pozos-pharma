import { authMiddleware } from '../middleware/auth.js';

export async function handleDrugs(request, env, path) {
  if (path === '/api/drugs/search' && request.method === 'GET') {
    return searchDrugs(request, env);
  }
  if (path === '/api/drugs/all' && request.method === 'GET') {
    return getAllDrugs(request, env);
  }
  if (path === '/api/drugs/nhis' && request.method === 'GET') {
    return getNhisDrugs(request, env);
  }
  if (path === '/api/drugs/detail' && request.method === 'GET') {
    return getDrugDetail(request, env);
  }
  if (path === '/api/drugs/interactions' && request.method === 'POST') {
    return checkInteractions(request, env);
  }
  return null;
}

async function searchDrugs(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q || q.length < 2) {
    return json({ error: 'Search query must be at least 2 characters' }, 400);
  }

  const searchTerm = `%${q}%`;
  const results = await env.DB.prepare(
    `SELECT id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled, nhis_covered, nhis_tier, avg_price_ghs
     FROM drugs
     WHERE generic_name LIKE ? OR brand_names LIKE ? OR drug_class LIKE ? OR uses LIKE ?
     LIMIT 20`
  ).bind(searchTerm, searchTerm, searchTerm, searchTerm).all();

  return json({ drugs: results.results || [] });
}

async function getNhisDrugs(request, env) {
  const url = new URL(request.url);
  const tier = url.searchParams.get('tier');
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  let sql = `SELECT id, generic_name, brand_names, drug_class, uses, otc, controlled, nhis_covered, nhis_tier, avg_price_ghs
     FROM drugs WHERE nhis_covered = 1`;
  const params = [];

  if (tier && ['A', 'B', 'C'].includes(tier.toUpperCase())) {
    sql += ` AND nhis_tier = ?`;
    params.push(tier.toUpperCase());
  }

  sql += ` ORDER BY generic_name ASC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const results = await env.DB.prepare(sql).bind(...params).all();

  return json({ drugs: results.results || [], page, limit });
}

async function getAllDrugs(request, env) {
  const results = await env.DB.prepare('SELECT * FROM drugs ORDER BY generic_name').all();
  return json({ drugs: results.results || [], cached_at: Date.now() });
}

async function getDrugDetail(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Drug id required' }, 400);

  const drug = await env.DB.prepare('SELECT * FROM drugs WHERE id = ?').bind(id).first();
  if (!drug) return json({ error: 'Drug not found' }, 404);

  return json({ drug });
}

const SEVERE_KEYWORDS = ['contraindicated', 'fatal', 'avoid', 'never', 'dangerous', 'do not combine'];

async function checkInteractions(request, env) {
  // Require auth
  const user = await authMiddleware(request, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { drugIds } = body;
  if (!Array.isArray(drugIds) || drugIds.length < 2 || drugIds.length > 10) {
    return json({ error: 'Provide between 2 and 10 drug IDs' }, 400);
  }

  // Fetch all specified drugs
  const placeholders = drugIds.map(() => '?').join(',');
  const result = await env.DB.prepare(
    `SELECT id, generic_name, brand_names, drug_class, interactions, uses, side_effects, dosage_notes, pregnancy_category, otc, controlled, nhis_covered, nhis_tier, avg_price_ghs
     FROM drugs WHERE id IN (${placeholders})`
  ).bind(...drugIds).all();

  const drugs = result.results || [];
  if (drugs.length < 2) {
    return json({ error: 'Could not find enough drugs with the given IDs' }, 404);
  }

  // Cross-reference each pair
  const interactions = [];
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const drugA = drugs[i];
      const drugB = drugs[j];

      const interactionsA = (drugA.interactions || '').toLowerCase();
      const interactionsB = (drugB.interactions || '').toLowerCase();
      const nameB = (drugB.generic_name || '').toLowerCase();
      const nameA = (drugA.generic_name || '').toLowerCase();
      const classB = (drugB.drug_class || '').toLowerCase();
      const classA = (drugA.drug_class || '').toLowerCase();

      // Check if A mentions B or B mentions A
      const aMentionsB = interactionsA.includes(nameB) || interactionsA.includes(classB);
      const bMentionsA = interactionsB.includes(nameA) || interactionsB.includes(classA);

      let description = '';
      let severity = 'none';

      if (aMentionsB || bMentionsA) {
        // Build description from the matching interaction text
        const parts = [];
        if (aMentionsB) parts.push(drugA.interactions);
        if (bMentionsA) parts.push(drugB.interactions);
        description = parts.join(' | ');

        // Determine severity
        const combined = description.toLowerCase();
        const isSevere = SEVERE_KEYWORDS.some(kw => combined.includes(kw));
        severity = isSevere ? 'severe' : 'moderate';
      }

      interactions.push({
        drugA: { id: drugA.id, generic_name: drugA.generic_name },
        drugB: { id: drugB.id, generic_name: drugB.generic_name },
        severity,
        description
      });
    }
  }

  // If 3+ drugs, call Workers AI for comprehensive summary
  let aiSummary = null;
  if (drugs.length >= 3) {
    try {
      const drugList = drugs.map(d => `${d.generic_name} (${d.drug_class})`).join(', ');
      const knownInteractions = interactions
        .filter(i => i.severity !== 'none')
        .map(i => `${i.drugA.generic_name} + ${i.drugB.generic_name}: ${i.severity} - ${i.description}`)
        .join('\n');

      const model = env.AI_PRIMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct';
      const aiResult = await env.AI.run(model, {
        messages: [
          {
            role: 'system',
            content: 'You are a clinical pharmacist AI. Provide a concise, professional summary of potential drug interactions. Mention any additional risks from combining multiple medications that may not be apparent from pairwise analysis. Always remind the user to consult a pharmacist. Keep your response under 300 words.'
          },
          {
            role: 'user',
            content: `A patient is taking these medications: ${drugList}.\n\nKnown pairwise interactions:\n${knownInteractions || 'None detected from database.'}\n\nProvide a comprehensive interaction summary and any additional multi-drug risks.`
          }
        ]
      });

      aiSummary = aiResult.response || aiResult.result || null;
    } catch (err) {
      console.error('AI interaction summary failed:', err);
      aiSummary = null;
    }
  }

  return json({ interactions, aiSummary, drugs });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
