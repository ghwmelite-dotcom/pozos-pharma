import { requireAuth } from '../middleware/auth.js';

export async function handleReminders(request, env, path) {
  // All reminder routes require authentication
  const user = await requireAuth(request, env);
  if (user instanceof Response) return user;

  const method = request.method;

  // GET /api/reminders/stats
  if (path === '/api/reminders/stats' && method === 'GET') {
    return getStats(user, env);
  }

  // Routes with :id parameter
  const idMatch = path.match(/^\/api\/reminders\/([^/]+)\/take$/);
  if (idMatch && method === 'POST') {
    return takeReminder(user, env, idMatch[1]);
  }

  const skipMatch = path.match(/^\/api\/reminders\/([^/]+)\/skip$/);
  if (skipMatch && method === 'POST') {
    return skipReminder(user, env, skipMatch[1]);
  }

  const historyMatch = path.match(/^\/api\/reminders\/([^/]+)\/history$/);
  if (historyMatch && method === 'GET') {
    return getHistory(user, env, historyMatch[1]);
  }

  const singleMatch = path.match(/^\/api\/reminders\/([^/]+)$/);
  if (singleMatch && method === 'PUT') {
    return updateReminder(request, user, env, singleMatch[1]);
  }
  if (singleMatch && method === 'DELETE') {
    return deleteReminder(user, env, singleMatch[1]);
  }

  // GET /api/reminders
  if (path === '/api/reminders' && method === 'GET') {
    return listReminders(user, env);
  }

  // POST /api/reminders
  if (path === '/api/reminders' && method === 'POST') {
    return createReminder(request, user, env);
  }

  return null;
}

async function listReminders(user, env) {
  const results = await env.DB.prepare(
    `SELECT * FROM medication_reminders WHERE user_id = ? AND active = 1 ORDER BY created_at DESC`
  ).bind(user.id).all();

  return json({ reminders: results.results || [] });
}

async function createReminder(request, user, env) {
  const body = await request.json();
  const { drug_id, drug_name, dosage, frequency, times, start_date, end_date } = body;

  if (!drug_name || !frequency || !times || !Array.isArray(times) || times.length === 0) {
    return json({ error: 'drug_name, frequency, and times are required' }, 400);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO medication_reminders (id, user_id, drug_id, drug_name, dosage, frequency, times, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, drug_id || null, drug_name, dosage || null, frequency, JSON.stringify(times), start_date || null, end_date || null).run();

  const reminder = await env.DB.prepare('SELECT * FROM medication_reminders WHERE id = ?').bind(id).first();
  return json({ reminder }, 201);
}

async function updateReminder(request, user, env, id) {
  const existing = await env.DB.prepare(
    'SELECT * FROM medication_reminders WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first();

  if (!existing) return json({ error: 'Reminder not found' }, 404);

  const body = await request.json();
  const { drug_name, dosage, frequency, times, start_date, end_date, active } = body;

  await env.DB.prepare(
    `UPDATE medication_reminders SET
      drug_name = COALESCE(?, drug_name),
      dosage = COALESCE(?, dosage),
      frequency = COALESCE(?, frequency),
      times = COALESCE(?, times),
      start_date = COALESCE(?, start_date),
      end_date = COALESCE(?, end_date),
      active = COALESCE(?, active)
     WHERE id = ? AND user_id = ?`
  ).bind(
    drug_name || null, dosage || null, frequency || null,
    times ? JSON.stringify(times) : null,
    start_date || null, end_date || null,
    active !== undefined ? (active ? 1 : 0) : null,
    id, user.id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM medication_reminders WHERE id = ?').bind(id).first();
  return json({ reminder: updated });
}

async function deleteReminder(user, env, id) {
  const existing = await env.DB.prepare(
    'SELECT * FROM medication_reminders WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first();

  if (!existing) return json({ error: 'Reminder not found' }, 404);

  await env.DB.prepare(
    'UPDATE medication_reminders SET active = 0 WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).run();

  return json({ success: true });
}

async function takeReminder(user, env, id) {
  const reminder = await env.DB.prepare(
    'SELECT * FROM medication_reminders WHERE id = ? AND user_id = ? AND active = 1'
  ).bind(id, user.id).first();

  if (!reminder) return json({ error: 'Reminder not found' }, 404);

  const now = new Date().toISOString();
  const logId = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO adherence_log (id, reminder_id, scheduled_time, taken_at, skipped)
     VALUES (?, ?, ?, ?, 0)`
  ).bind(logId, id, now, now).run();

  const newStreak = (reminder.streak || 0) + 1;
  await env.DB.prepare(
    'UPDATE medication_reminders SET streak = ?, last_taken = ? WHERE id = ?'
  ).bind(newStreak, now, id).run();

  return json({ success: true, streak: newStreak, taken_at: now });
}

async function skipReminder(user, env, id) {
  const reminder = await env.DB.prepare(
    'SELECT * FROM medication_reminders WHERE id = ? AND user_id = ? AND active = 1'
  ).bind(id, user.id).first();

  if (!reminder) return json({ error: 'Reminder not found' }, 404);

  const now = new Date().toISOString();
  const logId = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO adherence_log (id, reminder_id, scheduled_time, taken_at, skipped)
     VALUES (?, ?, ?, NULL, 1)`
  ).bind(logId, id, now).run();

  // Reset streak on skip
  await env.DB.prepare(
    'UPDATE medication_reminders SET streak = 0 WHERE id = ?'
  ).bind(id).run();

  return json({ success: true, streak: 0 });
}

async function getHistory(user, env, id) {
  const reminder = await env.DB.prepare(
    'SELECT * FROM medication_reminders WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first();

  if (!reminder) return json({ error: 'Reminder not found' }, 404);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const logs = await env.DB.prepare(
    `SELECT * FROM adherence_log WHERE reminder_id = ? AND scheduled_time >= ? ORDER BY scheduled_time DESC`
  ).bind(id, thirtyDaysAgo).all();

  return json({ history: logs.results || [] });
}

async function getStats(user, env) {
  const reminders = await env.DB.prepare(
    'SELECT * FROM medication_reminders WHERE user_id = ? AND active = 1'
  ).bind(user.id).all();

  const activeReminders = reminders.results || [];
  const totalReminders = activeReminders.length;
  const bestStreak = activeReminders.reduce((max, r) => Math.max(max, r.streak || 0), 0);

  // Calculate adherence rate from all logs
  const reminderIds = activeReminders.map(r => r.id);
  let taken = 0;
  let skipped = 0;

  if (reminderIds.length > 0) {
    const placeholders = reminderIds.map(() => '?').join(',');
    const logs = await env.DB.prepare(
      `SELECT
        SUM(CASE WHEN skipped = 0 AND taken_at IS NOT NULL THEN 1 ELSE 0 END) as taken_count,
        SUM(CASE WHEN skipped = 1 THEN 1 ELSE 0 END) as skipped_count
       FROM adherence_log WHERE reminder_id IN (${placeholders})`
    ).bind(...reminderIds).first();

    taken = logs?.taken_count || 0;
    skipped = logs?.skipped_count || 0;
  }

  const total = taken + skipped;
  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

  return json({
    totalReminders,
    bestStreak,
    adherenceRate,
    taken,
    skipped
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
