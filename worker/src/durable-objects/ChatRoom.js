export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    await this.handleSession(server, request);
    return new Response(null, { status: 101, webSocket: client });
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
          case 'auth':
            meta.userId = data.userId;
            meta.role = data.role || 'user';
            meta.username = data.username;
            this.broadcastPresence();
            break;

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

          case 'ping':
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
      this.sessions.delete(ws);
      this.broadcastPresence();
    });

    ws.addEventListener('error', () => {
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
