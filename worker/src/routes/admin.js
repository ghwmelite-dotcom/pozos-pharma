import { requireRole } from '../middleware/auth.js';

export async function handleAdmin(request, env, path) {
  if (path === '/api/admin/verify-pharmacist' && request.method === 'POST') {
    return verifyPharmacist(request, env);
  }
  if (path === '/api/admin/flagged-messages' && request.method === 'GET') {
    return getFlaggedMessages(request, env);
  }
  if (path === '/api/admin/stats' && request.method === 'GET') {
    return getAdminStats(request, env);
  }
  if (path === '/api/admin/pending-pharmacists' && request.method === 'GET') {
    return getPendingPharmacists(request, env);
  }
  if (path === '/api/admin/ban-user' && request.method === 'POST') {
    return banUser(request, env);
  }
  return null;
}

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

  const [totalUsers, totalSessions, totalMessages, activePharmacists, flaggedCount, handoffRate, avgSatisfaction] =
    await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as c FROM users').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM sessions').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM messages').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM pharmacists WHERE is_verified = 1').first(),
      env.DB.prepare('SELECT COUNT(*) as c FROM messages WHERE is_flagged = 1').first(),
      env.DB.prepare(
        `SELECT CAST(COUNT(CASE WHEN status != 'ai_active' THEN 1 END) AS REAL) / MAX(COUNT(*), 1) as rate FROM sessions`
      ).first(),
      env.DB.prepare('SELECT AVG(satisfaction_rating) as avg FROM sessions WHERE satisfaction_rating IS NOT NULL').first()
    ]);

  // Top topics
  const topTopics = await env.DB.prepare(
    'SELECT topic, COUNT(*) as count FROM sessions WHERE topic IS NOT NULL GROUP BY topic ORDER BY count DESC LIMIT 10'
  ).all();

  // AI model usage
  const aiMessages = await env.DB.prepare(
    "SELECT COUNT(*) as c FROM messages WHERE sender_type = 'ai'"
  ).first();

  return json({
    totalUsers: totalUsers?.c || 0,
    totalSessions: totalSessions?.c || 0,
    totalMessages: totalMessages?.c || 0,
    activePharmacists: activePharmacists?.c || 0,
    flaggedMessages: flaggedCount?.c || 0,
    handoffRate: handoffRate?.rate || 0,
    avgSatisfaction: avgSatisfaction?.avg || 0,
    topTopics: topTopics.results || [],
    aiMessagesCount: aiMessages?.c || 0
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
