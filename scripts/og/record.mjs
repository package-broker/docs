// Run only after rasterising every source in render-list.json. The generator
// never updates this manifest: a source change must fail until a new render.
import {existsSync, readFileSync, writeFileSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {sha256, checkCards} from './check.mjs';

const outDir = process.argv[2] ?? 'static';
const folder = path.join(outDir, 'img/og');
const list = JSON.parse(readFileSync(path.join(folder, 'render-list.json'), 'utf8'));
const fontSha256 = sha256(readFileSync(path.join(folder, 'inter-latin-wght-normal.woff2')));
const manifest = Object.fromEntries(list.map(card => [card.output, {
  sourceSha256: sha256(readFileSync(path.join(outDir, card.source.slice('static/'.length)))),
  fontSha256,
  pngSha256: sha256(readFileSync(path.join(outDir, card.output.slice('static/'.length)))),
}]));
const destination = path.join(folder, 'rendered.json');
const previous = existsSync(destination) ? readFileSync(destination, 'utf8') : null;
try {
  writeFileSync(destination, `${JSON.stringify(manifest, null, 2)}\n`);
  checkCards(outDir, true);
} catch (error) {
  if (previous === null) unlinkSync(destination);
  else writeFileSync(destination, previous);
  throw error;
}
console.log(`Recorded ${list.length} rendered social cards.`);
