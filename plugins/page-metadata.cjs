const {plannedDocFiles} = require('../scripts/llms-options.cjs');
const overrides = require('../src/data/page-metadata.json');
const {generateCards} = require('../scripts/og/generate.cjs');
const {writeFile} = require('node:fs/promises');
const path = require('node:path');
const {syncDates} = require('./sync-dates.cjs');

module.exports = function pageMetadata(context) {
  let snapshot;
  return {
    name: 'page-metadata',
    async allContentLoaded({allContent, actions}) {
      const pages = Object.fromEntries(Object.entries(overrides).filter(([route]) => !route.startsWith('/docs/')).map(([route, page]) => [route, {...page}]));
      const dates = syncDates(context.siteDir);
      const planned = new Set(plannedDocFiles(context.siteDir).map(file => `@site/docs-content/${file}`));
      const docs = Object.values(allContent['docusaurus-plugin-content-docs'] ?? {}).flatMap(content => content.loadedVersions.flatMap(v => v.docs));
      for (const doc of docs) {
        const route = doc.permalink.replace(/\/$/, '');
        pages[route] = {
          title: doc.title,
          description: doc.description,
          ...overrides[route],
          source: doc.source.replace('@site/docs-content/', ''),
          corpusTitle: doc.title,
          planned: planned.has(doc.source),
          noIndex: route === '/docs/CONTRIBUTING-DOCS',
          dateModified: dates[doc.source.replace('@site/docs-content/', '')]?.lastCommitDate,
        };
      }
      for (const content of Object.values(allContent['docusaurus-plugin-content-pages'] ?? {})) {
        for (const page of content ?? []) {
          const route = page.permalink.replace(/\/$/, '') || '/';
          if (!overrides[route]) throw new Error(`Add page metadata for ${route} in src/data/page-metadata.json.`);
          pages[route] = {...overrides[route]};
        }
      }
      for (const [route, page] of Object.entries(pages)) {
        if (!page.title || !page.description || page.description.length < 70 || page.description.length > 160) {
          throw new Error(`Write a 70–160 character description and a title for ${route} in src/data/page-metadata.json.`);
        }
        page.image = `/img/og/${route === '/' ? 'landing' : route.slice(1).replace(/[^a-z0-9-]/gi, '-')}.png`;
      }
      actions.setGlobalData({pages});
      snapshot = {pages, docRoutes: docs.map(doc => doc.permalink.replace(/\/$/, ''))};
      await generateCards(context.siteDir, pages);
    },
    async postBuild({outDir}) {
      // Keep verification tied to this build, including custom output directories.
      await writeFile(path.join(outDir, 'page-metadata.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
    },
  };
};
