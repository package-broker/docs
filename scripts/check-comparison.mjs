import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {productFacts, productRevision} from './comparison-product-facts.mjs';

const text = {type: 'string', minLength: 1};
const url = {...text, pattern: '^https://'};
const date = {...text, pattern: '^\\d{4}-\\d{2}-\\d{2}$'};
const provenance = {
  value: text, sourceUrl: url, lastVerified: date,
  verified: {type: 'boolean'}, quote: {type: 'string'},
};
const object = (properties, required = Object.keys(properties)) => ({type: 'object', properties, required, additionalProperties: false});
const array = (items, minItems, maxItems = minItems) => ({type: 'array', items, minItems, maxItems});
const criterionIds = ['auth', 'isolation', 'npm', 'sso', 'self-host', 'licence', 'price'];
const productIds = ['package-broker', 'satis', 'private-packagist', 'packeton'];
const cellSchema = object({
  criterionId: {enum: criterionIds}, productId: {enum: productIds}, ...provenance,
  planName: text, priceSourceUrl: url,
}, ['criterionId', 'productId', ...Object.keys(provenance)]);

// JSON Schema vocabulary used here is deliberately small so the gate needs only Node.
export const comparisonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  ...object({
    productRevision: {...text, pattern: '^[0-9a-f]{40}$'},
    products: array(object({
      id: {enum: productIds}, name: text, sourceUrl: url,
      migration: object({href: {...text, pattern: '^/docs/migration/from-(satis|private-packagist|packeton)$'}, published: {type: 'boolean'}}),
      fit: object(provenance),
    }, ['id', 'name']), 4),
    summaryCriteria: array(object({label: text, criterionIds: {...array({enum: criterionIds}, 1, 2), uniqueItems: true}}), 6),
    criteria: array(object({id: {enum: criterionIds}, label: text, cells: array(cellSchema, 4)}), 7),
  }),
};

export function validateSchema(value, schema, at = 'comparison') {
  const fail = message => {throw new Error(`${at}: ${message}`);};
  if (schema.enum && !schema.enum.includes(value)) fail('unexpected value');
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('expected object');
    for (const key of schema.required) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(schema.properties, key)) fail(`unexpected field ${key}`);
      validateSchema(value[key], schema.properties[key], `${at}.${key}`);
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) fail('expected array');
    if (value.length < schema.minItems || value.length > schema.maxItems) fail('incorrect item count');
    if (schema.uniqueItems && new Set(value).size !== value.length) fail('duplicate items');
    value.forEach((item, index) => validateSchema(item, schema.items, `${at}[${index}]`));
  } else if (schema.type) {
    if (typeof value !== schema.type) fail(`expected ${schema.type}`);
    if (schema.minLength && value.trim().length < schema.minLength) fail('empty value');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(`must match ${schema.pattern}`);
  }
}

export function checkComparison(data, now = new Date()) {
  validateSchema(data, comparisonSchema);
  if (data.productRevision !== productRevision) throw new Error('Product revision differs from reviewed allowlist');
  const uniqueIds = (items, expected, label) => {
    if (new Set(items).size !== items.length || expected.some(id => !items.includes(id))) throw new Error(`${label}: missing or duplicate ids`);
  };
  uniqueIds(data.products.map(product => product.id), productIds, 'products');
  uniqueIds(data.criteria.map(row => row.id), criterionIds, 'criteria');
  uniqueIds(data.summaryCriteria.flatMap(row => row.criterionIds), criterionIds, 'summary criteria');
  const review = (cell, label) => {
    const checked = new Date(`${cell.lastVerified}T00:00:00Z`);
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (!Number.isFinite(checked.getTime()) || checked.toISOString().slice(0, 10) !== cell.lastVerified) throw new Error(`${label}: invalid lastVerified`);
    const age = (today - checked.getTime()) / 86400000;
    // A date-only review may be recorded in a timezone already on the next UTC day.
    if (age < -1 || age > 90) throw new Error(`${label}: lastVerified is in the future or older than 90 days`);
    for (const source of [cell.sourceUrl, cell.priceSourceUrl].filter(Boolean)) {
      const parsed = new URL(source);
      if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) throw new Error(`${label}: source must be an HTTPS URL`);
    }
    if (cell.quote.trim().split(/\s+/u).filter(Boolean).length > 25) throw new Error(`${label}: quote exceeds 25 words`);
  };
  for (const product of data.products) {
    if (product.id === 'package-broker') continue;
    if (!product.sourceUrl || !product.fit || !product.migration) throw new Error(`${product.id}: missing page data`);
    if (product.migration.href !== `/docs/migration/from-${product.id}`) throw new Error(`${product.id}: wrong migration path`);
    review(product.fit, `${product.id}/fit`);
  }
  for (const row of data.criteria) {
    uniqueIds(row.cells.map(cell => cell.productId), productIds, row.id);
    for (const cell of row.cells) {
      const label = `${cell.productId}/${row.id}`;
      if (cell.criterionId !== row.id) throw new Error(`${label}: criterion id differs from row`);
      review(cell, label);
      if (cell.productId === 'package-broker') {
        const fact = productFacts[row.id];
        if (!cell.verified || ['value', 'sourceUrl', 'quote', 'planName', 'priceSourceUrl'].some(key => cell[key] !== fact[key])) throw new Error(`${label}: claim is not in the sourced product allowlist`);
      }
      if (row.id === 'price') {
        if (!cell.planName || !cell.priceSourceUrl || cell.priceSourceUrl !== cell.sourceUrl) throw new Error(`${label}: price needs planName and priceSourceUrl`);
        // Amounts need explicit price evidence; this packet deliberately publishes models only.
        if (/[\d$€£]|\b(?:USD|EUR|GBP)\b/u.test(cell.value)) throw new Error(`${label}: numeric price has no reviewed amount evidence`);
      }
    }
  }
  return data.criteria.flatMap(row => row.cells).length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const data = JSON.parse(readFileSync(new URL('../src/data/comparison.json', import.meta.url), 'utf8'));
    console.log(`Comparison gate passed: ${checkComparison(data)} cited cells; product claims match reviewed facts.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
