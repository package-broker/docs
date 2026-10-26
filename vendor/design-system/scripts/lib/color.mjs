export function oklchToLinearSrgb([L, C, H]) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// Numerical-noise tolerance only (linear-light units). Tokens outside it are reported, never clamped silently.
export const GAMUT_EPSILON = 0.0003;

export function inSrgbGamut(components) {
  return oklchToLinearSrgb(components).every((v) => v >= -GAMUT_EPSILON && v <= 1 + GAMUT_EPSILON);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const encode = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const decode = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

export function oklchToHex(components) {
  return (
    '#' +
    oklchToLinearSrgb(components)
      .map((v) => Math.round(clamp01(encode(clamp01(v))) * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function hexToOklch(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => decode(parseInt(n.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, C < 0.0005 ? 0 : H];
}

export function relativeLuminance(components) {
  const [r, g, b] = oklchToLinearSrgb(components).map((v) => decode(encode(clamp01(v))));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg, bg) {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const num = (v, d) => Number(v.toFixed(d)).toString();

// Serialisation precision is part of the contract: tokens.json stores L to 4, C to 4 and H to 2 decimals,
// the CSS carries exactly those digits, and the contrast script measures the parsed CSS text.
export function formatOklch([L, C, H], alpha) {
  const base = `${num(L * 100, 2)}% ${num(C, 4)} ${num(H, 2)}`;
  return alpha === undefined || alpha === 1 ? `oklch(${base})` : `oklch(${base} / ${num(alpha, 2)})`;
}

export function parseOklch(text) {
  const m = /^oklch\(([\d.]+)% ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/.exec(text);
  if (!m) throw new Error(`not an oklch() value: ${text}`);
  return { components: [Number(m[1]) / 100, Number(m[2]), Number(m[3])], alpha: m[4] === undefined ? 1 : Number(m[4]) };
}

export function serialisedComponents(components, alpha) {
  return parseOklch(formatOklch(components, alpha)).components;
}

// Tiny sRGB excursions within GAMUT_EPSILON still trigger CSS processors' P3 fallbacks.
export function needsP3Fallback(value) {
  return oklchToLinearSrgb(serialisedComponents(value.components, value.alpha)).some((v) => v < 0 || v > 1);
}

export function formatDisplayP3(value) {
  const rgb = oklchToLinearSrgb(serialisedComponents(value.components, value.alpha));
  // Linear sRGB -> XYZ D65 -> linear Display P3 (CSS Color 4 matrices).
  const xyz = [
    [0.4123907992659595, 0.357584339383878, 0.1804807884018343],
    [0.2126390058715104, 0.715168678767756, 0.0721923153607337],
    [0.0193308187155919, 0.1191947797946259, 0.9505321522496606],
  ].map((row) => row.reduce((sum, c, i) => sum + c * rgb[i], 0));
  const channels = [
    [2.493496911941425, -0.9313836179191239, -0.402710784450717],
    [-0.8294889695615747, 1.7626640603183463, 0.0236246858419436],
    [0.0358458302437845, -0.0761723892680418, 0.9568845240076872],
  ].map((row) => row.reduce((sum, c, i) => sum + c * xyz[i], 0));
  if (channels.some((v) => v < -GAMUT_EPSILON || v > 1 + GAMUT_EPSILON)) {
    throw new Error('token is outside Display P3; reduce its chroma in tokens.json');
  }
  const base = channels.map((v) => num(encode(clamp01(v)), 6)).join(' ');
  return `color(display-p3 ${base}${value.alpha === undefined || value.alpha === 1 ? '' : ` / ${num(value.alpha, 2)}`})`;
}
