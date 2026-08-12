import assert from 'node:assert/strict';
import test from 'node:test';
import { requireRole, signJWT } from '../src/middleware/auth.js';

const JWT_SECRET = 'test-only-secret-with-sufficient-length';

function environment(role, isBanned = 0) {
  return {
    JWT_SECRET,
    KV: { get: async () => null },
    DB: {
      prepare(sql) {
        assert.match(sql, /SELECT role, is_banned FROM users/);
        return {
          bind() { return this; },
          async first() { return { role, is_banned: isBanned }; },
        };
      },
    },
  };
}

async function requestFor(claimedRole) {
  const token = await signJWT({ userId: 'user-1', role: claimedRole }, JWT_SECRET);
  return new Request('https://example.com/protected', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

test('rejects a stale privileged JWT after database demotion', async () => {
  const result = await requireRole(await requestFor('pharmacist'), environment('user'), 'pharmacist');
  assert.equal(result.error.status, 403);
});

test('honours a database approval without requiring a fresh JWT', async () => {
  const result = await requireRole(await requestFor('user'), environment('pharmacist'), 'pharmacist');
  assert.equal(result.error, undefined);
  assert.equal(result.user.role, 'pharmacist');
});

test('blocks privileged access for a suspended account', async () => {
  const result = await requireRole(await requestFor('admin'), environment('admin', 1), 'admin');
  assert.equal(result.error.status, 403);
});
