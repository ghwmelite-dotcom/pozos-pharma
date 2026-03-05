import { signJWT, hashPassword, verifyPassword } from '../middleware/auth.js';

export async function handleAuth(request, env, path) {
  if (path === '/api/auth/register' && request.method === 'POST') {
    return register(request, env);
  }
  if (path === '/api/auth/login' && request.method === 'POST') {
    return login(request, env);
  }
  if (path === '/api/auth/me' && request.method === 'GET') {
    return getMe(request, env);
  }
  return null;
}

async function register(request, env) {
  const { username, email, password } = await request.json();

  if (!username || !email || !password) {
    return json({ error: 'Username, email, and password are required' }, 400);
  }
  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, 400);
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return json({ error: 'Username must be 3-20 alphanumeric characters' }, 400);
  }

  // Check existing
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE username = ? OR email = ?'
  ).bind(username, email).first();

  if (existing) {
    return json({ error: 'Username or email already taken' }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await env.DB.prepare(
    'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, username, email, passwordHash).run();

  const token = await signJWT({ userId: id, username, role: 'user' }, env.JWT_SECRET);
  await env.KV.put(`session:${id}`, token, { expirationTtl: 7 * 24 * 3600 });

  return json({ token, user: { id, username, email, role: 'user' } });
}

async function login(request, env) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, 400);
  }

  const user = await env.DB.prepare(
    'SELECT id, username, email, password_hash, role, is_banned FROM users WHERE email = ?'
  ).bind(email).first();

  if (!user) {
    return json({ error: 'Invalid credentials' }, 401);
  }
  if (user.is_banned) {
    return json({ error: 'Account has been suspended' }, 403);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const token = await signJWT(
    { userId: user.id, username: user.username, role: user.role },
    env.JWT_SECRET
  );
  await env.KV.put(`session:${user.id}`, token, { expirationTtl: 7 * 24 * 3600 });

  return json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
}

async function getMe(request, env) {
  const { authMiddleware } = await import('../middleware/auth.js');
  const payload = await authMiddleware(request, env);
  if (!payload) return json({ error: 'Unauthorized' }, 401);

  const user = await env.DB.prepare(
    'SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first();

  if (!user) return json({ error: 'User not found' }, 404);

  // If pharmacist, include pharmacist data
  let pharmacist = null;
  if (user.role === 'pharmacist') {
    pharmacist = await env.DB.prepare(
      'SELECT * FROM pharmacists WHERE user_id = ?'
    ).bind(user.id).first();
  }

  return json({ user, pharmacist });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
