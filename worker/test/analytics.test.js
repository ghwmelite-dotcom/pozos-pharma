import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { signJWT } from '../src/middleware/auth.js';
import { handleAnalytics } from '../src/routes/analytics.js';

const JWT_SECRET = 'test-only-secret-with-sufficient-length';

test('analytics migration creates the events table and reporting indexes', () => {
  const database = new DatabaseSync(':memory:');
  database.exec('CREATE TABLE users (id TEXT PRIMARY KEY);');
  database.exec(fs.readFileSync(
    new URL('../src/migrations/2026-08-12-analytics-events.sql', import.meta.url),
    'utf8'
  ));

  const table = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'analytics_events'"
  ).get();
  const indexes = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'analytics_events'"
  ).all().map(({ name }) => name);

  assert.equal(table.name, 'analytics_events');
  assert.ok(indexes.includes('idx_analytics_events_created'));
  assert.ok(indexes.includes('idx_analytics_events_type_created'));
  assert.ok(indexes.includes('idx_analytics_events_user_created'));
  database.close();
});

test('tracked events use the authenticated JWT userId claim', async () => {
  let insertedArgs;
  const env = {
    JWT_SECRET,
    KV: {
      get: async () => null,
      put: async () => undefined,
    },
    DB: {
      prepare(sql) {
        assert.match(sql, /INSERT INTO analytics_events/);
        return {
          bind(...args) { insertedArgs = args; return this; },
          async run() { return { meta: { changes: 1 } }; },
        };
      },
    },
  };
  const token = await signJWT({ userId: 'user-1', role: 'pharmacist' }, JWT_SECRET);
  const request = new Request('https://example.com/api/analytics/track', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_type: 'page_view', page: '/practice' }),
  });

  const response = await handleAnalytics(request, env, '/api/analytics/track');
  assert.equal(response.status, 200);
  assert.equal(insertedArgs[3], 'user-1');
  assert.equal(insertedArgs[4], '/practice');
});
