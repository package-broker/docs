export const repository = 'https://github.com/package-broker/broker';
// Enable full-guide links after their synced content replaces the stub.
export const workersQuickstartPublished = false;
export const dockerQuickstartPublished = false;
export const workersQuickstartDoc = '/docs/getting-started/quickstart-cloudflare';
export const workersQuickstart = workersQuickstartPublished ? workersQuickstartDoc : '/#quickstart';
export const dockerQuickstart = '/docs/getting-started/quickstart-docker';
export const comparisonsPublished = true;
export const agenciesPublished = true;
export const releaseStatus = '2.0.0-rc.X, pre-release; no tagged release yet';

export const docsLinks = [
  {label: 'Docs', to: '/docs/architecture'},
  {label: 'GitHub', href: repository},
  {label: 'Security', to: '/docs/security-and-residency'},
];
export const headerLinks = [
  {label: 'Docs', to: '/docs/architecture'},
  {label: 'Deploy', to: '/#quickstart'},
  {label: 'Security', to: '/security'},
  ...(agenciesPublished ? [{label: 'Agencies', to: '/agencies'}] : []),
  ...(comparisonsPublished ? [{label: 'Compare', to: '/compare/private-packagist'}] : []),
  {label: 'GitHub', href: repository},
];
export const footerLinks = [
  ...headerLinks.slice(0, 3),
  ...(agenciesPublished ? [{label: 'Agencies', to: '/agencies'}] : []),
  ...(comparisonsPublished ? [{label: 'Compare', to: '/compare/private-packagist'}] : []),
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

// [verify command] Source: origin/main:Dockerfile (runtime CLI, port and volume),
// packages/cli/src/cli.ts (USAGE), commands/admin.ts (key and setup-token output).
// Run in a broker source checkout. Wait for /health/ready before admin bootstrap.
export const dockerCommands = `docker build -t package-broker .
pnpm install --frozen-lockfile
pnpm build
pnpm pb secrets generate-master-key
export PB_MASTER_KEY='<generated-master-key>'
docker run -d --name package-broker \\
  -p 8787:8787 -v pb-data:/data \\
  -e PB_MASTER_KEY \\
  -e PB_ORG_SLUG='<organization-slug>' \\
  -e PB_ORG_NAME='<organization-name>' \\
  -e PB_PUBLIC_URL='http://localhost:8787' \\
  package-broker
until [ "$(docker inspect --format '{{.State.Health.Status}}' package-broker)" = healthy ]; do
  sleep 1
done
docker exec -it package-broker node /app/cli/dist/bin.js admin bootstrap \\
  --email '<email>' --sqlite /data/broker.sqlite`;

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
    label: 'Deployment quickstart', href: workersQuickstart,
  },
  {
    title: 'OIDC groups mapped to projects',
    mechanism: 'Dex or Cloudflare Access supplies identity provider groups that you map to project grants.',
    prevents: 'Maintaining a separate list of people for every project.',
    label: 'Identity and project grants', href: '/docs/decisions/identity-and-sessions',
  },
  {
    title: 'Token hygiene by default',
    mechanism: 'Token issuance requires re-authentication, expiry follows your configured policy, and you can issue a service token with read scope for one project.',
    prevents: 'A leaked install token publishing packages or reading another project when its scope is read and it is limited to one project.',
    label: 'Token scopes and revocation', href: '/docs/decisions/secrets-and-tokens',
  },
];
