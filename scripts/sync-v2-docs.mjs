import {execFileSync} from 'node:child_process';
import {readdir, readFile, mkdir, writeFile, rm, mkdtemp, rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteDir = fileURLToPath(new URL('../', import.meta.url));
const repository = 'https://github.com/package-broker/broker';
const github = `${repository}/blob/main/`;
const raw = 'https://raw.githubusercontent.com/package-broker/broker/main/';

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

export function docsPath(destination, file) {
  const target = path.resolve(destination, file);
  const relative = path.relative(destination, target);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Destination path escapes docs/: ${file}`);
  }
  return target;
}

export function externalLink(url, file, image = false) {
  if (/^(?:[a-z][\w+.-]*:|[\/#?])/i.test(url)) return url;
  const [, pathname, suffix] = url.match(/^([^?#]*)(.*)$/);
  const resolved = path.posix.normalize(path.posix.join('docs', path.posix.dirname(file), pathname));
  if (/^\.{1,2}(?:\/|$)/.test(resolved)) return repository + suffix;
  if (resolved === 'docs' || resolved.startsWith('docs/')) return url;
  return (image ? raw : github) + resolved + suffix;
}

export function rewriteLinks(markdown, file) {
  const imageReferences = new Set();
  for (const match of markdown.matchAll(/!\[([^\]\n]*)\](?:\[([^\]\n]*)\])?/g)) {
    imageReferences.add((match[2] || match[1]).trim().toLowerCase());
  }
  function links(part) {
    // Scan destinations rather than stopping at the first closing parenthesis.
    let result = '';
    let cursor = 0;
    for (const match of part.matchAll(/\]\((<?)/g)) {
      const start = match.index + match[0].length;
      let end = start;
      let depth = 0;
      for (; end < part.length; end++) {
        const char = part[end];
        if (char === '\\') { end++; continue; }
        if (match[1] ? char === '>' : /\s/.test(char) || (char === ')' && depth === 0)) break;
        if (char === '(') depth++;
        if (char === ')') depth--;
      }
      if (end === part.length || depth !== 0) continue;
      const labelStart = part.lastIndexOf('[', match.index);
      const image = labelStart > 0 && part[labelStart - 1] === '!';
      result += part.slice(cursor, start) + externalLink(part.slice(start, end), file, image);
      cursor = end;
    }
    return (result + part.slice(cursor))
      .replace(/^( {0,3}\[([^\]\n]+)\]:\s*<?)([^\s<>]+)(>?)/gm,
        (_, start, label, url, end) => start + externalLink(url, file, imageReferences.has(label.trim().toLowerCase())) + end)
      .replace(/((href|src)=["'])([^"']+)(["'])/g,
        (_, start, attribute, url, end) => start + externalLink(url, file, attribute === 'src') + end);
  }
  function inline(part) {
    let cursor = 0;
    let result = '';
    for (const match of part.matchAll(/(`+)(?!`)[\s\S]*?\1(?!`)/g)) {
      result += links(part.slice(cursor, match.index)) + match[0];
      cursor = match.index + match[0].length;
    }
    return result + links(part.slice(cursor));
  }
  // Closing fences may be longer than their opening fence. An unclosed fence
  // protects the remaining content as code too.
  const fences = /^[ \t]*(`{3,}|~{3,})[^\n]*(?:\n|$)/gm;
  let cursor = 0;
  let result = '';
  for (let match; (match = fences.exec(markdown));) {
    result += inline(markdown.slice(cursor, match.index));
    const closing = new RegExp(`^[ \\t]*${match[1][0]}{${match[1].length},}[ \\t]*\\r?$`, 'gm');
    closing.lastIndex = fences.lastIndex;
    const end = closing.exec(markdown);
    cursor = end ? closing.lastIndex : markdown.length;
    result += markdown.slice(match.index, cursor);
    fences.lastIndex = cursor;
  }
  return result + inline(markdown.slice(cursor));
}

export function markStub(markdown) {
  const frontMatter = markdown.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0] ?? '';
  const body = markdown.slice(frontMatter.length).trim();
  const stub = /^(?:# [^\r\n]+\r?\n\s*)?Coming in 2\.0(?:[ \t]*[:.]|$)[^\r\n]*$/.test(body);
  if (!stub) return {markdown, stub};
  const updatedFrontMatter = /^unlisted:/m.test(frontMatter)
    ? frontMatter.replace(/^unlisted:.*$/m, 'unlisted: true')
    : frontMatter.replace(/^(---\r?\n)/, '$1unlisted: true\n');
  return {
    markdown: frontMatter
      ? updatedFrontMatter + markdown.slice(frontMatter.length)
      : `---\nunlisted: true\n---\n\n${markdown}`,
    stub,
  };
}

export async function syncDocs({brokerDir, brokerRef, destination = path.join(siteDir, 'docs')}) {
  if (brokerRef?.startsWith('-')) throw new Error('BROKER_REF must not start with "-"');
  const files = brokerRef
    ? execFileSync('git', ['-C', brokerDir, 'ls-tree', '-rz', '--name-only', brokerRef, '--', 'docs/'], {encoding: 'utf8'})
      .split('\0').filter(Boolean).map(file => file.slice('docs/'.length)).sort()
    : await filesIn(path.join(brokerDir, 'docs'));
  if (!files.length) throw new Error('Broker docs directory is empty');
  const staging = await mkdtemp(path.join(path.dirname(destination), '.docs-sync-'));
  const stagedDocs = path.join(staging, 'docs');
  const backup = path.join(staging, 'previous');
  const unlisted = [];
  let preserveBackup = false;
  try {
    for (const file of files) {
      docsPath(destination, file);
      const target = docsPath(stagedDocs, file);
      let content = brokerRef
        ? execFileSync('git', ['-C', brokerDir, 'show', `${brokerRef}:docs/${file}`, '--'], {maxBuffer: 16 * 1024 * 1024})
        : await readFile(path.join(brokerDir, 'docs', file));
      if (/\.mdx?$/.test(file)) {
        const {markdown, stub} = markStub(content.toString('utf8'));
        if (stub) unlisted.push(file);
        content = Buffer.from(rewriteLinks(markdown, file));
      }
      await mkdir(path.dirname(target), {recursive: true});
      await writeFile(target, content);
    }
    // Keep the previous tree until all writes and the final rename succeed.
    let hadDestination = false;
    try {
      await rename(destination, backup);
      hadDestination = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      await rename(stagedDocs, destination);
    } catch (error) {
      if (hadDestination) {
        try {
          await rename(backup, destination);
        } catch (restoreError) {
          preserveBackup = true;
          throw new AggregateError([error, restoreError], `Could not restore docs; previous tree retained at ${backup}`);
        }
      }
      throw error;
    }
  } finally {
    if (!preserveBackup) await rm(staging, {recursive: true, force: true});
  }
  console.log(`Synced ${files.length} files from ${brokerDir}${brokerRef ? ` @ ${brokerRef}` : ''}`);
  console.log(`Unlisted stubs (${unlisted.length}):\n${unlisted.map(file => `  ${file}`).join('\n')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncDocs({
    brokerDir: path.resolve(process.env.BROKER_DIR ?? path.join(siteDir, '../v2')),
    brokerRef: process.env.BROKER_REF,
  });
}
