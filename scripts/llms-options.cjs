const {readFileSync, readdirSync} = require('node:fs');
const path = require('node:path');
const pages = require('../src/data/page-metadata.json');

function plannedDocFiles(siteDir = path.join(__dirname, '..')) {
  const docsDir = path.join(siteDir, 'docs-content');
  // A stub with a follow-up link is still planned content. The sidebar's
  // strict stub-only matcher deliberately has a narrower responsibility.
  return readdirSync(docsDir, {recursive: true}).filter(file => /\.mdx?$/.test(file) &&
    /^Coming in 2\.0\b/m.test(readFileSync(path.join(docsDir, file), 'utf8')));
}

function llmsOptions(siteDir = path.join(__dirname, '..')) {
  const ignoreFiles = plannedDocFiles(siteDir);
  const handWritten = readFileSync(path.join(siteDir, 'content/llms-hand-written.md'), 'utf8').trim();
  // The installed plugin reads Markdown, not React marketing pages. Build this
  // section from the same metadata used in their HTML instead of indexing TSX.
  const marketing = Object.entries(pages)
    .filter(([route]) => route === '/' || route === '/agencies' || route === '/security' || route.startsWith('/compare/'))
    .map(([route, page]) => `- [${page.title}](https://package.broker${route}): ${page.description}`);
  return {
    docsDir: [{path: 'docs-content', routeBasePath: 'docs', label: 'Documentation'}],
    ignoreFiles,
    title: 'Package Broker',
    description: 'Self-host private Composer and npm packages on Cloudflare Workers or Node with project grants and one token policy. Package Broker 2.0 is in development.',
    generateLLMsTxt: true,
    generateLLMsFullTxt: true,
    includeBlog: false,
    addMdExtension: false,
    excludeImports: true,
    rootContent: `${handWritten}\n\n## Website\n\n${marketing.join('\n')}`,
    fullRootContent: handWritten,
  };
}

module.exports = {llmsOptions, plannedDocFiles};
