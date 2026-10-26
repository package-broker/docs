import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const curated = require('../src/data/page-metadata.json');
const {llmsOptions, excludedDoc} = require('./llms-options.cjs');
// Include suffixed task numbers and decision/document task identifiers, too.
export const internalIds = /\b(?:T\d+[a-z]*|PB-\d+|G0\d+(?:-\d+)*|DOC\d+)\b/;

export function rewriteDocLinks(text, source, pages) {
  const rewrite = target => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) return target;
    const match = target.match(/^([^?#]+)([?#].*)?$/);
    if (!match || (match[1].startsWith('/') && !/\.mdx?$/i.test(match[1]))) return target;
    const file = match[1].startsWith('/') ? match[1].slice(1)
      : path.posix.normalize(path.posix.join('docs', path.posix.dirname(source), match[1]));
    if (file.startsWith('docs/') && !/\.mdx?$/i.test(match[1])) return target;
    const suffix = match[2] ?? '';
    const entry = Object.entries(pages).find(([, page]) => `docs/${page.source}` === file);
    return entry ? `https://package.broker${entry[0]}${suffix}`
      : `https://github.com/package-broker/broker/blob/main/${file}${suffix}`;
  };
  let fenced = false;
  return text.split('\n').map(line => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) return line;
    return line.replace(/(\]\(<?)([^\s)>]+)(>?)(?=[\s)])/g, (_, open, target, close) => `${open}${rewrite(target)}${close}`)
      .replace(/^(\s*\[[^\]]+\]:\s*<?)([^\s>]+)/, (_, open, target) => `${open}${rewrite(target)}`);
  }).join('\n');
}

export function rewriteCorpusLinks(full, pages) {
  return full.replace(/(^## ([^\n]+)\n)([\s\S]*?)(?=^## |$(?![\s\S]))/gm, (section, heading, title, body) => {
    const page = Object.values(pages).find(page => page.source && page.corpusTitle === title);
    return page ? heading + rewriteDocLinks(body, page.source, pages) : section;
  });
}

export function curateLlms(outDir) {
  const {pages, docRoutes} = JSON.parse(readFileSync(path.join(outDir, 'page-metadata.json'), 'utf8'));
  const options = llmsOptions();
  const docs = docRoutes.filter(route => !pages[route].planned && route !== excludedDoc).sort().map(route => {
    const page = curated[route];
    assert.ok(page?.title && page?.description, `Add curated LLM metadata for ${route} in src/data/page-metadata.json`);
    return `- [${page.title}](https://package.broker${route}): ${page.description}`;
  });
  writeFileSync(path.join(outDir, 'llms.txt'), `# Package Broker\n\n> ${options.description}\n\n${options.rootContent}\n\n## Documentation\n\n${docs.join('\n')}\n`);
  const fullPath = path.join(outDir, 'llms-full.txt');
  const full = readFileSync(fullPath, 'utf8');
  writeFileSync(fullPath, rewriteCorpusLinks(full, pages).replace(new RegExp(internalIds.source, 'g'), 'the referenced change'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  curateLlms(process.argv[2] ?? 'build');
}
