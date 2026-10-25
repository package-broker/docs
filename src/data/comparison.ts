import {repository} from './landing';

export type ComparisonCell = {
  value: string;
  sourceUrl: string | null;
  lastVerified: string | null;
};

const satis = 'https://github.com/composer/satis';
const packagist = 'https://packagist.com';
const packeton = 'https://github.com/vtsykun/packeton';
const packetonDocs = 'https://docs.packeton.org/';

// Competitor evidence: growth/50-recommendations/mocks/index.html,
// comparison source comments checked 2026-10-17. No new online verification.
const checked = (value: string, sourceUrl: string): ComparisonCell => ({value, sourceUrl, lastVerified: '2026-10-17'});
const broker = (value: string, path: string): ComparisonCell => ({value, sourceUrl: `${repository}/blob/main/${path}`, lastVerified: '2026-10-25'});
const notVerified: ComparisonCell = {value: 'Not verified', sourceUrl: null, lastVerified: null};

// The mock combines authentication and SSO. Repeat that evidence in both rows;
// it does not establish separate registry-token capabilities for competitors.
const authentication = [
  checked('None built in; access is set at the web server.', satis),
  notVerified,
  checked('JWT, LDAP and OIDC.', packetonDocs),
];

export const comparisons = [
  {name: 'Satis', href: '/compare/satis', migration: '/docs/migration/from-satis', source: satis},
  {name: 'Private Packagist', href: '/compare/private-packagist', migration: '/docs/migration/from-private-packagist', source: `${packagist}/docs`},
  {name: 'Packeton', href: '/compare/packeton', migration: '/docs/migration/from-packeton', source: packetonDocs},
];

export const comparisonRows: {criterion: string; cells: ComparisonCell[]}[] = [
  {criterion: 'Authentication', cells: [
    broker('Personal and service tokens for Composer and npm.', 'docs/decisions/secrets-and-tokens.md'),
    ...authentication,
  ]},
  {criterion: 'Isolation per client', cells: [
    broker('Separate projects and source credentials.', 'docs/reference/access-model.md'),
    checked('One static repository per build; no per-client access control.', satis),
    checked('Suborganizations.', `${packagist}/pricing`),
    notVerified,
  ]},
  {criterion: 'npm registry', cells: [
    broker('Composer and npm use one token policy.', 'docs/decisions/secrets-and-tokens.md'),
    checked('No; Composer only.', satis),
    notVerified,
    checked('PHP packages; npm not listed.', packeton),
  ]},
  {criterion: 'SSO', cells: [
    broker('OIDC groups mapped to project grants.', 'docs/decisions/identity-and-sessions.md'),
    ...authentication,
  ]},
  {criterion: 'Self-hosting', cells: [
    broker('Cloudflare Workers or Node. Container image publishing (GHCR) is planned; build the image from the repository.', 'Dockerfile'),
    checked('Static files on any web server.', satis),
    checked('A self-hosted edition exists; hosted option as well.', `${packagist}/self-hosted`),
    checked('Docker image or source install.', packeton),
  ]},
  {criterion: 'Licence', cells: [
    broker('AGPL-3.0-only.', 'LICENSE'),
    // The mock cites the research Alternatives table for Satis MIT licensing.
    checked('MIT.', satis),
    notVerified,
    checked('MIT.', packeton),
  ]},
  {criterion: 'Price model', cells: [
    broker('Your Cloudflare plan or host, storage and operations.', 'README.md'),
    checked('The cost of your own host.', satis),
    checked('Per user and suborganization; see their pricing page.', `${packagist}/pricing`),
    checked('The cost of your own host.', packeton),
  ]},
];
