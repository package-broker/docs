// Copy: v2-research/50-recommendations/landing/copy.md and notes.md.
export const releaseStatus = '2.0 pre-release: no tagged release yet';
export const pageTitle = 'PACKAGE.broker 2.0 | Composer & npm registry';
export const pageDescription = 'Self-hosted Composer and npm registry with per-project SSO grants and upstream credentials. Run on Cloudflare Workers or Node. Explore the 2.0 pre-release.';

export const claims = [
  {
    title: 'Per-project isolation by SSO group, with per-project upstream credentials',
    text: 'You grant a project to an SSO group or a single e-mail address. A source and its credentials can belong to one project, and only that project is served from it.',
    href: '/docs/decisions/registry-and-sources/', label: 'Sources and project boundaries',
  },
  {
    title: 'Composer and npm under one token policy',
    text: 'One token works as Composer HTTP Basic and as an npm Bearer token for npm, pnpm and Yarn Berry, and the same grants apply to both.',
    href: '/docs/decisions/secrets-and-tokens/', label: 'Token decisions',
  },
  {
    title: 'Self-hosted on Workers or Docker, under AGPL-3.0-only',
    text: 'Two runtimes share one core. Workers uses D1, R2 and Queues. Docker uses SQLite with filesystem or S3-compatible storage. Until the container image ships, run the Node bundle.',
    href: '/docs/architecture/', label: 'Architecture',
  },
  {
    title: 'OIDC groups from Dex or Cloudflare Access, mapped to projects',
    text: 'Sign-in goes through Cloudflare Access on Workers and Dex on Docker, both over OIDC. Package Broker has no local groups: a project grant names a group from your identity provider or a single e-mail address.',
    href: '/docs/decisions/identity-and-sessions/', label: 'Identity decisions',
  },
  {
    title: 'Token hygiene by default',
    text: 'Personal tokens expire within 90 days by default. CI service tokens are bound to one project and can be read-only. Creating any token requires a fresh sign-in.',
    href: '/docs/decisions/secrets-and-tokens/', label: 'Secrets and token policy',
  },
];

// Each answer is plain text so the rendered FAQ and FAQPage use identical text.
export const faqItems = [
  {
    question: 'Can I upgrade a v1 installation in place?',
    answer: 'No. Version 2.0 is a backwards-incompatible rewrite in package-broker/broker. The v1 repository, package-broker/server, receives security fixes only. The v1 documentation remains available under /v1/.',
    href: '/docs/decisions/release-and-versioning/', label: 'Release decisions (ADR-001 and ADR-023)',
  },
  {
    question: 'How are projects and customer deployments isolated?',
    answer: 'One deployment holds one organization with multiple projects. Project grants name identity-provider groups or individual e-mail addresses. A source and its credentials can belong to a project. Separate customer organizations require separate deployments.',
    href: '/docs/decisions/identity-and-sessions/', label: 'Organization and identity decisions (ADR-002 and ADR-009)',
  },
  {
    question: 'Can I use one token with Composer and npm?',
    answer: 'Yes. A personal token works with Composer HTTP Basic and npm Bearer authentication across npm, pnpm and Yarn Berry. It can cover selected projects or all of your projects. Effective access is limited by scopes, grants, your role and the project token policy.',
    href: '/docs/decisions/secrets-and-tokens/', label: 'Token kinds and scopes (ADR-010)',
  },
  {
    question: 'What do the two runtimes need?',
    answer: 'Workers requires the Workers Paid plan and uses D1, R2 and Queues. The Node runtime uses SQLite and filesystem or S3-compatible blob storage. Both share the same core. A Docker image is planned; the quickstart currently runs the Node bundle.',
    href: '/docs/decisions/platform-ports-and-adapters/', label: 'Runtime decisions (ADR-003)',
  },
  {
    question: 'How quickly does removing access take effect?',
    answer: 'Broker-side changes, including removed grants, disabled users and revoked tokens, apply on the next request. Identity-provider group changes apply within five minutes where a directory API or push is available; otherwise they apply at the next sign-in or session expiry. Sessions have a 12-hour lifetime and a one-hour idle timeout.',
    href: '/docs/decisions/identity-and-sessions/', label: 'Session and revocation decisions (ADR-011)',
  },
  {
    question: 'How long do personal and CI tokens last?',
    answer: 'The default maximum expiry is 90 days. Read-only CI service tokens may last one year. Service tokens are bound to one project, with an organization-wide exception for organization admins. Creating a token requires re-authentication.',
    href: '/docs/decisions/secrets-and-tokens/', label: 'Token expiry decisions (ADR-010)',
  },
];

// The LLM plugin reads Markdown, not TSX pages. Include this in both generated
// files through rootContent/fullRootContent, without a competing static llms.txt.
export const landingSummary = `## Package Broker 2.0\n\n[Homepage](https://package.broker/)\n\n${releaseStatus}.\n\n${claims.map((claim, index) => `${index + 1}. ${claim.title}. ${claim.text}`).join('\n\n')}\n\nThe Docker image is planned; today the Node quickstart runs the bundle directly. Workers requires the Workers Paid plan, Node 24 and pnpm. Workers deployment uses pb cloudflare setup after cloning, pnpm install --frozen-lockfile and pnpm build. Version 2.0 does not upgrade v1 in place. [v1 documentation](https://package.broker/v1/).`;

// origin/main: README.md prerequisites/build; packages/cli/src/cli.ts USAGE:31.
// setup builds, provisions, migrates, deploys and bootstraps; no wrangler step.
export const workersCommands = `git clone https://github.com/package-broker/broker.git
cd broker
corepack enable
pnpm install --frozen-lockfile && pnpm build

export CLOUDFLARE_API_TOKEN='replace-with-your-token'
export CLOUDFLARE_ACCOUNT_ID='replace-with-your-account-id'
pnpm pb cloudflare setup \\
  --worker-name acme-broker \\
  --org-slug acme --org-name "Acme" \\
  --admin-email you@example.com`;

// origin/main: README.md (pb build stages assets), scripts/node-bundle-smoke.mjs
// (production dependencies/env/server.js), runtime-node/src/entry.ts|startup.ts
// (port 8787, migrations, organization bootstrap); cli.ts USAGE:28,39,40;
// docs/workers-install.md (one-time admin setup). No manual UI copy is needed.
export const nodeCommands = `git clone https://github.com/package-broker/broker.git
cd broker
corepack enable
pnpm install --frozen-lockfile && pnpm build
pnpm pb build --config broker.config.ts --target node
export PB_MASTER_KEY="$(pnpm --silent pb secrets generate-master-key)"

cd .pb/node
npm install --omit=dev
PB_PUBLIC_URL=http://localhost:8787 \\
PB_SQLITE_PATH=./data/db.sqlite \\
PB_BLOB_ROOT=./data/blobs \\
PB_ORG_SLUG=acme PB_ORG_NAME="Acme" \\
node server.js

# In a second shell, from the repository root:
pnpm pb admin bootstrap --email you@example.com \\
  --sqlite .pb/node/data/db.sqlite`;
