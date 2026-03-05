// JWT auth middleware using Web Crypto API (no external deps)

const encoder = new TextEncoder();

async function getKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export async function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 3600 // 7 days
  }));
  const data = `${header}.${body}`;
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sigB64 = base64url(String.fromCharCode(...new Uint8Array(sig)));
  return `${data}.${sigB64}`;
}

export async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const key = await getKey(secret);
  const sigBytes = Uint8Array.from(base64urlDecode(sig), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(`${header}.${body}`));
  if (!valid) return null;

  const payload = JSON.parse(base64urlDecode(body));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export async function authMiddleware(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  // Check KV for token validity (allows invalidation)
  const revoked = await env.KV.get(`revoked:${token}`);
  if (revoked) return null;

  const payload = await verifyJWT(token, env.JWT_SECRET);
  return payload;
}

export async function requireAuth(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return user;
}

export async function requireRole(request, env, role) {
  const user = await authMiddleware(request, env);
  if (!user) {
    return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  if (user.role !== role && user.role !== 'admin') {
    return { error: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) };
  }
  return { user };
}

// Simple password hashing using SHA-256 + salt (D1 doesn't support bcrypt natively)
export async function hashPassword(password) {
  const salt = crypto.randomUUID();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(salt + password));
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${salt}:${hashHex}`;
}

export async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = await crypto.subtle.digest('SHA-256', encoder.encode(salt + password));
  const checkHex = Array.from(new Uint8Array(check)).map(b => b.toString(16).padStart(2, '0')).join('');
  return checkHex === hash;
}
