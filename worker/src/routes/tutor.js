import { requireAuth } from '../middleware/auth.js';
import { getTutorResponse } from '../ai/pharmacyTutor.js';

const FREE_DAILY_LIMIT = 10;

async function getOrCreateSubscription(userId, env) {
  let sub = await env.DB.prepare(
    'SELECT * FROM tutor_subscriptions WHERE user_id = ?'
  ).bind(userId).first();
  if (!sub) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO tutor_subscriptions (id, user_id, plan, status) VALUES (?, ?, ?, ?)'
    ).bind(id, userId, 'free', 'active').run();
    sub = { id, user_id: userId, plan: 'free', status: 'active' };
  }
  return sub;
}

async function getDailyUsage(userId, env) {
  const today = new Date().toISOString().split('T')[0];
  const row = await env.DB.prepare(
    'SELECT question_count FROM tutor_usage WHERE user_id = ? AND date = ?'
  ).bind(userId, today).first();
  return row?.question_count || 0;
}

async function incrementUsage(userId, env) {
  const today = new Date().toISOString().split('T')[0];
  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO tutor_usage (id, user_id, date, question_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(user_id, date) DO UPDATE SET question_count = question_count + 1
  `).bind(id, userId, today).run();
}

function isPremium(sub) {
  if (!sub || sub.plan === 'free') return false;
  if (sub.status !== 'active') return false;
  if (sub.current_period_end && sub.current_period_end < Math.floor(Date.now() / 1000)) return false;
  return true;
}

export async function handleTutor(request, env, path) {
  // POST /api/tutor/chat
  if (path === '/api/tutor/chat' && request.method === 'POST') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const sub = await getOrCreateSubscription(user.id, env);
    const premium = isPremium(sub);

    if (!premium) {
      const usage = await getDailyUsage(user.id, env);
      if (usage >= FREE_DAILY_LIMIT) {
        return new Response(JSON.stringify({
          error: 'daily_limit',
          message: 'You have reached your daily free limit of 10 questions. Upgrade to Premium for unlimited access.',
          usage,
          limit: FREE_DAILY_LIMIT
        }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const body = await request.json();
    const { message, conversationId, subject, difficulty, examPrep } = body;

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (examPrep && !premium) {
      return new Response(JSON.stringify({
        error: 'premium_required',
        message: 'Exam prep mode is a Premium feature.'
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    let convId = conversationId;
    if (!convId) {
      convId = crypto.randomUUID();
      const title = message.slice(0, 80);
      await env.DB.prepare(
        'INSERT INTO tutor_conversations (id, user_id, subject, difficulty, title) VALUES (?, ?, ?, ?, ?)'
      ).bind(convId, user.id, subject || 'general', difficulty || 'year1', title).run();
    } else {
      const conv = await env.DB.prepare(
        'SELECT id FROM tutor_conversations WHERE id = ? AND user_id = ?'
      ).bind(convId, user.id).first();
      if (!conv) {
        return new Response(JSON.stringify({ error: 'Conversation not found' }), {
          status: 404, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const userMsgId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO tutor_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
    ).bind(userMsgId, convId, 'user', message.trim()).run();

    const historyRows = await env.DB.prepare(
      'SELECT role, content FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).bind(convId).all();

    const aiResult = await getTutorResponse(message.trim(), historyRows.results || [], env, {
      subject: subject || 'general',
      difficulty: difficulty || 'year1',
      examPrep: Boolean(examPrep)
    });

    const aiMsgId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO tutor_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
    ).bind(aiMsgId, convId, 'assistant', aiResult.content).run();

    await env.DB.prepare(
      'UPDATE tutor_conversations SET updated_at = unixepoch() WHERE id = ?'
    ).bind(convId).run();

    await incrementUsage(user.id, env);
    const usage = await getDailyUsage(user.id, env);

    return new Response(JSON.stringify({
      conversationId: convId,
      message: {
        id: aiMsgId,
        role: 'assistant',
        content: aiResult.content,
        model: aiResult.model
      },
      usage: {
        count: usage,
        limit: premium ? null : FREE_DAILY_LIMIT,
        isPremium: premium
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // GET /api/tutor/history
  if (path === '/api/tutor/history' && request.method === 'GET') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const sub = await getOrCreateSubscription(user.id, env);
    const premium = isPremium(sub);
    const limit = premium ? 50 : 3;

    const convos = await env.DB.prepare(
      'SELECT id, subject, difficulty, title, created_at, updated_at FROM tutor_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?'
    ).bind(user.id, limit).all();

    return new Response(JSON.stringify({
      conversations: convos.results || [],
      isPremium: premium
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // GET /api/tutor/history/:conversationId
  if (path.startsWith('/api/tutor/history/') && request.method === 'GET') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const convId = path.split('/api/tutor/history/')[1];
    const conv = await env.DB.prepare(
      'SELECT * FROM tutor_conversations WHERE id = ? AND user_id = ?'
    ).bind(convId, user.id).first();

    if (!conv) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    const messages = await env.DB.prepare(
      'SELECT id, role, content, created_at FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).bind(convId).all();

    return new Response(JSON.stringify({
      conversation: conv,
      messages: messages.results || []
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // GET /api/tutor/usage
  if (path === '/api/tutor/usage' && request.method === 'GET') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const sub = await getOrCreateSubscription(user.id, env);
    const premium = isPremium(sub);
    const usage = await getDailyUsage(user.id, env);

    return new Response(JSON.stringify({
      usage,
      limit: premium ? null : FREE_DAILY_LIMIT,
      isPremium: premium,
      plan: sub.plan
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // POST /api/tutor/subscribe
  if (path === '/api/tutor/subscribe' && request.method === 'POST') {
    const user = await requireAuth(request, env);
    if (user instanceof Response) return user;

    const userRow = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(user.id).first();
    if (!userRow) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userRow.email,
        amount: 5000 * 100,
        currency: 'GHS',
        plan: env.PAYSTACK_PLAN_CODE,
        metadata: {
          user_id: user.id,
          username: user.username,
          product: 'ai-tutor-premium'
        },
        callback_url: `${env.CORS_ORIGIN}/ai-tutor?payment=success`
      })
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return new Response(JSON.stringify({ error: 'Payment initialization failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // POST /api/tutor/webhook
  if (path === '/api/tutor/webhook' && request.method === 'POST') {
    const signature = request.headers.get('x-paystack-signature');
    const body = await request.text();

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(env.PAYSTACK_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (expectedSig !== signature) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'subscription.create' || event.event === 'charge.success') {
      const metadata = event.data.metadata || {};
      const userId = metadata.user_id;
      if (!userId) return new Response('OK', { status: 200 });

      const subCode = event.data.subscription_code || event.data.reference;
      const customerCode = event.data.customer?.customer_code || '';
      const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

      await env.DB.prepare(`
        INSERT INTO tutor_subscriptions (id, user_id, paystack_sub_code, paystack_customer_code, plan, status, current_period_end, updated_at)
        VALUES (?, ?, ?, ?, 'premium', 'active', ?, unixepoch())
        ON CONFLICT(user_id) DO UPDATE SET
          paystack_sub_code = excluded.paystack_sub_code,
          paystack_customer_code = excluded.paystack_customer_code,
          plan = 'premium',
          status = 'active',
          current_period_end = excluded.current_period_end,
          updated_at = unixepoch()
      `).bind(crypto.randomUUID(), userId, subCode, customerCode, periodEnd).run();
    }

    if (event.event === 'subscription.disable' || event.event === 'subscription.not_renew') {
      const metadata = event.data.metadata || {};
      const userId = metadata.user_id;
      if (userId) {
        await env.DB.prepare(
          'UPDATE tutor_subscriptions SET status = ?, plan = ?, updated_at = unixepoch() WHERE user_id = ?'
        ).bind('cancelled', 'free', userId).run();
      }
    }

    return new Response('OK', { status: 200 });
  }

  return null;
}
