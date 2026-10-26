import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checks, loadPlaywright, storageKey} from './analytics-consent.mjs';

const siteDir = fileURLToPath(new URL('../', import.meta.url));
const playwright = await loadPlaywright();
const activeUrl = process.env.ANALYTICS_TEST_URL;

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const file = path.join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

function builtWithMeasurementId() {
  return walk(path.join(siteDir, 'build/assets/js')).some(file => file.endsWith('.js') && /ga4MeasurementId["']?\s*:\s*["']G-/.test(readFileSync(file, 'utf8')));
}

function serve(root) {
  const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml'};
  const server = createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const candidates = [url.pathname, `${url.pathname}.html`, path.join(url.pathname, 'index.html')].map(item => path.join(root, item));
    const file = candidates.find(item => item.startsWith(root) && existsSync(item) && statSync(item).isFile());
    if (!file) { response.writeHead(404).end('not found'); return; }
    response.writeHead(200, {'content-type': types[path.extname(file)] ?? 'application/octet-stream'}).end(readFileSync(file));
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

test('CSP in static/_headers lists the Google Analytics hosts and nothing else third-party', () => {
  const csp = readFileSync(path.join(siteDir, 'static/_headers'), 'utf8').split('\n').find(line => line.includes('Content-Security-Policy'));
  const directive = name => csp.split(';').map(item => item.trim()).find(item => item.startsWith(`${name} `));
  assert.match(directive('script-src'), /https:\/\/www\.googletagmanager\.com/);
  assert.match(directive('connect-src'), /https:\/\/\*\.google-analytics\.com/);
  const hosts = csp.match(/https:\/\/[^\s;]+/g);
  assert.deepEqual([...new Set(hosts)].sort(), [
    'https://*.analytics.google.com', 'https://*.google-analytics.com', 'https://*.googletagmanager.com',
    'https://www.google-analytics.com', 'https://www.googletagmanager.com',
  ]);
});

test('the footer links to /privacy', () => {
  const html = readFileSync(path.join(siteDir, 'build/index.html'), 'utf8');
  assert.match(html, /<a[^>]+href="\/privacy"[^>]*>Privacy<\/a>/);
});

test('without GA4_MEASUREMENT_ID the build is inert: no banner, no Google request, no stored choice, /privacy says so', {skip: !playwright ? 'playwright is not resolvable' : !existsSync(path.join(siteDir, 'build')) ? 'no build/' : builtWithMeasurementId() ? 'build/ was made with a measurement ID' : false}, async () => {
  const server = await serve(path.join(siteDir, 'build'));
  const browser = await playwright.chromium.launch();
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await browser.newPage();
    const external = [];
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    await page.goto(`${base}/`, {waitUntil: 'load'});
    await page.waitForTimeout(1000);
    assert.equal(await page.getByRole('region', {name: 'Analytics preferences'}).count(), 0);
    assert.equal(await page.evaluate(key => window.localStorage.getItem(key), storageKey), null);
    await page.goto(`${base}/privacy`, {waitUntil: 'load'});
    await page.getByText('Analytics is not active on this site').waitFor();
    assert.equal(await page.getByRole('switch').count(), 0);
    assert.deepEqual(external, []);
  } finally {
    await browser.close();
    server.close();
  }
});

for (const check of checks) {
  test(`consent: ${check.name}`, {skip: !playwright ? 'playwright is not resolvable' : !activeUrl ? 'set ANALYTICS_TEST_URL to a build made with GA4_MEASUREMENT_ID=G-TEST000000' : false}, async () => {
    const browser = await playwright.chromium.launch();
    try {
      await check.run({browser, baseUrl: activeUrl, live: false});
    } finally {
      await browser.close();
    }
  });
}
