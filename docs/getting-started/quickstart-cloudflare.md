---
sidebar_position: 3
title: Quickstart (Cloudflare Workers)
description: Deploy PACKAGE.broker on Cloudflare's edge network for zero-cost, global distribution
---

# Quickstart: Cloudflare Workers

Deploy PACKAGE.broker on Cloudflare Workers for edge-optimized, serverless package proxying.

## Choose Your Deployment Method

We offer two ways to deploy:

1. **Interactive CLI** (recommended) - One-command setup with guided prompts
2. **GitHub Template** - Fork-and-deploy with automated GitHub Actions

## Method 1: Interactive CLI (Recommended)

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Authenticated with Cloudflare (`npx wrangler login`)

### Step 1: Install and Initialize

```bash
$ npm init -y
$ npm install @package-broker/cloudflare @package-broker/main
$ npx package-broker-cloudflare init
```

The CLI will guide you through:
- **Tier selection**: Free or Paid tier
- **Worker name**: Customize or use default
- **Resource creation**: Automatically creates D1, KV, R2 (and Queue if paid tier)
- **Secret management**: Sets `ENCRYPTION_KEY` as Cloudflare secret
- **Deployment**: Optionally deploys immediately

### What Happens Automatically

1. ✅ Generates encryption key
2. ✅ Creates D1 database
3. ✅ Creates KV namespace
4. ✅ Creates R2 bucket
5. ✅ Creates Queue (if paid tier)
6. ✅ Sets `ENCRYPTION_KEY` as Cloudflare secret (not in `wrangler.toml`)
7. ✅ Generates `wrangler.toml` with all resource IDs
8. ✅ Copies migration files
9. ✅ Applies migrations (if deploying)
10. ✅ Deploys Worker (if confirmed)

### After Deployment

1. Open your Worker URL (shown in CLI output)
2. Complete initial setup (email + password)
3. Create an access token in the dashboard
4. Start adding repository sources

## Method 2: GitHub Template (CI/CD)

### Prerequisites

- A GitHub account
- A Cloudflare account

### Step 1: Use Template

1. Go to [package-broker/cloudflare-template](https://github.com/package-broker/cloudflare-template)
2. Click **"Use this template"**
3. Create your repository

### Step 2: Configure Secrets and Variables

In your repository: **Settings → Secrets and variables → Actions**

#### Required Secrets

- **`CLOUDFLARE_API_TOKEN`** - Your Cloudflare API token
  - Create at: https://dash.cloudflare.com/profile/api-tokens
  - **Required permissions**: See [API Token Permissions](#api-token-permissions) below
- **`ENCRYPTION_KEY`** - Generate with: `openssl rand -base64 32`

#### Required Variables

- **`CLOUDFLARE_ACCOUNT_ID`** - Your Cloudflare account ID (found in dashboard)

#### Optional Variables

- **`WORKER_NAME`** - Custom worker name (defaults to repository name)
- **`CLOUDFLARE_TIER`** - `free` or `paid` (defaults to `free`)

### Step 3: Deploy

Push to `main` branch or manually trigger the workflow from the **Actions** tab.

The workflow automatically:
- Validates configuration
- Creates Cloudflare resources
- Generates `wrangler.toml`
- Sets secrets
- Applies migrations
- Deploys the Worker

## API Token Permissions

:::note Required Permissions

Your `CLOUDFLARE_API_TOKEN` must be a **scoped API token** (not Global API Key) with at least **Edit** permissions for:

- **Workers** - Workers Scripts (deploy/update Worker)
- **D1** - Create/list databases, run migrations
- **KV** - Create/list namespaces
- **R2** - Create/list buckets
- **Queues** (paid tier only) - Create/list queues

**Optional** (recommended for better error messages):
- **Account** - Account Settings (Read)

**Important**:
- Do **not** use the Global API Key
- Keep the token **account-scoped** and minimal
- Route/zone permissions are only needed for custom domains (not required for `workers.dev`)

:::

## Security: Encryption Key

The `ENCRYPTION_KEY` is **never stored in `wrangler.toml`**. It's set as a Cloudflare secret:

- **CLI**: Automatically set via `wrangler secret put ENCRYPTION_KEY`
- **GitHub Actions**: Set automatically during workflow
- **Manual**: Use `wrangler secret put ENCRYPTION_KEY` or set via Cloudflare dashboard

To update the key:
- Via CLI: `wrangler secret put ENCRYPTION_KEY`
- Via Dashboard: Workers & Pages → Settings → Variables and Secrets

## Initial Setup

After deployment, complete the initial setup:

1. Open your Worker URL in a browser
2. Enter your email address
3. Set a secure password
4. Click **"Complete Setup"**

## Create an Access Token

1. Navigate to **Access Tokens** in the dashboard
2. Click **Create Token**
3. Enter a description
4. Select permissions (readonly or write)
5. Click **Create**
6. **Copy the token immediately**

## Verify Installation

Test the health endpoint:

```bash
$ curl https://your-worker.workers.dev/health
```

**Expected output:**
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## Free Tier Limitations

Cloudflare Workers free tier includes:

- **100,000 requests/day** per account
- **10ms CPU time** per request
- **128MB memory** per request
- **D1**: 5GB storage, 5 million reads/month, 100,000 writes/month
- **R2**: 10GB storage, 1 million Class A operations/month
- **KV**: 100,000 reads/day, 1,000 writes/day

For production workloads, consider the **Workers Paid** plan ($5/month) for:
- Unlimited requests
- Higher CPU time limits
- Queue support for async operations

## Troubleshooting

### CLI: Authentication Failed

If the CLI says you're not authenticated:

```bash
$ npx wrangler login
```

### CLI: Resource Creation Fails

- Verify you're authenticated: `npx wrangler whoami`
- Check your API token has the required permissions (see above)
- Ensure you have available quota for the resource type

### GitHub Actions: Workflow Fails

- Verify all required secrets and variables are set
- Check secret/variable names are exact (case-sensitive)
- Review workflow logs for specific error messages
- See [SETUP.md](https://github.com/package-broker/cloudflare-template/blob/main/SETUP.md) for detailed troubleshooting

### Database Migration Errors

Migrations are applied automatically. If they fail:

```bash
# Check migration status
$ npx wrangler d1 migrations list <worker-name>-db --remote

# Manually re-run migrations if needed
$ npx wrangler d1 migrations apply <worker-name>-db --remote
```

### Can't Access Dashboard

- Verify the Worker deployed successfully: `npx wrangler deployments list`
- Check Worker logs: `npx wrangler tail`
- Ensure you're using HTTPS (required for Workers)

## Upgrading PACKAGE.broker

### CLI Method

```bash
$ npm update @package-broker/cloudflare @package-broker/main
$ npx wrangler deploy
```

### GitHub Template Method

Update `package.json` in your repository:

```json
{
  "dependencies": {
    "@package-broker/main": "^0.2.12"
  }
}
```

Then push to `main` branch - the workflow will automatically deploy the new version.

## Project Structure

After initialization, your project structure will look like:

```
package-broker-deployment/
├── node_modules/
├── migrations/          # Database migration files (auto-copied)
├── wrangler.toml        # Cloudflare Workers configuration (auto-generated)
├── package.json
└── package-lock.json
```

**Note**: `wrangler.toml` does **not** contain `ENCRYPTION_KEY` - it's set as a Cloudflare secret.

## Next Steps

- Learn about production deployment: [Deployment Overview](../deployment/overview)
- Understand authentication: [Token Management](../administration/tokens)
- Review operations: [Backups and Restore](../operations/backups-restore) and [Scaling](../operations/scaling)
- Check [Roadmap](../reference/roadmap) for upcoming features
