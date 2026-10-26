const {readFileSync} = require('node:fs');
const path = require('node:path');

function syncDates(siteDir) {
  const manifest = path.join(siteDir, 'docs-content/.sync.json');
  const {files} = JSON.parse(readFileSync(manifest, 'utf8'));
  for (const [file, entry] of Object.entries(files)) {
    const date = entry?.lastCommitDate;
    if (date != null && (typeof date !== 'string' || !Number.isFinite(Date.parse(date)))) {
      throw new Error(`Invalid lastCommitDate for ${file} in ${manifest}: ${JSON.stringify(date)}. Supply a valid ISO timestamp or omit the date.`);
    }
  }
  return files;
}

function createSyncMetadata() {
  let dates;
  return {
    setPages(pages) {
      dates = new Map(Object.entries(pages).map(([route, page]) => [route, page.dateModified]));
    },
    async sitemapItems({defaultCreateSitemapItems, ...args}) {
      if (!dates) throw new Error('Load page metadata before generating the sitemap.');
      const items = await defaultCreateSitemapItems(args);
      return items.map(item => ({...item, lastmod: dates.get(new URL(item.url).pathname) ?? null}));
    },
  };
}

module.exports = {syncDates, createSyncMetadata};
