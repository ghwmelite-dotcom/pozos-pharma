import { handleAuth } from './routes/auth.js';
import { handleChat } from './routes/chat.js';
import { handlePharmacist } from './routes/pharmacist.js';
import { handleDrugs } from './routes/drugs.js';
import { handleAdmin } from './routes/admin.js';
import { handleAnalytics } from './routes/analytics.js';
import { handleReminders } from './routes/reminders.js';
import { handlePharmacies } from './routes/pharmacies.js';
import { handleArticles } from './routes/articles.js';
import { handleVoice } from './routes/voice.js';
import { handleVision } from './routes/vision.js';
import { handleTutor } from './routes/tutor.js';
import { handlePractice } from './routes/practice.js';
export { ChatRoom } from './durable-objects/ChatRoom.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env);
    }

    // WebSocket upgrade → Durable Object
    if (path.startsWith('/ws/')) {
      const roomSlug = path.split('/ws/')[1] || 'general';
      const roomId = env.CHAT_ROOM.idFromName(roomSlug);
      const room = env.CHAT_ROOM.get(roomId);
      const wsUrl = new URL(request.url);
      wsUrl.searchParams.set('roomId', roomSlug);
      return room.fetch(new Request(wsUrl.toString(), request));
    }

    // API routes
    let response = null;

    try {
      if (path.startsWith('/api/auth/')) {
        response = await handleAuth(request, env, path);
      } else if (path.startsWith('/api/chat/') || path === '/api/chat/message') {
        response = await handleChat(request, env, path);
      } else if (path.startsWith('/api/pharmacist') || path.startsWith('/api/handoff/')) {
        response = await handlePharmacist(request, env, path);
      } else if (path.startsWith('/api/drugs/')) {
        response = await handleDrugs(request, env, path);
      } else if (path.startsWith('/api/admin/')) {
        response = await handleAdmin(request, env, path);
      } else if (path.startsWith('/api/reminders')) {
        response = await handleReminders(request, env, path);
      } else if (path.startsWith('/api/pharmacies')) {
        response = await handlePharmacies(request, env, path);
      } else if (path.startsWith('/api/articles')) {
        response = await handleArticles(request, env, path);
      } else if (path.startsWith('/api/voice/')) {
        response = await handleVoice(request, env, path);
      } else if (path.startsWith('/api/vision/')) {
        response = await handleVision(request, env, path);
      } else if (path.startsWith('/api/analytics/')) {
        response = await handleAnalytics(request, env, path);
      } else if (path.startsWith('/api/tutor/')) {
        response = await handleTutor(request, env, path);
      } else if (path.startsWith('/api/practice/')) {
        response = await handlePractice(request, env, path);
      }
    } catch (err) {
      console.error('Route error:', err);
      response = new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!response) {
      response = new Response(JSON.stringify({ error: 'Not found', path }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add CORS headers to all responses
    return addCORS(response, request, env);
  }
};

function handleCORS(request, env) {
  const requestOrigin = request.headers.get('Origin');
  const allowedOrigin = resolveCORSOrigin(request, env);

  if (requestOrigin && !allowedOrigin) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Vary': 'Origin',
      },
    });
  }

  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (allowedOrigin) headers['Access-Control-Allow-Origin'] = allowedOrigin;

  return new Response(null, {
    status: 204,
    headers,
  });
}

function addCORS(response, request, env) {
  const headers = new Headers(response.headers);
  const allowedOrigin = resolveCORSOrigin(request, env);
  if (allowedOrigin) headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.append('Vary', 'Origin');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function resolveCORSOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;

  const configuredOrigins = String(env.CORS_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (configuredOrigins.includes(origin)) return origin;

  const requestHostname = new URL(request.url).hostname;
  const isLocalWorker = requestHostname === 'localhost' || requestHostname === '127.0.0.1';
  const isLocalOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
  return isLocalWorker && isLocalOrigin ? origin : null;
}
