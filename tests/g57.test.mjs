import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import path from 'node:path';
import {checkCorpusLinks, checkIndexVocabulary} from '../scripts/check-llms.mjs';
import {createRequire} from 'node:module';
import {rewriteDocLinks, rewriteCorpusLinks} from '../scripts/curate-llms.mjs';
import {htmlPages, inspectPage, schemaObjects} from '../scripts/check-seo.mjs';
const require = createRequire(import.meta.url);
const {factsBlock, llmsOptions} = require('../scripts/llms-options.cjs');
const entity = require('../src/data/entity.ts');
const {releaseStatus} = require('../src/data/landing.ts');
const comparison = require('../src/data/comparison.json');

const pages = {
  '/docs/start': {source: 'start.md', corpusTitle: 'Start'},
  '/docs/custom-slug': {source: 'guides/README.md', corpusTitle: 'Guide'},
};

test('relative Markdown links use doc routes, preserve fragments and send repository files to GitHub', () => {
  const input = '[start](../start.md#install) [guide](README.md) [license](../../LICENSE.md#terms) [policy](../../SECURITY.md) [license text](../../LICENSE)\n[ref]: ../start.md#token\n[external](https://example.com/README.md) [anchor](#local) [agencies](/agencies)\n```sh\n[x](../start.md)\n```';
  const result = rewriteDocLinks(input, 'guides/README.md', pages);
  assert.match(result, /https:\/\/package.broker\/docs\/start#install/);
  assert.match(result, /https:\/\/package.broker\/docs\/custom-slug/);
  assert.match(result, /https:\/\/github.com\/package-broker\/broker\/blob\/main\/LICENSE.md#terms/);
  assert.match(result, /https:\/\/github.com\/package-broker\/broker\/blob\/main\/LICENSE\)/);
  assert.match(result, /\[ref\]: https:\/\/package.broker\/docs\/start#token/);
  assert.match(result, /\[external\]\(https:\/\/example.com\/README.md\)/);
  assert.match(result, /\[anchor\]\(https:\/\/package.broker\/docs\/custom-slug#local\)/);
  assert.match(result, /\[agencies\]\(https:\/\/package.broker\/agencies\)/);
  assert.match(result, /```sh\n\[x\]\(\.\.\/start.md\)/);
  assert.equal(rewriteCorpusLinks('## Guide\n\n[start](../start.md#install)\n\n## Start\n\n[guide](guides/README.md)', pages), '## Guide\n\n[start](https://package.broker/docs/start#install)\n\n## Start\n\n[guide](https://package.broker/docs/custom-slug)');
});

test('Facts use shared entity, status and all three comparison fits and checked dates', () => {
  const facts = factsBlock();
  for (const value of [entity.definition, entity.runtimes, entity.licence.url, releaseStatus]) assert.ok(facts.includes(value));
  const alternatives = comparison.products.filter(product => product.fit);
  assert.equal(alternatives.length, 3);
  for (const {name, fit} of alternatives) for (const value of [name, fit.value, fit.sourceUrl, fit.lastVerified]) assert.ok(facts.includes(value));
  assert.ok(llmsOptions().ignoreFiles.includes('CONTRIBUTING-DOCS.md'));
});

test('docs display synced source dates, status and funnel links, with troubleshooting pointers only where intended', () => {
  const {pages: metadata, docRoutes} = JSON.parse(readFileSync('build/page-metadata.json', 'utf8'));
  const {files} = JSON.parse(readFileSync('docs-content/.sync.json', 'utf8'));
  const sitemap = readFileSync('build/sitemap.xml', 'utf8');
  for (const {html, route} of htmlPages('build')) {
    if (!docRoutes.includes(route)) {
      assert.ok(!html.includes('aria-label="Release status"'));
      continue;
    }
    const expected = files[metadata[route].source].lastCommitDate;
    assert.equal(metadata[route].dateModified, expected);
    assert.ok(html.includes(releaseStatus));
    assert.match(html, /href="\/#quickstart"[^>]*>Start the quickstart/);
    assert.match(html, /href="\/#status"[^>]*>Get notified/);
    assert.ok(html.includes(`dateTime="${expected}"`) || html.includes(`datetime="${expected}"`));
    assert.ok(html.includes(new Date(expected).toISOString().slice(0, 10)));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map(([, json]) => JSON.parse(json));
    assert.equal(schemaObjects(schemas).find(node => node['@type'] === 'TechArticle').dateModified, expected);
    assert.equal(html.includes('Running several client projects?'), route.startsWith('/docs/troubleshooting/'));
    if (route === '/docs/CONTRIBUTING-DOCS') {
      assert.match(html, /name="robots" content="noindex, follow"/);
      assert.ok(!sitemap.includes(`https://package.broker${route}`));
    } else {
      const entry = [...sitemap.matchAll(/<url>(.*?)<\/url>/g)].find(([, entry]) => entry.includes(`<loc>https://package.broker${route}</loc>`));
      assert.ok(entry, route);
      assert.ok(entry[1].includes(`<lastmod>${new Date(expected).toISOString()}</lastmod>`) || entry[1].includes(`<lastmod>${expected}</lastmod>`), route);
    }
  }
});

test('landing schema gate rejects missing licence and repository identity links', () => {
  const {html} = htmlPages('build').find(page => page.route === '/');
  for (const field of ['license', 'sameAs']) {
    const changed = html.replace(new RegExp(`"${field}":(?:"[^"]*"|\\[[^\\]]*\\]),?`), '');
    assert.notEqual(changed, html);
    assert.throws(() => inspectPage(changed, '/'));
  }
});

test('corpus links cover site routes and non-Markdown files in docs', () => {
  const input = '[collector](./otel-collector/config.yaml#pipeline) [docs](/docs/start#next) [site](/agencies)\n[ref]: ./otel-collector/processor.yaml';
  const output = rewriteDocLinks(input, 'guides/README.md', pages);
  assert.ok(output.includes('https://github.com/package-broker/broker/blob/main/docs/guides/otel-collector/config.yaml#pipeline'));
  assert.ok(output.includes('https://github.com/package-broker/broker/blob/main/docs/guides/otel-collector/processor.yaml'));
  assert.ok(output.includes('https://package.broker/docs/start#next'));
  assert.ok(output.includes('https://package.broker/agencies'));
  checkCorpusLinks(output);
  for (const target of ['./config.yaml', '../start.md', '/docs/start', '/agencies', '#section', '//example.com/path']) {
    for (const input of [`[link](${target})`, `[ref]: ${target}`]) assert.throws(() => checkCorpusLinks(input), /must be absolute/);
    checkCorpusLinks(`\`\`\`md\n[link](${target})\n\`\`\``);
  }
  const fenced = '~~~~md\n[link](./config.yaml)\n```\n[other](/agencies)\n~~~~';
  assert.equal(rewriteDocLinks(fenced, 'guides/README.md', pages), fenced);
  checkCorpusLinks(fenced);
});

test('only negated v1 free-tier claims are exempt from the vocabulary gate', () => {
  for (const line of [
    'The old free tier claim does not apply to 2.0.',
    'Claims about the predecessor’s Cloudflare free tier and template do not apply to 2.0.',
  ]) checkIndexVocabulary(line);
  for (const line of [
    'The Cloudflare free tier works.',
    'The free tier claim does not apply to 2.0. The software is free.',
    'The old free tier works.\nThe claim does not apply to 2.0.',
    'A powerful free tier claim does not apply to 2.0.',
  ]) assert.throws(() => checkIndexVocabulary(line), /banned product term/);
});

test('sync dates fail clearly when invalid and sitemap dates remain in memory', async () => {
  const {syncDates, createSyncMetadata} = require('../plugins/sync-dates.cjs');
  const site = mkdtempSync(path.resolve('node_modules/.g57-dates-'));
  try {
    mkdirSync(path.join(site, 'docs-content'));
    const manifest = path.join(site, 'docs-content/.sync.json');
    writeFileSync(manifest, JSON.stringify({files: {'start.md': {lastCommitDate: 'not a date'}}}));
    assert.throws(() => syncDates(site), /Invalid lastCommitDate for start\.md.*not a date/);
    await assert.rejects(require('../plugins/page-metadata.cjs')({siteDir: site}).allContentLoaded({allContent: {}, actions: {}}), /Invalid lastCommitDate for start\.md/);
    writeFileSync(manifest, JSON.stringify({files: {'start.md': {lastCommitDate: '2026-10-26T04:43:04Z'}, 'undated.md': {}}}));
    const dates = syncDates(site);
    const metadata = createSyncMetadata();
    metadata.setPages({'/docs/custom-slug': {dateModified: dates['start.md'].lastCommitDate}});
    const items = await metadata.sitemapItems({siteConfig: {generatedFilesDir: path.join(site, 'custom-generated')}, defaultCreateSitemapItems: async () => [
      {url: 'https://package.broker/docs/custom-slug'}, {url: 'https://package.broker/agencies'},
    ]});
    assert.equal(items[0].lastmod, dates['start.md'].lastCommitDate);
    assert.equal(items[1].lastmod, null);
    assert.equal(dates['undated.md'].lastCommitDate, undefined);
  } finally { rmSync(site, {recursive: true, force: true}); }
});

test('DocItem omits the Last updated line when metadata has no date', () => {
  const ts = require('typescript');
  const React = require('react');
  const {renderToStaticMarkup} = require('react-dom/server');
  let dateModified;
  const componentModule = {exports: {}};
  const code = ts.transpileModule(readFileSync('src/theme/DocItem/index.tsx', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText;
  const mockRequire = name => {
    if (name === '@theme-original/DocItem') return () => null;
    if (name === '@docusaurus/Link') return ({to, children}) => React.createElement('a', {href: to}, children);
    if (name === '@docusaurus/useGlobalData') return {usePluginData: () => ({pages: {'/docs/undated': {dateModified}}})};
    if (name === '@site/src/data/landing') return {releaseStatus};
    if (name === './styles.module.css') return {notice: 'notice'};
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(mockRequire, componentModule, componentModule.exports);
  const render = () => renderToStaticMarkup(React.createElement(componentModule.exports.default, {content: {metadata: {permalink: '/docs/undated'}}}));
  assert.doesNotMatch(render(), /Last updated|<time/);
  dateModified = '2026-10-26T04:43:04Z';
  assert.match(render(), /Last updated: <time dateTime="2026-10-26T04:43:04Z">2026-10-26/);
});
