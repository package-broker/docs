const {execFileSync} = require('node:child_process');
const path = require('node:path');

module.exports = function comparisonValidation() {
  execFileSync(process.execPath, [path.join(__dirname, '../scripts/check-comparison.mjs')], {stdio: 'inherit'});
  return {name: 'comparison-validation'};
};
