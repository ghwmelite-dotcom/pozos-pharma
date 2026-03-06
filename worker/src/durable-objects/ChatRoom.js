import { verifyJWT } from '../middleware/auth.js';

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    // Handle internal broadcast (non-WebSocket)
    if (request.headers.get('Upgrade') !== 'websocket') {
      return this.handleHTTP(request);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    await this.handleSession(server, request);
    return new Response(null, { status: 101, webSocket: client });
  }

  async handleHTTP(request) {
    const url = new URL(request.url);

    // POST /broadcast - broadcast a message to all connected clients
    if (url.pathname.endsWith('/broadcast') && request.method === 'POST') {
      const messages = await request.json();
      const msgArray = Array.isArray(messages) ? messages : [messages];
      for (const msg of msgArray) {
        await this.broadcast(msg);
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }

  async handleSession(ws, request) {
    ws.accept();
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId') || 'general';

    const meta = { userId: null, role: 'user', roomId };
    this.sessions.set(ws, meta);

    // Send current user count
    this.broadcastPresence();

    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'auth': {
            if (!data.token) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
              ws.close(1008, 'Missing token');
              break;
            }
            const payload = await verifyJWT(data.token, this.env.JWT_SECRET);
            if (!payload) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
              ws.close(1008, 'Invalid token');
              break;
            }
            meta.userId = payload.userId || payload.sub;
            meta.role = payload.role || 'user';
            meta.username = payload.username;
            meta.tokenExp = payload.exp;
            this.broadcastPresence();

            // Send message history to the newly connected client
            try {
              const history = await this.env.DB.prepare(
                `SELECT m.id, m.content, m.sender_type, m.sender_id, m.created_at
                 FROM messages m
                 JOIN sessions s ON m.session_id = s.id
                 WHERE s.room_id = ?
                 ORDER BY m.created_at DESC
                 LIMIT 50`
              ).bind(meta.roomId).all();

              const messages = (history.results || []).reverse().map(m => ({
                id: m.id,
                content: m.content,
                sender_type: m.sender_type,
                sender_id: m.sender_id,
                created_at: m.created_at
              }));

              ws.send(JSON.stringify({ type: 'history', messages }));
            } catch (err) {
              console.error('Failed to load history:', err);
              // Non-fatal
            }
            break;
          }

          case 'message':
            await this.broadcast({
              type: 'message',
              id: crypto.randomUUID(),
              sender: data.sender,
              senderId: data.senderId,
              senderType: data.senderType,
              content: data.content,
              timestamp: Date.now(),
              drugRefs: data.drugRefs || [],
              badgeLevel: data.badgeLevel || null,
              aiModel: data.aiModel || null,
              isEmergency: data.isEmergency || false
            });
            break;

          case 'typing':
            await this.broadcast(
              {
                type: 'typing',
                userId: data.userId,
                username: data.username,
                isTyping: data.isTyping
              },
              ws
            );
            break;

          case 'handoff_update':
            await this.broadcast({
              type: 'handoff_update',
              status: data.status,
              pharmacist: data.pharmacist || null,
              sessionId: data.sessionId
            });
            break;

          case 'video_offer':
          case 'video_answer':
          case 'video_ice':
            // Forward WebRTC signaling to the target user only
            if (data.targetUserId) {
              this.sendToUser(data.targetUserId, {
                type: data.type,
                data: data.data,
                fromUserId: meta.userId,
              });
            }
            break;

          case 'ping':
            if (meta.tokenExp && meta.tokenExp < Math.floor(Date.now() / 1000)) {
              ws.send(JSON.stringify({ type: 'auth_expired' }));
              ws.close(1008, 'Token expired');
              break;
            }
            ws.send(JSON.stringify({ type: 'pong' }));
            break;

          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.addEventListener('close', () => {
      const closingMeta = this.sessions.get(ws);
      if (closingMeta?.username) {
        this.broadcast({ type: 'typing', userId: closingMeta.userId, username: closingMeta.username, isTyping: false }, ws);
      }
      this.sessions.delete(ws);
      this.broadcastPresence();
    });

    ws.addEventListener('error', () => {
      const closingMeta = this.sessions.get(ws);
      if (closingMeta?.username) {
        this.broadcast({ type: 'typing', userId: closingMeta.userId, username: closingMeta.username, isTyping: false }, ws);
      }
      this.sessions.delete(ws);
      this.broadcastPresence();
    });
  }

  broadcastPresence() {
    const users = [];
    for (const [, meta] of this.sessions) {
      if (meta.userId) {
        users.push({ userId: meta.userId, username: meta.username, role: meta.role });
      }
    }
    const msg = JSON.stringify({ type: 'presence', users, count: users.length });
    for (const [ws] of this.sessions) {
      if (ws.readyState === 1) ws.send(msg);
    }

    // Sync user count to KV for room list display
    // Get roomId from any connected session
    const roomId = this.sessions.size > 0 ? [...this.sessions.values()][0]?.roomId : null;
    if (roomId && this.env.KV) {
      this.env.KV.put(`room:${roomId}:users`, String(users.length), { expirationTtl: 60 }).catch(() => {});
    }
  }

  sendToUser(targetUserId, msg) {
    const text = JSON.stringify(msg);
    for (const [ws, meta] of this.sessions) {
      if (meta.userId === targetUserId && ws.readyState === 1) {
        ws.send(text);
        return;
      }
    }
  }

  async broadcast(msg, exclude = null) {
    const text = JSON.stringify(msg);
    for (const [ws] of this.sessions) {
      if (ws !== exclude && ws.readyState === 1) {
        ws.send(text);
      }
    }
  }
}
