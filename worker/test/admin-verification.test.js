import assert from 'node:assert/strict';
import test from 'node:test';
import { signJWT } from '../src/middleware/auth.js';
import { handleAdmin } from '../src/routes/admin.js';

const JWT_SECRET = 'test-only-secret-with-sufficient-length';

class VerificationDatabase {
  constructor() {
    this.batchStatements = [];
  }

  prepare(sql) {
    return {
      sql,
      args: [],
      bind(...args) { this.args = args; return this; },
      async first() {
        if (sql.includes('SELECT role, is_banned FROM users')) {
          return { role: 'admin', is_banned: 0 };
        }
        if (sql.includes('SELECT user_id FROM pharmacists')) {
          return { user_id: 'applicant-1' };
        }
        return null;
      },
    };
  }

  async batch(statements) {
    this.batchStatements = statements;
    return statements.map(() => ({ success: true }));
  }
}

async function adminRequest(url) {
  const token = await signJWT({ userId: 'admin-1', role: 'admin' }, JWT_SECRET);
  return new Request(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

function environment(database) {
  return {
    JWT_SECRET,
    KV: { get: async () => null },
    DB: database,
  };
}

test('approval verifies the application and promotes the linked account together', async () => {
  const database = new VerificationDatabase();
  const path = '/api/admin/pharmacists/pharmacist-1/approve';
  const response = await handleAdmin(
    await adminRequest(`https://example.com${path}`), environment(database), path
  );

  assert.equal(response.status, 200);
  assert.equal(database.batchStatements.length, 2);
  assert.match(database.batchStatements[0].sql, /SET is_verified = 1/);
  assert.match(database.batchStatements[1].sql, /SET role = 'pharmacist'/);
  assert.deepEqual(database.batchStatements[1].args, ['applicant-1']);
});

test('rejection removes the application and demotes the linked account together', async () => {
  const database = new VerificationDatabase();
  const path = '/api/admin/pharmacists/pharmacist-1/reject';
  const response = await handleAdmin(
    await adminRequest(`https://example.com${path}`), environment(database), path
  );

  assert.equal(response.status, 200);
  assert.equal(database.batchStatements.length, 2);
  assert.match(database.batchStatements[0].sql, /DELETE FROM pharmacists/);
  assert.match(database.batchStatements[1].sql, /SET role = 'user'/);
});
