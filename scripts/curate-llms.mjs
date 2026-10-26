import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const curated = require('../src/data/page-metadata.json');
const {llmsOptions} = require('./llms-options.cjs');
// Include suffixed task numbers and decision/document task identifiers, too.
export const internalIds = /\b(?:T\d+[a-z]*|PB-\d+|G0\d+(?:-\d+)*|DOC\d+)\b/;

export function curateLlms(outDir) {
  const {pages, docRoutes} = JSON.parse(readFileSync(path.join(outDir, 'page-metadata.json'), 'utf8'));
  const options = llmsOptions();
  const docs = docRoutes.filter(route => !pages[route].planned).sort().map(route => {
    const page = curated[route];
    assert.ok(page?.title && page?.description, `Add curated LLM metadata for ${route} in src/data/page-metadata.json`);
    return `- [${page.title}](https://package.broker${route}): ${page.description}`;
  });
  writeFileSync(path.join(outDir, 'llms.txt'), `# Package Broker\n\n> ${options.description}\n\n${options.rootContent}\n\n## Documentation\n\n${docs.join('\n')}\n`);
  // Preserve the corpus's instructions and limitations, replacing only internal
  // task references. Synced source files remain untouched.
  const fullPath = path.join(outDir, 'llms-full.txt');
  const full = readFileSync(fullPath, 'utf8');
  writeFileSync(fullPath, full.replace(new RegExp(internalIds.source, 'g'), 'the referenced change'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  curateLlms(process.argv[2] ?? 'build');
}
