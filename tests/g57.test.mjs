import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
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
  assert.match(result, /\[anchor\]\(#local\)/);
  assert.match(result, /\[agencies\]\(\/agencies\)/);
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
