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

export function mapProseLines(text, transform) {
  let fence;
  return text.split('\n').map(line => {
    const marker = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      return line;
    }
    if (marker) {
      fence = marker[1];
      return line;
    }
    return transform(line);
  }).join('\n');
}

export function rewriteDocLinks(text, source, pages) {
  const rewrite = target => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return target;
    if (target.startsWith('//')) return `https:${target}`;
    if (target.startsWith('#')) {
      const entry = Object.entries(pages).find(([, page]) => page.source === source);
      assert.ok(entry, `Missing route for ${source}`);
      return `https://package.broker${entry[0]}${target}`;
    }
    const [, pathname, suffix = ''] = target.match(/^([^?#]+)([?#].*)?$/) ?? [];
    if (!pathname) return target;
    const file = pathname.startsWith('/') ? pathname.slice(1)
      : path.posix.normalize(path.posix.join('docs', path.posix.dirname(source), pathname));
    const entry = Object.entries(pages).find(([, page]) => `docs/${page.source}` === file);
    if (entry) return `https://package.broker${entry[0]}${suffix}`;
    if (pathname.startsWith('/')) return `https://package.broker${target}`;
    return `https://github.com/package-broker/broker/blob/main/${file}${suffix}`;
  };
  return mapProseLines(text, line => line
    .replace(/(\]\(<?)([^\s)>]+)(>?)(?=[\s)])/g, (_, open, target, close) => `${open}${rewrite(target)}${close}`)
    .replace(/^(\s*\[[^\]]+\]:\s*<?)([^\s>]+)/, (_, open, target) => `${open}${rewrite(target)}`));
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
