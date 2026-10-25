export const repository = 'https://github.com/package-broker/broker';
export const workersQuickstart = '/docs/getting-started/quickstart-cloudflare';
export const dockerQuickstart = '/docs/getting-started/quickstart-docker';
export const comparisonsPublished = false;
export const releaseStatus = '2.0.0-rc.X, pre-release; no tagged release yet';

export const headerLinks = [
  {label: 'Docs', href: '/docs/architecture'},
  {label: 'Deploy', href: '/#quickstart'},
  {label: 'Security', href: '/docs/security-and-residency'},
  {label: 'Agencies', href: '/#claims'},
  {label: 'Compare', href: '/#compare'},
  {label: 'GitHub', href: repository},
];
export const footerLinks = [
  ...headerLinks.slice(0, 3),
  {label: 'Governance', href: `${repository}/blob/main/GOVERNANCE.md`},
  {label: 'Contributing', href: `${repository}/blob/main/CONTRIBUTING.md`},
  {label: 'Code of conduct', href: `${repository}/blob/main/CODE_OF_CONDUCT.md`},
  {label: 'GitHub', href: repository},
  {label: 'Discussions', href: `${repository}/discussions`},
];

// [verify command] Source: origin/main:packages/cli/src/cli.ts (USAGE), README.md,
// docs/workers-install.md. Run in a broker source checkout; WEB-14 verifies deployment.
export const workersCommands = `pnpm install --frozen-lockfile
pnpm build
pnpm pb cloudflare setup \\
  --worker-name <worker-name> \\
  --org-slug <organization-slug> \\
  --org-name "<organization-name>" \\
  --admin-email <email> \\
  --key-file <master-key-file> \\
  --token-file <setup-token-file>`;

// [verify command] Source: origin/main:README.md (build and whole-output deployment),
// scripts/node-bundle-smoke.mjs (server environment), packages/cli/src/cli.ts.
// README.md says the GHCR image is planned; use the supported Node output meanwhile.
export const dockerCommands = `pnpm install --frozen-lockfile
pnpm build
pnpm pb build --config broker.config.ts --target node
cd .pb/node
npm install --omit=dev
export PB_MASTER_KEY='<master-key>'
export PB_SQLITE_PATH='<absolute-data-directory>/db.sqlite'
export PB_BLOB_ROOT='<absolute-data-directory>/blobs'
export PB_ORG_SLUG='<organization-slug>'
export PB_ORG_NAME='<organization-name>'
export PB_PUBLIC_URL='http://localhost:8787'
node server.js`;

export const claims = [
  {
    title: 'Per-project isolation by SSO group, with per-project source credentials',
    mechanism: 'Identity provider groups grant access to projects, and each project selects sources with credentials for that client.',
    prevents: "A package bought for client A reaching client B’s developers when each client has its own project and sources.",
    label: 'Access model reference', href: '/docs/reference/access-model',
  },
  {
    title: 'Composer and npm under one token policy',
    mechanism: 'The same token kinds, expiry policy and revocation apply to Composer and npm within a project.',
    prevents: 'A second set of registry credentials for your front-end packages.',
    label: 'Composer and npm token model', href: '/docs/decisions/secrets-and-tokens',
  },
  {
    title: 'Self-hosted on Workers or Node, under AGPL',
    mechanism: 'You deploy the broker to Cloudflare Workers or run the Node bundle on your host under AGPL-3.0-only.',
    prevents: 'Depending on a hosted registry operator to retain control of your package index.',
    label: 'Cloudflare Workers quickstart', href: workersQuickstart,
  },
  {
    title: 'OIDC groups mapped to projects',
    mechanism: 'Dex or Cloudflare Access supplies identity provider groups that you map to project grants.',
    prevents: 'Maintaining a separate list of people for every project.',
    label: 'Identity and project grants', href: '/docs/decisions/identity-and-sessions',
  },
  {
    title: 'Token hygiene by default',
    mechanism: 'Token issuance requires fresh authentication, expiry follows your configured policy, and you can issue a service token with read scope for one project.',
    prevents: 'A leaked install token publishing packages or reading another project when its scope is read and it is limited to one project.',
    label: 'Token scopes and revocation', href: '/docs/decisions/secrets-and-tokens',
  },
];

export const comparisonRows = [
  ['Authentication', 'Personal and service tokens for Composer and npm.'],
  ['Isolation per client', 'Separate projects and source credentials.'],
  ['npm registry', 'Composer and npm use one token policy.'],
  ['SSO', 'OIDC groups mapped to project grants.'],
  ['Self-hosting', 'Cloudflare Workers or the Node bundle; Docker image planned.'],
  ['Licence', 'AGPL-3.0-only.'],
  ['Price model', 'Your Cloudflare plan or host, storage and operations.'],
];
export const comparisons = [
  {name: 'Satis', href: '/compare/satis', migration: '/docs/migration/from-satis', source: 'https://github.com/composer/satis'},
  {name: 'Private Packagist', href: '/compare/private-packagist', migration: '/docs/migration/from-private-packagist', source: 'https://packagist.com/docs'},
  {name: 'Packeton', href: '/compare/packeton', migration: '/docs/migration/from-packeton', source: 'https://docs.packeton.org/'},
];
