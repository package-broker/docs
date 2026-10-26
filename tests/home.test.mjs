import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('../build/index.html', import.meta.url), 'utf8');
const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
const text = main.replace(/<[^>]*>/g, '').replace(/<!--.*?-->/g, '');

test('home preserves the headline and adds a single product definition and runtime sentence', () => {
  const headline = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.equal(headline.replace(/<[^>]*>/g, ''), 'One token per developer. Client keys stay in the broker, not on laptops.');
  assert.equal((headline.match(/<span\b/g) ?? []).length, 3);
  assert.equal((text.match(/Package Broker is a self-hosted, open-source/g) ?? []).length, 1);
  assert.equal((text.match(/It runs on Cloudflare Workers or your own Node host with Docker\./g) ?? []).length, 1);
  assert.doesNotMatch(text, /Docker \/ Node|Watch releases|Watch the repository/);
});

test('one release disclosure contains both notification routes without requiring JavaScript', () => {
  const disclosures = [...main.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)];
  assert.equal(disclosures.length, 1);
  assert.match(main, /<details id="get-notified">/);
  for (const [, body] of disclosures) {
    assert.match(body, /<summary>Get notified of the first release<\/summary>/);
    assert.equal((body.match(/<li>/g) ?? []).length, 3);
    for (const label of ['Watch', 'Custom', 'Releases']) assert.ok(body.includes(`<strong>${label}</strong>`));
    assert.match(body, /href="https:\/\/github.com\/package-broker\/broker"/);
    assert.match(body, /href="https:\/\/github.com\/package-broker\/broker\/releases.atom"/);
  }
  assert.match(main, /href="#quickstart"[^>]*>Start the quickstart/);
});

test('status exposes release work, progress and the four help routes', () => {
  const status = main.match(/<section\b[^>]*id="status"[\s\S]*?<\/section>/)[0];
  assert.match(status, /href="#get-notified"[^>]*>Get notified of the first release/);
  assert.doesNotMatch(status, /<details/);
  for (const phrase of ['v2.0.0-rc.1', 'still needs to be recorded', 'container image publishing is planned']) assert.ok(status.includes(phrase));
  for (const href of ['https://github.com/package-broker/broker/pulls', 'https://github.com/package-broker/broker/commits/main', 'https://github.com/package-broker/broker/issues', 'https://github.com/package-broker/broker/discussions', 'mailto:hi@package.broker', '/security']) assert.ok(status.includes(`href="${href}"`));
  assert.match(main, /href="\/docs\/guides\/mirror-vendor-repositories"[^>]*>Marketplace keys per client project/);
});

test('each quickstart panel lists prerequisites before its commands and links the detailed checklist', () => {
  for (const runtime of ['workers', 'docker']) {
    const panel = main.split(`id="panel-${runtime}"`)[1].split('<pre')[0];
    assert.match(panel, /Before you start:/);
    assert.match(panel, /#what-you-need/);
    const checklist = panel.match(/<ul>([\s\S]*?)<\/ul>/)[1];
    assert.equal((checklist.match(/<li>/g) ?? []).length, runtime === 'workers' ? 4 : 3);
    assert.doesNotMatch(panel, /pnpm \d|workers\.dev/);
    if (runtime === 'workers') assert.equal((panel.match(/Workers Paid/g) ?? []).length, 1);
    for (const phrase of ['Git', 'Node 24', 'pnpm', 'Composer 2', 'vendor credentials']) assert.ok(panel.includes(phrase));
    const extra = runtime === 'workers' ? ['Workers Paid', 'Queues', 'R2', 'Analytics Engine', 'an account Workers subdomain registered in the dashboard', 'Workers Scripts Edit', 'D1 Edit', 'Workers R2 Storage Edit', 'Queues Edit', 'Account Analytics Read'] : ['Docker Engine or Desktop', 'running daemon', 'Linux container support'];
    for (const phrase of extra) assert.ok(panel.includes(phrase), phrase);
  }
});


test('home metadata includes the search wording within the description limit', () => {
  const metadata = JSON.parse(readFileSync(new URL('../src/data/page-metadata.json', import.meta.url), 'utf8'))['/'];
  assert.equal(metadata.title, 'Self-hosted private Composer and npm registry');
  assert.ok(metadata.description.length >= 70 && metadata.description.length <= 160);
  for (const phrase of ['self-hosted', 'Composer and npm', 'role-based access']) assert.ok(metadata.description.includes(phrase));
  assert.ok(html.includes(`content="${metadata.description}"`));
});
