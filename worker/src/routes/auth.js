import { signJWT, hashPassword, verifyPassword } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../email/sendEmail.js';

// Run schema migration on first call (idempotent)
let migrated = false;
async function ensureSchema(env) {
  if (migrated) return;
  const columns = [
    { name: 'email_verified', sql: 'ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0' },
    { name: 'verification_token', sql: 'ALTER TABLE users ADD COLUMN verification_token TEXT' },
    { name: 'reset_token', sql: 'ALTER TABLE users ADD COLUMN reset_token TEXT' },
    { name: 'reset_token_expires', sql: 'ALTER TABLE users ADD COLUMN reset_token_expires INTEGER' },
  ];
  for (const col of columns) {
    try {
      await env.DB.prepare(col.sql).run();
    } catch (e) {
      // Column likely already exists — ignore
    }
  }
  migrated = true;
}

export async function handleAuth(request, env, path) {
  await ensureSchema(env);

  if (path === '/api/auth/register' && request.method === 'POST') {
    return register(request, env);
  }
  if (path === '/api/auth/login' && request.method === 'POST') {
    return login(request, env);
  }
  if (path === '/api/auth/me' && request.method === 'GET') {
    return getMe(request, env);
  }
  if (path === '/api/auth/forgot-password' && request.method === 'POST') {
    return forgotPassword(request, env);
  }
  if (path === '/api/auth/reset-password' && request.method === 'POST') {
    return resetPassword(request, env);
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
    'INSERT INTO users (id, username, email, password_hash, email_verified) VALUES (?, ?, ?, ?, 1)'
  ).bind(id, username, email, passwordHash).run();

  const token = await signJWT({ userId: id, username, role: 'user' }, env.JWT_SECRET);
  await env.KV.put(`session:${id}`, token, { expirationTtl: 7 * 24 * 3600 });

  return json({ token, user: { id, username, email, role: 'user', email_verified: 1 } });
}

async function login(request, env) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, 400);
  }

  const user = await env.DB.prepare(
    'SELECT id, username, email, password_hash, role, is_banned, email_verified FROM users WHERE email = ?'
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
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified ?? 0,
    }
  });
}

async function getMe(request, env) {
  const { authMiddleware } = await import('../middleware/auth.js');
  const payload = await authMiddleware(request, env);
  if (!payload) return json({ error: 'Unauthorized' }, 401);

  const user = await env.DB.prepare(
    'SELECT id, username, email, role, avatar_url, created_at, email_verified FROM users WHERE id = ?'
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

async function forgotPassword(request, env) {
  const { email } = await request.json();

  if (!email) {
    return json({ error: 'Email is required' }, 400);
  }

  const user = await env.DB.prepare(
    'SELECT id, email FROM users WHERE email = ?'
  ).bind(email).first();

  // Always return success to prevent email enumeration
  if (!user) {
    return json({ message: 'If an account with that email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomUUID();
  const resetTokenExpires = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  await env.DB.prepare(
    'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?'
  ).bind(resetToken, resetTokenExpires, user.id).run();

  // Send reset email (non-blocking)
  sendPasswordResetEmail(email, resetToken, env).catch((err) =>
    console.error('[auth] Failed to send password reset email:', err)
  );

  return json({ message: 'If an account with that email exists, a reset link has been sent.' });
}

async function resetPassword(request, env) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return json({ error: 'Token and new password are required' }, 400);
  }
  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, 400);
  }

  const user = await env.DB.prepare(
    'SELECT id, reset_token_expires FROM users WHERE reset_token = ?'
  ).bind(token).first();

  if (!user) {
    return json({ error: 'Invalid or expired reset token' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  if (user.reset_token_expires && user.reset_token_expires < now) {
    return json({ error: 'Reset token has expired. Please request a new one.' }, 400);
  }

  const passwordHash = await hashPassword(password);

  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?'
  ).bind(passwordHash, user.id).run();

  return json({ message: 'Password has been reset successfully' });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
