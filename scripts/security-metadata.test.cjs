const {test} = require('node:test');
const assert = require('node:assert/strict');
const {securityText} = require('../plugins/security-metadata.cjs');
const policy = require('../src/data/security-policy.json');
const contacts = require('../src/data/contacts.json');
const expiry = Date.parse(policy.expires);
const day = 86400000;

test('security.txt uses the shared contact and a permanent policy URL', () => {
  const text = securityText(expiry - 100 * day);
  assert.ok(text.includes(`Contact: mailto:${contacts.security}\n`));
  assert.ok(text.includes(`/blob/${policy.productCommit}/SECURITY.md\n`));
  assert.ok(text.includes('Preferred-Languages: en\n'));
  assert.ok(text.includes('Canonical: https://package.broker/.well-known/security.txt\n'));
});
test('expiry gate rejects expired, near-expiry, invalid and over-one-year dates', () => {
  for (const now of [expiry + day, expiry - 29 * day, expiry - 366 * day]) assert.throws(() => securityText(now), /expiry/);
  assert.throws(() => securityText(expiry - 100 * day, {...policy, expires: 'invalid'}), /expiry/);
  assert.doesNotThrow(() => securityText(expiry - 30 * day));
  assert.doesNotThrow(() => securityText(expiry - 365 * day));
});
