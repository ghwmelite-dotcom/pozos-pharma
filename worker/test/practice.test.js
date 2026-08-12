import assert from 'node:assert/strict';
import test from 'node:test';
import { signJWT } from '../src/middleware/auth.js';
import { handlePractice } from '../src/routes/practice.js';

const JWT_SECRET = 'test-only-secret-with-sufficient-length';

class MockDatabase {
  constructor({ existingIntervention = null, exportRows = [] } = {}) {
    this.insertArgs = null;
    this.existingIntervention = existingIntervention;
    this.exportRows = exportRows;
    this.executed = [];
  }

  prepare(sql) {
    const database = this;
    return {
      args: [],
      bind(...args) {
        this.args = args;
        return this;
      },
      async first() {
        database.executed.push({ sql, args: this.args });
        if (sql.includes('FROM users')) {
          return { role: 'pharmacist', is_banned: 0 };
        }
        if (sql.includes('FROM pharmacists')) {
          return {
            id: 'pharmacist-1',
            full_name: 'Test Pharmacist',
            license_number: 'PCG/12345',
            specialization: 'Community Pharmacy',
          };
        }
        if (sql.includes('client_request_id')) return database.existingIntervention;
        return null;
      },
      async all() {
        database.executed.push({ sql, args: this.args });
        if (sql.includes('SELECT reference_code, occurred_at')) {
          return { results: database.exportRows };
        }
        return { results: [] };
      },
      async run() {
        database.executed.push({ sql, args: this.args });
        if (sql.includes('INSERT OR IGNORE INTO clinical_interventions')) {
          database.insertArgs = this.args;
        }
        return { meta: { changes: 1 } };
      },
    };
  }
}

async function createEnvironment(databaseOptions) {
  return {
    JWT_SECRET,
    KV: { get: async () => null },
    DB: new MockDatabase(databaseOptions),
  };
}

async function pharmacistToken() {
  return signJWT({ userId: 'user-1', role: 'pharmacist' }, JWT_SECRET);
}

function validPayload(overrides = {}) {
  return {
    clientRequestId: 'offline-request-1',
    conditionCategory: 'malaria',
    drugNames: 'Artemether-Lumefantrine',
    issueType: 'dose_adjustment',
    severity: 'moderate',
    actionTaken: 'Counselled the patient and confirmed the correct six-dose schedule.',
    outcome: 'accepted',
    reportable: false,
    notes: 'No patient identifiers recorded.',
    occurredAt: '2025-01-15T08:30:00.000Z',
    ...overrides,
  };
}

test('requires an authenticated pharmacist for practice endpoints', async () => {
  const env = await createEnvironment();
  const request = new Request('https://example.com/api/practice/interventions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload()),
  });

  const response = await handlePractice(request, env, '/api/practice/interventions');
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Unauthorized' });
});

test('rejects intervention values outside the clinical allowlists', async () => {
  const env = await createEnvironment();
  const request = new Request('https://example.com/api/practice/interventions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await pharmacistToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validPayload({ severity: 'catastrophic' })),
  });

  const response = await handlePractice(request, env, '/api/practice/interventions');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid severity' });
});

test('rejects obvious direct patient identifiers', async () => {
  const env = await createEnvironment();
  const request = new Request('https://example.com/api/practice/interventions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await pharmacistToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validPayload({ notes: 'Follow up at patient@example.com' })),
  });

  const response = await handlePractice(request, env, '/api/practice/interventions');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Remove direct patient identifiers before saving' });
});

test('stores a valid de-identified intervention through a prepared statement', async () => {
  const env = await createEnvironment();
  const request = new Request('https://example.com/api/practice/interventions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await pharmacistToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validPayload()),
  });

  const response = await handlePractice(request, env, '/api/practice/interventions');
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.match(payload.intervention.reference_code, /^PZI-\d{8}-[A-F0-9]{6}$/);
  assert.ok(env.DB.insertArgs, 'expected an INSERT statement to be executed');
  assert.equal(env.DB.insertArgs[1], 'pharmacist-1');
  assert.equal(env.DB.insertArgs[3], 'offline-request-1');
  assert.equal(env.DB.insertArgs[5], 'malaria');
  assert.equal(env.DB.insertArgs[7], 'dose_adjustment');
});

test('replays an existing offline request without inserting a duplicate', async () => {
  const existing = { id: 'existing-1', reference_code: 'PZI-20250115-ABC123' };
  const env = await createEnvironment({ existingIntervention: existing });
  const request = new Request('https://example.com/api/practice/interventions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await pharmacistToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validPayload()),
  });

  const response = await handlePractice(request, env, '/api/practice/interventions');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { intervention: existing, replayed: true });
  assert.equal(env.DB.insertArgs, null);
});

test('scopes every overview query to the authenticated pharmacist', async () => {
  const env = await createEnvironment();
  const request = new Request('https://example.com/api/practice/overview', {
    headers: { Authorization: `Bearer ${await pharmacistToken()}` },
  });

  const response = await handlePractice(request, env, '/api/practice/overview');
  assert.equal(response.status, 200);

  const clinicalQueries = env.DB.executed.filter(({ sql }) => sql.includes('clinical_interventions'));
  assert.equal(clinicalQueries.length, 4);
  assert.ok(clinicalQueries.every(({ args }) => args[0] === 'pharmacist-1'));
});

test('protects CSV exports from spreadsheet formula injection', async () => {
  const env = await createEnvironment({
    exportRows: [{
      reference_code: 'PZI-20250115-ABC123',
      occurred_at: 1736929800,
      condition_category: 'malaria',
      drug_names: '=HYPERLINK("https://example.com")',
      issue_type: 'dose_adjustment',
      severity: 'moderate',
      action_taken: '+unsafe formula',
      outcome: 'accepted',
      reportable: 0,
      notes: '@unsafe',
    }],
  });
  const request = new Request('https://example.com/api/practice/interventions/export.csv', {
    headers: { Authorization: `Bearer ${await pharmacistToken()}` },
  });

  const response = await handlePractice(request, env, '/api/practice/interventions/export.csv');
  const csv = await response.text();
  assert.equal(response.status, 200);
  assert.match(csv, /"'=HYPERLINK/);
  assert.match(csv, /"'\+unsafe formula"/);
  assert.match(csv, /"'@unsafe"/);
});
