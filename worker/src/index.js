import { handleAuth } from './routes/auth.js';
import { handleChat } from './routes/chat.js';
import { handlePharmacist } from './routes/pharmacist.js';
import { handleDrugs } from './routes/drugs.js';
import { handleAdmin } from './routes/admin.js';
export { ChatRoom } from './durable-objects/ChatRoom.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS
    if (request.method === 'OPTIONS') {
      return handleCORS();
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
    return addCORS(response, env);
  }
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

function addCORS(response, env) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
