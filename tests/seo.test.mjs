import test from 'node:test';
import assert from 'node:assert/strict';
import {checkSeo, inspectPage, htmlPages} from '../scripts/check-seo.mjs';
import {checkLlms} from '../scripts/check-llms.mjs';
import {checkCards} from '../scripts/og/check.mjs';

test('every built HTML page has its own canonical, description, social metadata and assigned JSON-LD type', () => {
  checkSeo('build');
});

test('SEO gate rejects offers, ratings, reviews, forbidden schema and duplicate canonicals', () => {
  const {html} = htmlPages('build').find(page => page.route === '/');
  for (const key of ['offers', 'aggregateRating', 'review']) {
    const changed = html.replace('"@type":"SoftwareApplication"', `"@type":"SoftwareApplication","${key}":{}`);
    assert.notEqual(changed, html);
    assert.throws(() => inspectPage(changed, '/'), new RegExp(`omit ${key}`));
  }
  assert.throws(() => inspectPage(html.replace('</head>', '<link rel="canonical" href="https://package.broker/"></head>'), '/'), /one canonical/);
  for (const type of ['FAQPage', 'HowTo']) {
    assert.throws(() => inspectPage(html.replace('</head>', `<script type="application/ld+json">{"@type":"${type}"}</script></head>`), '/'), new RegExp(`forbidden ${type}`));
  }
});

test('LLM outputs list every non-stub doc and marketing page, and preserve the hand-written corrections', () => {
  checkLlms('build');
});

test('social card sources embed Inter and all supplied PNGs have the required dimensions and size', () => {
  checkCards('build');
});
