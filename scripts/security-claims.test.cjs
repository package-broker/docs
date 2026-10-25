const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, existsSync} = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const ts = require('typescript');

// Run the actual site data module using the same CommonJS target as the site.
function loadData(filename) {
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true},
  }).outputText;
  const module = {exports: {}};
  const localRequire = createRequire(filename);
  new Function('require', 'module', 'exports', code)(specifier => {
    const candidate = path.resolve(path.dirname(filename), `${specifier}.ts`);
    return specifier.startsWith('.') && existsSync(candidate) ? loadData(candidate) : localRequire(specifier);
  }, module, module.exports);
  return module.exports;
}

const {publishedClaim, securityClaims, tokenKinds, operatorResponsibilities} = loadData(path.resolve(__dirname, '../src/data/security-claims.ts'));

test('security prose and table rows require shipped status and nonempty sources', () => {
  for (const item of [...securityClaims, ...tokenKinds, ...operatorResponsibilities]) {
    if (item.status === 'shipped') assert.equal(publishedClaim(item), item);
    else assert.throws(() => publishedClaim(item.id), /Unpublished security claim/);
  }
  assert.throws(() => publishedClaim('missing'), /Unpublished security claim/);
  for (const row of [securityClaims[0], tokenKinds[0], operatorResponsibilities[0]]) {
    for (const status of ['planned', 'unknown']) {
      assert.throws(() => publishedClaim({...row, status}), /Unpublished security claim/);
    }
    for (const sources of [[], [''], ['   ']]) {
      assert.throws(() => publishedClaim({...row, sources}), /Unpublished security claim/);
    }
  }
});
