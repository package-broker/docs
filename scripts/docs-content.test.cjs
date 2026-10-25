const assert = require('node:assert/strict');
const {copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');

function fixture(t) {
  const root = mkdtempSync(path.join(__dirname, '.docs-test-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  mkdirSync(path.join(root, 'scripts'));
  const docs = path.join(root, 'docs-content');
  mkdirSync(docs);
  const helper = path.join(root, 'scripts/docs-content.cjs');
  copyFileSync(path.join(__dirname, 'docs-content.cjs'), helper);
  const manifest = value => writeFileSync(path.join(docs, '.sync.json'), JSON.stringify(value));
  const source = text => writeFileSync(path.join(docs, 'page.md'), text);
  return {docs, manifest, source, ...require(helper)};
}

const valid = {sha: 'a'.repeat(40), files: {'page.md': {lastCommitDate: '2026-10-25T12:34:56Z'}}};

test('accepts nonempty manifests with valid Git ISO timestamps and calendar dates', t => {
  const f = fixture(t);
  for (const date of ['2026-10-25T12:34:56Z', '2026-10-25T12:34:56+02:00',
    '2026-10-25T12:34:56-05:30', '2024-02-29T00:00:00Z']) {
    f.manifest({...valid, files: {'page.md': {lastCommitDate: date}}});
    assert.doesNotThrow(f.assertDocsSynced);
  }
});

test('rejects absent, malformed and empty manifests and every missing or invalid file date', t => {
  const f = fixture(t);
  const message = /missing or malformed.*sync-docs/;
  assert.throws(f.assertDocsSynced, message);
  writeFileSync(path.join(f.docs, '.sync.json'), '{broken');
  assert.throws(f.assertDocsSynced, message);
  for (const value of [null, [], {}, {...valid, sha: 'abc'}, {...valid, sha: 'g'.repeat(40)},
    {...valid, files: []}, {...valid, files: {}}, {...valid, files: null}]) {
    f.manifest(value);
    assert.throws(f.assertDocsSynced, message);
  }
  for (const entry of [null, [], 'date', {}, {lastCommitDate: null}, {lastCommitDate: 123},
    ...['', 'yesterday', '2026-10-25', '2026-10-25T12:34:56', '2026-02-29T00:00:00Z',
      '2026-02-30T00:00:00Z', '2026-13-01T00:00:00Z', '2026-10-25T24:00:00Z',
      '2026-10-25T12:60:00Z', '2026-10-25T12:34:56+24:00'].map(lastCommitDate => ({lastCommitDate}))]) {
    f.manifest({...valid, files: {...valid.files, 'other.md': entry}});
    assert.throws(f.assertDocsSynced, message);
  }
});

test('recognizes only stub bodies, allowing front matter, a title, BOM and CRLF', t => {
  const f = fixture(t);
  for (const body of ['Coming in 2.0', 'Coming in 2.0.', 'Coming in 2.0...', 'Coming in 2.0…',
    'Coming in 2.0: configuring Composer.']) {
    for (const prefix of ['', '# Guide\n\n', '---\ntitle: Guide\n---\n\n',
      '\uFEFF---\ntitle: Guide\n---\n\n# Guide\n\n']) {
      for (const newline of ['\n', '\r\n']) {
        f.source(`${prefix}${body}\n`.replaceAll('\n', newline));
        assert.equal(f.isPlannedDoc(f.docs, 'page.md'), true, `${prefix}${body}`);
        assert.equal(f.isPlannedDoc('', '@site/docs-content/page.md'), true);
      }
    }
  }
});

test('does not mark full documents, version lookalikes or unfinished front matter as stubs', t => {
  const f = fixture(t);
  for (const body of ['# Full guide\n\nInstall packages with this command.', '', 'Coming in 2.01…',
    'Coming in 2.0 will add more options.', 'Coming in 2.0…\n\nExisting content.',
    'Coming in 2.0: Cloudflare.\n\nSee [limits](limits.md) for details.',
    '---\ntitle: Guide\n\nComing in 2.0…', '# Title\n\nComing in 2.0…\n\n## Details']) {
    f.source(body);
    assert.equal(f.isPlannedDoc(f.docs, 'page.md'), false, body);
  }
});
