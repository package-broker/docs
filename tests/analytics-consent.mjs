import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

export const storageKey = 'pb-analytics-consent';
const observedHosts = new Set();
export const fakeMeasurementId = 'G-TEST000000';
const googleHost = /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|googleadservices\.com)$/;

export async function loadPlaywright() {
  const candidates = [import.meta.url];
  if (process.env.PLAYWRIGHT_REQUIRE_FROM) candidates.push(pathToFileURL(process.env.PLAYWRIGHT_REQUIRE_FROM).href);
  for (const from of candidates) {
    try {
      return createRequire(from)('playwright');
    } catch {
      continue;
    }
  }
  return null;
}

const gtagStub = `(function () {
  var id = new URLSearchParams(document.currentScript.src.split('?')[1]).get('id');
  var consent = {ad_storage: 'denied', analytics_storage: 'denied'};
  var configured = false;
  function gcs() { return 'G1' + (consent.ad_storage === 'granted' ? 1 : 0) + (consent.analytics_storage === 'granted' ? 1 : 0); }
  function send(name, params) {
    if (window['ga-disable-' + id]) return;
    var query = new URLSearchParams({v: '2', tid: id, en: name, gcs: gcs()});
    Object.keys(params || {}).forEach(function (key) { query.set(key === 'page_location' ? 'dl' : key === 'page_referrer' ? 'dr' : key === 'page_title' ? 'dt' : 'ep.' + key, String(params[key])); });
    fetch('https://www.google-analytics.com/g/collect?' + query, {method: 'POST', mode: 'no-cors'}).catch(function () {});
  }
  function handle(entry) {
    var args = Array.prototype.slice.call(entry);
    if (args[0] === 'consent') Object.assign(consent, args[2]);
    else if (args[0] === 'config') configured = true;
    else if (args[0] === 'event' && configured) send(args[1], args[2]);
  }
  window.dataLayer.slice().forEach(handle);
  var push = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function (entry) { handle(entry); return push(entry); };
})();`;

async function newSession(ctx, viewport = {width: 1280, height: 900}, init = null) {
  const context = await ctx.browser.newContext({viewport, permissions: ['clipboard-read', 'clipboard-write']});
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const requests = [];
  const record = request => {
    const url = new URL(request.url());
    if (googleHost.test(url.hostname)) observedHosts.add(url.hostname);
    if (googleHost.test(url.hostname)) requests.push({url, method: request.method(), body: request.postData() ?? ''});
  };
  page.on('request', record);
  if (!ctx.live) {
    await context.route(url => googleHost.test(url.hostname), route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtag/js') {
        return route.fulfill({status: 200, contentType: 'application/javascript', body: gtagStub});
      }
      return route.fulfill({status: 204, body: ''});
    });
  }
  const collects = () => requests.filter(item => item.url.pathname.endsWith('/collect'));
  const params = item => new URLSearchParams(item.url.search + (item.body ? `&${item.body}` : ''));
  const events = name => collects().filter(item => params(item).get('en') === name);
  const open = async (path = '/') => {
    await page.goto(new URL(path, ctx.baseUrl).href, {waitUntil: 'load'});
  };
  return {context, page, requests, collects, params, events, open};
}

const banner = page => page.getByRole('region', {name: 'Analytics preferences'});
const stored = page => page.evaluate(key => window.localStorage.getItem(key), storageKey);
const analyticsCookies = page => page.evaluate(() => document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => n === '_ga' || n.startsWith('_ga_') || n === '_gid'));
const settle = page => page.waitForTimeout(1500);

export const checks = [
  {
    name: 'no stored choice: banner shows, no Google request, no analytics cookie, nothing stored',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/');
        await banner(s.page).waitFor();
        await settle(s.page);
        assert.deepEqual(s.requests.map(item => item.url.href), []);
        assert.deepEqual(await analyticsCookies(s.page), []);
        assert.equal(await stored(s.page), null);
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'accept and refuse have equal prominence and a normal keyboard order; Escape saves nothing',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/');
        const region = banner(s.page);
        await region.waitFor();
        const accept = region.getByRole('button', {name: 'Accept analytics'});
        const refuse = region.getByRole('button', {name: 'Refuse analytics'});
        const [a, r] = [await accept.boundingBox(), await refuse.boundingBox()];
        assert.equal(Math.round(a.width), Math.round(r.width));
        assert.equal(Math.round(a.height), Math.round(r.height));
        assert.equal(await accept.getAttribute('class'), await refuse.getAttribute('class'));
        await accept.focus();
        await s.page.keyboard.press('Tab');
        assert.equal(await s.page.evaluate(() => document.activeElement?.textContent), 'Refuse analytics');
        await s.page.keyboard.press('Escape');
        assert.equal(await region.isVisible(), true);
        assert.equal(await stored(s.page), null);
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'banner adds no layout shift and leaves the hero call to action reachable at 390 px',
    async run(ctx) {
      const measure = async choice => {
        const s = await newSession(ctx, {width: 390, height: 844}, `
          ${choice ? `window.localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(choice)});` : ''}
          window.__shift = 0;
          new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shift += entry.value; }).observe({type: 'layout-shift', buffered: true});
        `);
        try {
          await s.open('/');
          await settle(s.page);
          const shift = await s.page.evaluate(() => window.__shift);
          if (choice) return {shift};
          const region = banner(s.page);
          const box = await region.boundingBox();
          assert.ok(box.height <= 844 * 0.3, `banner height ${box.height} is at most 30% of the viewport`);
          assert.equal(await region.evaluate(element => getComputedStyle(element.parentElement).position), 'fixed');
          const cta = s.page.locator('.pb-hero .pb-btn--primary').first();
          await cta.evaluate(element => element.scrollIntoView({block: 'center'}));
          const reachable = await cta.evaluate(element => {
            const rect = element.getBoundingClientRect();
            const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
            return hit === element || element.contains(hit);
          });
          assert.equal(reachable, true, 'hero call to action receives the click once scrolled into view');
          return {shift};
        } finally { await s.context.close(); }
      };
      const withBanner = await measure(null);
      const withoutBanner = await measure('refused');
      assert.ok(withBanner.shift <= withoutBanner.shift + 0.001, `layout shift ${withBanner.shift} with the banner against ${withoutBanner.shift} without it`);
    },
  },
  {
    name: 'keyboard: Tab from page load reaches the banner before the header links',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/');
        await banner(s.page).waitFor();
        const order = [];
        for (let index = 0; index < 4; index += 1) {
          await s.page.keyboard.press('Tab');
          order.push(await s.page.evaluate(() => document.activeElement?.textContent?.trim()));
        }
        assert.ok(order.indexOf('Accept analytics') !== -1 && order.indexOf('Accept analytics') < 2, `tab order: ${order.join(' | ')}`);
        assert.ok(!order.slice(0, order.indexOf('Accept analytics')).some(label => /Package Broker|Docs|Security/.test(label ?? '')), 'no header link before the banner');
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'search page: neither dl, dt nor any parameter carries the query; page_type is search',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/');
        await banner(s.page).getByRole('button', {name: 'Accept analytics'}).click();
        await s.page.waitForTimeout(500);
        await s.open('/search?q=topsecretterm');
        await s.page.waitForTimeout(1500);
        const views = s.events('page_view');
        assert.ok(views.length >= 2, 'page views were sent');
        for (const item of s.collects()) assert.ok(!/topsecretterm/.test(decodeURIComponent(item.url.href + item.body)), 'query text appears nowhere');
        assert.equal(s.params(views.at(-1)).get('dt'), 'Search results');
        await s.page.evaluate(() => document.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); }));
        await s.page.locator('footer a[href="https://github.com/package-broker/broker"]').first().click();
        await s.page.waitForTimeout(500);
        const github = s.events('github_click').at(-1);
        assert.equal(s.params(github).get('ep.page_type'), 'search');
        assert.equal(s.params(github).get('dt'), 'Search results');
        assert.ok(!s.params(github).get('dl').includes('?'));
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'accept: the tag loads, the first collect request carries granted analytics storage and no query string',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/?private=secret#section');
        await banner(s.page).getByRole('button', {name: 'Accept analytics'}).click();
        await s.page.waitForResponse(response => response.url().includes('/collect'), {timeout: 10000}).catch(() => null);
        await s.page.waitForTimeout(500);
        assert.equal(await stored(s.page), 'accepted');
        assert.ok(s.requests.some(item => item.url.pathname === '/gtag/js'), 'gtag.js was requested');
        const first = s.collects()[0];
        assert.ok(first, 'a collect request was sent');
        const query = s.params(first);
        assert.equal(query.get('en'), 'page_view');
        assert.equal(query.get('gcs'), 'G101', 'analytics storage granted, advertising storage denied');
        assert.ok(!query.get('dl').includes('?') && !query.get('dl').includes('secret'), `page location carries no query string: ${query.get('dl')}`);
        for (const item of s.collects()) assert.ok(!/secret/.test(item.url.href + item.body), 'no query string content in any event');
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'accept: copy_command, github_click and search_zero_results fire with their parameters and no query text',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/');
        await banner(s.page).getByRole('button', {name: 'Accept analytics'}).click();
        await s.page.waitForTimeout(500);
        await s.page.evaluate(() => document.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); }));
        await s.page.getByRole('button', {name: 'Copy Workers commands'}).click();
        await s.page.locator('footer a[href="https://github.com/package-broker/broker"]').first().click();
        await s.page.waitForTimeout(500);
        const copy = s.events('copy_command');
        assert.equal(copy.length, 1);
        assert.equal(s.params(copy[0]).get('ep.block'), 'workers');
        assert.equal(s.params(copy[0]).get('ep.page_type'), 'landing');
        const github = s.events('github_click');
        assert.equal(github.length, 1);
        assert.equal(s.params(github[0]).get('ep.location'), 'footer');

        const query = 'zzqxnomatchzz';
        await s.open('/docs/architecture');
        await s.page.locator('.navbar__search-input').fill(query);
        await s.page.waitForFunction(() => document.querySelector('[class*="noResults"]'), null, {timeout: 10000});
        await s.page.waitForTimeout(2000);
        const zero = s.events('search_zero_results');
        assert.equal(zero.length, 1);
        assert.equal(s.params(zero[0]).get('ep.result_count'), '0');
        assert.equal(s.params(zero[0]).get('ep.page_type'), 'docs');
        for (const item of s.collects()) assert.ok(!item.url.href.includes(query) && !item.body.includes(query), 'the typed query never leaves the browser');
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'refuse: no tag, no Google request, choice stored as refused and kept on reload',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/');
        await banner(s.page).getByRole('button', {name: 'Refuse analytics'}).click();
        await settle(s.page);
        assert.equal(await stored(s.page), 'refused');
        await s.page.reload({waitUntil: 'load'});
        await settle(s.page);
        assert.equal(await banner(s.page).count(), 0);
        assert.deepEqual(s.requests.map(item => item.url.href), []);
        assert.deepEqual(await analyticsCookies(s.page), []);
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'withdraw on /privacy: the stored choice reads as refused and no further GA4 request is sent',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/');
        await banner(s.page).getByRole('button', {name: 'Accept analytics'}).click();
        await s.page.waitForTimeout(800);
        await s.page.locator('footer a', {hasText: 'Privacy'}).click();
        await s.page.waitForURL('**/privacy');
        const toggle = s.page.getByRole('switch', {name: 'Allow Google Analytics'});
        await toggle.waitFor();
        assert.equal(await toggle.getAttribute('aria-checked'), 'true');
        const before = s.requests.length;
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-checked'), 'false');
        assert.equal(await stored(s.page), 'refused');
        const afterWithdraw = s.requests.length;
        await s.page.evaluate(() => document.addEventListener('click', event => { if (event.target.closest('a[href^="https://github.com"]')) event.preventDefault(); }));
        await s.page.locator('a[href="https://github.com/lbajsarowicz"]').first().click();
        await s.page.locator('footer a', {hasText: 'Security'}).click();
        await s.page.waitForURL('**/security');
        await settle(s.page);
        assert.equal(s.requests.length, afterWithdraw, `no Google request after withdrawing (had ${before} before)`);
        assert.deepEqual(await analyticsCookies(s.page), []);
        await s.page.reload({waitUntil: 'load'});
        await settle(s.page);
        assert.equal(s.requests.length, afterWithdraw);
      } finally { await s.context.close(); }
    },
  },
  {
    name: 'privacy page: switch is keyboard operable and reports state',
    async run(ctx) {
      const s = await newSession(ctx);
      try {
        await s.open('/privacy');
        await banner(s.page).getByRole('button', {name: 'Refuse analytics'}).click();
        const toggle = s.page.getByRole('switch', {name: 'Allow Google Analytics'});
        await toggle.focus();
        await s.page.keyboard.press('Space');
        assert.equal(await toggle.getAttribute('aria-checked'), 'true');
        assert.equal(await stored(s.page), 'accepted');
        await s.page.keyboard.press('Enter');
        assert.equal(await toggle.getAttribute('aria-checked'), 'false');
        assert.equal(await stored(s.page), 'refused');
      } finally { await s.context.close(); }
    },
  },
];

if (checks.length && process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const live = process.argv.includes('--live');
  const baseUrl = process.argv.find(arg => /^https?:/.test(arg)) ?? process.env.ANALYTICS_TEST_URL;
  if (!baseUrl) { console.error('usage: node tests/analytics-consent.mjs <url> [--live]'); process.exit(2); }
  const playwright = await loadPlaywright();
  if (!playwright) { console.error('playwright is not resolvable; set PLAYWRIGHT_REQUIRE_FROM to a package.json that depends on it'); process.exit(2); }
  const browser = await playwright.chromium.launch();
  let failed = 0;
  for (const check of checks) {
    try { await check.run({browser, baseUrl, live}); console.log(`ok   ${check.name}`); }
    catch (error) { failed += 1; console.log(`FAIL ${check.name}\n     ${error.message.split('\n')[0]}`); }
  }
  await browser.close();
  if (live) console.log(`Google hosts observed: ${[...observedHosts].sort().join(', ') || 'none'}`);
  process.exit(failed ? 1 : 0);
}
