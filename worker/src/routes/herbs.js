/**
 * Herbal & traditional medicine API.
 *
 * Serves the `herbs` table (see schema.sql + herbs-seed.sql). All content is
 * evidence-graded and may be unverified (reviewed_by = NULL) — the frontend
 * must surface evidence_level and the safety/interaction fields, and must not
 * present traditional use as proven treatment.
 */

export async function handleHerbs(request, env, path) {
  if (path === '/api/herbs/all' && request.method === 'GET') {
    return getAllHerbs(request, env);
  }
  if (path === '/api/herbs/search' && request.method === 'GET') {
    return searchHerbs(request, env);
  }
  if (path === '/api/herbs/detail' && request.method === 'GET') {
    return getHerbDetail(request, env);
  }
  return null;
}

async function getAllHerbs(request, env) {
  const results = await env.DB.prepare(
    'SELECT * FROM herbs ORDER BY common_name'
  ).all();
  return json({ herbs: results.results || [], cached_at: Date.now() });
}

async function searchHerbs(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q || q.length < 2) {
    return json({ error: 'Search query must be at least 2 characters' }, 400);
  }

  const searchTerm = `%${q}%`;
  const results = await env.DB.prepare(
    `SELECT id, common_name, local_names, scientific_name, traditional_uses,
            evidence_level, herb_drug_interactions, safety_concerns, pregnancy_caution
     FROM herbs
     WHERE common_name LIKE ? OR local_names LIKE ? OR scientific_name LIKE ? OR traditional_uses LIKE ?
     LIMIT 20`
  ).bind(searchTerm, searchTerm, searchTerm, searchTerm).all();

  return json({ herbs: results.results || [] });
}

async function getHerbDetail(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Herb id required' }, 400);

  const herb = await env.DB.prepare('SELECT * FROM herbs WHERE id = ?').bind(id).first();
  if (!herb) return json({ error: 'Herb not found' }, 404);

  return json({ herb });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
