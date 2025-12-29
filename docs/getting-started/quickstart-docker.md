---
sidebar_position: 2
title: Quickstart (Docker)
description: Get PACKAGE.broker running in 15 minutes using Docker
---

# Quickstart: Docker

This guide will get you up and running with PACKAGE.broker using Docker in about 15 minutes.

## Prerequisites

- Docker installed (version 20.10 or later)
- At least 2GB RAM available
- 10GB disk space for package storage

## Step 1: Pull the Image

Pull the official PACKAGE.broker Docker image from Docker Hub (recommended):

```bash
$ docker pull packagebroker/server:latest
```

Or from GitHub Container Registry:

```bash
$ docker pull ghcr.io/package-broker/server:latest
```

## Step 2: Generate Encryption Key

Generate a secure encryption key for storing repository credentials:

```bash
$ openssl rand -base64 32
```

**Save this key securely** - you'll need it in the next step. If you lose it, you won't be able to decrypt stored credentials.

## Step 3: Create Data Directory

Create a directory for persistent data:

```bash
$ mkdir -p ./package-broker-data
```

## Step 4: Start the Container

Run PACKAGE.broker with SQLite (simplest setup):

```bash
$ docker run -d \
  --name package-broker \
  -p 8080:8080 \
  -v $(pwd)/package-broker-data:/data \
  -e ENCRYPTION_KEY="YOUR_ENCRYPTION_KEY_HERE" \
  -e DB_DRIVER=sqlite \
  -e DB_URL="/data/database.sqlite" \
  -e STORAGE_DRIVER=fs \
  -e STORAGE_FS_PATH="/data/storage" \
  packagebroker/server:latest
```

Replace `YOUR_ENCRYPTION_KEY_HERE` with the key you generated in Step 2.

**Note**: The `DB_URL` should be a file path (e.g., `/data/database.sqlite`), not a URI with `file:` prefix.

## Step 5: Run Database Migrations

After starting the container, you need to initialize the database by running migrations:

```bash
$ docker exec package-broker node packages/adapter-node/scripts/migrate.cjs /data/database.sqlite
```

**Expected output:**
```
Initializing database at: /data/database.sqlite
Running migrations from: /app/packages/main/migrations
✅ Database migrations completed successfully
```

**What happens if migrations aren't run?**
- The server will start but log an error message with migration instructions
- API requests will fail with database errors until migrations are completed

**Note**: Migrations only need to be run once when setting up a new database. The server will work immediately after migrations complete - no restart required.

## Step 6: Verify Installation

Check that the container is running:

```bash
$ docker ps | grep package-broker
```

You should see the container listed. Check the health endpoint:

```bash
$ curl http://localhost:8080/health
```

**Expected output:**
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## Step 7: Initial Setup

Open your browser and navigate to:

```
http://localhost:8080
```

You'll see the setup screen. Create your first admin account:

1. Enter your email address
2. Set a secure password
3. Click "Complete Setup"

## Step 8: Create an Access Token

1. Navigate to **Access Tokens** in the dashboard
2. Click **Create Token**
3. Enter a description (e.g., "Development")
4. Select permissions:
   - **Read-only**: Can download packages
   - **Write**: Can download and manage packages
5. Click **Create**
6. **Copy the token immediately** - it's only shown once

## Step 9: Add a Repository Source

1. Navigate to **Sources** in the dashboard
2. Click **Add Source**
3. Enter repository details:
   - **URL**: Your repository URL (e.g., `https://github.com/your-org/your-package`)
   - **Type**: Select the VCS type (GitHub, GitLab, Bitbucket)
   - **Credentials**: Add authentication if the repository is private
4. Click **Save**

## Step 10: Test Package Installation

Create a test `composer.json`:

```json
{
  "name": "test/project",
  "require": {
    "your-org/your-package": "^1.0"
  },
  "repositories": [
    {
      "type": "composer",
      "url": "http://localhost:8080"
    }
  ]
}
```

Configure authentication:

```bash
$ composer config http-basic.localhost:8080 token YOUR_TOKEN_HERE
```

Install the package:

```bash
$ composer install
```

If successful, you should see the package downloaded and installed.

## Troubleshooting

### Container Won't Start

Check container logs:

```bash
$ docker logs package-broker
```

Common issues:
- **Port 8080 already in use**: Change the port mapping (e.g., `-p 8081:8080`)
- **Permission errors**: Ensure the data directory is writable
- **Invalid encryption key**: Key must be base64-encoded, 32 bytes

### Health Check Fails

Verify the container is running:

```bash
$ docker ps -a | grep package-broker
```

If the container exited, check logs for errors.

### Can't Access Dashboard

- Verify the container is running: `docker ps`
- Check port mapping: `docker port package-broker`
- Try accessing via `http://127.0.0.1:8080` instead of `localhost`

### Database Not Initialized Error

If you see "Database not initialized. Please run migrations" when accessing the dashboard:

1. **Check if migrations have been run:**
   ```bash
   $ docker exec package-broker node packages/adapter-node/scripts/migrate.cjs /data/database.sqlite
   ```

2. **Verify the database file exists:**
   ```bash
   $ docker exec package-broker ls -la /data/database.sqlite
   ```

3. **Check container logs for migration errors:**
   ```bash
   $ docker logs package-broker | grep -i migration
   ```

4. **If migrations fail**, ensure:
   - The database path is correct (should be `/data/database.sqlite`, not `file:/data/database.sqlite`)
   - The data volume is properly mounted
   - The container has write permissions to `/data`

## Next Steps

- Learn about production deployment: [Deployment Overview](../deployment/overview)
- Understand authentication: [Token Management](../administration/tokens)
- Explore use cases: [E-shop Extension Vendor Integration](../use-cases/eshop-extension-vendor)
- Review operations: [Backups and Restore](../operations/backups-restore)

