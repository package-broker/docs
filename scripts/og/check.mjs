import assert from 'node:assert/strict';
import {existsSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const sha256 = value => createHash('sha256').update(value).digest('hex');

export function checkCards(outDir, requirePng = true) {
  const renderList = JSON.parse(readFileSync(path.join(outDir, 'img/og/render-list.json'), 'utf8'));
  const manifestPath = path.join(outDir, 'img/og/rendered.json');
  assert.ok(existsSync(manifestPath), 'Record rendered card hashes after rasterisation: node scripts/og/record.mjs');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const fontHash = sha256(readFileSync(path.join(outDir, 'img/og/inter-latin-wght-normal.woff2')));
  assert.deepEqual(Object.keys(manifest).sort(), renderList.map(card => card.output).sort(), 'Rendered card manifest must cover every card exactly once');
  let pending = 0;
  for (const card of renderList) {
    const svg = readFileSync(path.join(outDir, card.source.slice('static/'.length)), 'utf8');
    assert.match(svg, /width="1200" height="630"/);
    assert.match(svg, /src:url\(inter-latin-wght-normal\.woff2\)/);
    assert.doesNotMatch(svg, /base64,/, 'Use one shared self-hosted font');
    const png = path.join(outDir, card.output.slice('static/'.length));
    if (!existsSync(png)) {
      assert.ok(!requirePng, `Rasterise ${card.source} to ${card.output} before publishing`);
      pending++;
      continue;
    }
    assert.ok(statSync(png).size <= card.maxBytes, `${png}: image exceeds 300 KB`);
    const header = readFileSync(png);
    const rendered = manifest[card.output];
    assert.equal(rendered.sourceSha256, sha256(svg), `${png}: stale PNG; rasterise its changed SVG source`);
    assert.equal(rendered.fontSha256, fontHash, `${png}: stale PNG; rasterise with the changed font`);
    assert.equal(rendered.pngSha256, sha256(header), `${png}: PNG differs from its recorded render`);
    assert.equal(header.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${png}: invalid PNG`);
    assert.equal(header.toString('ascii', 12, 16), 'IHDR');
    assert.equal(header.readUInt32BE(16), 1200, `${png}: wrong width`);
    assert.equal(header.readUInt32BE(20), 630, `${png}: wrong height`);
  }
  return {cards: renderList.length, pending};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkCards(process.argv[2] ?? 'build', true);
  console.log(`Social cards: ${result.cards} SVG sources; ${result.pending} PNGs awaiting orchestrator rasterisation.`);
}
