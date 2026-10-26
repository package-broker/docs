import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {checkP3Themes} from './lib/p3-theme-check.mjs';
import {formatDisplayP3} from './lib/color.mjs';

const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
const lightDanger = /(--pb-color-status-danger-bg: )(color\(display-p3 [^)]+\))/;
const lightValue = lightDanger.exec(css)[2];

test('generated P3 fallbacks cover light, both dark scopes and print', () => {
  const result = checkP3Themes(css, tokens);
  assert.deepEqual(result.errors, []);
  assert.ok(result.checked > 0);
});

test('rejects a light fallback lifted out of print into every theme', () => {
  const bad = css + `\n@media (color-gamut: p3) { :root, [data-theme] { --pb-color-status-danger-bg: ${lightValue}; } }`;
  assert.ok(checkP3Themes(bad, tokens).errors.some((e) => e.includes('escapes its theme scope')));
});

test('rejects light values in either dark scope', () => {
  // Replace every P3 danger value: light and print stay valid, both dark scopes must fail.
  const bad = css.replace(new RegExp(lightDanger.source, 'g'), `$1${lightValue}`);
  const {errors} = checkP3Themes(bad, tokens);
  assert.ok(errors.some((e) => e.includes('wrong dark value')));
  assert.ok(errors.some((e) => e.includes('wrong auto-dark value')));
});

test('rejects removal of an explicit dark override', () => {
  const start = css.indexOf('/* Explicit P3 fallbacks');
  const bad = css.slice(0, start) + css.slice(start).replace(/(    \[data-theme="dark"\] \{)[\s\S]*?\n    \}/, '$1\n    }');
  assert.ok(checkP3Themes(bad, tokens).errors.some((e) => e.includes('missing its dark override')));
});

test('rejects a missing P3 enhancement block', () => {
  const bad = css.slice(0, css.indexOf('/* Explicit P3 fallbacks'));
  assert.ok(checkP3Themes(bad, tokens).errors.some((e) => e.includes('missing its light override')));
});

test('rejects an automatic dark selector that also matches an explicit light theme', () => {
  const start = css.indexOf('/* Explicit P3 fallbacks');
  const bad = css.slice(0, start) + css.slice(start).replace(':root:not([data-theme="light"], [data-theme="dark"])', ':root');
  assert.ok(checkP3Themes(bad, tokens).errors.some((e) => e.includes('escapes its theme scope')));
});

test('rejects a P3 token declaration outside a gamut guard', () => {
  const bad = css + `\n:root { --pb-color-status-danger-bg: ${lightValue}; }`;
  assert.ok(checkP3Themes(bad, tokens).errors.some((e) => e.includes('missing its colour-gamut guard')));
});

test('requires dark and print overrides for any newly enhanced token', () => {
  const value = formatDisplayP3(tokens.color.status.info.bg.$value);
  const bad = css + `\n@media (color-gamut: p3) { :root, [data-theme="light"] { --pb-color-status-info-bg: ${value}; } }`;
  assert.ok(checkP3Themes(bad, tokens).errors.some((e) => e.includes('status-info-bg is missing its dark override')));
});
