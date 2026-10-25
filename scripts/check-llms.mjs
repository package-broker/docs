import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {htmlPages, origin} from './check-seo.mjs';

const siteDir = fileURLToPath(new URL('../', import.meta.url));

export function checkLlms(outDir) {
  const index = readFileSync(path.join(outDir, 'llms.txt'), 'utf8');
  const full = readFileSync(path.join(outDir, 'llms-full.txt'), 'utf8');
  const handWritten = readFileSync(path.join(siteDir, 'content/llms-hand-written.md'), 'utf8').trim();
  assert.match(index, /^# Package Broker\n/);
  assert.match(index, /^> .+/m);
  assert.ok([...index.matchAll(/^## /gm)].length >= 3, 'Expected at least three LLM index sections');
  assert.ok(index.includes(handWritten), 'Index must include the complete hand-written block');
  assert.ok(full.includes(handWritten), 'Corpus must include the complete hand-written block');
  assert.ok(!full.includes('Coming in 2.0'), 'Stub content must not enter the corpus');
  const size = Buffer.byteLength(full);
  assert.ok(size > 0 && size <= 2 * 1024 * 1024, 'Split an LLM corpus over 2 MB by section');
  const links = [...index.matchAll(/^- \[[^\]]+\]\((https:\/\/package\.broker[^)]*)\): .+/gm)].map(([, url]) => url);
  const built = new Set(htmlPages(outDir).map(page => `${origin}${page.route}`));
  for (const url of links) assert.ok(built.has(url), `LLM index links a page that is not built: ${url}`);
  assert.equal(new Set(links).size, links.length, 'LLM index contains duplicate pages');
  // Use Docusaurus route metadata to cover slugs/README routes, independently
  // of the LLM plugin's filesystem-derived URLs.
  const globalData = JSON.parse(readFileSync(path.join(siteDir, '.docusaurus/globalData.json'), 'utf8'));
  const pages = globalData['docusaurus-plugin-content-docs'].default.versions.flatMap(version => version.docs);
  const seoPages = globalData['page-metadata'].default.pages;
  for (const doc of pages) {
    const route = doc.path.replace(/\/$/, '');
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
