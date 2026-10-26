import test from 'node:test';
import assert from 'node:assert/strict';
import {checkSeo, inspectPage, htmlPages} from '../scripts/check-seo.mjs';
import {checkLlms} from '../scripts/check-llms.mjs';
import {checkCards} from '../scripts/og/check.mjs';
import {curateLlms} from '../scripts/curate-llms.mjs';
import {readFileSync, writeFileSync, mkdtempSync, cpSync, mkdirSync, rmSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const siteDir = fileURLToPath(new URL('../', import.meta.url));
const curated = require('../src/data/page-metadata.json');

function withBuildFixture(check) {
  const fixture = mkdtempSync(path.join(siteDir, 'node_modules/.seo-test-'));
  try {
    for (const {file} of htmlPages('build')) {
      mkdirSync(path.dirname(path.join(fixture, file)), {recursive: true});
      cpSync(path.join('build', file), path.join(fixture, file));
    }
    for (const file of ['llms.txt', 'llms-full.txt', 'page-metadata.json']) cpSync(path.join('build', file), path.join(fixture, file));
    cpSync('build/img/og', path.join(fixture, 'img/og'), {recursive: true});
    return check(fixture);
  } finally {
    rmSync(fixture, {recursive: true, force: true});
  }
}

test('every built HTML page has its own canonical, description, social metadata and assigned JSON-LD type', () => {
  for (const page of checkSeo('build')) {
    assert.equal(page.title, `${curated[page.route].title} | Package Broker`);
    assert.equal(page.description, curated[page.route].description);
  }
});

test('SEO gate rejects offers, ratings, reviews, forbidden schema and duplicate canonicals', () => {
  const {html} = htmlPages('build').find(page => page.route === '/');
  for (const key of ['offers', 'aggregateRating', 'review']) {
    const changed = html.replace('"@type":"SoftwareApplication"', `"@type":"SoftwareApplication","${key}":{}`);
    assert.notEqual(changed, html);
    assert.throws(() => inspectPage(changed, '/'), new RegExp(`omit ${key}`));
    const extra = html.replace('</head>', `<script type="application/ld+json">{"nested":{"${key}":{}}}</script></head>`);
    assert.throws(() => inspectPage(extra, '/'), new RegExp(`omit ${key}`));
  }
  assert.throws(() => inspectPage(html.replace('</head>', '<link rel="canonical" href="https://package.broker/"></head>'), '/'), /one canonical/);
  for (const type of ['FAQPage', 'HowTo']) {
    assert.throws(() => inspectPage(html.replace('</head>', `<script type="application/ld+json">{"@type":"${type}"}</script></head>`), '/'), new RegExp(`forbidden ${type}`));
  }
});

test('SEO gate rejects every unexpected type, including cross-page types and array types', () => {
  for (const route of ['/', '/docs/architecture', '/agencies']) {
    const {html} = htmlPages('build').find(page => page.route === route);
    const invalid = route === '/' ? ['WebPage', 'TechArticle'] : route.startsWith('/docs/') ? ['WebPage', 'Product'] : ['TechArticle', 'Product'];
    for (const type of invalid) for (const value of [type, ['Thing', type]]) {
      const changed = html.replace('</head>', `<script type="application/ld+json">{"@type":${JSON.stringify(value)}}</script></head>`);
      assert.throws(() => inspectPage(changed, route), /unexpected JSON-LD type set/);
    }
  }
});

test('LLM outputs list every non-stub doc and marketing page, and preserve the hand-written corrections', () => {
  checkLlms('build');
});

test('LLM gate rejects internal IDs in both files, raw summaries and banned product terms', () => {
  withBuildFixture(outDir => {
    for (const file of ['llms.txt', 'llms-full.txt']) {
      const dest = path.join(outDir, file);
      const original = readFileSync(dest, 'utf8');
      for (const id of ['T716', 'T741b', 'PB-12', 'G06-32', 'DOC1']) {
        writeFileSync(dest, `${original}\n${id}\n`);
        assert.throws(() => checkLlms(outDir), /internal task ID/);
      }
      writeFileSync(dest, `${original}\nt716 t741b pb-12 g06-32 doc1 t3.small\n`);
      checkLlms(outDir);
      writeFileSync(dest, original);
    }
    const dest = path.join(outDir, 'llms.txt');
    const original = readFileSync(dest, 'utf8');
    for (const term of ['org', 'deployed-account', 'upstream', 'mirror', 'powerful']) {
      writeFileSync(dest, `${original}\n${term}\n`);
      assert.throws(() => checkLlms(outDir), /banned product term/);
    }
    writeFileSync(dest, original.replace(curated['/docs/architecture'].description, 'An uncurated summary.'));
    assert.throws(() => checkLlms(outDir), /description must use curated metadata/);
    writeFileSync(dest, original.replace('[Architecture overview](https://package.broker/docs/architecture):', '[Raw title](https://package.broker/docs/architecture):'));
    assert.throws(() => checkLlms(outDir), /title must use curated metadata/);
  });
});

test('LLM post-processing replaces internal references while preserving corpus limitations', () => {
  withBuildFixture(outDir => {
    const dest = path.join(outDir, 'llms-full.txt');
    writeFileSync(dest, `${readFileSync(dest, 'utf8')}\nT716 preserves access checks. T741b adds no migration. PB-12, G06-32 and DOC1 are pending.\nt716 t741b pb-12 g06-32 doc1 t3.small\n`);
    curateLlms(outDir);
    checkLlms(outDir);
    const result = readFileSync(dest, 'utf8');
    assert.match(result, /preserves access checks/);
    assert.match(result, /adds no migration/);
    assert.match(result, /are pending/);
    assert.match(result, /t716 t741b pb-12 g06-32 doc1 t3\.small/);
  });
});

test('LLM gate validates prose links, fragments and the selected build metadata', () => {
  withBuildFixture(outDir => {
    const dest = path.join(outDir, 'llms.txt');
    const original = readFileSync(dest, 'utf8');
    for (const url of ['https://package.broker/missing', 'https://package.broker/#missing']) {
      writeFileSync(dest, `${original}\nSee [Architecture overview](${url}).\n`);
      assert.throws(() => checkLlms(outDir), /page that is not built|absent anchor/);
    }
    writeFileSync(dest, original);
    const snapshotPath = path.join(outDir, 'page-metadata.json');
    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    snapshot.pages['/docs/architecture'].planned = true;
    writeFileSync(snapshotPath, JSON.stringify(snapshot));
    assert.throws(() => checkLlms(outDir), /planned status/);
  });
});

test('metadata plugin reports missing descriptions and unmapped page routes during build', async () => {
  const plugin = require('../plugins/page-metadata.cjs');
  const actions = {setGlobalData() { throw new Error('Validation must fail before publishing metadata'); }};
  for (const description of [undefined, null, '']) {
    await assert.rejects(plugin({siteDir}).allContentLoaded({actions, allContent: {
      'docusaurus-plugin-content-docs': {default: {loadedVersions: [{docs: [{title: 'Untitled', description, permalink: '/docs/new', source: '@site/docs-content/new.md'}]}]}},
    }}), /70–160 character description.*\/docs\/new/);
  }
  await assert.rejects(plugin({siteDir}).allContentLoaded({actions, allContent: {
    'docusaurus-plugin-content-pages': {default: [{permalink: '/new-page'}]},
  }}), /Add page metadata for \/new-page/);
});

test('all social PNGs match their SVG and shared font hashes, dimensions and size', () => {
  assert.equal(checkCards('build', true).pending, 0);
});

test('social card gate rejects missing, stale, oversized and malformed PNGs', () => {
  withBuildFixture(outDir => {
    const folder = path.join(outDir, 'img/og');
    const [card] = JSON.parse(readFileSync(path.join(folder, 'render-list.json'), 'utf8'));
    const png = path.join(outDir, card.output.slice('static/'.length));
    const svg = path.join(outDir, card.source.slice('static/'.length));
    const font = path.join(folder, 'inter-latin-wght-normal.woff2');
    const originalPng = readFileSync(png);
    unlinkSync(png);
    assert.throws(() => checkCards(outDir), /Rasterise/);
    assert.throws(() => checkSeo(outDir), /Rasterise/);
    writeFileSync(png, originalPng);
    for (const file of [svg, font]) {
      const original = readFileSync(file);
      writeFileSync(file, Buffer.concat([original, Buffer.from('\n')]));
      assert.throws(() => checkCards(outDir), /stale PNG/);
      writeFileSync(file, original);
    }
    writeFileSync(png, Buffer.alloc(card.maxBytes + 1));
    assert.throws(() => checkCards(outDir), /exceeds 300 KB/);
    writeFileSync(png, Buffer.from('not a PNG'));
    assert.throws(() => checkCards(outDir), /differs from its recorded render/);
    const manifestPath = path.join(folder, 'rendered.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    delete manifest[card.output];
    writeFileSync(manifestPath, JSON.stringify(manifest));
    assert.throws(() => checkCards(outDir), /cover every card/);
  });
});
