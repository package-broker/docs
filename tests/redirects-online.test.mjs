import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('online redirect checks run without build output and reject an incorrect canonical', () => {
  const fixture = mkdtempSync(path.join(root, 'node_modules/.redirects-online-'));
  try {
    mkdirSync(path.join(fixture, 'tests'));
    for (const file of ['tests/redirects.test.mjs', 'tests/kept-paths.json', 'wrangler.jsonc', 'docusaurus.config.ts']) {
      cpSync(path.join(root, file), path.join(fixture, file));
    }
    cpSync(path.join(root, 'static'), path.join(fixture, 'static'), {recursive: true, filter: source =>
      source === path.join(root, 'static') || source.endsWith('_redirects')});
    const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {cwd: root, encoding: 'utf8'}).trim();
    writeFileSync(path.join(fixture, '.git'), `gitdir: ${gitDir}\n`);
    // Stub HTTP in memory: this verifies suite behavior, not Cloudflare routing.
    const mock = path.join(fixture, 'mock-http.mjs');
    writeFileSync(mock, `
import {readFileSync} from 'node:fs';
const rules = readFileSync(new URL('./static/_redirects', import.meta.url), 'utf8')
  .split('\\n').filter(line => line && !line.startsWith('#')).map(line => line.split(/\\s+/));
const kept = JSON.parse(readFileSync(new URL('./tests/kept-paths.json', import.meta.url)));
const targets = new Set(['/', '/sitemap.xml', ...kept, ...rules.map(rule => rule[1])]);
globalThis.fetch = async input => {
  const route = new URL(input).pathname;
  const rule = rules.find(([from]) => from === route) ?? (route.startsWith('/blog/') ? rules.find(([from]) => from === '/blog/*') : undefined);
  if (rule) return new Response(null, {status: 301, headers: {location: rule[1]}});
  if (route.endsWith('/') && targets.has(route.slice(0, -1))) return new Response(null, {status: 307, headers: {location: route.slice(0, -1)}});
  if (!targets.has(route)) return new Response('Missing', {status: 404});
  const canonical = process.env.WRONG_CANONICAL ? '/wrong' : route;
  return new Response('<link rel="canonical" href="https://package.broker' + canonical + '">', {status: 200});
};
`);
    assert.equal(existsSync(path.join(fixture, 'build')), false);
    for (const wrong of [false, true]) {
      const childEnv = {...process.env, BASE_URL: 'https://preview.example', WRONG_CANONICAL: wrong ? 'true' : ''};
      delete childEnv.NODE_TEST_CONTEXT;
      const child = spawnSync(process.execPath, ['--import', mock, '--test', 'tests/redirects.test.mjs'], {
        cwd: fixture, encoding: 'utf8', timeout: 30_000,
        env: childEnv,
      });
      assert.ifError(child.error);
      const output = child.stdout + child.stderr;
      if (wrong) {
        assert.notEqual(child.status, 0, output);
        assert.match(output, /canonical URL/);
      } else assert.equal(child.status, 0, output);
      assert.equal(existsSync(path.join(fixture, 'build')), false);
    }
  } finally {
    rmSync(fixture, {recursive: true, force: true});
  }
});
