import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/index.js';

const ENV = { CORS_ORIGIN: 'https://pozospharma.pages.dev' };

test('echoes only the configured production origin', async () => {
  const request = new Request('https://api.example.com/missing', {
    headers: { Origin: 'https://pozospharma.pages.dev' },
  });
  const response = await worker.fetch(request, ENV, {});

  assert.equal(response.status, 404);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://pozospharma.pages.dev');
  assert.match(response.headers.get('Vary') || '', /Origin/);
});

test('rejects preflight requests from an unconfigured origin', async () => {
  const request = new Request('https://api.example.com/api/practice/overview', {
    method: 'OPTIONS',
    headers: { Origin: 'https://attacker.example' },
  });
  const response = await worker.fetch(request, ENV, {});

  assert.equal(response.status, 403);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});

test('permits localhost origins only when the Worker itself is local', async () => {
  const localRequest = new Request('http://127.0.0.1:8787/missing', {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173' },
  });
  const publicRequest = new Request('https://api.example.com/missing', {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173' },
  });

  const localResponse = await worker.fetch(localRequest, ENV, {});
  const publicResponse = await worker.fetch(publicRequest, ENV, {});
  assert.equal(localResponse.status, 204);
  assert.equal(localResponse.headers.get('Access-Control-Allow-Origin'), 'http://localhost:5173');
  assert.equal(publicResponse.status, 403);
});
