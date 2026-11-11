const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const endpoint = 'https://api.counterapi.dev/v2/owner/visits';
async function visit({ storage = new Map(), url = endpoint, hostname = 'www.machinnurseryfarms.com', lang = 'en', ok = true, data = { data: { up_count: 1234, down_count: 0 } }, storageBlocked = false } = {}) {
  const node = { dataset: { counterUrl: url }, textContent: 'Pending activation' };
  const calls = [];
  const context = vm.createContext({
    document: { documentElement: { lang, classList: { add() {} } }, getElementById: id => id === 'visit-count' ? node : null, querySelectorAll: () => [], querySelector: () => null },
    window: { location: { hostname } },
    sessionStorage: { getItem: key => { if (storageBlocked) throw Error(); return storage.get(key); }, setItem: (key, value) => { if (storageBlocked) throw Error(); storage.set(key, value); } },
    fetch: async (url, options) => { calls.push({ url, options }); return { ok, json: async () => data }; },
    AbortController, setTimeout, clearTimeout, Intl,
  });
  vm.runInContext(fs.readFileSync('main.js', 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return { node, calls, storage };
}

test('first visit increments shared counter without credentials or referrer', async () => {
  const { node, calls } = await visit();
  assert.equal(node.textContent, '1,234');
  assert.equal(calls[0].url, endpoint + '/up');
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.referrerPolicy, 'no-referrer');
});
test('reload and bilingual navigation read total without another increment', async () => {
  const storage = new Map();
  await visit({ storage });
  const result = await visit({ storage, lang: 'es' });
  assert.equal(result.calls[0].url, endpoint);
});
test('new session increments again', async () => {
  await visit();
  assert.equal((await visit()).calls[0].url, endpoint + '/up');
});
test('missing configuration and local previews never contact the provider', async () => {
  assert.equal((await visit({ url: '' })).calls.length, 0);
  assert.equal((await visit({ hostname: 'localhost' })).calls.length, 0);
  assert.equal((await visit({ url: 'https://evil.example/track' })).calls.length, 0);
});
test('outages and malformed responses show honest status without automatic retries', async () => {
  const failed = await visit({ ok: false, lang: 'es' });
  assert.equal(failed.node.textContent, 'No disponible');
  assert.equal(failed.storage.size, 0);
  const storage = new Map();
  assert.equal((await visit({ storage, data: { data: { value: '<script>' } } })).node.textContent, 'Unavailable');
  assert.equal((await visit({ storage })).calls[0].url, endpoint);
});
test('blocked session storage does not break rendering', async () => {
  assert.equal((await visit({ storageBlocked: true })).node.textContent, '1,234');
});
