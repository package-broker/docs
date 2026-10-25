const {readFileSync} = require('node:fs');
const path = require('node:path');

function isCommitDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) return false;
  const date = value.slice(0, 10);
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(Date.parse(value)) && Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(date);
}

function assertDocsSynced() {
  try {
    const manifest = JSON.parse(readFileSync(path.join(__dirname, '../docs-content/.sync.json'), 'utf8'));
    if (!manifest || typeof manifest.sha !== 'string' || !/^[0-9a-f]{40}$/.test(manifest.sha) ||
        !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files) ||
        Object.keys(manifest.files).length === 0 ||
        !Object.values(manifest.files).every(file => file && typeof file === 'object' &&
          !Array.isArray(file) && isCommitDate(file.lastCommitDate))) {
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
    .replace(/^\uFEFF/, '')
    .replace(/^---\r?\n(?:[\s\S]*?\r?\n)?---(?:\r?\n|$)/, '').trim()
    .replace(/^# [^\r\n]+\r?\n+/, '').trim();
  return /^Coming in 2\.0(?::[^\r\n]+|\.{1,3}|…)?$/.test(body);
}

module.exports = {assertDocsSynced, isPlannedDoc};
