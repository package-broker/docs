import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
const quickstart = '/docs/getting-started/quickstart-cloudflare';

function legacyRef(runGit = git) {
  for (const ref of ['refs/heads/v1-archive', 'refs/remotes/origin/v1-archive']) {
    // Accept a local or fetched archive only; main changes during the switch.
    try {
      runGit('rev-parse', '--verify', ref);
      runGit('show', `${ref}:docs/intro.md`);
    } catch { continue; }
    return ref;
  }
  throw new Error('Cannot validate redirects: v1-archive is missing or does not contain v1 docs. Ask the owner to preserve the current v1 main as v1-archive, then fetch v1-archive.');
}

function frontmatter(content) {
  const block = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
  const value = key => block.match(new RegExp(`^${key}:\\s*['\"]?([^'\"\\r\\n]+?)['\"]?\\s*$`, 'm'))?.[1];
  return {id: value('id'), slug: value('slug')};
}

function inventory(ref) {
  const files = git('ls-tree', '-r', '--name-only', ref, 'docs', 'blog').split('\n');
  const docs = files.filter(file => /^docs\/.+\.mdx?$/.test(file)).map(file => {
    const meta = frontmatter(git('show', `${ref}:${file}`));
    const relative = file.slice('docs/'.length).replace(/\.mdx?$/, '');
    const id = meta.id ? path.posix.join(path.posix.dirname(relative), meta.id) : relative;
    const slug = meta.slug ?? relative.replace(/(?:^|\/)index$/, '');
    return {file, id, route: `/docs/${slug.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '')};
  });
  const sidebar = git('show', `${ref}:sidebars.ts`);
  const ids = new Set(docs.map(doc => doc.id));
  for (const [, id] of sidebar.matchAll(/^\s*(?:id:\s*)?['"]([^'"]+)['"],?\s*$/gm)) {
    assert.ok(ids.has(id), `Sidebar document ${id} must exist in ${ref}`);
  }
  const categories = [...sidebar.matchAll(/type:\s*['"]generated-index['"][\s\S]*?slug:\s*['"]([^'"]+)['"]/g)]
    .map(([, slug]) => `/docs/${slug.replace(/^\/+|\/+$/g, '')}`);
  const posts = files.filter(file => /^blog\/.+\.mdx?$/.test(file)).map(file => {
    const meta = frontmatter(git('show', `${ref}:${file}`));
    const name = path.posix.basename(file).replace(/\.mdx?$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return `/blog/${(meta.slug ?? name).replace(/^\/+|\/+$/g, '')}`;
  });
  return {docs, categories, posts};
}

function readMap() {
  const text = readFileSync(path.join(root, 'static/_redirects'), 'utf8');
  const kept = JSON.parse(readFileSync(new URL('./kept-paths.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(kept) && kept.every(route => typeof route === 'string' && /^\/(?!\/)/.test(route)), 'Kept paths must be site paths');
  assert.equal(new Set(kept).size, kept.length, 'Kept paths must be unique');
  const rules = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('#')).map(line => {
    const fields = line.trim().split(/\s+/);
    assert.equal(fields.length, 3, `Invalid rule: ${line}`);
    const [from, to, status] = fields;
    assert.equal(status, '301', `Permanent redirect required: ${line}`);
    assert.match(from, /^\//);
    assert.match(to, /^\/(?!\/)/, 'Targets must stay on this site');
    assert.notEqual(from, to, `Self redirect: ${line}`);
    return {from, to};
  });
  assert.equal(new Set(rules.map(rule => rule.from)).size, rules.length, 'Redirect sources must be unique');
  // This map needs only one dynamic rule. Reject unsupported patterns rather than
  // allowing an offline approximation to disagree with the edge router.
  for (const rule of rules) if (/[*:]/.test(rule.from)) {
    assert.deepEqual(rule, {from: '/blog/*', to: '/'});
  }
  const resolve = route => rules.find(rule => rule.from === route)
    ?? (route.startsWith('/blog/') ? rules.find(rule => rule.from === '/blog/*') : undefined);
  return {text, kept, rules, resolve};
}

const base = process.env.BASE_URL;
const ref = legacyRef();
const legacy = inventory(ref);
const map = readMap();
const routes = [...new Set([...legacy.docs.map(doc => doc.route), ...legacy.categories, ...legacy.posts, '/blog'])];
const cases = new Map();
for (const route of routes) {
  cases.set(route, map.kept.includes(route) ? {status: 200} : {status: 301, to: map.resolve(route)?.to});
}
for (const rule of map.rules) {
  if (!rule.from.includes('*')) cases.set(rule.from, {status: 301, to: rule.to});
}
cases.set('/blog/unknown-v1-post', {status: 301, to: '/'});

function built(route) {
  const relative = route.replace(/^\//, '');
  return [relative ? `${relative}.html` : 'index.html', path.posix.join(relative, 'index.html')]
    .some(file => existsSync(path.join(root, 'build', file)));
}

test('v1 file and sidebar inventory is fully covered without redirect chains', () => {
  assert.equal(legacy.docs.length, 31, `Expected the 31 v1 documents from ${ref}`);
  assert.equal(legacy.posts.length, 1);
  assert.equal(legacy.categories.length, 6);
  for (const route of routes) {
    assert.ok(map.kept.includes(route) || map.resolve(route), `Missing v1 URL: ${route}`);
    const slash = `${route}/`;
    const target = map.kept.includes(route) ? route : map.resolve(route)?.to;
    assert.equal(map.resolve(slash)?.to, target, `Trailing slash must redirect directly: ${slash}`);
  }
  for (const route of map.kept) {
    assert.ok(routes.includes(route), `Kept route is absent from v1: ${route}`);
    assert.equal(map.resolve(route), undefined, `Kept path must return 200: ${route}`);
    if (!base) assert.ok(built(route), `Missing kept page in build: ${route}`);
  }
  for (const route of [quickstart, '/docs/getting-started/quickstart-docker']) assert.ok(map.kept.includes(route));
  for (const {from, to} of map.rules) {
    if (!base) assert.ok(built(to), `Missing target in build for ${from}: ${to}`);
    assert.equal(map.resolve(to), undefined, `Redirect chain from ${from} through ${to}`);
  }
  if (!base) {
    assert.equal(readFileSync(path.join(root, 'build/_redirects'), 'utf8'), map.text, 'Build must use the current map');
    assert.ok(existsSync(path.join(root, 'build/404.html')), 'Workers needs the built 404 page');
  }
});

test('legacy ref lookup uses a local or fetched v1-archive only', () => {
  const tried = [];
  const selected = legacyRef((command, ...args) => {
    tried.push([command, ...args]);
    if (command === 'show' && args[0].startsWith('refs/heads/')) throw new Error('Not v1');
  });
  assert.equal(selected, 'refs/remotes/origin/v1-archive');
  assert.deepEqual(tried, [
    ['rev-parse', '--verify', 'refs/heads/v1-archive'],
    ['show', 'refs/heads/v1-archive:docs/intro.md'],
    ['rev-parse', '--verify', 'refs/remotes/origin/v1-archive'],
    ['show', 'refs/remotes/origin/v1-archive:docs/intro.md'],
  ]);
  assert.equal(legacyRef(() => {}), 'refs/heads/v1-archive');
  const missing = [];
  assert.throws(() => legacyRef((...args) => {
    missing.push(args);
    throw new Error('Missing ref');
  }), /v1-archive is missing.*Ask the owner.*fetch v1-archive/);
  assert.deepEqual(missing, [
    ['rev-parse', '--verify', 'refs/heads/v1-archive'],
    ['rev-parse', '--verify', 'refs/remotes/origin/v1-archive'],
  ]);
});

const canonicalRoutes = [...new Set(['/', ...map.kept, ...map.rules.map(rule => rule.to)])];
const canonicalUrl = route => `https://package.broker${route}`;
function checkCanonical(html, route) {
  const canonical = html.match(/<link\b(?=[^>]*\brel="canonical")(?=[^>]*\bhref="([^"]+)")[^>]*>/)?.[1];
  assert.equal(canonical, canonicalUrl(route), `${route}: canonical URL`);
}

test('Worker HTML handling, redirects and canonical URLs agree', () => {
  const config = JSON.parse(readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8'));
  assert.equal(config.assets.html_handling, 'drop-trailing-slash');
  assert.match(readFileSync(path.join(root, 'docusaurus.config.ts'), 'utf8'), /trailingSlash:\s*false/);
  for (const route of canonicalRoutes) {
    assert.ok(route === '/' || !route.endsWith('/'), `Target must omit trailing slash: ${route}`);
    if (!base) {
      const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
      checkCanonical(readFileSync(path.join(root, 'build', file), 'utf8'), route);
    }
  }
});

test('deployed v1 URLs return exact redirects and targets return 200', {skip: !base, timeout: 300_000}, async t => {
  const url = new URL(base);
  assert.ok(['https:', 'http:'].includes(url.protocol));
  assert.equal(url.pathname, '/', 'BASE_URL must be an origin');
  assert.equal(url.search + url.hash, '');
  const request = async (route, keepBody = false) => {
    // Retry only transient propagation/network failures, never wrong redirects.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch(new URL(route, url), {redirect: 'manual', signal: AbortSignal.timeout(15_000)});
        if (!keepBody || response.status >= 500) await response.body?.cancel();
        if (response.status >= 500 && attempt < 4) { await new Promise(resolve => setTimeout(resolve, 2000)); continue; }
        return response;
      } catch (error) {
        if (attempt === 4) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };
  for (const [route, expected] of cases) await t.test(route, async () => {
    const response = await request(route);
    assert.equal(response.status, expected.status, `${route}: status`);
    if (expected.status === 301) {
      assert.ok(expected.to, `Missing redirect for ${route}`);
      // Permit the two HTTP serializations of this exact same-origin target.
      // Do not normalize away an unexpected path, query, fragment or hostname.
      const location = response.headers.get('location');
      assert.ok(location, `${route}: missing Location`);
      assert.ok([expected.to, new URL(expected.to, url).href].includes(location), `${route}: exact Location ${expected.to}, received ${location}`);
      assert.equal((await request(expected.to)).status, 200, `${route}: target must return 200 after one hop`);
    } else {
      assert.equal(response.headers.get('location'), null, `${route}: kept page must not redirect`);
    }
  });
  for (const route of canonicalRoutes) {
    const response = await request(route, true);
    assert.equal(response.status, 200, `${route}: canonical target status`);
    checkCanonical(await response.text(), route);
    if (route !== '/') {
      const slash = await request(`${route}/`);
      assert.ok([301, 307, 308].includes(slash.status), `${route}/: slash normalization status`);
      assert.ok([route, new URL(route, url).href].includes(slash.headers.get('location')), `${route}/: normalize directly to canonical path`);
    }
  }
  for (const route of ['/', '/sitemap.xml']) assert.equal((await request(route)).status, 200, route);
  assert.equal((await request('/unknown-page-redirect-check')).status, 404, 'Unknown URLs use the 404 page');
});
