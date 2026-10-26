import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {htmlPages, origin} from './check-seo.mjs';
import {createRequire} from 'node:module';
import {internalIds} from './curate-llms.mjs';

const {factsBlock, excludedDoc} = createRequire(import.meta.url)('./llms-options.cjs');

const siteDir = fileURLToPath(new URL('../', import.meta.url));

export function checkLlms(outDir) {
  const index = readFileSync(path.join(outDir, 'llms.txt'), 'utf8');
  const full = readFileSync(path.join(outDir, 'llms-full.txt'), 'utf8');
  for (const [name, text] of [['llms.txt', index], ['llms-full.txt', full]]) {
    assert.ok(text.includes(factsBlock()), `${name}: generated Facts must match source data`);
    assert.ok(text.indexOf('## Facts') < text.indexOf('## Common misconceptions'), `${name}: Facts must come first`);
    assert.ok(!text.includes(excludedDoc), `${name}: contributor instructions must be excluded`);
    assert.doesNotMatch(text, /\b(T|PB-|G0)\d+/, `${name}: internal task ID`);
    assert.doesNotMatch(text, internalIds, `${name}: internal task ID`);
  }
  const prose = index.replace('Cloudflare free tier, Kubernetes, one-click template and `npx package-broker init` claims do not apply to 2.0.', 'v1 deployment claims do not apply to 2.0.').replace(/\]\([^)]+\)/g, ']');
  assert.doesNotMatch(prose, /\b(?:org|account|deployed-account|upstream|mirror|free|zero-ops|enterprise-ready|powerful|seamless)\b/i, 'LLM index contains a banned product term');
  const handWritten = readFileSync(path.join(siteDir, 'content/llms-hand-written.md'), 'utf8').trim();
  assert.match(index, /^# Package Broker\n/);
  assert.match(index, /^> .+/m);
  assert.ok([...index.matchAll(/^## /gm)].length >= 3, 'Expected at least three LLM index sections');
  assert.ok(index.includes(handWritten), 'Index must include the complete hand-written block');
  assert.ok(full.includes(handWritten), 'Corpus must include the complete hand-written block');
  assert.doesNotMatch(index, /\[deployment\]/, 'Deployment link must be inline');
  assert.ok(!full.includes('Coming in 2.0'), 'Stub content must not enter the corpus');
  const proseCorpus = full.replace(/^\s*(```|~~~)[\s\S]*?^\s*\1.*$/gm, '');
  assert.doesNotMatch(proseCorpus, /\]\(<?(?![a-z][a-z0-9+.-]*:)[^\s)]*\.mdx?(?:[?#][^)]*)?>?\)/i, 'Corpus Markdown links must be absolute');
  assert.doesNotMatch(proseCorpus, /^\s*\[[^\]]+\]:\s*<?(?![a-z][a-z0-9+.-]*:)[^\s>]*\.mdx?(?:[?#][^\s>]*)?/im, 'Corpus reference links must be absolute');
  const size = Buffer.byteLength(full);
  assert.ok(size > 0 && size <= 2 * 1024 * 1024, 'Split an LLM corpus over 2 MB by section');
  const entries = [...index.matchAll(/^- \[([^\]]+)\]\((https:\/\/package\.broker[^)]*)\): (.+)$/gm)];
  const links = entries.map(([, , url]) => url);
  const metadata = JSON.parse(readFileSync(path.join(siteDir, 'src/data/page-metadata.json'), 'utf8'));
  for (const [, title, url, description] of entries) {
    const page = metadata[new URL(url).pathname];
    assert.ok(page, `Missing curated metadata: ${url}`);
    assert.equal(title, page.title, `${url}: LLM title must use curated metadata`);
    assert.equal(description, page.description, `${url}: LLM description must use curated metadata`);
  }
  const built = new Set(htmlPages(outDir).map(page => `${origin}${page.route}`));
  for (const [url] of index.matchAll(/https:\/\/package\.broker(?:[/?#][^\s)<>]*)?/g)) {
    const target = new URL(url);
    assert.ok(built.has(`${target.origin}${target.pathname}`), `LLM index links a page that is not built: ${url}`);
    if (target.hash) {
      const page = htmlPages(outDir).find(page => page.route === target.pathname);
      assert.ok(page.html.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `LLM index links an absent anchor: ${url}`);
    }
  }
  assert.equal(new Set(links).size, links.length, 'LLM index contains duplicate pages');
  // Use Docusaurus route metadata to cover slugs/README routes, independently
  // of the LLM plugin's filesystem-derived URLs.
  const {pages: seoPages, docRoutes} = JSON.parse(readFileSync(path.join(outDir, 'page-metadata.json'), 'utf8'));
  assert.ok(!full.split('\n').includes(`## ${seoPages[excludedDoc].corpusTitle}`), 'Contributor instructions must not enter the corpus');
  for (const route of docRoutes) {
    const planned = seoPages[route]?.planned || route === excludedDoc;
    assert.equal(links.includes(`${origin}${route}`), !planned, `LLM listing disagrees with planned status: ${route}`);
  }
  for (const route of ['/', '/agencies', '/security', '/compare/satis', '/compare/private-packagist', '/compare/packeton']) {
    assert.ok(links.includes(`${origin}${route}`), `Missing marketing page: ${route}`);
  }
  for (const route of ['/search', '/404.html']) assert.ok(!links.includes(`${origin}${route}`));
  return {size, pages: links.length};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkLlms(process.argv[2] ?? 'build');
  console.log(`LLM gate passed: ${result.pages} linked pages; corpus ${result.size} bytes.`);
}
