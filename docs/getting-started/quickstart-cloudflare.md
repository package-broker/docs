---
title: 'Quickstart: Cloudflare'
sidebar_position: 1
description: Build and deploy the Package Broker 2.0 pre-release with pb cloudflare setup.
---

Package Broker 2.0 is a pre-release with no tagged release yet. Start from a source checkout with Node 24, pnpm and a Cloudflare account on the **Workers Paid plan**.

## Build the checkout

{/* Source: origin/main README.md, Prerequisites and Build with a plugin set. */}
```sh
git clone https://github.com/package-broker/broker.git
cd broker
corepack enable
pnpm install --frozen-lockfile && pnpm build
```

## Run interactive setup

Set your Cloudflare API token and account ID in the environment. Run setup in an interactive terminal, using a worker name unique to your account and your own administrator e-mail address.

{/* Source: origin/main packages/cli/src/cli.ts USAGE:31 and packages/cli/src/commands/cloudflare/setup.ts. */}
```sh
export CLOUDFLARE_API_TOKEN='replace-with-your-token'
export CLOUDFLARE_ACCOUNT_ID='replace-with-your-account-id'
pnpm pb cloudflare setup \
  --worker-name acme-broker \
  --org-slug acme --org-name "Acme" \
  --admin-email you@example.com
```

The command builds the Worker artifact, provisions resources, applies migrations, deploys and bootstraps the organization and administrator. Follow the prompts, review the resource creation plan and confirm it. Save the master key securely for subsequent deployments and recovery. The generated private inventory under `.pb/` records resource ownership and setup progress; preserve it.

## Finish administrator enrollment

Open `/_pb/ui/setup` at the broker's public address and use the one-time setup token delivered by the CLI. Follow [administrator setup](../workers-install.md) to choose a password and enroll an authenticator. Ordinary package access uses tokens; OIDC sign-in is configured separately according to the [identity decisions](../decisions/identity-and-sessions.md).

Before exposing custom domains or self-origin aliases, review [Workers fill limits and self-origin aliases](../reference/workers-fill-limits.md) for metadata sizing, D1 invocation budgets and required outbound deny entries.
