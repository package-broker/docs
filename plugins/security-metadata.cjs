const {mkdir, writeFile} = require('node:fs/promises');
const path = require('node:path');
const contacts = require('../src/data/contacts.json');
const policy = require('../src/data/security-policy.json');

function securityText(now = Date.now(), metadata = policy) {
  // Date.parse also accepts date-only, local-time and normalized invalid dates.
  const isoWithTimezone = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
  const expires = Date.parse(metadata.expires);
  if (!isoWithTimezone.test(metadata.expires) || !Number.isFinite(expires) ||
      new Date(`${metadata.expires.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== metadata.expires.slice(0, 10)) {
    throw new Error('security.txt expiry must be strict ISO-8601 with a timezone. Update src/data/security-policy.json.');
  }
  const remaining = expires - now;
  if (remaining < 30 * 86400000 || remaining > 365 * 86400000) {
    throw new Error('security.txt expiry must be between 30 and 365 days ahead. Update src/data/security-policy.json.');
  }
  if (!/^[a-f0-9]{40}$/.test(metadata.productCommit)) throw new Error('Security policy requires a full product commit SHA.');
  return [
    `Contact: mailto:${contacts.security}`,
    `Expires: ${metadata.expires}`,
    `Policy: https://github.com/package-broker/broker/blob/${metadata.productCommit}/SECURITY.md`,
    'Preferred-Languages: en',
    'Canonical: https://package.broker/.well-known/security.txt',
    '',
  ].join('\n');
}

module.exports = function securityMetadataPlugin() {
  return {
    name: 'security-metadata',
    async loadContent() { return securityText(); },
    async postBuild({outDir}) {
      const folder = path.join(outDir, '.well-known');
      await mkdir(folder, {recursive: true});
      await writeFile(path.join(folder, 'security.txt'), securityText());
    },
  };
};
module.exports.securityText = securityText;
if (require.main === module) process.stdout.write(securityText());
