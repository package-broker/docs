import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {htmlPages, origin} from './check-seo.mjs';
import {internalIds} from './curate-llms.mjs';

const siteDir = fileURLToPath(new URL('../', import.meta.url));

export function checkLlms(outDir) {
  const index = readFileSync(path.join(outDir, 'llms.txt'), 'utf8');
  const full = readFileSync(path.join(outDir, 'llms-full.txt'), 'utf8');
  for (const [name, text] of [['llms.txt', index], ['llms-full.txt', full]]) {
    assert.doesNotMatch(text, /\b(T|PB-|G0)\d+/i, `${name}: internal task ID`);
    assert.doesNotMatch(text, internalIds, `${name}: internal task ID`);
  }
  const prose = index.replace(/\]\([^)]+\)/g, ']');
  assert.doesNotMatch(prose, /\b(?:org|account|deployed-account|upstream|mirror|free|zero-ops|enterprise-ready|powerful|seamless)\b/i, 'LLM index contains a banned product term');
  const handWritten = readFileSync(path.join(siteDir, 'content/llms-hand-written.md'), 'utf8').trim();
  assert.match(index, /^# Package Broker\n/);
  assert.match(index, /^> .+/m);
  assert.ok([...index.matchAll(/^## /gm)].length >= 3, 'Expected at least three LLM index sections');
  assert.ok(index.includes(handWritten), 'Index must include the complete hand-written block');
  assert.ok(full.includes(handWritten), 'Corpus must include the complete hand-written block');
  assert.ok(!full.includes('Coming in 2.0'), 'Stub content must not enter the corpus');
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
  for (const route of docRoutes) {
    const planned = seoPages[route]?.planned;
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
