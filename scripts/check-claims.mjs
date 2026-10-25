import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteDir = fileURLToPath(new URL('../', import.meta.url));
const marketingRoots = [
  'src/pages', 'src/components', 'src/data', 'src/theme/Navbar', 'src/theme/Footer',
  'blog', 'docusaurus.config.ts', 'static/img/og-2.0.svg',
];
// Docs retain factual upstream wording. The password-manager rule also applies
// to current and historical docs, translations, and other published sources.
const publishedRoots = [
  'src', 'blog', 'docs', 'versioned_docs', 'i18n', 'static',
  'versioned_sidebars', 'sidebars.ts', 'versions.json', 'docusaurus.config.ts',
];
const textFile = /\.(?:[cm]?[jt]sx?|mdx?|json|ya?ml|html?|css|scss|svg|txt|xml)$/i;
const marketingRules = [
  ['free tier', /\bfree[\s-]+tier\b/gi],
  ['zero cost', /\bzero[\s-]+cost\b/gi],
  ['zero-ops', /\bzero[\s-]+ops\b/gi],
  ['enterprise-ready', /\benterprise[\s-]+ready\b/gi],
  ['security scanning', /\bsecurity[\s-]+scanning\b/gi],
  ['SOC 2 claim', /\bsoc[\s-]*2\b/gi],
  // Conservatively flag standalone "free" on marketing surfaces for review as
  // a potential price claim; factual docs and ADRs are outside this rule.
  ['free price claim', /\bfree\b/gi],
];
const passwordRules = [
  ['password-manager reference', /\bpassword[\s-]+(?:managers?|management|vaults?)\b/gi],
  ['password-manager product', /\b(?:1[\s-]?password|onepassword|bitwarden|lastpass|dashlane|keepass(?:xc)?|nordpass|roboform|enpass|passbolt|keeper|lockwise)\b/gi],
  ['password-manager product', /\b(?:proton[\s-]+pass|apple[\s-]+passwords|icloud[\s-]+keychain)\b/gi],
];

async function filesUnder(relative) {
  const absolute = path.join(siteDir, relative);
  let entries;
  try {
    entries = await readdir(absolute, {withFileTypes: true});
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    if (error.code === 'ENOTDIR') return textFile.test(relative) ? [relative] : [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const file = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(file));
    else if (entry.isFile() && textFile.test(file)) files.push(file);
  }
  return files;
}

async function collect(roots) {
  return new Set((await Promise.all(roots.map(filesUnder))).flat());
}

const marketingFiles = await collect(marketingRoots);
const publishedFiles = await collect(publishedRoots);
const violations = [];
for (const file of [...new Set([...publishedFiles, ...marketingFiles])].sort()) {
  const source = await readFile(path.join(siteDir, file), 'utf8');
  const rules = marketingFiles.has(file) ? [...marketingRules, ...passwordRules] : passwordRules;
  for (const [label, pattern] of rules) {
    for (const match of source.matchAll(pattern)) {
      const line = source.slice(0, match.index).split('\n').length;
      violations.push(`${file}:${line}: ${label}: ${JSON.stringify(match[0])}`);
    }
  }
}

console.log(`Claims check: ${marketingFiles.size} marketing files; ${publishedFiles.size} published source files checked for password-manager references.`);
if (violations.length) {
  console.error(violations.join('\n'));
  console.error(`FAIL: ${violations.length} prohibited wording match(es).`);
  process.exitCode = 1;
} else {
  console.log('PASS: no prohibited marketing claims or password-manager references.');
}
