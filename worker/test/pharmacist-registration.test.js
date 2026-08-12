import assert from 'node:assert/strict';
import test from 'node:test';
import { signJWT } from '../src/middleware/auth.js';
import { handlePharmacist } from '../src/routes/pharmacist.js';

const JWT_SECRET = 'test-only-secret-with-sufficient-length';

class RegistrationDatabase {
  constructor(existing = null) {
    this.existing = existing;
    this.executed = [];
  }

  prepare(sql) {
    const database = this;
    return {
      args: [],
      bind(...args) { this.args = args; return this; },
      async first() {
        database.executed.push({ sql, args: this.args });
        return sql.includes('FROM pharmacists') ? database.existing : null;
      },
      async run() {
        database.executed.push({ sql, args: this.args });
        return { meta: { changes: 1 } };
      },
    };
  }
}

async function authenticatedRequest() {
  const token = await signJWT({ userId: 'applicant-1', role: 'user' }, JWT_SECRET);
  const form = new FormData();
  form.append('full_name', 'Ama Mensah');
  form.append('license_number', 'PCG/12345');
  form.append('country', 'Ghana');
  form.append('specialization', 'Community Pharmacy');
  return new Request('https://example.com/api/pharmacist/register', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
}

function environment(database) {
  return {
    JWT_SECRET,
    KV: { get: async () => null },
    DB: database,
    R2: { put: async () => undefined },
  };
}

test('accepts the frontend field contract without promoting an unverified applicant', async () => {
  const database = new RegistrationDatabase();
  const response = await handlePharmacist(
    await authenticatedRequest(),
    environment(database),
    '/api/pharmacist/register'
  );

  assert.equal(response.status, 200);
  assert.ok(database.executed.some(({ sql }) => sql.includes('INSERT INTO pharmacists')));
  assert.ok(database.executed.every(({ sql }) => !sql.includes('UPDATE users SET role')));
});

test('prevents duplicate pharmacist applications for one account', async () => {
  const database = new RegistrationDatabase({ id: 'existing', is_verified: 0 });
  const response = await handlePharmacist(
    await authenticatedRequest(),
    environment(database),
    '/api/pharmacist/register'
  );

  assert.equal(response.status, 409);
  assert.ok(database.executed.every(({ sql }) => !sql.includes('INSERT INTO pharmacists')));
});
