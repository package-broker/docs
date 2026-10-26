import {formatDisplayP3, needsP3Fallback} from './color.mjs';

// tokens.css uses only ordinary rules and nested at-rules. Keep their ancestor
// conditions when checking declarations, including print and automatic dark.
function* rules(css, conditions = []) {
  let pos = 0;
  while (pos < css.length) {
    const open = css.indexOf('{', pos);
    if (open < 0) return;
    const head = css.slice(pos, open).trim();
    let end = open + 1;
    let depth = 1;
    for (; end < css.length && depth; end++) {
      if (css[end] === '{') depth++;
      if (css[end] === '}') depth--;
    }
    if (depth) throw new Error('unbalanced CSS block');
    const body = css.slice(open + 1, end - 1);
    if (head.startsWith('@')) yield* rules(body, [...conditions, head]);
    else yield {head, body, conditions};
    pos = end;
  }
}

function selectors(head) {
  // A comma within :not() belongs to the selector, not the selector list.
  return head.match(/(?:\([^)]*\)|[^,])+/g).map((s) => s.trim().replaceAll("'", '"').replace(/\s+/g, '').replace(/\[data-theme=(light|dark)\]/g, '[data-theme="$1"]'));
}

const channels = (value) => /^color\(display-p3\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(value)?.slice(1).map((v, i) => v === undefined && i === 3 ? 1 : Number(v));

export function checkP3Themes(css, tokens) {
  const colors = new Map();
  (function walk(node, path = ['color']) {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (value.$value) colors.set(`--pb-${[...path, key].join('-')}`, value);
      else walk(value, [...path, key]);
    }
  })(tokens.color);
  const errors = [];
  const seen = new Set();
  const enhanced = new Set();
  let checked = 0;
  for (const {head, body, conditions} of rules(css.replace(/\/\*[\s\S]*?\*\//g, ''))) {
    if (!/color\(display-p3/.test(body) && !conditions.some((c) => /display-p3|color-gamut\s*:\s*p3/.test(c))) continue;
    const gamutGuard = conditions.some((c) => /^@media\b/.test(c) && /color-gamut\s*:\s*p3/.test(c));
    const print = conditions.some((c) => /^@media\s+print\b/.test(c));
    const autoDark = conditions.some((c) => /prefers-color-scheme\s*:\s*dark/.test(c));
    for (const [, name, value] of body.matchAll(/(--pb-[\w-]+)\s*:\s*([^;{}]+)(?:;|$)/g)) {
      if (!gamutGuard) errors.push(`P3 token ${name} is missing its colour-gamut guard`);
      const token = colors.get(name);
      if (!token) { errors.push(`P3 block overrides unknown colour token ${name}`); continue; }
      enhanced.add(name);
      for (const selector of selectors(head)) {
        let scope;
        if (print && [':root', '[data-theme]', '[data-theme="light"]', '[data-theme="dark"]'].includes(selector)) scope = 'print';
        else if (!autoDark && selector === '[data-theme="dark"]') scope = 'dark';
        else if (autoDark && [':root:not([data-theme="light"],[data-theme="dark"])', ':root:not([data-theme="light"]):not([data-theme="dark"])'].includes(selector)) scope = 'auto-dark';
        else if (!autoDark && [':root', '[data-theme="light"]'].includes(selector)) scope = 'light';
        else { errors.push(`P3 token ${name} escapes its theme scope: ${conditions.join(' / ')} / ${selector}`); continue; }
        const expected = scope === 'dark' || scope === 'auto-dark' ? token.$extensions['broker.package.modes'].dark : token.$value;
        const actualChannels = channels(value.trim());
        const expectedChannels = channels(formatDisplayP3(expected));
        if (!actualChannels || actualChannels.some((v, i) => Math.abs(v - expectedChannels[i]) > 0.000002)) {
          errors.push(`P3 token ${name} has the wrong ${scope} value: ${value.trim()}; expected ${formatDisplayP3(expected)}`);
        }
        seen.add(`${scope}|${name}`);
        checked++;
      }
    }
  }
  for (const [name, token] of colors) {
    if (!enhanced.has(name) && ![token.$value, token.$extensions['broker.package.modes'].dark].some(needsP3Fallback)) continue;
    for (const scope of ['light', 'dark', 'auto-dark', 'print']) {
      if (!seen.has(`${scope}|${name}`)) errors.push(`P3 token ${name} is missing its ${scope} override`);
    }
  }
  return {errors, checked};
}
