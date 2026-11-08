const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function runForm({ lang = 'en', channel = 'whatsapp', valid = true } = {}) {
  let submit, destination;
  const status = { textContent: '' }, fallback = { hidden: true };
  const form = { dataset: { email: 'owner@example.com', whatsapp: '17869926153' }, addEventListener: (_, handler) => { submit = handler; }, reportValidity: () => valid };
  const fields = { name: '<script>& María', email: 'visitor@example.com', phone: '', type: 'Wholesale', message: 'Clusia & Cocoplum\n20 plants?', channel };
  vm.runInNewContext(fs.readFileSync('main.js', 'utf8'), {
    document: { documentElement: { lang }, getElementById: () => null, querySelector: selector => ({ '#inquiry-form': form, '#inquiry-status': status, '#inquiry-open': fallback })[selector] },
    FormData: class { get(key) { return fields[key]; } },
    window: { open: url => { destination = url; }, location: { set href(url) { destination = url; } } },
  });
  submit({ preventDefault() {} });
  return { destination, status, fallback };
}
test('WhatsApp preserves customer input and requires sending in the app', () => {
  const result = runForm(), url = new URL(result.destination);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/17869926153');
  assert.match(url.searchParams.get('text'), /<script>& María/);
  assert.match(url.searchParams.get('text'), /Clusia & Cocoplum\n20 plants\?/);
  assert.match(result.status.textContent, /has not sent or saved/);
  assert.equal(result.fallback.href, result.destination);
  assert.equal(result.fallback.hidden, false);
});
test('Spanish email uses configured inbox and honest status', () => {
  const result = runForm({ lang: 'es', channel: 'email' }), url = new URL(result.destination);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'owner@example.com');
  assert.equal(url.searchParams.get('subject'), 'Consulta de plantas');
  assert.match(result.status.textContent, /no ha enviado ni guardado/);
});
test('Invalid input never opens a contact application', () => {
  const result = runForm({ valid: false });
  assert.equal(result.destination, undefined);
  assert.equal(result.fallback.hidden, true);
});
