const {readFileSync} = require('node:fs');
const path = require('node:path');

function syncDates(siteDir) {
  return JSON.parse(readFileSync(path.join(siteDir, 'docs-content/.sync.json'), 'utf8')).files;
}

async function sitemapItems({defaultCreateSitemapItems, ...args}) {
  const items = await defaultCreateSitemapItems(args);
  const {pages} = JSON.parse(readFileSync(path.join(__dirname, '../.docusaurus/globalData.json'), 'utf8'))['page-metadata'].default;
  return items.map(item => ({...item, lastmod: pages[new URL(item.url).pathname]?.dateModified ?? null}));
}

module.exports = {syncDates, sitemapItems};
