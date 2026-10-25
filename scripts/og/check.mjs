import assert from 'node:assert/strict';
import {existsSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function checkCards(outDir, requirePng = false) {
  const renderList = JSON.parse(readFileSync(path.join(outDir, 'img/og/render-list.json'), 'utf8'));
  let pending = 0;
  for (const card of renderList) {
    const svg = readFileSync(path.join(outDir, card.source.slice('static/'.length)), 'utf8');
    assert.match(svg, /width="1200" height="630"/);
    assert.match(svg, /data:font\/woff2;base64,/);
    const png = path.join(outDir, card.output.slice('static/'.length));
    if (!existsSync(png)) {
      assert.ok(!requirePng, `Rasterise ${card.source} to ${card.output} before publishing`);
      pending++;
      continue;
    }
    assert.ok(statSync(png).size <= card.maxBytes, `${png}: image exceeds 300 KB`);
    const header = readFileSync(png);
    assert.equal(header.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${png}: invalid PNG`);
    assert.equal(header.toString('ascii', 12, 16), 'IHDR');
    assert.equal(header.readUInt32BE(16), 1200, `${png}: wrong width`);
    assert.equal(header.readUInt32BE(20), 630, `${png}: wrong height`);
  }
  return {cards: renderList.length, pending};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkCards(process.argv[2] ?? 'build', process.argv.includes('--require-png'));
  console.log(`Social cards: ${result.cards} SVG sources; ${result.pending} PNGs awaiting orchestrator rasterisation.`);
}
