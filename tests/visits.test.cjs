const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');

async function visit({ storage = new Map(), lang = 'en', ok = true, data = { count: 1234 }, storageBlocked = false } = {}) {
  const node = { textContent: '' }, calls = [];
  vm.runInNewContext(fs.readFileSync('main.js', 'utf8'), {
    document: { documentElement: { lang, classList: { add() {} } }, getElementById: id => id === 'visit-count' ? node : null, querySelectorAll: () => [], querySelector: () => null },
    sessionStorage: { getItem: key => { if (storageBlocked) throw Error(); return storage.get(key); }, setItem: (key, value) => { if (storageBlocked) throw Error(); storage.set(key, value); } },
    crypto: { randomUUID },
    fetch: async (url, options) => { calls.push({ url, options }); return { ok, json: async () => data }; },
    AbortController, setTimeout, clearTimeout, Intl,
  });
  await new Promise(resolve => setImmediate(resolve));
  return { node, calls, storage };
}

test('counts using only our origin without credentials or referrer', async () => {
  const { node, calls } = await visit();
  assert.equal(node.textContent, '1,234');
  assert.equal(calls[0].url, '/api/visits');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.referrerPolicy, 'no-referrer');
});
test('reload and language changes reuse session for server deduplication', async () => {
  const storage = new Map();
  const first = await visit({ storage });
  const second = await visit({ storage, lang: 'es' });
  assert.equal(first.calls[0].options.body, second.calls[0].options.body);
  assert.notEqual(first.calls[0].options.body, (await visit()).calls[0].options.body);
});
test('failed responses reuse the same ID on the next page instead of double counting', async () => {
  const storage = new Map();
  const first = await visit({ storage, ok: false, lang: 'es' });
  assert.equal(first.node.textContent, 'No disponible');
  assert.equal(first.calls[0].options.body, (await visit({ storage })).calls[0].options.body);
});
test('invalid values and blocked storage are handled without breaking the page', async () => {
  assert.equal((await visit({ data: { count: '<script>' } })).node.textContent, 'Unavailable');
  assert.equal((await visit({ storageBlocked: true })).node.textContent, '1,234');
});
