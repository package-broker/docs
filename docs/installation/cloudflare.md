---
sidebar_position: 2
title: Installation (Cloudflare)
description: Guide to deploying the Composer Proxy on Cloudflare
---

# Installation on Cloudflare

This is the primary way to deploy Package Broker. It runs entirely on Cloudflare's free tier infrastructure using Workers, D1, R2, and KV.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed.
- A [Cloudflare account](https://dash.cloudflare.com/sign-up).
- `npm` installed.

## Step 1: Clone the Repository

Clone the server repository to your local machine (or use the pre-built package if available).

\`\`\`bash
git clone https://github.com/package-broker/server.git package-broker
cd package-broker
npm install
\`\`\`

## Step 2: Login to Cloudflare

Authenticate `wrangler` with your Cloudflare account.

\`\`\`bash
npx wrangler login
\`\`\`

## Step 3: Create Resources

You need to create the D1 database, KV namespace, and R2 bucket.

**Note:** Copy the IDs returned by these commands.

\`\`\`bash
# 1. Create D1 Database
npx wrangler d1 create composer-proxy-db

# 2. Create KV Namespace
npx wrangler kv:namespace create COMPOSER_KV

# 3. Create R2 Bucket
npx wrangler r2 bucket create composer-proxy-artifacts
\`\`\`

## Step 4: Configure `wrangler.toml`

Create or update your \`wrangler.toml\` file with the IDs from Step 3.

\`\`\`toml
name = "composer-proxy"
main = "packages/main/src/index.ts"
compatibility_date = "2024-09-23"

[vars]
# Generate a random 32-byte key: openssl rand -base64 32
ENCRYPTION_KEY = "YOUR_BASE64_KEY_HERE"

[[d1_databases]]
binding = "DB"
database_name = "composer-proxy-db"
database_id = "YOUR_DATABASE_ID_HERE"

[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "composer-proxy-artifacts"
\`\`\`

## Step 5: Initialize Database

Apply the migrations to your remote D1 database.

\`\`\`bash
npx wrangler d1 migrations apply composer-proxy-db --remote
\`\`\`

## Step 6: Deploy

Deploy the worker to the Cloudflare edge.

\`\`\`bash
npx wrangler deploy
\`\`\`

Your proxy is now live! 🚀

## Next Steps

- Proceed to the **Configuration** guide to learn how to add repositories.
- Setup your local `composer.json` to use your new proxy.
