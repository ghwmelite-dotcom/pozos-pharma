import { authMiddleware } from '../middleware/auth.js';

export async function handlePharmacies(request, env, path) {
  const url = new URL(request.url);

  // GET /api/pharmacies/nearby
  if (path === '/api/pharmacies/nearby' && request.method === 'GET') {
    return getNearbyPharmacies(url, env);
  }

  // GET /api/pharmacies/:id/stock
  const stockMatch = path.match(/^\/api\/pharmacies\/([^/]+)\/stock$/);
  if (stockMatch && request.method === 'GET') {
    return getPharmacyStock(stockMatch[1], env);
  }

  // POST /api/pharmacies/:id/stock
  if (stockMatch && request.method === 'POST') {
    return updatePharmacyStock(stockMatch[1], request, env);
  }

  // GET /api/pharmacies/:id
  const detailMatch = path.match(/^\/api\/pharmacies\/([^/]+)$/);
  if (detailMatch && request.method === 'GET') {
    return getPharmacyDetail(detailMatch[1], env);
  }

  // GET /api/pharmacies
  if (path === '/api/pharmacies' && request.method === 'GET') {
    return listPharmacies(url, env);
  }

  return null;
}

async function listPharmacies(url, env) {
  const city = url.searchParams.get('city');
  const region = url.searchParams.get('region');
  const nhis = url.searchParams.get('nhis');
  const partner = url.searchParams.get('partner');
  const q = url.searchParams.get('q');
  const lat = parseFloat(url.searchParams.get('lat'));
  const lng = parseFloat(url.searchParams.get('lng'));
  const radius = parseFloat(url.searchParams.get('radius')) || 50;

  let sql = 'SELECT * FROM pharmacies WHERE 1=1';
  const params = [];

  if (city) {
    sql += ' AND LOWER(city) = LOWER(?)';
    params.push(city);
  }
  if (region) {
    sql += ' AND LOWER(region) = LOWER(?)';
    params.push(region);
  }
  if (nhis === '1') {
    sql += ' AND nhis_accepted = 1';
  }
  if (partner === '1') {
    sql += ' AND is_partner = 1';
  }
  if (q) {
    sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(address) LIKE LOWER(?) OR LOWER(city) LIKE LOWER(?))';
    const term = `%${q}%`;
    params.push(term, term, term);
  }

  if (!isNaN(lat) && !isNaN(lng)) {
    // Approximate squared distance for sorting
    sql += ' ORDER BY ((lat - ?) * (lat - ?) + (lng - ?) * (lng - ?)) ASC';
    params.push(lat, lat, lng, lng);
  } else {
    sql += ' ORDER BY name ASC';
  }

  sql += ' LIMIT 50';

  const results = await env.DB.prepare(sql).bind(...params).all();

  // If lat/lng provided, compute approximate distance in km for each result
  let pharmacies = results.results || [];
  if (!isNaN(lat) && !isNaN(lng)) {
    pharmacies = pharmacies.map(p => {
      const dLat = (p.lat - lat) * 111.32;
      const dLng = (p.lng - lng) * 111.32 * Math.cos(lat * Math.PI / 180);
      const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
      return { ...p, distance_km: Math.round(distKm * 10) / 10 };
    });
  }

  return json({ pharmacies });
}

async function getPharmacyDetail(id, env) {
  const pharmacy = await env.DB.prepare('SELECT * FROM pharmacies WHERE id = ?').bind(id).first();
  if (!pharmacy) return json({ error: 'Pharmacy not found' }, 404);

  // Also get stock
  const stock = await env.DB.prepare(
    `SELECT ps.id, ps.drug_id, ps.in_stock, ps.price_ghs, ps.updated_at,
            d.generic_name, d.brand_names, d.drug_class
     FROM pharmacy_stock ps
     LEFT JOIN drugs d ON ps.drug_id = d.id
     WHERE ps.pharmacy_id = ?
     ORDER BY d.generic_name`
  ).bind(id).all();

  return json({ pharmacy, stock: stock.results || [] });
}

async function getPharmacyStock(pharmacyId, env) {
  const stock = await env.DB.prepare(
    `SELECT ps.id, ps.drug_id, ps.in_stock, ps.price_ghs, ps.updated_at,
            d.generic_name, d.brand_names, d.drug_class, d.nhis_covered, d.avg_price_ghs
     FROM pharmacy_stock ps
     LEFT JOIN drugs d ON ps.drug_id = d.id
     WHERE ps.pharmacy_id = ?
     ORDER BY d.generic_name`
  ).bind(pharmacyId).all();

  return json({ stock: stock.results || [] });
}

async function updatePharmacyStock(pharmacyId, request, env) {
  // Require auth - admin or partner
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  if (user.role !== 'admin' && user.role !== 'pharmacist') {
    return json({ error: 'Forbidden' }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { drug_id, in_stock, price_ghs } = body;
  if (!drug_id) return json({ error: 'drug_id required' }, 400);

  const id = `ps-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await env.DB.prepare(
    `INSERT INTO pharmacy_stock (id, pharmacy_id, drug_id, in_stock, price_ghs, updated_at)
     VALUES (?, ?, ?, ?, ?, unixepoch())
     ON CONFLICT(id) DO UPDATE SET in_stock = excluded.in_stock, price_ghs = excluded.price_ghs, updated_at = unixepoch()`
  ).bind(id, pharmacyId, drug_id, in_stock ? 1 : 0, price_ghs || null).run();

  return json({ success: true, id });
}

async function getNearbyPharmacies(url, env) {
  const lat = parseFloat(url.searchParams.get('lat'));
  const lng = parseFloat(url.searchParams.get('lng'));
  const limit = Math.min(20, parseInt(url.searchParams.get('limit') || '10', 10));

  if (isNaN(lat) || isNaN(lng)) {
    return json({ error: 'lat and lng are required' }, 400);
  }

  const results = await env.DB.prepare(
    `SELECT *, ((lat - ?) * (lat - ?) + (lng - ?) * (lng - ?)) AS dist_sq
     FROM pharmacies
     WHERE lat IS NOT NULL AND lng IS NOT NULL
     ORDER BY dist_sq ASC
     LIMIT ?`
  ).bind(lat, lat, lng, lng, limit).all();

  const pharmacies = (results.results || []).map(p => {
    const dLat = (p.lat - lat) * 111.32;
    const dLng = (p.lng - lng) * 111.32 * Math.cos(lat * Math.PI / 180);
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
    const { dist_sq, ...rest } = p;
    return { ...rest, distance_km: Math.round(distKm * 10) / 10 };
  });

  return json({ pharmacies });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
