const {readFileSync} = require('node:fs');
const path = require('node:path');

function assertDocsSynced() {
  try {
    const manifest = JSON.parse(readFileSync(path.join(__dirname, '../docs-content/.sync.json'), 'utf8'));
    if (!manifest || typeof manifest.sha !== 'string' || !/^[0-9a-f]{40}$/.test(manifest.sha) ||
        !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files)) {
      throw new Error('Invalid sync manifest');
    }
  } catch {
    throw new Error('docs-content/.sync.json is missing or malformed. Run scripts/sync-docs.mjs with BROKER_DIR and a full --ref commit SHA.');
  }
}

function isPlannedDoc(contentPath, source) {
  const filename = source.startsWith('@site/')
    ? path.join(__dirname, '..', source.slice('@site/'.length))
    : path.resolve(contentPath, source);
  const body = readFileSync(filename, 'utf8')
    .replace(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim();
  return /^Coming in 2\.0(?=[:.…\s]|$)/.test(body);
}

module.exports = {assertDocsSynced, isPlannedDoc};
