import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { getPozosResponse } from '../ai/pozosBot.js';
import { filterMessage } from './safety.js';

export async function handleChat(request, env, path) {
  if (path === '/api/chat/message' && request.method === 'POST') {
    return sendMessage(request, env);
  }
  if (path === '/api/chat/history' && request.method === 'GET') {
    return getHistory(request, env);
  }
  if (path === '/api/chat/rooms' && request.method === 'GET') {
    return getRooms(request, env);
  }
  if (path === '/api/chat/session' && request.method === 'POST') {
    return createSession(request, env);
  }
  return null;
}

async function sendMessage(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  // Rate limit check
  const limit = await rateLimit(user.userId, env);
  if (limit.limited) {
    return json({ error: limit.message, retryAfter: limit.retryAfter }, 429);
  }

  const { content, sessionId, roomId } = await request.json();
  if (!content || !content.trim()) {
    return json({ error: 'Message content is required' }, 400);
  }
  if (content.length > 2000) {
    return json({ error: 'Message too long (max 2000 characters)' }, 400);
  }

  // Safety filter
  const safety = filterMessage(content);
  if (safety.blocked) {
    // Save flagged message
    const msgId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO messages (id, session_id, sender_id, sender_type, content, is_flagged, flag_reason) VALUES (?, ?, ?, ?, ?, 1, ?)'
    ).bind(msgId, sessionId, user.userId, 'user', content, safety.reason).run();

    // Auto-create handoff for safety blocks
    await env.DB.prepare(
      'INSERT INTO handoff_queue (id, session_id, user_id, urgency, reason, ai_summary) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), sessionId, user.userId, 'emergency', 'safety_filter', 'User message triggered safety filter - immediate pharmacist review needed').run();

    return json({
      aiMessage: {
        id: crypto.randomUUID(),
        content: safety.response,
        senderType: 'ai',
        model: 'safety-filter',
        isEmergency: true
      },
      requiresHandoff: true
    });
  }

  // Get or verify session
  let session;
  if (sessionId) {
    session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(sessionId).first();
  }
  if (!session) {
    const newId = sessionId || crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, room_id, status, topic) VALUES (?, ?, ?, ?, ?)'
    ).bind(newId, user.userId, roomId || 'general', 'ai_active', content.slice(0, 100)).run();
    session = { id: newId, status: 'ai_active' };
  }

  // Save user message
  const userMsgId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO messages (id, session_id, sender_id, sender_type, content) VALUES (?, ?, ?, ?, ?)'
  ).bind(userMsgId, session.id, user.userId, 'user', content).run();

  // If pharmacist is active, don't call AI
  if (session.status === 'pharmacist_active') {
    return json({
      userMessage: { id: userMsgId, content, senderType: 'user' },
      sessionId: session.id,
      requiresHandoff: false
    });
  }

  // Fetch history for AI context
  const history = await env.DB.prepare(
    'SELECT sender_type, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 10'
  ).bind(session.id).all();
  const sessionHistory = (history.results || []).reverse();

  // Call PozosBot AI
  const aiResponse = await getPozosResponse(content, sessionHistory, env);

  // Save AI response
  const aiMsgId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO messages (id, session_id, sender_id, sender_type, content) VALUES (?, ?, ?, ?, ?)'
  ).bind(aiMsgId, session.id, 'pozosbot', 'ai', aiResponse.content).run();

  // Handle handoff if needed
  if (aiResponse.requiresHandoff) {
    await env.DB.prepare(
      'UPDATE sessions SET status = ?, handoff_requested_at = unixepoch() WHERE id = ?'
    ).bind('handoff_requested', session.id).run();

    await env.DB.prepare(
      'INSERT INTO handoff_queue (id, session_id, user_id, urgency, reason, ai_summary) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      crypto.randomUUID(), session.id, user.userId,
      aiResponse.isEmergency ? 'emergency' : 'normal',
      'ai_recommendation',
      aiResponse.content.slice(0, 500)
    ).run();

    // Notify via KV
    await env.KV.put(`handoff:${session.id}`, JSON.stringify({
      sessionId: session.id,
      userId: user.userId,
      urgency: aiResponse.isEmergency ? 'emergency' : 'normal',
      timestamp: Date.now()
    }), { expirationTtl: 3600 });
  }

  return json({
    aiMessage: {
      id: aiMsgId,
      content: aiResponse.content,
      senderType: 'ai',
      model: aiResponse.model,
      isEmergency: aiResponse.isEmergency
    },
    sessionId: session.id,
    requiresHandoff: aiResponse.requiresHandoff
  });
}

async function getHistory(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  if (!sessionId) return json({ error: 'sessionId required' }, 400);

  const messages = await env.DB.prepare(
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?'
  ).bind(sessionId, limit, offset).all();

  return json({ messages: messages.results || [] });
}

async function getRooms(request, env) {
  const rooms = await env.DB.prepare('SELECT * FROM rooms ORDER BY id').all();
  return json({ rooms: rooms.results || [] });
}

async function createSession(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { roomId, topic } = await request.json();
  const id = crypto.randomUUID();

  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, room_id, topic) VALUES (?, ?, ?, ?)'
  ).bind(id, user.userId, roomId || 'general', topic || '').run();

  return json({ sessionId: id });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
