// Verified cells only: landing/notes.md §4, checked 2026-10-19.
// Private Packagist customer/suborganization access is also awaiting re-check.
const upstream = 'https://github.com/package-broker/broker/blob/main/';
export const comparisonSources = [
  {id: 'pb-formats', label: 'Package Broker formats (ADR-005)', url: '/docs/decisions/registry-and-sources/'},
  {id: 'pb-identity', label: 'Package Broker grants and identity (ADR-009)', url: '/docs/decisions/identity-and-sessions/'},
  {id: 'pb-sources', label: 'Package Broker project sources (ADR-007)', url: '/docs/decisions/registry-and-sources/'},
  {id: 'pb-tokens', label: 'Package Broker token policy (ADR-010)', url: '/docs/decisions/secrets-and-tokens/'},
  {id: 'pb-runtimes', label: 'Package Broker runtimes and image status (README)', url: `${upstream}README.md`},
  {id: 'pb-license', label: 'Package Broker licence (ADR-001)', url: '/docs/decisions/licensing-and-contribution-terms/'},
  {id: 'satis', label: 'Satis README (formats, access, hosting, licence)', url: 'https://github.com/composer/satis#readme'},
  {id: 'pp-formats', label: 'Private Packagist (Composer packages)', url: 'https://packagist.com/'},
  {id: 'pp-auth', label: 'Private Packagist authentication and editions', url: 'https://packagist.com/docs/centralized-authentication-and-sso'},
  {id: 'pp-ci', label: 'Private Packagist CI/CD tokens (checked 2026-10-16)', url: 'https://packagist.com/docs/setup-ci-cd'},
  {id: 'pp-license', label: 'Private Packagist subscription', url: 'https://packagist.com/pricing'},
  {id: 'packeton', label: 'Packeton README (Composer API, ACLs, tokens, hosting, licence)', url: 'https://github.com/vtsykun/packeton#readme'},
  {id: 'packeton-oidc', label: 'Packeton generic OIDC and role mapping', url: 'https://github.com/vtsykun/packeton/blob/master/docs/oauth2/oidc.md'},
];

type Cell = {text: string; source: string; verified: boolean};
const verified = (text: string, source: string): Cell => ({text, source, verified: true});
const undocumented = (text = 'Not documented', source = ''): Cell => ({text, source, verified: false});
const pb = (text: string, source: string) => verified(text, source);
export const comparisonProducts = ['Package Broker 2.0', 'Satis', 'Private Packagist', 'Packeton'];
export const comparisonRows: {label: string; cells: Cell[]}[] = [
  {label: 'Package formats', cells: [pb('Composer and npm', 'pb-formats'), verified('Composer', 'satis'), undocumented('Composer; npm: Not documented', 'pp-formats'), undocumented('Composer; npm: Not documented', 'packeton')]},
  {label: 'Access per project or customer', cells: [pb('Project package subsets; grants to SSO groups or e-mail addresses', 'pb-identity'), verified('None built in; protect it at the web server', 'satis'), undocumented(), verified('Customer users and ACL groups, limited by vendor and version', 'packeton')]},
  {label: 'Upstream credentials per project', cells: [pb('A source and its credentials can belong to one project', 'pb-sources'), undocumented(), undocumented(), undocumented()]},
  {label: 'Sign-in', cells: [pb('OIDC through Cloudflare Access or Dex; identity-provider groups map to projects', 'pb-identity'), verified('No accounts', 'satis'), verified('OAuth through GitHub, GitLab or Bitbucket; SAML or OIDC through those platforms', 'pp-auth'), verified('OAuth2, generic OIDC and LDAP; groups map to roles', 'packeton-oidc')]},
  {label: 'CI tokens', cells: [pb('Project-bound service tokens; read-only allowed for up to one year; organization-wide exception for admins', 'pb-tokens'), verified('No tokens', 'satis'), verified('Read-only and update tokens; read-only tokens are not counted as users', 'pp-ci'), verified('Per-user API token', 'packeton')]},
  {label: 'How it runs', cells: [pb('Self-hosted: Workers (Paid plan) or Node; Docker image planned', 'pb-runtimes'), verified('Self-hosted build producing static files; Docker image available', 'satis'), verified('Hosted (Cloud) or Self-Hosted edition', 'pp-auth'), verified('Self-hosted PHP application; Docker image available', 'packeton')]},
  {label: 'Licence', cells: [pb('AGPL-3.0-only', 'pb-license'), verified('MIT', 'satis'), verified('Commercial subscription', 'pp-license'), verified('MIT', 'packeton')]},
];
