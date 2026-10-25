const {plannedDocFiles} = require('../scripts/llms-options.cjs');
const overrides = require('../src/data/page-metadata.json');
const {generateCards} = require('../scripts/og/generate.cjs');

module.exports = function pageMetadata(context) {
  return {
    name: 'page-metadata',
    async allContentLoaded({allContent, actions}) {
      const pages = Object.fromEntries(Object.entries(overrides).filter(([route]) => !route.startsWith('/docs/')));
      const planned = new Set(plannedDocFiles(context.siteDir).map(file => `@site/docs-content/${file}`));
      const docs = allContent['docusaurus-plugin-content-docs']?.default?.loadedVersions?.flatMap(v => v.docs) ?? [];
      for (const doc of docs) {
        const route = doc.permalink.replace(/\/$/, '');
        pages[route] = {
          title: doc.title,
          description: doc.description,
          ...overrides[route],
          planned: planned.has(doc.source),
        };
      }
      for (const [route, page] of Object.entries(pages)) {
        if (!page.title || page.description.length < 70 || page.description.length > 160) {
          throw new Error(`Write a 70–160 character description and a title for ${route} in src/data/page-metadata.json.`);
        }
        page.image = `/img/og/${route === '/' ? 'landing' : route.slice(1).replace(/[^a-z0-9-]/gi, '-')}.png`;
      }
      actions.setGlobalData({pages});
      await generateCards(context.siteDir, pages);
    },
  };
};
