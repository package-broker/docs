---
sidebar_position: 3
title: Quickstart (Cloudflare Workers)
description: Deploy PACKAGE.broker on Cloudflare's edge network for zero-cost, global distribution
---

# Quickstart: Cloudflare Workers

Deploy PACKAGE.broker on Cloudflare Workers for edge-optimized, serverless package proxying.

:::tip Coming Soon: One-Command Setup
We're working on an interactive CLI that will reduce this to just:
```bash
npm install @package-broker/cloudflare
npx package-broker-cloudflare init --interactive
```
The CLI will automatically create resources, generate config, and deploy. [See roadmap](https://github.com/package-broker/server/issues).
:::

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- `npm` installed

## Step 1: Create Project Directory

Create a new directory for your PACKAGE.broker deployment:

```bash
$ mkdir package-broker-deployment
$ cd package-broker-deployment
```

## Step 2: Install PACKAGE.broker

Install PACKAGE.broker packages from npm:

```bash
$ npm init -y
$ npm install @package-broker/cli @package-broker/main
```

:::info Future: Single Package
In upcoming releases, this will be simplified to:
```bash
npm install @package-broker/cloudflare
```
:::

This installs:
- `@package-broker/main`: The main application package
- `@package-broker/cli`: CLI tool for initialization

## Step 3: Initialize Configuration

Run the CLI tool to initialize your project:

```bash
$ npx package-broker
```

:::info Future: Interactive Setup
The CLI will soon ask:
- Which tier (free/paid)?
- Worker name?
- Auto-create resources?
- Deploy immediately?

For now, these steps are manual.
:::

This will:
- Create `wrangler.toml` from the example template
- Copy migration files to a `migrations/` directory
- Display next steps

## Step 4: Generate Encryption Key

Generate a secure encryption key:

```bash
$ openssl rand -base64 32
```

Save this key securely - you'll need it in the next step.

## Step 5: Login to Cloudflare

Authenticate `wrangler` with your Cloudflare account:

```bash
$ npx wrangler login
```

## Step 6: Create Cloudflare Resources

:::info Future: Automatic Resource Creation
The enhanced CLI will automatically create and configure these resources. For now, run these commands manually:
:::

Create the required Cloudflare resources:

```bash
# Create D1 Database
$ npx wrangler d1 create package-broker-db

# Create KV Namespace
$ npx wrangler kv:namespace create PACKAGE_BROKER_KV

# Create R2 Bucket
$ npx wrangler r2 bucket create package-broker-artifacts
```

**Important**: Copy the IDs returned by these commands - you'll need them in the next step.

## Step 7: Configure wrangler.toml

:::info Future: Zero Manual Editing
The enhanced CLI will generate a complete `wrangler.toml` with all IDs populated automatically. For now, edit manually:
:::

Edit `wrangler.toml` and update the following:

1. **Set your worker name** (if you want a different name):
   ```toml
   name = "package-broker"
   ```

2. **Update the main entry point** to point to the installed package:
   ```toml
   main = "node_modules/@package-broker/main/dist/index.js"
   ```
   
   **Note**: The `nodejs_compat` compatibility flag (already in the template) enables Node.js APIs needed by the package.

3. **Add your encryption key** (from Step 4):
   ```toml
   [vars]
   ENCRYPTION_KEY = "YOUR_BASE64_KEY_HERE"
   ```

4. **Update database ID** (from Step 6):
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "package-broker-db"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

5. **Update KV namespace ID** (from Step 6):
   ```toml
   [[kv_namespaces]]
   binding = "KV"
   id = "YOUR_KV_ID_HERE"
   ```

6. **Update R2 bucket name** (if different):
   ```toml
   [[r2_buckets]]
   binding = "R2_BUCKET"
   bucket_name = "package-broker-artifacts"
   ```

## Step 8: Deploy

Deploy the Worker to Cloudflare's edge:

```bash
$ npx wrangler deploy
```

**Note**: Migrations are automatically applied during deployment. The `migrations/` directory (copied by the CLI) contains all migration files, and `wrangler deploy` will apply them automatically.

Your proxy is now live! The deployment will show your Worker URL (e.g., `package-broker.your-subdomain.workers.dev`).

## Step 9: Initial Setup

Open your Worker URL in a browser:

```
https://package-broker.your-subdomain.workers.dev
```

Complete the initial setup:

1. Enter your email address
2. Set a secure password
3. Click "Complete Setup"

## Step 10: Create an Access Token

1. Navigate to **Access Tokens** in the dashboard
2. Click **Create Token**
3. Enter a description
4. Select permissions (readonly or write)
5. Click **Create**
6. **Copy the token immediately**

## Step 11: Configure Custom Domain (Optional)

To use your own domain:

1. Add your domain to Cloudflare
2. Create a CNAME record pointing to your Worker
3. Update your Worker route in Cloudflare dashboard

## Verify Installation

Test the health endpoint:

```bash
$ curl https://package-broker.your-subdomain.workers.dev/health
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

### Deployment Fails

Check for errors in the deployment output. Common issues:

- **Invalid database ID**: Verify the D1 database ID is correct
- **KV namespace not found**: Ensure the KV namespace ID is correct
- **R2 bucket not found**: Verify the bucket name matches

### Can't Access Dashboard

- Verify the Worker deployed successfully: `npx wrangler deployments list`
- Check Worker logs: `npx wrangler tail`
- Ensure you're using HTTPS (required for Workers)

### Database Migration Errors

Migrations are automatically applied during `wrangler deploy`. If migrations fail:

```bash
# Check migration status
$ npx wrangler d1 migrations list package-broker-db --remote

# Manually re-run migrations if needed
$ npx wrangler d1 migrations apply package-broker-db --remote
```

**Note**: The CLI tool copies migrations to your project root `migrations/` directory. Wrangler automatically detects and applies migrations from this directory during deployment.

## Upgrading PACKAGE.broker

To upgrade to a new version:

```bash
$ npm update @package-broker/cli @package-broker/main
$ npx wrangler deploy
```

The CLI tool will handle any configuration changes needed for new versions.

## Project Structure

After initialization, your project structure will look like:

```
package-broker-deployment/
├── node_modules/
├── migrations/          # Database migration files
├── wrangler.toml        # Cloudflare Workers configuration
├── package.json
└── package-lock.json
```

## Next Steps

- Learn about production deployment: [Deployment Overview](../deployment/overview)
- Understand authentication: [Token Management](../administration/tokens)
- Review operations: [Backups and Restore](../operations/backups-restore) and [Scaling](../operations/scaling)
- Check [Roadmap](../reference/roadmap) for enhanced CLI features

