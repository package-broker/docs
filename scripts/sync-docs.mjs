import {execFileSync} from 'node:child_process';
import {existsSync, lstatSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));

function git(brokerDir, args, encoding = 'utf8') {
  return execFileSync('git', ['-C', brokerDir, ...args], {
    encoding, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function archivePath(name) {
  const parts = name.replace(/\/$/, '').split('/');
  if (parts[0] !== 'docs' || parts.some(part => !part || part === '.' || part === '..') ||
      /[\\\x00-\x1f\x7f:]/.test(name)) {
    throw new Error(`Archive path must stay inside docs-content/: ${JSON.stringify(name)}`);
  }
  return parts.slice(1).join('/');
}

function paxFields(data) {
  const fields = {};
  for (let offset = 0; offset < data.length;) {
    const space = data.indexOf(32, offset);
    const length = Number(data.subarray(offset, space).toString());
    if (space < offset || !Number.isSafeInteger(length) || length <= space - offset + 1 ||
        offset + length > data.length || data[offset + length - 1] !== 10) {
      throw new Error('Malformed archive metadata.');
    }
    const record = data.subarray(space + 1, offset + length - 1).toString();
    const equals = record.indexOf('=');
    if (equals < 1) throw new Error('Malformed archive metadata.');
    fields[record.slice(0, equals)] = record.slice(equals + 1);
    offset += length;
  }
  return fields;
}

// Parse rather than extract: links and traversal never reach the filesystem.
export function readArchive(archive) {
  const files = new Map();
  let pending = {};
  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const field = (start, size) => header.subarray(start, start + size).toString().replace(/\0.*$/s, '');
    const sizeText = field(124, 12).trim();
    const size = /^[0-7]+$/.test(sizeText) ? parseInt(sizeText, 8) : NaN;
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > archive.length) {
      throw new Error('Malformed archive size.');
    }
    const checksum = parseInt(field(148, 8).trim(), 8);
    const actual = header.reduce((sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte), 0);
    if (checksum !== actual) throw new Error('Malformed archive checksum.');
    const type = field(156, 1);
    const data = archive.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === 'g' || type === 'x') {
      const fields = paxFields(data);
      if (type === 'g' && Object.keys(fields).some(key => key !== 'comment')) {
        throw new Error('Unsupported global archive metadata.');
      }
      if (type === 'x') {
        if (Object.keys(fields).some(key => key !== 'path')) throw new Error('Unsupported archive metadata.');
        pending = fields;
      }
      continue;
    }
    const prefix = field(345, 155);
    const name = pending.path ?? `${prefix ? `${prefix}/` : ''}${field(0, 100)}`;
    pending = {};
    const relative = archivePath(name);
    if (type === '5') continue;
    if (type !== '0' && type !== '') throw new Error(`Archive links and special files are not supported: ${name}`);
    if (!relative || relative === '.sync.json' || files.has(relative)) {
      throw new Error(`Reserved or duplicate archive path: ${name}`);
    }
    files.set(relative, Buffer.from(data));
  }
  if (files.size === 0) throw new Error('The commit contains no docs files.');
  return new Map([...files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
}

export function addFrontMatter(name, data) {
  if (name !== 'architecture.md' || /^(?:\uFEFF)?---\r?\n/.test(data.toString())) return data;
  return Buffer.concat([Buffer.from('---\ntitle: Architecture overview\nsidebar_position: 9\ndescription: How Package Broker runtimes, plugins, access decisions and storage fit together.\n---\n\n'), data]);
}

export function syncDocs({brokerDir = process.env.BROKER_DIR, ref, siteDir = siteRoot, dryRun = false, log = console.log}) {
  if (!brokerDir) throw new Error('BROKER_DIR is missing. Set it to the broker repository path.');
  if (typeof ref !== 'string' || !/^[0-9a-fA-F]{40}$/.test(ref)) {
    throw new Error('The ref must be a full 40-hex commit SHA present in BROKER_DIR.');
  }
  const sha = ref.toLowerCase();
  let objectType;
  try { objectType = git(brokerDir, ['cat-file', '-t', sha]).trim(); } catch {
    throw new Error('The commit is missing from BROKER_DIR. Fetch it before syncing.');
  }
  if (objectType !== 'commit') throw new Error('The ref must identify a commit, not another Git object.');
  const files = readArchive(git(brokerDir, ['archive', '--format=tar', sha, 'docs'], null));
  const dates = [];
  for (const [name, data] of files) {
    const lastCommitDate = git(brokerDir, ['log', '-1', '--format=%cI', sha, '--', `:(literal)docs/${name}`]).trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(lastCommitDate)) {
      throw new Error(`No commit date found for docs/${name}.`);
    }
    dates.push([name, {lastCommitDate}]);
    const rendered = addFrontMatter(name, data);
    if (rendered !== data) log(`${dryRun ? 'Would add' : 'Added'} front matter: ${name}`);
    files.set(name, rendered);
  }
  const manifest = {sha, files: Object.fromEntries(dates)};
  if (!dryRun) {
    const destination = path.join(siteDir, 'docs-content');
    if (existsSync(destination) && (!lstatSync(destination).isDirectory() || lstatSync(destination).isSymbolicLink())) {
      throw new Error('docs-content/ must be a directory, not a link or file.');
    }
    const temporary = mkdtempSync(path.join(siteDir, '.docs-content-sync-'));
    const staged = path.join(temporary, 'content');
    const previous = path.join(temporary, 'previous');
    try {
      mkdirSync(staged);
      for (const [name, data] of files) {
        const target = path.join(staged, name);
        mkdirSync(path.dirname(target), {recursive: true});
        writeFileSync(target, data);
      }
      writeFileSync(path.join(staged, '.sync.json'), `${JSON.stringify(manifest, null, 2)}\n`);
      if (existsSync(destination)) renameSync(destination, previous);
      try { renameSync(staged, destination); } catch (error) {
        if (existsSync(previous)) renameSync(previous, destination);
        throw error;
      }
    } finally {
      rmSync(temporary, {recursive: true, force: true});
    }
  }
  log(`${dryRun ? 'Dry run: would sync' : 'Synced'} ${files.size} files from broker ${sha}.`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const {values} = parseArgs({options: {ref: {type: 'string'}, 'dry-run': {type: 'boolean', default: false}}});
    syncDocs({ref: values.ref, dryRun: values['dry-run']});
  } catch (error) {
    console.error(`Docs sync failed: ${error.message}`);
    process.exitCode = 1;
  }
}
