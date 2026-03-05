// KV-based rate limiting: 30 msgs/min, 200 msgs/hour per user

export async function rateLimit(userId, env) {
  const minuteKey = `rl:min:${userId}:${Math.floor(Date.now() / 60000)}`;
  const hourKey = `rl:hr:${userId}:${Math.floor(Date.now() / 3600000)}`;

  const [minuteCount, hourCount] = await Promise.all([
    env.KV.get(minuteKey).then(v => parseInt(v || '0')),
    env.KV.get(hourKey).then(v => parseInt(v || '0'))
  ]);

  if (minuteCount >= 30) {
    return { limited: true, retryAfter: 60, message: 'Too many messages. Please wait a minute.' };
  }
  if (hourCount >= 200) {
    return { limited: true, retryAfter: 3600, message: 'Hourly message limit reached. Please try again later.' };
  }

  await Promise.all([
    env.KV.put(minuteKey, String(minuteCount + 1), { expirationTtl: 120 }),
    env.KV.put(hourKey, String(hourCount + 1), { expirationTtl: 7200 })
  ]);

  return { limited: false };
}
