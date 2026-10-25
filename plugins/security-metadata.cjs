const {mkdir, writeFile} = require('node:fs/promises');
const path = require('node:path');
const contacts = require('../src/data/contacts.json');
const policy = require('../src/data/security-policy.json');

function securityText(now = Date.now(), metadata = policy) {
  const expires = Date.parse(metadata.expires);
  const remaining = expires - now;
  if (!Number.isFinite(expires) || remaining < 30 * 86400000 || remaining > 365 * 86400000) {
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
