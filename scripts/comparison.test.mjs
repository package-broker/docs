import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {checkComparison} from './check-comparison.mjs';
import {productFacts, productRevision, evidenceDigests} from './comparison-product-facts.mjs';

const data = JSON.parse(readFileSync(new URL('../src/data/comparison.json', import.meta.url)));
const reviewDate = new Date('2026-10-26T12:00:00Z');
const clone = () => structuredClone(data);

test('comparison data has complete provenance and approved product claims', () => {
  assert.equal(checkComparison(data, reviewDate), 28);
});

test('every cell needs sourceUrl, lastVerified, verified and quote, including unknowns', () => {
  for (let row = 0; row < data.criteria.length; row++) for (let cell = 0; cell < 4; cell++) {
    for (const key of ['sourceUrl', 'lastVerified', 'verified', 'quote']) {
      const altered = clone();
      delete altered.criteria[row].cells[cell][key];
      assert.throws(() => checkComparison(altered, reviewDate), new RegExp(`missing ${key}`));
    }
  }
});

test('all Package Broker claims must match the independently reviewed allowlist', () => {
  for (let row = 0; row < data.criteria.length; row++) for (const key of ['value', 'sourceUrl', 'quote']) {
    const altered = clone();
    altered.criteria[row].cells[0][key] = key === 'sourceUrl' ? 'https://example.com/unsupported' : 'Unsupported product feature';
    assert.throws(() => checkComparison(altered, reviewDate), /sourced product allowlist/);
  }
  for (const fact of Object.values(productFacts)) {
    assert.ok(fact.evidence.length > 1);
    assert.ok(fact.evidence.every(path => /^[a-f0-9]{64}$/.test(evidenceDigests[path])));
  }
});

test('stale dates, bad URLs, long quotes, numeric prices and inconsistent ids fail', () => {
  for (const [key, value, expected] of [
    ['lastVerified', '2026-07-27', /older than 90/],
    ['lastVerified', '2026-10-28', /future/],
    ['lastVerified', '2026-02-30', /invalid lastVerified/],
    ['sourceUrl', 'http://example.com', /must match/],
    ['sourceUrl', 'https://', /Invalid URL/],
    ['quote', Array(26).fill('word').join(' '), /25 words/],
    ['criterionId', 'price', /criterion id/],
  ]) {
    const altered = clone(); altered.criteria[0].cells[1][key] = value;
    assert.throws(() => checkComparison(altered, reviewDate), expected);
  }
  const boundary = clone(); boundary.criteria[0].cells[1].lastVerified = '2026-07-28';
  assert.equal(checkComparison(boundary, reviewDate), 28);
  for (const key of ['planName', 'priceSourceUrl']) {
    const altered = clone(); delete altered.criteria.at(-1).cells[1][key];
    assert.throws(() => checkComparison(altered, reviewDate), /price needs/);
  }
  const price = clone(); price.criteria.at(-1).cells[1].value = 'EUR 1 per month';
  assert.throws(() => checkComparison(price, reviewDate), /numeric price/);
  const unsupportedPlan = clone(); unsupportedPlan.criteria.at(-1).cells[0].planName = 'Unlimited plan';
  assert.throws(() => checkComparison(unsupportedPlan, reviewDate), /sourced product allowlist/);
  const duplicate = clone(); duplicate.criteria[0].cells[1].productId = 'package-broker';
  assert.throws(() => checkComparison(duplicate, reviewDate), /missing or duplicate ids/);
});

test('recorded evidence matches the reviewed product commit', {skip: !process.env.BROKER_DIR}, () => {
  for (const [path, digest] of Object.entries(evidenceDigests)) {
    const content = execFileSync('git', ['-C', process.env.BROKER_DIR, 'show', `${productRevision}:${path}`]);
    assert.equal(createHash('sha256').update(content).digest('hex'), digest, path);
  }
});

// Exercise the actual React components; replace only the Docusaurus host shell.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const json = require('../src/data/comparison.json');
function loadComponent(relative) {
  const filename = fileURLToPath(new URL(relative, import.meta.url));
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText;
  const module = {exports: {}};
  const localRequire = createRequire(filename);
  const load = specifier => {
    if (specifier.endsWith('.module.css')) return {__esModule: true, default: {page: 'comparison-page'}};
    if (specifier === '@docusaurus/Link') return ({to, ...props}) => React.createElement('a', {...props, href: to});
    if (specifier === '@docusaurus/Head') return ({children}) => children;
    if (specifier === '../marketing/MarketingLayout') return {
      __esModule: true,
      default: ({children}) => React.createElement('main', null, children),
      PageSection: ({id, title, children}) => React.createElement('section', {id}, React.createElement('h2', null, title), children),
    };
    if (specifier === '../../data/landing') return {workersQuickstart: '/#quickstart', repository: 'https://example.com/test-repository'};
    if (specifier === './ComparisonTable' || specifier === '../compare/ComparisonTable') return loadComponent('../src/components/compare/ComparisonTable.tsx');
    return localRequire(specifier);
  };
  new Function('require', 'module', 'exports', code)(load, module, module.exports);
  return module.exports;
}

test('unknown cells never render stored claims; both views read the same data', () => {
  const {default: Table, CellValue} = loadComponent('../src/components/compare/ComparisonTable.tsx');
  const unknown = {...json.criteria[0].cells[1], verified: false, value: 'Unsupported secret claim'};
  const html = renderToStaticMarkup(React.createElement(CellValue, {cell: unknown, productName: 'Satis', criterion: 'Authentication'}));
  assert.match(html, /Unknown: not confirmed by the recorded source/); assert.doesNotMatch(html, /Unsupported secret claim/);
  const cell = json.criteria.find(row => row.id === 'self-host').cells[1];
  const original = cell.value;
  try {
    cell.value = 'Shared data edit';
    for (const props of [{}, {competitorId: 'satis'}]) {
      const output = renderToStaticMarkup(React.createElement(Table, props));
      assert.match(output, /Shared data edit/);
      assert.match(output, /scope="row"/);
      assert.match(output, /headers="[^"]+"/);
    }
  } finally {cell.value = original;}
});

test('each comparison has both fit cases, legal notice and a published migration destination', () => {
  const {default: Page} = loadComponent('../src/components/compare/ComparisonPage.tsx');
  for (const product of json.products.filter(item => item.id !== 'package-broker')) {
    const render = () => renderToStaticMarkup(React.createElement(Page, {productId: product.id}));
    const html = render();
    assert.match(html, /fits better/); assert.match(html, /trademarks/);
    // Shared site Head metadata is checked against built HTML in tests/seo.test.mjs.
    assert.match(html, /When Package Broker fits better/);
    assert.match(html, /one personal token/);
    assert.match(html, /freelancer/);
    assert.match(html, /Versions already installed through the broker/);
    assert.match(html, /No seat counting/);
    if (product.migration.published) assert.ok(html.includes(`href="${product.migration.href}"`));
    else {
      assert.ok(!html.includes(`href="${product.migration.href}"`));
      assert.match(html, /href="https:\/\/example.com\/test-repository\/discussions"/);
    }
  }
});

test('verified cells and fit cases require quotes and competitor sources', () => {
  for (let row = 0; row < data.criteria.length; row++) for (let cell = 0; cell < 4; cell++) {
    const altered = clone();
    Object.assign(altered.criteria[row].cells[cell], {verified: true, quote: '   '});
    assert.throws(() => checkComparison(altered, reviewDate), /non-empty quote/);
  }
  for (let index = 1; index < data.products.length; index++) {
    for (const [key, value, expected] of [
      ['verified', false, /fit must be verified/],
      ['quote', '  ', /non-empty quote/],
      ['sourceUrl', 'https://example.com/claim', /allowed competitor hostname/],
    ]) {
      const altered = clone(); altered.products[index].fit[key] = value;
      assert.throws(() => checkComparison(altered, reviewDate), expected);
    }
  }
  const wrongRepo = clone(); wrongRepo.products[1].fit.sourceUrl = 'https://github.com/someone/other';
  assert.throws(() => checkComparison(wrongRepo, reviewDate), /competitor repository/);
  for (const [key, value, expected] of [
    ['quote', '', /empty value/],
    ['quote', Array(26).fill('word').join(' '), /25 words/],
    ['sourceUrl', 'https://example.com/claim', /allowed competitor hostname/],
  ]) {
    const altered = clone();
    altered.criteria.find(row => row.id === 'isolation').cells[3].additionalSources[0][key] = value;
    assert.throws(() => checkComparison(altered, reviewDate), expected);
  }
});

test('documentation absence, internal citations and summary labels render explicitly', () => {
  const {default: Table, CellValue} = loadComponent('../src/components/compare/ComparisonTable.tsx');
  const npm = json.criteria.find(row => row.id === 'npm').cells.find(cell => cell.productId === 'private-packagist');
  const html = renderToStaticMarkup(React.createElement(CellValue, {cell: npm, productName: 'Private Packagist', criterion: 'npm'}));
  assert.match(html, /Not documented/);
  assert.match(html, /href="https:\/\/packagist.com\/docs"/);
  const isolation = json.criteria.find(row => row.id === 'isolation').cells[3];
  const access = renderToStaticMarkup(React.createElement(CellValue, {cell: isolation, productName: 'Packeton', criterion: 'Isolation'}));
  assert.match(access, /href="https:\/\/docs.packeton.org\/usage\/credential.html"/);
  const summary = renderToStaticMarkup(React.createElement(Table));
  assert.match(summary, /href="\/docs\/decisions\/secrets-and-tokens"/);
  assert.doesNotMatch(summary, /href="https:\/\/package.broker\/docs\//);
  assert.match(summary, /<strong>Authentication: <\/strong>/);
  assert.match(summary, /<strong>SSO: <\/strong>/);
  assert.doesNotMatch(summary, /class="pb-table__value pb-compare__cell"><span class="pb-table__value/);
  const invalid = clone(); invalid.criteria.find(row => row.id === 'npm').cells[2].verified = true;
  assert.throws(() => checkComparison(invalid, reviewDate), /non-empty quote|invalid documentation status/);
});
