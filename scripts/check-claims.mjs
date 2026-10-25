import {readdir, readFile} from 'node:fs/promises';
import {isUtf8} from 'node:buffer';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteDir = fileURLToPath(new URL('../', import.meta.url));
const marketingRoots = [
  'src', 'static', 'blog', 'docusaurus.config.ts',
];
// Docs retain factual upstream wording. The password-manager rule also applies
// to current and historical docs, translations, and other published sources.
const publishedRoots = [
  'src', 'blog', 'docs', 'versioned_docs', 'i18n', 'static',
  'versioned_sidebars', 'sidebars.ts', 'versions.json', 'docusaurus.config.ts',
];
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
  ['password-manager CLI', /\bop:\/\/|\bop\s+(?:read|run|inject|signin)\b/gi],
];

async function filesUnder(relative) {
  const absolute = path.join(siteDir, relative);
  let entries;
  try {
    entries = await readdir(absolute, {withFileTypes: true});
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    if (error.code === 'ENOTDIR') return [relative];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const file = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(file));
    else if (entry.isFile()) files.push(file);
  }
  return files;
}

async function collect(roots) {
  return new Set((await Promise.all(roots.map(filesUnder))).flat());
}

const marketingFiles = await collect(marketingRoots);
// Redirect paths name historical routes; they are not marketing copy.
marketingFiles.delete('static/_redirects');
const publishedFiles = await collect(publishedRoots);
const builtFiles = (await filesUnder('build')).filter(file => file.endsWith('.html') && !file.startsWith('build/v1/'));
for (const file of builtFiles) {
  publishedFiles.add(file);
  // Preserve the Round 1 exception for factual upstream documentation.
  if (!file.startsWith('build/docs/')) marketingFiles.add(file);
}
const violations = [];
let checked = 0;
for (const file of [...new Set([...publishedFiles, ...marketingFiles])].sort()) {
  const buffer = await readFile(path.join(siteDir, file));
  if (buffer.includes(0) || !isUtf8(buffer)) continue;
  const source = buffer.toString('utf8');
  checked++;
  const rules = marketingFiles.has(file) ? [...marketingRules, ...passwordRules] : passwordRules;
  for (const [label, pattern] of rules) {
    for (const match of source.matchAll(pattern)) {
      const line = source.slice(0, match.index).split('\n').length;
      violations.push(`${file}:${line}: ${label}: ${JSON.stringify(match[0])}`);
    }
  }
}

console.log(`Claims check: ${checked} published text files, including ${builtFiles.length} built HTML files; marketing claims and password-manager references checked.`);
if (violations.length) {
  console.error(violations.join('\n'));
  console.error(`FAIL: ${violations.length} prohibited wording match(es).`);
  process.exitCode = 1;
} else {
  console.log('PASS: no prohibited marketing claims or password-manager references.');
}
