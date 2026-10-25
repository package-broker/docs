import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {addFrontMatter, readArchive, syncDocs} from './sync-docs.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(import.meta.dirname, '.sync-test-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const brokerDir = path.join(root, 'broker');
  const siteDir = path.join(root, 'site');
  mkdirSync(brokerDir);
  mkdirSync(siteDir);
  let commitDate = '2026-10-20T10:00:00+00:00';
  const git = (...args) => execFileSync('git', ['-C', brokerDir, ...args], {
    encoding: 'utf8', env: {...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_AUTHOR_NAME: 'Docs test', GIT_AUTHOR_EMAIL: 'docs@example.test',
      GIT_COMMITTER_NAME: 'Docs test', GIT_COMMITTER_EMAIL: 'docs@example.test',
      GIT_AUTHOR_DATE: commitDate, GIT_COMMITTER_DATE: commitDate},
  }).trim();
  git('init', '-q');
  const put = (file, text) => {
    mkdirSync(path.dirname(path.join(brokerDir, file)), {recursive: true});
    writeFileSync(path.join(brokerDir, file), text);
  };
  put('docs/architecture.md', '# Architecture overview\n');
  put('docs/guide.md', '---\ntitle: Guide\n---\n\nComing in 2.0…\n');
  put('docs/no-front-matter.md', '# Leave this alone\n');
  put('docs/group/_category_.json', '{"label":"Group"}\n');
  git('add', '.');
  git('-c', 'commit.gpgsign=false', 'commit', '-qm', 'Docs fixture');
  const ref = git('rev-parse', 'HEAD');
  return {brokerDir, siteDir, ref, git, put, setDate(value) { commitDate = value; }, log() {}};
}

function snapshot(dir) {
  return Object.fromEntries(readdirSync(dir, {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile()).map(entry => {
      const filename = path.join(entry.parentPath, entry.name);
      return [path.relative(dir, filename), readFileSync(filename).toString('base64')];
    }).sort(([a], [b]) => a.localeCompare(b)));
}

test('refuses branch names, short SHAs, option-like refs, absent commits, blobs and tags before writing', t => {
  const options = fixture(t);
  const blob = options.git('rev-parse', 'HEAD:docs/architecture.md');
  options.git('-c', 'tag.gpgsign=false', 'tag', '-am', 'Tag fixture', 'annotated');
  const tag = options.git('rev-parse', 'annotated');
  for (const ref of [undefined, 'main', options.ref.slice(0, 8), '--help', 'g'.repeat(40), '0'.repeat(40), blob, tag]) {
    assert.throws(() => syncDocs({...options, ref}), /ref|commit/i);
  }
  assert.deepEqual(readdirSync(options.siteDir), []);
});

test('adds front matter only to architecture without it and preserves existing bytes', () => {
  const original = Buffer.from('# Architecture\n');
  const rendered = addFrontMatter('architecture.md', original);
  assert.match(rendered.toString(), /^---\ntitle: Architecture overview\nsidebar_position: 9\ndescription: .+\n---\n\n# Architecture/);
  for (const source of ['---\ntitle: Custom\n---\n\nBody\n', '\uFEFF---\r\ntitle: Custom\r\n---\r\nBody']) {
    const data = Buffer.from(source);
    assert.equal(addFrontMatter('architecture.md', data), data);
  }
  assert.equal(addFrontMatter('other.md', original), original);
});

test('sync is deterministic, uses committed content and file dates, removes stale files and logs additions', t => {
  const options = fixture(t);
  options.put('docs/architecture.md', '# Uncommitted edit\n');
  const logs = [];
  const manifest = syncDocs({...options, log: line => logs.push(line)});
  const output = path.join(options.siteDir, 'docs-content');
  assert.match(readFileSync(path.join(output, 'architecture.md'), 'utf8'), /# Architecture overview/);
  assert.equal(readFileSync(path.join(output, 'no-front-matter.md'), 'utf8'), '# Leave this alone\n');
  assert.equal(manifest.sha, options.ref);
  assert.equal(Object.keys(manifest.files).length, 4);
  assert.equal(manifest.files['architecture.md'].lastCommitDate, options.git('log', '-1', '--format=%cI', options.ref, '--', 'docs/architecture.md'));
  assert.deepEqual(JSON.parse(readFileSync(path.join(output, '.sync.json'))), manifest);
  assert.ok(logs.includes('Added front matter: architecture.md'));
  const before = snapshot(output);
  writeFileSync(path.join(output, 'stale.md'), 'old');
  syncDocs(options);
  assert.deepEqual(snapshot(output), before);
});

test('dry run reports the file count without writing or changing output', t => {
  const options = fixture(t);
  const logs = [];
  syncDocs({...options, dryRun: true, log: line => logs.push(line)});
  assert.match(logs.at(-1), /^Dry run: would sync 4 files/);
  assert.deepEqual(readdirSync(options.siteDir), []);
  syncDocs(options);
  const before = snapshot(options.siteDir);
  syncDocs({...options, dryRun: true});
  assert.deepEqual(snapshot(options.siteDir), before);
});

test('records each file history, including literal pathspec characters and object property names', t => {
  const options = fixture(t);
  options.setDate('2026-10-21T11:00:00+02:00');
  options.put('docs/[guide].md', '# Another guide\n');
  options.put('docs/__proto__', 'A regular file\n');
  options.git('add', '.');
  options.git('-c', 'commit.gpgsign=false', 'commit', '-qm', 'More docs');
  const ref = options.git('rev-parse', 'HEAD');
  const manifest = syncDocs({...options, ref});
  const expected = options.git('log', '-1', '--format=%cI', ref);
  assert.equal(manifest.files['[guide].md'].lastCommitDate, expected);
  assert.equal(manifest.files.__proto__.lastCommitDate, expected);
  assert.ok(Object.hasOwn(manifest.files, '__proto__'));
  assert.notEqual(manifest.files['architecture.md'].lastCommitDate, expected);
});

test('rejects archived links and a linked destination without writing outside docs-content', t => {
  const options = fixture(t);
  syncDocs(options);
  const before = snapshot(options.siteDir);
  options.put('outside.txt', 'Keep this');
  symlinkSync('../../outside.txt', path.join(options.brokerDir, 'docs/link'));
  options.git('add', '.');
  options.git('-c', 'commit.gpgsign=false', 'commit', '-qm', 'Linked docs');
  assert.throws(() => syncDocs({...options, ref: options.git('rev-parse', 'HEAD')}), /links/);
  assert.deepEqual(snapshot(options.siteDir), before);
  const output = path.join(options.siteDir, 'docs-content');
  rmSync(output, {recursive: true});
  symlinkSync(options.brokerDir, output);
  assert.throws(() => syncDocs(options), /directory/);
  assert.equal(readFileSync(path.join(options.brokerDir, 'outside.txt'), 'utf8'), 'Keep this');
});

function tarEntry(name, type = '0', content = Buffer.from('x')) {
  const header = Buffer.alloc(512);
  header.write(name, 0, 100);
  header.write('0000644\0', 100);
  header.write(`${content.length.toString(8).padStart(11, '0')}\0`, 124);
  header.fill(32, 148, 156);
  header.write(type, 156);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148);
  return Buffer.concat([header, content, Buffer.alloc((512 - content.length % 512) % 512), Buffer.alloc(1024)]);
}

test('rejects archive traversal, absolute paths, reserved manifest, links and special files', () => {
  for (const name of ['../escape', '/docs/escape', 'docs/../../escape', 'docs/a/../escape', 'docs//escape',
    'docs/./escape', 'docs/escape\\..\\outside', 'docs/C:/escape', 'docs/.sync.json']) {
    assert.throws(() => readArchive(tarEntry(name)), /path/);
  }
  for (const type of ['1', '2', '3', '6']) assert.throws(() => readArchive(tarEntry('docs/link', type)), /links/);
});

test('supports long paths from git archive and rejects traversal in PAX paths', t => {
  const options = fixture(t);
  const longPath = `docs/${'a'.repeat(120)}/page.md`;
  options.put(longPath, '# Long path\n');
  options.git('add', '.');
  options.git('-c', 'commit.gpgsign=false', 'commit', '-qm', 'Long docs path');
  syncDocs({...options, ref: options.git('rev-parse', 'HEAD')});
  assert.equal(readFileSync(path.join(options.siteDir, 'docs-content', longPath.slice(5)), 'utf8'), '# Long path\n');
  const value = 'path=docs/../../escape\n';
  let length = value.length + 3;
  length = `${length} ${value}`.length;
  const metadata = tarEntry('pax', 'x', Buffer.from(`${length} ${value}`)).subarray(0, 1024);
  assert.throws(() => readArchive(Buffer.concat([metadata, tarEntry('docs/page.md')])), /path/);
});
