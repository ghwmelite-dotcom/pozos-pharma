import { authMiddleware } from '../middleware/auth.js';

export async function handleDrugs(request, env, path) {
  if (path === '/api/drugs/search' && request.method === 'GET') {
    return searchDrugs(request, env);
  }
  if (path === '/api/drugs/detail' && request.method === 'GET') {
    return getDrugDetail(request, env);
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
    `SELECT id, generic_name, brand_names, drug_class, uses, side_effects, otc, controlled
     FROM drugs
     WHERE generic_name LIKE ? OR brand_names LIKE ? OR drug_class LIKE ? OR uses LIKE ?
     LIMIT 10`
  ).bind(searchTerm, searchTerm, searchTerm, searchTerm).all();

  return json({ drugs: results.results || [] });
}

async function getDrugDetail(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Drug id required' }, 400);

  const drug = await env.DB.prepare('SELECT * FROM drugs WHERE id = ?').bind(id).first();
  if (!drug) return json({ error: 'Drug not found' }, 404);

  return json({ drug });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
