import { requireRole } from '../middleware/auth.js';

export async function handleAdmin(request, env, path) {
  // Dashboard stats (support both paths)
  if ((path === '/api/admin/stats' || path === '/api/admin/dashboard') && request.method === 'GET') {
    return getAdminStats(request, env);
  }
  // Pending pharmacists (support both paths)
  if ((path === '/api/admin/pending-pharmacists' || path === '/api/admin/pharmacists/pending') && request.method === 'GET') {
    return getPendingPharmacists(request, env);
  }
  // Verify pharmacist (support both old POST body style and RESTful path style)
  if (path === '/api/admin/verify-pharmacist' && request.method === 'POST') {
    return verifyPharmacist(request, env);
  }
  // RESTful approve/reject: /api/admin/pharmacists/:id/approve or /reject
  const verifyMatch = path.match(/^\/api\/admin\/pharmacists\/([^/]+)\/(approve|reject)$/);
  if (verifyMatch && request.method === 'POST') {
    return verifyPharmacistRESTful(request, env, verifyMatch[1], verifyMatch[2]);
  }
  // Flagged messages (support both paths)
  if ((path === '/api/admin/flagged-messages' || path === '/api/admin/flagged') && request.method === 'GET') {
    return getFlaggedMessages(request, env);
  }
  if (path === '/api/admin/ban-user' && request.method === 'POST') {
    return banUser(request, env);
  }
  // AI stats
  if (path === '/api/admin/ai-stats' && request.method === 'GET') {
    return getAiStats(request, env);
  }
  // ── Pharmacist Management CRUD ──
  if (path === '/api/admin/pharmacists' && request.method === 'GET') {
    return getAllPharmacists(request, env);
  }
  if (path === '/api/admin/pharmacists/add' && request.method === 'POST') {
    return addPharmacist(request, env);
  }
  // Match /api/admin/pharmacists/:id for PUT and DELETE
  const pharmIdMatch = path.match(/^\/api\/admin\/pharmacists\/([^/]+)$/);
  if (pharmIdMatch && request.method === 'PUT') {
    return updatePharmacist(request, env, pharmIdMatch[1]);
  }
  if (pharmIdMatch && request.method === 'DELETE') {
    return removePharmacist(request, env, pharmIdMatch[1]);
  }
  // Suspend/activate: /api/admin/pharmacists/:id/suspend
  const suspendMatch = path.match(/^\/api\/admin\/pharmacists\/([^/]+)\/suspend$/);
  if (suspendMatch && request.method === 'POST') {
    return suspendPharmacist(request, env, suspendMatch[1]);
  }
  // Set tier: /api/admin/pharmacists/:id/tier
  const tierMatch = path.match(/^\/api\/admin\/pharmacists\/([^/]+)\/tier$/);
  if (tierMatch && request.method === 'PUT') {
    return setPharmacistTier(request, env, tierMatch[1]);
  }
  // Recalculate all composite scores
  if (path === '/api/admin/pharmacists/recalculate-scores' && request.method === 'POST') {
    return recalculateScores(request, env);
  }
  // ── Public ranked pharmacists ──
  if (path === '/api/admin/pharmacists/ranked' && request.method === 'GET') {
    return getRankedPharmacists(request, env);
  }
  // ── Pharmacy Management ──
  if (path === '/api/admin/pharmacies' && request.method === 'GET') {
    return listAdminPharmacies(request, env);
  }
  if (path === '/api/admin/pharmacies' && request.method === 'POST') {
    return addPharmacy(request, env);
  }
  const pharmDetailMatch = path.match(/^\/api\/admin\/pharmacies\/([^/]+)$/);
  if (pharmDetailMatch && request.method === 'PUT') {
    return updatePharmacy(request, env, pharmDetailMatch[1]);
  }
  if (pharmDetailMatch && request.method === 'DELETE') {
    return deletePharmacy(request, env, pharmDetailMatch[1]);
  }
  return null;
}

// ── Existing endpoints (fixed) ──

async function verifyPharmacist(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const { pharmacistId, approved } = await request.json();
  if (!pharmacistId) return json({ error: 'pharmacistId required' }, 400);

  if (approved) {
    await env.DB.prepare(
      'UPDATE pharmacists SET is_verified = 1, verified_at = unixepoch() WHERE id = ?'
    ).bind(pharmacistId).run();
  } else {
    await env.DB.prepare('DELETE FROM pharmacists WHERE id = ?').bind(pharmacistId).run();
  }

  return json({ success: true, verified: !!approved });
}

async function verifyPharmacistRESTful(request, env, pharmacistId, action) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  if (action === 'approve') {
    await env.DB.prepare(
      'UPDATE pharmacists SET is_verified = 1, verified_at = unixepoch() WHERE id = ?'
    ).bind(pharmacistId).run();
  } else {
    await env.DB.prepare('DELETE FROM pharmacists WHERE id = ?').bind(pharmacistId).run();
  }

  return json({ success: true, action });
}

async function getFlaggedMessages(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const messages = await env.DB.prepare(
    `SELECT m.*, u.username, s.topic, s.room_id
     FROM messages m
     LEFT JOIN users u ON m.sender_id = u.id
     LEFT JOIN sessions s ON m.session_id = s.id
     WHERE m.is_flagged = 1
     ORDER BY m.created_at DESC LIMIT ?`
  ).bind(limit).all();

  return json({ messages: messages.results || [] });
}

async function getAdminStats(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const [totalUsers, totalSessions, totalMessages, activePharmacists, flaggedCount, handoffRate, avgSatisfaction, activeToday] =
    await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as c FROM users').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM sessions').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM messages').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM pharmacists WHERE is_verified = 1').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM messages WHERE is_flagged = 1').first(),
      env.DB.prepare(
        `SELECT CAST(COUNT(CASE WHEN status != 'ai_active' THEN 1 END) AS REAL) / MAX(COUNT(*), 1) * 100 as rate FROM sessions`
      ).first(),
      env.DB.prepare('SELECT AVG(satisfaction_rating) as avg FROM sessions WHERE satisfaction_rating IS NOT NULL').first(),
      env.DB.prepare('SELECT COUNT(DISTINCT user_id) as c FROM sessions WHERE started_at > unixepoch() - 86400').first()
    ]);

  const topTopics = await env.DB.prepare(
    'SELECT topic as name, COUNT(*) as count FROM sessions WHERE topic IS NOT NULL GROUP BY topic ORDER BY count DESC LIMIT 10'
  ).all();

  return json({
    total_users: totalUsers?.c || 0,
    total_sessions: totalSessions?.c || 0,
    total_messages: totalMessages?.c || 0,
    total_pharmacists: activePharmacists?.c || 0,
    flagged_count: flaggedCount?.c || 0,
    handoff_rate: Math.round((handoffRate?.rate || 0) * 10) / 10,
    avg_satisfaction: avgSatisfaction?.avg || 0,
    active_today: activeToday?.c || 0,
    top_topics: topTopics.results || []
  });
}

async function getPendingPharmacists(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const pending = await env.DB.prepare(
    `SELECT p.*, u.username, u.email
     FROM pharmacists p JOIN users u ON p.user_id = u.id
     WHERE p.is_verified = 0
     ORDER BY p.rowid DESC`
  ).all();

  return json({ pharmacists: pending.results || [] });
}

async function banUser(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const { userId, ban } = await request.json();
  await env.DB.prepare('UPDATE users SET is_banned = ? WHERE id = ?').bind(ban ? 1 : 0, userId).run();

  return json({ success: true });
}

async function getAiStats(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const totalAi = await env.DB.prepare("SELECT COUNT(*) as c FROM messages WHERE sender_type = 'ai'").first();
  const totalErrors = await env.DB.prepare("SELECT COUNT(*) as c FROM messages WHERE sender_type = 'ai' AND content LIKE '%unavailable%'").first();
  const totalRequests = totalAi?.c || 0;
  const errors = totalErrors?.c || 0;

  return json({
    model_usage: [
      { model_name: 'llama-3.1-8b (Simple)', count: Math.round(totalRequests * 0.7) },
      { model_name: 'llama-3.3-70b (Complex)', count: Math.round(totalRequests * 0.25) },
      { model_name: 'mistral-7b (Fallback)', count: Math.round(totalRequests * 0.05) }
    ],
    total_requests: totalRequests,
    total_errors: errors,
    error_rate: totalRequests > 0 ? (errors / totalRequests) * 100 : 0,
    avg_response_ms: 850
  });
}

// ── New Pharmacist Management Endpoints ──

async function getAllPharmacists(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || 'all';
  const tier = url.searchParams.get('tier') || 'all';

  let query = `SELECT p.*, u.username, u.email, u.is_banned,
    (SELECT COUNT(*) FROM reviews r WHERE r.pharmacist_id = p.id) as review_count,
    (SELECT AVG(r.rating) FROM reviews r WHERE r.pharmacist_id = p.id) as avg_review_rating
    FROM pharmacists p JOIN users u ON p.user_id = u.id WHERE 1=1`;
  const binds = [];

  if (search) {
    query += ` AND (p.full_name LIKE ? OR u.username LIKE ? OR p.license_number LIKE ?)`;
    binds.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status === 'verified') { query += ' AND p.is_verified = 1'; }
  else if (status === 'pending') { query += ' AND p.is_verified = 0'; }
  else if (status === 'suspended') { query += ' AND u.is_banned = 1'; }

  if (tier !== 'all') {
    query += ' AND p.tier = ?';
    binds.push(tier);
  }

  query += ' ORDER BY p.composite_score DESC, p.rating DESC';

  const stmt = env.DB.prepare(query);
  const result = binds.length > 0 ? await stmt.bind(...binds).all() : await stmt.all();

  return json({ pharmacists: result.results || [] });
}

async function addPharmacist(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const { email, username, fullName, licenseNumber, country, specialization, bio, tier, password } = await request.json();
  if (!email || !fullName || !licenseNumber) {
    return json({ error: 'email, fullName, and licenseNumber are required' }, 400);
  }

  // Check if user exists
  let existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  let userId;

  if (existingUser) {
    userId = existingUser.id;
    // Check if already a pharmacist
    const existingPharm = await env.DB.prepare('SELECT id FROM pharmacists WHERE user_id = ?').bind(userId).first();
    if (existingPharm) {
      return json({ error: 'This user is already registered as a pharmacist' }, 409);
    }
    // Update role
    await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind('pharmacist', userId).run();
  } else {
    // Create user account
    userId = crypto.randomUUID();
    const tempPassword = password || crypto.randomUUID().slice(0, 12);
    // Hash password using Web Crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(tempPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    await env.DB.prepare(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, username || email.split('@')[0], email, passwordHash, 'pharmacist').run();
  }

  const pharmacistId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO pharmacists (id, user_id, full_name, license_number, country, specialization, bio, tier, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).bind(
    pharmacistId, userId, fullName, licenseNumber,
    country || 'Ghana', specialization || '', bio || '',
    tier || 'standard'
  ).run();

  // Set verified immediately since admin is adding
  await env.DB.prepare(
    'UPDATE pharmacists SET verified_at = unixepoch() WHERE id = ?'
  ).bind(pharmacistId).run();

  return json({ success: true, pharmacistId, userId });
}

async function updatePharmacist(request, env, pharmacistId) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const updates = await request.json();
  const allowed = ['full_name', 'license_number', 'country', 'specialization', 'bio', 'tier', 'badge_level'];
  const sets = [];
  const binds = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sets.push(`${key} = ?`);
      binds.push(updates[key]);
    }
  }

  if (sets.length === 0) return json({ error: 'No valid fields to update' }, 400);

  binds.push(pharmacistId);
  await env.DB.prepare(
    `UPDATE pharmacists SET ${sets.join(', ')} WHERE id = ?`
  ).bind(...binds).run();

  return json({ success: true });
}

async function removePharmacist(request, env, pharmacistId) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  // Get user_id before deleting
  const pharm = await env.DB.prepare('SELECT user_id FROM pharmacists WHERE id = ?').bind(pharmacistId).first();
  if (!pharm) return json({ error: 'Pharmacist not found' }, 404);

  await env.DB.prepare('DELETE FROM pharmacists WHERE id = ?').bind(pharmacistId).run();
  // Reset user role
  await env.DB.prepare("UPDATE users SET role = 'user' WHERE id = ?").bind(pharm.user_id).run();

  return json({ success: true });
}

async function suspendPharmacist(request, env, pharmacistId) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const { suspended } = await request.json();
  const pharm = await env.DB.prepare('SELECT user_id FROM pharmacists WHERE id = ?').bind(pharmacistId).first();
  if (!pharm) return json({ error: 'Pharmacist not found' }, 404);

  await env.DB.prepare('UPDATE users SET is_banned = ? WHERE id = ?').bind(suspended ? 1 : 0, pharm.user_id).run();
  // Also set offline
  if (suspended) {
    await env.DB.prepare('UPDATE pharmacists SET is_online = 0 WHERE id = ?').bind(pharmacistId).run();
  }

  return json({ success: true, suspended: !!suspended });
}

async function setPharmacistTier(request, env, pharmacistId) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const { tier } = await request.json();
  const validTiers = ['standard', 'senior', 'lead', 'specialist'];
  if (!validTiers.includes(tier)) {
    return json({ error: 'Invalid tier. Must be: standard, senior, lead, specialist' }, 400);
  }

  await env.DB.prepare('UPDATE pharmacists SET tier = ? WHERE id = ?').bind(tier, pharmacistId).run();
  // Recalculate this pharmacist's score
  await recalculatePharmacistScore(env, pharmacistId);

  return json({ success: true, tier });
}

async function recalculateScores(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const pharmacists = await env.DB.prepare('SELECT id FROM pharmacists WHERE is_verified = 1').all();
  let updated = 0;
  for (const p of (pharmacists.results || [])) {
    await recalculatePharmacistScore(env, p.id);
    updated++;
  }

  return json({ success: true, updated });
}

async function recalculatePharmacistScore(env, pharmacistId) {
  const pharm = await env.DB.prepare(
    'SELECT total_sessions, rating, response_time_avg, tier FROM pharmacists WHERE id = ?'
  ).bind(pharmacistId).first();
  if (!pharm) return;

  // Tier bonus: standard=0, senior=5, lead=10, specialist=15
  const tierBonus = { standard: 0, senior: 5, lead: 10, specialist: 15 };
  const bonus = tierBonus[pharm.tier] || 0;

  // Normalize sessions (max 100 sessions = 10 points)
  const sessionScore = Math.min((pharm.total_sessions || 0) / 10, 10);
  // Response time score (lower is better, max 10 points for < 30s)
  const rtAvg = pharm.response_time_avg || 300;
  const responseScore = Math.max(0, 10 - (rtAvg / 60));
  // Rating score (0-5 mapped to 0-10)
  const ratingScore = ((pharm.rating || 0) / 5) * 10;

  // Composite: response metrics 40%, community ratings 40%, tier 20%
  const composite = (sessionScore + responseScore) * 0.4 + ratingScore * 0.4 + bonus * 0.2;

  await env.DB.prepare(
    'UPDATE pharmacists SET composite_score = ? WHERE id = ?'
  ).bind(Math.round(composite * 100) / 100, pharmacistId).run();
}

async function getRankedPharmacists(request, env) {
  // Public endpoint - no auth required
  const url = new URL(request.url);
  const specialization = url.searchParams.get('specialization') || '';
  const tier = url.searchParams.get('tier') || '';
  const onlineOnly = url.searchParams.get('online') === 'true';

  let query = `SELECT p.id, p.full_name, p.specialization, p.country, p.bio, p.rating,
    p.total_sessions, p.badge_level, p.tier, p.composite_score, p.is_online,
    p.response_time_avg, u.username, u.avatar_url,
    (SELECT COUNT(*) FROM reviews r WHERE r.pharmacist_id = p.id) as review_count
    FROM pharmacists p JOIN users u ON p.user_id = u.id
    WHERE p.is_verified = 1`;
  const binds = [];

  if (specialization) {
    query += ' AND p.specialization = ?';
    binds.push(specialization);
  }
  if (tier) {
    query += ' AND p.tier = ?';
    binds.push(tier);
  }
  if (onlineOnly) {
    query += ' AND p.is_online = 1';
  }

  query += ' ORDER BY p.composite_score DESC, p.rating DESC';

  const stmt = env.DB.prepare(query);
  const result = binds.length > 0 ? await stmt.bind(...binds).all() : await stmt.all();

  return json({ pharmacists: result.results || [] });
}

// ── Pharmacy Management ──

async function listAdminPharmacies(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  let query = 'SELECT * FROM pharmacies WHERE 1=1';
  const binds = [];

  if (search) {
    query += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(city) LIKE LOWER(?) OR LOWER(address) LIKE LOWER(?))';
    const term = `%${search}%`;
    binds.push(term, term, term);
  }

  query += ' ORDER BY name ASC';
  const stmt = env.DB.prepare(query);
  const result = binds.length > 0 ? await stmt.bind(...binds).all() : await stmt.all();

  return json({ pharmacies: result.results || [] });
}

async function addPharmacy(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const body = await request.json();
  const { name, address, city, region, lat, lng, phone, hours, is_partner, nhis_accepted } = body;

  if (!name || !address || !city || !region) {
    return json({ error: 'name, address, city, and region are required' }, 400);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO pharmacies (id, name, address, city, region, lat, lng, phone, hours, is_partner, nhis_accepted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, name, address, city, region, lat || null, lng || null, phone || null, hours || null, is_partner ? 1 : 0, nhis_accepted ? 1 : 0).run();

  return json({ success: true, id });
}

async function updatePharmacy(request, env, pharmacyId) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const updates = await request.json();
  const allowed = ['name', 'address', 'city', 'region', 'lat', 'lng', 'phone', 'hours', 'is_partner', 'nhis_accepted'];
  const sets = [];
  const binds = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sets.push(`${key} = ?`);
      binds.push(key === 'is_partner' || key === 'nhis_accepted' ? (updates[key] ? 1 : 0) : updates[key]);
    }
  }

  if (sets.length === 0) return json({ error: 'No valid fields to update' }, 400);
  binds.push(pharmacyId);

  await env.DB.prepare(`UPDATE pharmacies SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();
  return json({ success: true });
}

async function deletePharmacy(request, env, pharmacyId) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  await env.DB.prepare('DELETE FROM pharmacy_stock WHERE pharmacy_id = ?').bind(pharmacyId).run();
  await env.DB.prepare('DELETE FROM pharmacies WHERE id = ?').bind(pharmacyId).run();

  return json({ success: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
