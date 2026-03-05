import { authMiddleware, requireRole } from '../middleware/auth.js';

export async function handlePharmacist(request, env, path) {
  if (path === '/api/pharmacist/register' && request.method === 'POST') {
    return registerPharmacist(request, env);
  }
  if (path === '/api/pharmacists/online' && request.method === 'GET') {
    return getOnlinePharmacists(request, env);
  }
  if (path === '/api/pharmacist/toggle-online' && request.method === 'POST') {
    return toggleOnline(request, env);
  }
  if (path === '/api/pharmacist/stats' && request.method === 'GET') {
    return getStats(request, env);
  }
  if (path === '/api/handoff/request' && request.method === 'POST') {
    return requestHandoff(request, env);
  }
  if (path === '/api/handoff/accept' && request.method === 'POST') {
    return acceptHandoff(request, env);
  }
  if (path === '/api/handoff/close' && request.method === 'POST') {
    return closeHandoff(request, env);
  }
  if (path === '/api/handoff/queue' && request.method === 'GET') {
    return getHandoffQueue(request, env);
  }
  if (path === '/api/pharmacist/reviews' && request.method === 'POST') {
    return submitReview(request, env);
  }
  return null;
}

async function registerPharmacist(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const formData = await request.formData();
  const fullName = formData.get('fullName');
  const licenseNumber = formData.get('licenseNumber');
  const country = formData.get('country') || 'Ghana';
  const specialization = formData.get('specialization') || '';
  const bio = formData.get('bio') || '';
  const licenseDoc = formData.get('licenseDoc');

  if (!fullName || !licenseNumber) {
    return json({ error: 'Full name and license number are required' }, 400);
  }

  // Upload license document to R2
  let licenseDocKey = null;
  if (licenseDoc && licenseDoc.size > 0) {
    if (licenseDoc.size > 5 * 1024 * 1024) {
      return json({ error: 'License document must be under 5MB' }, 400);
    }
    licenseDocKey = `licenses/${user.userId}/${crypto.randomUUID()}-${licenseDoc.name}`;
    await env.R2.put(licenseDocKey, licenseDoc.stream(), {
      httpMetadata: { contentType: licenseDoc.type }
    });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO pharmacists (id, user_id, full_name, license_number, country, specialization, bio, license_doc_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.userId, fullName, licenseNumber, country, specialization, bio, licenseDocKey).run();

  // Update user role
  await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind('pharmacist', user.userId).run();

  return json({ id, message: 'Registration submitted. Pending verification by admin.' });
}

async function getOnlinePharmacists(request, env) {
  const results = await env.DB.prepare(
    `SELECT p.id, p.full_name, p.specialization, p.rating, p.badge_level, p.total_sessions, p.country, p.bio,
            u.username, u.avatar_url
     FROM pharmacists p JOIN users u ON p.user_id = u.id
     WHERE p.is_online = 1 AND p.is_verified = 1`
  ).all();

  return json({ pharmacists: results.results || [] });
}

async function toggleOnline(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const { isOnline } = await request.json();
  await env.DB.prepare(
    'UPDATE pharmacists SET is_online = ? WHERE user_id = ?'
  ).bind(isOnline ? 1 : 0, user.userId).run();

  // Update KV presence
  if (isOnline) {
    await env.KV.put(`pharmacist:online:${user.userId}`, '1', { expirationTtl: 3600 });
  } else {
    await env.KV.delete(`pharmacist:online:${user.userId}`);
  }

  return json({ isOnline });
}

async function getStats(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const pharmacist = await env.DB.prepare(
    'SELECT * FROM pharmacists WHERE user_id = ?'
  ).bind(user.userId).first();

  const todaySessions = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM sessions
     WHERE pharmacist_id = ? AND started_at > unixepoch() - 86400`
  ).bind(pharmacist?.id).first();

  const avgRating = await env.DB.prepare(
    'SELECT AVG(rating) as avg FROM reviews WHERE pharmacist_id = ?'
  ).bind(pharmacist?.id).first();

  const pendingQueue = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM handoff_queue WHERE claimed_by IS NULL'
  ).first();

  return json({
    sessionsToday: todaySessions?.count || 0,
    avgRating: avgRating?.avg || 0,
    totalSessions: pharmacist?.total_sessions || 0,
    pendingInQueue: pendingQueue?.count || 0
  });
}

async function requestHandoff(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { sessionId, urgency, reason } = await request.json();
  if (!sessionId) return json({ error: 'sessionId required' }, 400);

  // Update session
  await env.DB.prepare(
    'UPDATE sessions SET status = ?, handoff_requested_at = unixepoch() WHERE id = ?'
  ).bind('handoff_requested', sessionId).run();

  // Get AI summary from last messages
  const lastMessages = await env.DB.prepare(
    'SELECT content, sender_type FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 5'
  ).bind(sessionId).all();
  const aiSummary = (lastMessages.results || [])
    .map(m => `[${m.sender_type}]: ${m.content.slice(0, 100)}`)
    .reverse()
    .join('\n');

  await env.DB.prepare(
    'INSERT INTO handoff_queue (id, session_id, user_id, urgency, reason, ai_summary) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), sessionId, user.userId, urgency || 'normal', reason || '', aiSummary).run();

  // Count online pharmacists
  const online = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM pharmacists WHERE is_online = 1 AND is_verified = 1'
  ).first();

  // Queue position
  const position = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM handoff_queue WHERE claimed_by IS NULL'
  ).first();

  return json({
    queuePosition: position?.count || 1,
    onlinePharmacists: online?.count || 0
  });
}

async function acceptHandoff(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const { queueId } = await request.json();
  if (!queueId) return json({ error: 'queueId required' }, 400);

  // Verify pharmacist is verified
  const pharmacist = await env.DB.prepare(
    'SELECT * FROM pharmacists WHERE user_id = ? AND is_verified = 1'
  ).bind(user.userId).first();
  if (!pharmacist) return json({ error: 'Must be a verified pharmacist' }, 403);

  // Atomically claim
  const claim = await env.DB.prepare(
    'UPDATE handoff_queue SET claimed_by = ?, claimed_at = unixepoch() WHERE id = ? AND claimed_by IS NULL'
  ).bind(pharmacist.id, queueId).run();

  if (!claim.meta.changes) {
    return json({ error: 'Already claimed by another pharmacist' }, 409);
  }

  // Get queue entry for session info
  const entry = await env.DB.prepare('SELECT * FROM handoff_queue WHERE id = ?').bind(queueId).first();

  // Update session
  await env.DB.prepare(
    'UPDATE sessions SET status = ?, pharmacist_id = ?, handoff_accepted_at = unixepoch() WHERE id = ?'
  ).bind('pharmacist_active', pharmacist.id, entry.session_id).run();

  // Increment session count
  await env.DB.prepare(
    'UPDATE pharmacists SET total_sessions = total_sessions + 1 WHERE id = ?'
  ).bind(pharmacist.id).run();

  // Get message history
  const messages = await env.DB.prepare(
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC'
  ).bind(entry.session_id).all();

  return json({
    sessionId: entry.session_id,
    messageHistory: messages.results || [],
    userId: entry.user_id
  });
}

async function closeHandoff(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { sessionId, rating } = await request.json();

  await env.DB.prepare(
    'UPDATE sessions SET status = ?, ended_at = unixepoch(), satisfaction_rating = ? WHERE id = ?'
  ).bind('closed', rating || null, sessionId).run();

  return json({ success: true });
}

async function getHandoffQueue(request, env) {
  const { user, error } = await requireRole(request, env, 'pharmacist');
  if (error) return error;

  const queue = await env.DB.prepare(
    `SELECT hq.*, u.username, s.topic, s.room_id
     FROM handoff_queue hq
     JOIN users u ON hq.user_id = u.id
     JOIN sessions s ON hq.session_id = s.id
     WHERE hq.claimed_by IS NULL
     ORDER BY
       CASE hq.urgency WHEN 'emergency' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END,
       hq.created_at ASC`
  ).all();

  return json({ queue: queue.results || [] });
}

async function submitReview(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { pharmacistId, sessionId, rating, comment } = await request.json();
  if (!pharmacistId || !rating || rating < 1 || rating > 5) {
    return json({ error: 'Valid pharmacistId and rating (1-5) required' }, 400);
  }

  await env.DB.prepare(
    'INSERT INTO reviews (id, pharmacist_id, user_id, session_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), pharmacistId, user.userId, sessionId, rating, comment || '').run();

  // Update average rating
  const avg = await env.DB.prepare(
    'SELECT AVG(rating) as avg FROM reviews WHERE pharmacist_id = ?'
  ).bind(pharmacistId).first();
  await env.DB.prepare(
    'UPDATE pharmacists SET rating = ? WHERE id = ?'
  ).bind(avg?.avg || 0, pharmacistId).run();

  return json({ success: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
