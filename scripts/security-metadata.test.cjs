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

test('expiry requires a real ISO-8601 timestamp with an explicit timezone', () => {
  for (const expires of ['2027-09-30', '2027-09-30T00:00:00', 'September 30, 2027 UTC', '2027-02-30T00:00:00Z', '2027-09-30T24:00:00Z', '2027-09-30T00:00:00+24:00']) {
    assert.throws(() => securityText(expiry - 100 * day, {...policy, expires}), /ISO-8601 with a timezone/);
  }
  for (const expires of ['2027-09-30T00:00:00Z', '2027-09-30T02:00:00+02:00', '2027-09-29T19:00:00-05:00', '2027-09-30T00:00:00.123Z']) {
    assert.ok(securityText(expiry - 100 * day, {...policy, expires}).includes(`Expires: ${expires}\n`));
  }
});

test('product policy requires a full commit SHA', () => {
  for (const productCommit of ['', 'main', '8055d81', 'g'.repeat(40), undefined]) {
    assert.throws(() => securityText(expiry - 100 * day, {...policy, productCommit}), /full product commit SHA/);
  }
});
