import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../edge/worker.mjs';
import headers from '../edge/policy.mjs';

const origin = 'https://www.machinnurseryfarms.com';
const environment = response => ({ ASSETS: { fetch: async () => response } });

function checkHeaders(response) {
  assert.equal(Object.keys(headers).length, 9);
  for (const [name, value] of Object.entries(headers)) assert.equal(response.headers.get(name), value, name);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.doesNotMatch(response.headers.get('content-security-policy'), /unsafe-inline|unsafe-eval/);
}

test('all nine security headers are applied and permissive CORS is removed', async () => {
  const response = await worker.fetch(new Request(origin), environment(new Response('hello', { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/html' } })));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'hello');
  checkHeaders(response);
});

test('host, HTTP and index aliases normalize in a single permanent redirect', async () => {
  const response = await worker.fetch(new Request('http://machinnurseryfarms.com/es/index.html?utm_source=test'), {});
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), origin + '/es/?utm_source=test');
  checkHeaders(response);
});

test('double slash paths cannot redirect to an attacker-controlled host', async () => {
  const response = await worker.fetch(new Request('http://machinnurseryfarms.com//evil.example/index.html'), {});
  assert.equal(new URL(response.headers.get('location')).origin, origin);
});

test('unknown pages remain genuine 404s instead of serving the home page as 200', async () => {
  const response = await worker.fetch(new Request(origin + '/missing-page'), environment(new Response('Not found', { status: 404 })));
  assert.equal(response.status, 404);
  checkHeaders(response);
});

test('POST is rejected without passing customer data to the asset service', async () => {
  let called = false;
  const response = await worker.fetch(new Request(origin, { method: 'POST', body: 'private=data' }), { ASSETS: { fetch() { called = true; } } });
  assert.equal(response.status, 405);
  assert.equal(called, false);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
  checkHeaders(response);
});

test('asset service failure returns 503 with security headers and no internal details', async () => {
  const response = await worker.fetch(new Request(origin), { ASSETS: { fetch() { throw new Error('private internal detail'); } } });
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private internal detail/);
  checkHeaders(response);
});
