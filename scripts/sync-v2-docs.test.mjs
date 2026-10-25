import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {docsPath, externalLink, markStub, rewriteLinks, syncDocs} from './sync-v2-docs.mjs';

const repository = 'https://github.com/package-broker/broker';
const raw = 'https://raw.githubusercontent.com/package-broker/broker/main/';
const siteDir = fileURLToPath(new URL('../', import.meta.url));

test('links resolving to the repository root or above point to its tree', () => {
  for (const url of ['../', '..', '../../', '../../../..']) {
    assert.equal(externalLink(url, 'README.md'), repository);
  }
  assert.equal(externalLink('../../../?tab=readme#top', 'guide/page.md'), `${repository}?tab=readme#top`);
  assert.equal(externalLink('../../README.md', 'guide/page.md'), `${repository}/blob/main/README.md`);
});

test('external images use raw content; docs images and absolute URLs stay intact', () => {
  const input = [
    '![Architecture](../../assets/diagram(v2).png?raw=1#view)',
    '<img src="../../assets/logo.svg" /> <a href="../../README.md">Readme</a>',
    '![Local](../images/local.png)',
    '![Reference][diagram]',
    '[diagram]: ../../assets/reference.png "Diagram"',
    '![Remote](https://example.com/logo.png)',
  ].join('\n');
  assert.equal(rewriteLinks(input, 'guide/page.md'), [
    `![Architecture](${raw}assets/diagram(v2).png?raw=1#view)`,
    `<img src="${raw}assets/logo.svg" /> <a href="${repository}/blob/main/README.md">Readme</a>`,
    '![Local](../images/local.png)',
    '![Reference][diagram]',
    `[diagram]: ${raw}assets/reference.png "Diagram"`,
    '![Remote](https://example.com/logo.png)',
  ].join('\n'));
});

test('balanced parentheses survive inline, angle, reference and HTML link rewrites', () => {
  const input = [
    '[API](../../api/a(b(c)).md?q=(yes)#part)',
    '[Title](../../api/a(b).md "The title")',
    '[Angle](<../../api/a(b).md>)',
    '[ref]: ../../api/a(b).md',
    '<a href="../../api/a(b).md">API</a>',
  ].join('\n');
  assert.equal(rewriteLinks(input, 'guide/page.md'), input.replaceAll('../../api/', `${repository}/blob/main/api/`));
  for (const url of ['https://example.com/a(b(c))', '#a(b)', '../local(a).md']) {
    assert.equal(rewriteLinks(`[Link](${url})`, 'guide/page.md'), `[Link](${url})`);
  }
});

test('longer fences close code blocks and links after them are rewritten', () => {
  for (const fence of ['`', '~']) {
    const code = [fence.repeat(3) + 'md', '[Code](../../README.md)', fence.repeat(2), '[Still code](../../README.md)', fence.repeat(4)].join('\n');
    assert.equal(rewriteLinks(code + '\n[Link](../../README.md)', 'guide/page.md'),
      code + `\n[Link](${repository}/blob/main/README.md)`);
  }
  const inline = '`[Code](../../README.md)`';
  assert.equal(rewriteLinks(inline + '\n[Link](../../README.md)', 'guide/page.md'),
    inline + `\n[Link](${repository}/blob/main/README.md)`);
  const unclosed = '```md\n[Code](../../README.md)';
  assert.equal(rewriteLinks(unclosed, 'guide/page.md'), unclosed);
});

test('stub bodies allow one optional h1 but no extra prose or headings', () => {
  for (const body of ['Coming in 2.0.', '# Install\n\nComing in 2.0: Docker.', '# Install\r\nComing in 2.0']) {
    const {markdown, stub} = markStub(body);
    assert.equal(stub, true);
    assert.match(markdown, /^---\nunlisted: true\n---/);
    assert.equal(markStub(markdown).markdown, markdown);
  }
  assert.match(markStub('---\nunlisted: false\n---\n# Install\nComing in 2.0.').markdown, /unlisted: true/);
  for (const body of ['## Install\nComing in 2.0.', '# One\n# Two\nComing in 2.0.', '# Install\nComing in 2.0.\nMore information.', 'Coming in 2.0\n.']) {
    assert.deepEqual(markStub(body), {markdown: body, stub: false});
  }
});

test('every destination must resolve strictly inside docs', () => {
  const destination = path.join(siteDir, 'docs');
  for (const file of ['..', '../escape.md', '.', '', path.join(siteDir, 'outside.md')]) {
    assert.throws(() => docsPath(destination, file), /escapes docs/);
  }
  assert.equal(docsPath(destination, 'guide/page.md'), path.join(destination, 'guide/page.md'));
});

test('option-like broker refs are rejected before Git runs', async () => {
  await assert.rejects(syncDocs({brokerDir: '/nonexistent', brokerRef: '--output=bad'}), /BROKER_REF must not start/);
});

test('sync preserves old docs on write/swap failure and removes stale files on success', async t => {
  const fixture = await fs.mkdtemp(path.join(siteDir, '.sync-test-'));
  t.after(() => fs.rm(fixture, {recursive: true, force: true}));
  const brokerDir = path.join(fixture, 'broker');
  const destination = path.join(fixture, 'site', 'docs');
  await fs.mkdir(path.join(brokerDir, 'docs'), {recursive: true});
  await fs.mkdir(destination, {recursive: true});
  await fs.writeFile(path.join(destination, 'stale.md'), 'Previous docs');
  await fs.writeFile(path.join(brokerDir, 'docs', 'a.md'), '# Heading\nComing in 2.0.');
  const binary = Buffer.from([0, 255, 128, 42]);
  await fs.writeFile(path.join(brokerDir, 'docs', 'b.png'), binary);
  const writeFile = fs.writeFile;
  let writes = 0;
  const mockedWrite = t.mock.method(fs, 'writeFile', async (...args) => {
    assert.equal(await fs.readFile(path.join(destination, 'stale.md'), 'utf8'), 'Previous docs');
    if (++writes === 2) throw new Error('Injected write failure');
    return writeFile(...args);
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(syncDocs({brokerDir, destination}), /Injected write failure/);
  } finally {
    mockedWrite.mock.restore();
    syncBuiltinESMExports();
  }
  assert.deepEqual(await fs.readdir(destination), ['stale.md']);
  assert.deepEqual(await fs.readdir(path.dirname(destination)), ['docs']);
  const rename = fs.rename;
  const mockedRename = t.mock.method(fs, 'rename', async (source, target) => {
    if (source.endsWith('/docs') && target === destination) throw new Error('Injected swap failure');
    return rename(source, target);
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(syncDocs({brokerDir, destination}), /Injected swap failure/);
  } finally {
    mockedRename.mock.restore();
    syncBuiltinESMExports();
  }
  assert.equal(await fs.readFile(path.join(destination, 'stale.md'), 'utf8'), 'Previous docs');
  assert.deepEqual(await fs.readdir(path.dirname(destination)), ['docs']);
  await syncDocs({brokerDir, destination});
  assert.deepEqual(await fs.readdir(destination), ['a.md', 'b.png']);
  assert.deepEqual(await fs.readFile(path.join(destination, 'b.png')), binary);
  const first = await fs.readFile(path.join(destination, 'a.md'), 'utf8');
  assert.match(first, /unlisted: true/);
  await syncDocs({brokerDir, destination});
  assert.equal(await fs.readFile(path.join(destination, 'a.md'), 'utf8'), first);
  assert.deepEqual(await fs.readdir(path.dirname(destination)), ['docs']);
});
