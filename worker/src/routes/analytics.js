import { requireRole, authMiddleware } from '../middleware/auth.js';

export async function handleAnalytics(request, env, path) {
  if (path === '/api/analytics/track' && request.method === 'POST') {
    return trackEvent(request, env);
  }
  if (path === '/api/analytics/dashboard' && request.method === 'GET') {
    return getDashboard(request, env);
  }
  return null;
}

async function trackEvent(request, env) {
  // Rate limit by IP: max 100 events/minute
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const rateLimitKey = `ratelimit:analytics:${ip}`;
  const current = parseInt(await env.KV.get(rateLimitKey) || '0');

  if (current >= 100) {
    return json({ error: 'Rate limit exceeded' }, 429);
  }

  await env.KV.put(rateLimitKey, String(current + 1), { expirationTtl: 60 });

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { event_type, event_data, page } = body;
  if (!event_type) {
    return json({ error: 'event_type required' }, 400);
  }

  // Optionally attach user_id if authenticated
  let userId = null;
  const user = await authMiddleware(request, env);
  if (user) {
    userId = user.sub || user.id || null;
  }

  const id = crypto.randomUUID();

  await env.DB.prepare(
    'INSERT INTO analytics_events (id, event_type, event_data, user_id, page) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, event_type, event_data || null, userId, page || null).run();

  return json({ success: true, id });
}

async function getDashboard(request, env) {
  const { user, error } = await requireRole(request, env, 'admin');
  if (error) return error;

  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 86400;
  const thirtyDaysAgo = now - 30 * 86400;
  const fourteenDaysAgo = now - 14 * 86400;
  const todayStart = now - (now % 86400);

  const [
    eventsByType7d,
    eventsByType30d,
    topSearchedDrugs,
    pageViewsByPage,
    dailyActiveUsers,
    peakHours,
    topDrugDetailViews,
    userGrowth
  ] = await Promise.all([
    // Total events by type (last 7 days)
    env.DB.prepare(
      'SELECT event_type, COUNT(*) as count FROM analytics_events WHERE created_at >= ? GROUP BY event_type ORDER BY count DESC'
    ).bind(sevenDaysAgo).all(),

    // Total events by type (last 30 days)
    env.DB.prepare(
      'SELECT event_type, COUNT(*) as count FROM analytics_events WHERE created_at >= ? GROUP BY event_type ORDER BY count DESC'
    ).bind(thirtyDaysAgo).all(),

    // Top searched drugs
    env.DB.prepare(
      `SELECT json_extract(event_data, '$.query') as query, COUNT(*) as count
       FROM analytics_events
       WHERE event_type = 'drug_search' AND event_data IS NOT NULL AND created_at >= ?
       GROUP BY query ORDER BY count DESC LIMIT 15`
    ).bind(thirtyDaysAgo).all(),

    // Page views by page
    env.DB.prepare(
      `SELECT page, COUNT(*) as count
       FROM analytics_events
       WHERE event_type = 'page_view' AND created_at >= ?
       GROUP BY page ORDER BY count DESC LIMIT 15`
    ).bind(thirtyDaysAgo).all(),

    // Daily active users (distinct user_ids per day, last 14 days)
    env.DB.prepare(
      `SELECT (created_at / 86400) as day, COUNT(DISTINCT user_id) as count
       FROM analytics_events
       WHERE user_id IS NOT NULL AND created_at >= ?
       GROUP BY day ORDER BY day ASC`
    ).bind(fourteenDaysAgo).all(),

    // Peak usage hours (group by hour of day)
    env.DB.prepare(
      `SELECT ((created_at % 86400) / 3600) as hour, COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= ?
       GROUP BY hour ORDER BY hour ASC`
    ).bind(thirtyDaysAgo).all(),

    // Top drug detail views
    env.DB.prepare(
      `SELECT json_extract(event_data, '$.drug_name') as drug_name, COUNT(*) as count
       FROM analytics_events
       WHERE event_type = 'drug_detail_view' AND event_data IS NOT NULL AND created_at >= ?
       GROUP BY drug_name ORDER BY count DESC LIMIT 15`
    ).bind(thirtyDaysAgo).all(),

    // User growth (new registrations per day, last 30 days)
    env.DB.prepare(
      `SELECT (created_at / 86400) as day, COUNT(*) as count
       FROM users
       WHERE created_at >= ?
       GROUP BY day ORDER BY day ASC`
    ).bind(thirtyDaysAgo).all()
  ]);

  // Summary stats
  const totalSearches = (eventsByType30d.results || []).find(e => e.event_type === 'drug_search')?.count || 0;
  const totalPageViews = (eventsByType30d.results || []).find(e => e.event_type === 'page_view')?.count || 0;

  // DAU today
  const dauToday = await env.DB.prepare(
    'SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE user_id IS NOT NULL AND created_at >= ?'
  ).bind(todayStart).first();

  // New users this week
  const newUsersWeek = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM users WHERE created_at >= ?'
  ).bind(sevenDaysAgo).first();

  return json({
    summary: {
      total_searches: totalSearches,
      total_page_views: totalPageViews,
      dau_today: dauToday?.count || 0,
      new_users_week: newUsersWeek?.count || 0
    },
    events_by_type_7d: eventsByType7d.results || [],
    events_by_type_30d: eventsByType30d.results || [],
    top_searched_drugs: topSearchedDrugs.results || [],
    page_views_by_page: pageViewsByPage.results || [],
    daily_active_users: dailyActiveUsers.results || [],
    peak_hours: peakHours.results || [],
    top_drug_detail_views: topDrugDetailViews.results || [],
    user_growth: userGrowth.results || []
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
