import {execFileSync} from 'node:child_process';
import {readdir, readFile, mkdir, writeFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteDir = fileURLToPath(new URL('../', import.meta.url));
const brokerDir = path.resolve(process.env.BROKER_DIR ?? path.join(siteDir, '../v2'));
const brokerRef = process.env.BROKER_REF;
const destination = path.join(siteDir, 'docs');
const github = 'https://github.com/package-broker/broker/blob/main/';

async function filesIn(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported docs entry: ${relative}`);
  }
  return files.sort();
}

function externalLink(url, file) {
  if (/^(?:[a-z][\w+.-]*:|[\/#?])/i.test(url)) return url;
  const [, pathname, suffix] = url.match(/^([^?#]*)(.*)$/);
  const resolved = path.posix.normalize(path.posix.join('docs', path.posix.dirname(file), pathname));
  return resolved === 'docs' || resolved.startsWith('docs/')
    ? url
    : github + resolved + suffix;
}

function rewriteLinks(markdown, file) {
  // Preserve fenced and inline code, including examples containing Markdown links.
  const code = /(^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\2[ \t]*$|`+[^`\n]*`+)/gm;
  let cursor = 0;
  let result = '';
  function links(part) {
    return part
      .replace(/(\]\(<?)([^\s<>]+?)(>?)(?=\s+["']|\))/g,
        (_, start, url, end) => start + externalLink(url, file) + end)
      .replace(/^( {0,3}\[[^\]\n]+\]:\s*<?)([^\s<>]+)(>?)/gm,
        (_, start, url, end) => start + externalLink(url, file) + end)
      .replace(/((?:href|src)=["'])([^"']+)(["'])/g,
        (_, start, url, end) => start + externalLink(url, file) + end);
  }
  for (const match of markdown.matchAll(code)) {
    result += links(markdown.slice(cursor, match.index)) + match[0];
    cursor = match.index + match[0].length;
  }
  return result + links(markdown.slice(cursor));
}

const files = brokerRef
  ? execFileSync('git', ['-C', brokerDir, 'ls-tree', '-rz', '--name-only', brokerRef, '--', 'docs/'], {encoding: 'utf8'})
    .split('\0').filter(Boolean).map(file => file.slice('docs/'.length)).sort()
  : await filesIn(path.join(brokerDir, 'docs'));
if (!files.length) throw new Error('Broker docs directory is empty');
const output = new Map();
const unlisted = [];
for (const file of files) {
  let content = brokerRef
    ? execFileSync('git', ['-C', brokerDir, 'show', `${brokerRef}:docs/${file}`], {maxBuffer: 16 * 1024 * 1024})
    : await readFile(path.join(brokerDir, 'docs', file));
  if (/\.mdx?$/.test(file)) {
    let markdown = content.toString('utf8');
    const frontMatter = markdown.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0] ?? '';
    const body = markdown.slice(frontMatter.length).trim();
    if (/^Coming in 2\.0(?:\s*[:.]|$)[^\n]*$/.test(body)) {
      const updatedFrontMatter = /^unlisted:/m.test(frontMatter)
        ? frontMatter.replace(/^unlisted:.*$/m, 'unlisted: true')
        : frontMatter.replace(/^(---\r?\n)/, '$1unlisted: true\n');
      markdown = frontMatter
        ? updatedFrontMatter + markdown.slice(frontMatter.length)
        : `---\nunlisted: true\n---\n\n${markdown}`;
      unlisted.push(file);
    }
    content = Buffer.from(rewriteLinks(markdown, file));
  }
  output.set(file, content);
}

// Read and transform everything before replacing the generated directory.
await rm(destination, {recursive: true, force: true});
for (const [file, content] of output) {
  const target = path.join(destination, file);
  await mkdir(path.dirname(target), {recursive: true});
  await writeFile(target, content);
}
console.log(`Synced ${files.length} files from ${brokerDir}${brokerRef ? ` @ ${brokerRef}` : ''}`);
console.log(`Unlisted stubs (${unlisted.length}):\n${unlisted.map(file => `  ${file}`).join('\n')}`);
