import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {generateCards, wrapTitle, titleWidth, cardLayout, guardTitle} = require('../scripts/og/generate.cjs');
const tokens = require('../vendor/design-system/tokens.json');

test('social titles keep readable type and reject overflow instead of truncating', () => {
  for (const {title} of Object.values(require('../src/data/page-metadata.json'))) {
    const {titleSize, maxWidth} = cardLayout(tokens);
    const lines = wrapTitle(title, titleSize, maxWidth);
    assert.equal(lines.join(' '), title);
    assert.ok(lines.length <= 3);
    assert.ok(lines.every(line => titleWidth(line, titleSize) <= maxWidth));
  }
  for (const title of ['', 'W'.repeat(100), 'long title '.repeat(40)]) {
    assert.throws(() => wrapTitle(title), /title needs editing/);
  }
});

test('generation preserves metadata copy, section labels, logo geometry, XML and tokens deterministically', async () => {
  const site = mkdtempSync(path.join(tmpdir(), 'og-test-'));
  try {
    for (const file of [
      'vendor/design-system/tokens.json',
      'static/img/logo.svg',
      'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    ]) {
      mkdirSync(path.dirname(path.join(site, file)), {recursive: true});
      cpSync(file, path.join(site, file));
    }
    const pages = {
      '/': {title: 'Old metadata title', description: 'Home description', cardSupport: require('../src/data/page-metadata.json')['/'].cardSupport, image: '/img/og/landing.png'},
      '/docs/example': {title: 'Roles & scopes <guide>', description: 'A "quoted" description', image: '/img/og/docs-example.png', planned: true},
      '/compare/example': {title: 'Compare registries', description: 'Comparison description', cardSupport: 'Compare & review', image: '/img/og/compare-example.png'},
    };
    const folder = path.join(site, 'static/img/og');
    await generateCards(site, pages);
    const files = ['landing.svg', 'docs-example.svg', 'compare-example.svg', 'render-list.json'];
    const first = files.map(file => readFileSync(path.join(folder, file), 'utf8'));
    await generateCards(site, pages);
    assert.deepEqual(files.map(file => readFileSync(path.join(folder, file), 'utf8')), first);
    assert.match(first[0], /One token<\/tspan><tspan[^>]+>per developer\./);
    assert.match(first[0], /Client keys stay in the broker, not on laptops\./);
    assert.ok(first[0].includes(`data-role="headline" x="${cardLayout(tokens).margin}" y="${tokens.space['20'].$value.value * 2 + cardLayout(tokens, 'landing').titleSize}" font-size="${cardLayout(tokens, 'landing').titleSize}"`));
    assert.match(first[1], /Roles &amp; scopes &lt;guide&gt;/);
    assert.match(first[1], /A &quot;quoted&quot; description/);
    assert.match(first[1], /Documentation: Guides/);
    assert.match(first[2], /Compare &amp; review/);
    const palette = new Set(Object.values(tokens.color).flatMap(value => value.$value?.hex ?? []));
    for (const svg of first.slice(0, 3)) {
      assert.match(svg, /width="1200" height="630"/);
      assert.match(svg, /aria-hidden="true"/);
      assert.doesNotMatch(svg, /src:url\(https?:|href="https?:|base64,|style=/);
      for (const [, hex] of svg.matchAll(/(?:fill|stroke)="(#[a-f0-9]+)"/gi)) assert.ok(palette.has(hex), hex);
      assert.equal([...svg.matchAll(/data-role="support"/g)].length, 1);
      assert.match(svg, /circle cx="100" cy="110" r="6"/);
      const titleTag = svg.match(/data-role="headline"[^>]+/)[0];
      const supportTag = svg.match(/data-role="support"[^>]+/)[0];
      const value = (tag, key) => Number(tag.match(new RegExp(`${key}="([^"]+)"`))[1]);
      const lines = [...svg.matchAll(/<tspan[^>]+dy="([^"]+)"/g)];
      const lastBaseline = value(titleTag, 'y') + lines.reduce((sum, line) => sum + Number(line[1]), 0);
      assert.equal(value(supportTag, 'y') - value(supportTag, 'font-size') - lastBaseline, tokens.space['8'].$value.value);
      assert.ok(value(supportTag, 'y') < 630 - tokens.space['16'].$value.value);
      assert.match(svg, /src:url\(inter-latin-wght-normal\.woff2\)/);
    }
    const oversized = structuredClone(tokens);
    oversized.font.size['5xl'].$value.value *= 10;
    writeFileSync(path.join(site, 'vendor/design-system/tokens.json'), JSON.stringify(oversized));
    await assert.rejects(generateCards(site, {'/': pages['/']}), /title needs editing/);
  } finally {
    rmSync(site, {recursive: true, force: true});
  }
});

test('width estimates use the canvas and guard fixed landing lines', () => {
  const {titleSize, maxWidth} = cardLayout(tokens);
  assert.equal(titleWidth('aA—…', 1), 0.6 + 0.72 + 1 + 1);
  assert.equal(wrapTitle('Package Broker and Satis, compared', titleSize, maxWidth).length, 2);
  const landing = cardLayout(tokens, 'landing');
  assert.deepEqual(guardTitle(['One token', 'per developer.'], landing.titleSize, landing.maxWidth), ['One token', 'per developer.']);
  assert.throws(() => guardTitle(['W'.repeat(100)], landing.titleSize, landing.maxWidth), /title needs editing/);
});

test('documentation support follows the route section without adding claims', async () => {
  const site = mkdtempSync(path.join(tmpdir(), 'og-sections-'));
  try {
    for (const file of ['vendor/design-system/tokens.json', 'static/img/logo.svg', 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2']) {
      mkdirSync(path.dirname(path.join(site, file)), {recursive: true});
      cpSync(file, path.join(site, file));
    }
    const sections = {decisions: 'Decisions', reference: 'Reference', guides: 'Guides', 'getting-started': 'Getting started'};
    const pages = Object.fromEntries(Object.keys(sections).map(section => [`/docs/${section}`, {title: 'Example', description: 'Example description', image: `/img/og/${section}.png`}]));
    await generateCards(site, pages);
    for (const [section, label] of Object.entries(sections)) {
      assert.ok(readFileSync(path.join(site, `static/img/og/${section}.svg`), 'utf8').includes(`Documentation: ${label}`));
    }
  } finally {
    rmSync(site, {recursive: true, force: true});
  }
});
