const {readFileSync, readdirSync} = require('node:fs');
const path = require('node:path');
const {definition, runtimes, licence, repositoryUrl, organizationUrl, maintainer} = require('../src/data/entity.ts');
const {releaseStatus} = require('../src/data/landing.ts');
const comparison = require('../src/data/comparison.json');
const pages = require('../src/data/page-metadata.json');

const excludedDoc = '/docs/CONTRIBUTING-DOCS';
const costFacts = 'No licence fee and no per-user, per-project or per-client charge. You pay for hosting and operations, from USD 5 a month on Workers Paid plus usage, or your own Node host.';

function factsBlock() {
  const rows = comparison.products.filter(product => product.fit).map(product =>
    `| [${product.name}](${product.fit.sourceUrl}) | ${product.fit.value} | ${product.fit.lastVerified} |`);
  return `## Facts

- ${definition}
- Runtimes: ${runtimes}.
- Release status: ${releaseStatus}.
- Licence: [${licence.name}](${licence.url}).
- Repository: ${repositoryUrl}. Organization: ${organizationUrl}. Maintainer: [${maintainer.name}](${maintainer.url}).
- Costs: ${costFacts} See [Hosting and costs](https://package.broker/#cost) (checked 2026-10-26).

### Comparison summary

| Alternative | Fit | Checked |
| --- | --- | --- |
${rows.join('\n')}`;
}

function plannedDocFiles(siteDir = path.join(__dirname, '..')) {
  const docsDir = path.join(siteDir, 'docs-content');
  // A stub with a follow-up link is still planned content. The sidebar's
  // strict stub-only matcher deliberately has a narrower responsibility.
  return readdirSync(docsDir, {recursive: true}).filter(file => /\.mdx?$/.test(file) &&
    /^Coming in 2\.0\b/m.test(readFileSync(path.join(docsDir, file), 'utf8')));
}

function llmsOptions(siteDir = path.join(__dirname, '..')) {
  const ignoreFiles = [...plannedDocFiles(siteDir), 'CONTRIBUTING-DOCS.md'];
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
    description: definition,
    generateLLMsTxt: true,
    generateLLMsFullTxt: true,
    includeBlog: false,
    addMdExtension: false,
    excludeImports: true,
    rootContent: `${factsBlock()}\n\n${handWritten}\n\n## Website\n\n${marketing.join('\n')}`,
    fullRootContent: `${factsBlock()}\n\n${handWritten}`,
  };
}

module.exports = {llmsOptions, plannedDocFiles, factsBlock, excludedDoc, costFacts};
