import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {definition, runtimes, licence, repositoryUrl, organizationUrl, maintainer} = createRequire(import.meta.url)('../src/data/entity.ts');
import {checkCards} from './og/check.mjs';

export const origin = 'https://package.broker';
export const decode = text => text.replace(/&(?:#(x[0-9a-f]+|\d+)|amp|quot|apos|lt|gt);/gi, (entity, code) => code
  ? String.fromCodePoint(code.startsWith('x') ? parseInt(code.slice(1), 16) : Number(code))
  : ({'&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>'}[entity] ?? entity));

export function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, name, double, single]) => [name.toLowerCase(), decode(double ?? single)]));
}

export function htmlPages(outDir) {
  assert.ok(existsSync(path.join(outDir, 'index.html')), 'Build the site before checking SEO.');
  return readdirSync(outDir, {recursive: true}).filter(file => file.endsWith('.html')).sort().map(file => ({
    file,
    route: file === 'index.html' ? '/' : file === '404.html' ? '/404.html' : `/${file.replace(/(?:\/index)?\.html$/, '')}`,
    html: readFileSync(path.join(outDir, file), 'utf8'),
  }));
}

export function schemaObjects(value) {
  if (Array.isArray(value)) return value.flatMap(schemaObjects);
  if (value && typeof value === 'object') return [value, ...Object.values(value).flatMap(schemaObjects)];
  return [];
}

export function inspectPage(html, route) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head, `${route}: missing head`);
  const tags = [...head.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const canonicals = tags.filter(tag => tag.rel === 'canonical');
  assert.equal(canonicals.length, 1, `${route}: expected one canonical`);
  const canonical = `${origin}${route}`;
  assert.equal(canonicals[0].href, canonical, `${route}: canonical must be its own absolute URL`);
  const meta = key => {
    const found = tags.filter(tag => tag.name === key || tag.property === key);
    assert.equal(found.length, 1, `${route}: expected one ${key}`);
    assert.ok(found[0].content, `${route}: empty ${key}`);
    return found[0].content;
  };
  const description = meta('description');
  assert.ok(description.length >= 70 && description.length <= 160, `${route}: description length ${description.length}`);
  const title = decode(head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  assert.ok(title, `${route}: missing title`);
  assert.equal(meta('og:title'), title, `${route}: OG title differs`);
  assert.equal(meta('og:description'), description, `${route}: OG description differs`);
  assert.equal(meta('og:url'), canonical, `${route}: OG URL differs`);
  const image = meta('og:image');
  assert.ok(image.startsWith(`${origin}/img/og/`) && image.endsWith('.png'), `${route}: expected a local PNG social card`);
  assert.equal(meta('og:image:width'), '1200');
  assert.equal(meta('og:image:height'), '630');
  assert.equal(meta('twitter:card'), 'summary_large_image');
  assert.equal(meta('twitter:image'), image);
  const schemas = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => attributes(attrs).type === 'application/ld+json')
    .map(([, , json]) => JSON.parse(json));
  const objects = schemaObjects(schemas);
  const ofType = type => objects.filter(object => [object['@type']].flat().includes(type));
  for (const type of ['FAQPage', 'HowTo']) assert.equal(ofType(type).length, 0, `${route}: forbidden ${type}`);
  const expectedType = route === '/' ? 'SoftwareApplication' : route.startsWith('/docs/') ? 'TechArticle' : 'WebPage';
  assert.equal(ofType(expectedType).length, 1, `${route}: expected one ${expectedType}`);
  const expectedTypes = route === '/' ? ['Organization', 'Person', 'SoftwareApplication'] : route.startsWith('/docs/')
    ? ['BreadcrumbList', 'ListItem', 'TechArticle'] : ['WebPage'];
  const actualTypes = objects.flatMap(object => object['@type'] ?? []);
  assert.deepEqual([...new Set(actualTypes)].sort(), expectedTypes.sort(), `${route}: unexpected JSON-LD type set`);
  if (route === '/') {
    const app = ofType('SoftwareApplication')[0];
    for (const field of ['name', 'applicationCategory', 'operatingSystem']) assert.ok(app[field], `SoftwareApplication needs ${field}`);
    for (const object of objects) for (const field of ['offers', 'aggregateRating', 'review']) {
      assert.ok(!Object.hasOwn(object, field), `Landing page JSON-LD must omit ${field}`);
    }
    assert.equal(app.license, licence.url);
    assert.deepEqual(app.sameAs, [repositoryUrl]);
    assert.equal(app.description, definition);
    assert.equal(app.operatingSystem, runtimes);
    assert.deepEqual(app.author, {'@type': 'Person', ...maintainer});
    assert.deepEqual(ofType('Organization')[0].sameAs, [organizationUrl, repositoryUrl]);
    assert.equal(ofType('Organization').length, 1, 'Organization belongs on the landing page');
    assert.deepEqual(app.maintainer, {'@type': 'Person', ...maintainer}, 'SoftwareApplication names its maintainer');
  } else {
    assert.equal(ofType('Organization').length, 0, `${route}: Organization belongs only on /`);
    assert.equal(ofType('SoftwareApplication').length, 0, `${route}: SoftwareApplication belongs only on /`);
  }
  return {route, title, description, image};
}

export function excludedFromSitemap(route, html) {
  return ['/404', '/404.html', '/search'].includes(route) || /\/tags(?:\/|$)/.test(route) ||
    [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => {
      const attrs = attributes(tag);
      return attrs.name === 'robots' && /\bnoindex\b/.test(attrs.content);
    });
}

export function checkSeo(outDir) {
  checkCards(outDir, true);
  const pages = htmlPages(outDir);
  const metadata = pages.map(({html, route}) => inspectPage(html, route));
  assert.equal(new Set(metadata.map(page => page.description)).size, pages.length, 'Descriptions must be unique');
  const sitemap = readFileSync(path.join(outDir, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => decode(url));
  const expected = pages.filter(page => !excludedFromSitemap(page.route, page.html)).map(page => `${origin}${page.route}`);
  assert.deepEqual([...locations].sort(), expected.sort(), 'Sitemap must list every public HTML page exactly once');
  const robots = readFileSync(path.join(outDir, 'robots.txt'), 'utf8');
  assert.match(robots, /^User-agent: \*\s*\nAllow: \/\s*$/m);
  assert.match(robots, /^Sitemap: https:\/\/package\.broker\/sitemap\.xml$/m);
  assert.doesNotMatch(robots, /^Disallow:\s*\S|^User-agent:\s*(?!\*\s*$)\S/im);
  return metadata;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pages = checkSeo(process.argv[2] ?? 'build');
  console.log(`SEO gate passed: ${pages.length} HTML pages; canonicals, descriptions, social metadata, JSON-LD, robots and sitemap.`);
}
