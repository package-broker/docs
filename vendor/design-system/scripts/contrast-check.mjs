#!/usr/bin/env node
// Contrast gate. Three layers: (1) the declared pair table in tokens.json, (2) every pair the stylesheets actually use
// (extracted from components.css, undeclared pairs fail), (3) an independent recomputation from the stored hex values.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { contrastRatio, inSrgbGamut, formatOklch, serialisedComponents } from './lib/color.mjs';
import { derivePairs, AMBIENT } from './lib/css-pairs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const MODES = ['light', 'dark'];
const EXT = tokens.$extensions;
const declared = EXT['broker.package.contrastPairs'];
const exempt = EXT['broker.package.contrastExempt'];
const ignored = EXT['broker.package.contrastIgnore'];
const containers = EXT['broker.package.contrastContainers'];

const colorLeaves = [];
(function walk(node, path = []) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v.$value) colorLeaves.push([[...path, k].join('.'), v]);
    else walk(v, [...path, k]);
  }
})(tokens.color);
const byPath = new Map(colorLeaves);
const byName = new Map(colorLeaves.map(([p]) => [p.replace(/\./g, '-'), p]));
const nameToPath = (name) => byName.get(name) ?? (() => { throw new Error(`stylesheet uses --pb-color-${name}, which is not a token`); })();

const valueFor = (node, mode) => (mode === 'light' ? node.$value : node.$extensions['broker.package.modes'].dark);
const measured = (node, mode) => {
  const v = valueFor(node, mode);
  return serialisedComponents(v.components, v.alpha);
};

// Independent textbook WCAG 2 luminance from the stored 8-bit hex, no OKLCH involved.
const hexLum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const hexRatio = (a, b) => {
  const [x, y] = [hexLum(a), hexLum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const errors = [];
const gamutErrors = [];
for (const [path, node] of colorLeaves) {
  for (const mode of MODES) {
    const v = valueFor(node, mode);
    if (!inSrgbGamut(v.components)) gamutErrors.push(`${path} (${mode}) ${formatOklch(v.components)}`);
  }
}

const key = (p) => `${p.fg}|${p.bg}|${p.min}`;
const seen = new Set();
const pairs = [];
for (const p of declared) {
  if (seen.has(key(p))) errors.push(`duplicate declared pair ${key(p)}`);
  seen.add(key(p));
  pairs.push(p);
}

const rows = pairs.map((p) => {
  const fg = byPath.get(p.fg) ?? (errors.push(`unknown token ${p.fg}`), null);
  const bg = byPath.get(p.bg) ?? (errors.push(`unknown token ${p.bg}`), null);
  if (!fg || !bg) return [p.fg, p.bg, p.use, `${p.min}:1`, 'n/a', 'n/a'];
  for (const n of [fg, bg]) if (valueFor(n, 'light').alpha !== undefined) errors.push(`pair ${p.fg} x ${p.bg} uses a translucent token; composite it first or remove the pair`);
  const cells = MODES.map((m) => {
    const r = contrastRatio(measured(fg, m), measured(bg, m));
    const h = hexRatio(valueFor(fg, m).hex, valueFor(bg, m).hex);
    if (Math.abs(r - h) > 0.15 || (r >= p.min) !== (h >= p.min - 0.02)) errors.push(`${p.fg} x ${p.bg} (${m}): OKLCH ratio ${r.toFixed(2)} and hex ratio ${h.toFixed(2)} disagree`);
    if (r < p.min) errors.push(`FAIL ${p.fg} x ${p.bg} (${m}) ${r.toFixed(2)} < ${p.min}`);
    return `${r.toFixed(2)} ${r >= p.min ? 'pass' : 'FAIL'}`;
  });
  return [p.fg, p.bg, p.use, `${p.min}:1`, ...cells];
});

// Layer 2: pairs the stylesheet uses.
const cssFiles = ['components.css'];
const exemptNames = new Set(exempt.map((e) => e.token));
const declaredSet = new Set(pairs.map((p) => `${p.fg}|${p.bg}`));
const needs = new Map();
const need = (fgName, bgName, kind, where) => {
  if (exemptNames.has(fgName) || exemptNames.has(bgName)) return;
  if (fgName === bgName) return;
  if (ignored.some((i) => i.fg === fgName && (i.bg === bgName || (i.bg === 'ambient' && AMBIENT.includes(bgName))))) return;
  const fg = nameToPath(fgName);
  const bg = nameToPath(bgName);
  const k = `${fg}|${bg}`;
  if (!needs.has(k)) needs.set(k, { fg, bg, kind, where: new Set() });
  needs.get(k).where.add(where);
};
for (const file of cssFiles) {
  for (const p of derivePairs(readFileSync(join(root, file), 'utf8'), containers).values()) {
    for (const w of p.where) need(p.fg, p.bg, p.kind, w);
  }
}
const missing = [];
for (const [k, v] of needs) {
  if (declaredSet.has(k)) continue;
  missing.push(`${v.fg} on ${v.bg} (${v.kind}; used by ${[...v.where].join(', ')})`);
}
if (missing.length) errors.push(`undeclared pairs used in ${cssFiles.join(', ')} (declare them in tokens.json contrastPairs or fix the CSS):\n  ${missing.join('\n  ')}`);

console.log('| Foreground | Background | Use | Min | Light | Dark |');
console.log('|---|---|---|---|---|---|');
for (const r of rows) console.log(`| \`${r[0]}\` | \`${r[1]}\` | ${r[2]} | ${r[3]} | ${r[4]} | ${r[5]} |`);
console.log('');
for (const g of gamutErrors) console.log(`OUT OF sRGB GAMUT: ${g}`);
for (const e of errors) console.log(e);
const failing = errors.filter((e) => e.startsWith('FAIL')).length;
console.log(`${pairs.length} unique declared pairs x ${MODES.length} themes = ${pairs.length * MODES.length} checks, ${failing} failing, ${needs.size} stylesheet pairs derived (${missing.length} undeclared), ${gamutErrors.length} out-of-gamut tokens, ${errors.length} errors`);
process.exit(errors.length || gamutErrors.length ? 1 : 0);
