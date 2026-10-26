export const repository = 'https://github.com/package-broker/broker';
// Enable full-guide links after their synced content replaces the stub.
export const workersQuickstartPublished = true;
export const dockerQuickstartPublished = true;
export const workersQuickstartDoc = '/docs/getting-started/quickstart-cloudflare';
export const workersQuickstart = workersQuickstartPublished ? workersQuickstartDoc : '/#quickstart';
export const dockerQuickstart = '/docs/getting-started/quickstart-docker';
export const comparisonsPublished = true;
export const agenciesPublished = true;
export const releaseStatus = '2.0 is in development; no tagged release yet';

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
// docs/workers-install.md; clone URL from docs/decisions/release-and-versioning.md. Run in a broker source checkout; WEB-14 verifies deployment.
export const workersCommands = `git clone https://github.com/package-broker/broker.git
cd broker
pnpm install --frozen-lockfile
pnpm build
pnpm pb cloudflare setup \\
  --worker-name <worker-name> \\
  --org-slug <organization-slug> \\
  --org-name "<organization-name>" \\
  --admin-email <email> \\
  --key-file <master-key-file> \\
  --token-file <setup-token-file>`;

// [verify command] Source: origin/main:Dockerfile (runtime CLI, port and volume),
// packages/cli/src/cli.ts (USAGE), commands/admin.ts (key and setup-token output); clone URL from docs/decisions/release-and-versioning.md.
// Run in a broker source checkout. Wait for /health/ready before admin bootstrap.
export const dockerCommands = `git clone https://github.com/package-broker/broker.git
cd broker
docker build -t package-broker .
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

