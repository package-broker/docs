// Extracts the colour pairs a stylesheet actually uses, per component root class, so contrast is checked on the CSS and not only on a hand-kept table.
const COLOR_VAR = /var\(--pb-color-([a-z0-9-]+)\)/g;
export const AMBIENT = ['bg', 'surface', 'surface-subtle', 'surface-raised'];

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function* rules(css) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) return;
    const head = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth) {
      if (css[j] === '{') depth++;
      if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    if (head.startsWith('@')) {
      if (/^@(media|container|supports|layer)/.test(head)) yield* rules(body);
    } else {
      yield { selectors: head.split(',').map((s) => s.trim()).filter(Boolean), body };
    }
    i = j;
  }
}

const declarations = (body) =>
  body
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const k = d.indexOf(':');
      return [d.slice(0, k).trim(), d.slice(k + 1).trim()];
    });

const tokensIn = (value) => [...value.matchAll(COLOR_VAR)].map((m) => m[1]);
const STATE = /(?::(?!:)[a-z-]+(?:\([^)]*\))?|\.is-[a-z]+|\[(?:aria|data)-[a-z-]+(?:="[^"]*")?\]|\[type="[^"]*"\])+$/;
const normalise = (selector) => selector.replace(/\s*[>+~]\s*/g, ' ').replace(/\s+/g, ' ').trim();
const PSEUDO_ELEMENT = /::(?:before|after)$/;
const baseOf = (selector) =>
  normalise(selector)
    .split(' ')
    .map((compound) => {
      const pe = PSEUDO_ELEMENT.exec(compound)?.[0] ?? '';
      return compound.slice(0, compound.length - pe.length).replace(STATE, '') + pe;
    })
    .join(' ');
const parentOf = (key) => {
  const parts = key.split(/ (?![^\[]*\])/);
  return parts.length > 1 ? parts.slice(0, -1).join(' ') : null;
};

/**
 * Groups every rule by its selector with trailing state selectors removed, so rest, hover, active and selected rules of one element
 * are checked together, and derives the colour pairs they imply. Elements without their own background inherit the nearest ancestor
 * group's backgrounds, then the ambient surfaces; elements without their own text colour use the ancestor's, then `text`.
 */
export function derivePairs(cssText, containers = []) {
  const groups = new Map();
  for (const rule of rules(stripComments(cssText))) {
    for (const selector of rule.selectors) {
      const key = baseOf(selector);
      if (!groups.has(key)) groups.set(key, { fg: new Set(), bg: new Set(), border: new Set(), outline: new Set(), insetOutline: new Set() });
      const g = groups.get(key);
      const inset = /outline-offset:\s*calc\(-1/.test(rule.body);
      for (const [prop, value] of declarations(rule.body)) {
        if (!value.includes('--pb-color-') || /gradient/.test(value)) continue;
        const names = tokensIn(value);
        if (prop === 'color') names.forEach((n) => g.fg.add(n));
        else if (prop === 'background' || prop === 'background-color') names.forEach((n) => g.bg.add(n));
        else if (/^border/.test(prop) || prop === 'box-shadow') names.forEach((n) => g.border.add(n));
        else if (/^outline/.test(prop)) names.forEach((n) => (inset ? g.insetOutline : g.outline).add(n));
      }
    }
  }
  const chain = (key, pick) => {
    for (let k = parentOf(key); k; k = parentOf(k)) {
      const g = groups.get(k);
      if (g && g[pick].size) return [...g[pick]];
    }
    const rootKey = key.split(' ')[0];
    const rg = rootKey === key ? null : groups.get(rootKey);
    return rg && rg[pick].size ? [...rg[pick]] : null;
  };
  const out = new Map();
  const add = (fg, bg, kind, where) => {
    const k = `${fg}|${bg}|${kind}`;
    if (!out.has(k)) out.set(k, { fg, bg, kind, where: new Set() });
    out.get(k).where.add(where);
  };
  for (const [key, g] of groups) {
    if (PSEUDO_ELEMENT.test(key)) {
      const host = chain(`${key.replace(PSEUDO_ELEMENT, '')} x`, 'bg') ?? AMBIENT;
      for (const b of [...g.bg, ...g.border]) for (const h of host) add(b, h, 'boundary', key);
      continue;
    }
    const inheritedBg = chain(key, 'bg');
    const bgs = [...new Set([...g.bg, ...(g.bg.size ? [] : inheritedBg ?? AMBIENT), ...(g.fg.size && g.bg.size && inheritedBg && key.includes(' ') ? inheritedBg : [])])];
    const fgs = g.fg.size ? [...g.fg] : g.bg.size ? chain(key, 'fg') ?? ['text'] : [];
    for (const f of fgs) for (const b of bgs) add(f, b, 'text', key);
    const outer = chain(key, 'bg') ?? AMBIENT;
    for (const b of g.border) for (const a of outer) add(b, a, 'boundary', key);
    for (const o of g.outline) for (const a of outer) add(o, a, 'focus', key);
    for (const o of g.insetOutline) for (const b of bgs) add(o, b, 'focus', key);
  }
  for (const { root, bg } of containers) {
    const own = [...groups].filter(([key, g]) => key.startsWith(`${root} `) && (g.outline.size || g.insetOutline.size));
    const tokens = own.length ? own.flatMap(([, g]) => [...g.outline, ...g.insetOutline]) : ['focus'];
    for (const t of tokens) add(t, bg, 'focus', `${root} (container)`);
  }
  return out;
}
