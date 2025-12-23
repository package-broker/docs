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

Pull the official PACKAGE.broker Docker image:

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
  -e DB_URL="file:/data/database.sqlite" \
  -e STORAGE_DRIVER=fs \
  -e STORAGE_FS_PATH="/data/storage" \
  ghcr.io/package-broker/server:latest
```

Replace `YOUR_ENCRYPTION_KEY_HERE` with the key you generated in Step 2.

## Step 5: Verify Installation

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

## Step 6: Initial Setup

Open your browser and navigate to:

```
http://localhost:8080
```

You'll see the setup screen. Create your first admin account:

1. Enter your email address
2. Set a secure password
3. Click "Complete Setup"

## Step 7: Create an Access Token

1. Navigate to **Access Tokens** in the dashboard
2. Click **Create Token**
3. Enter a description (e.g., "Development")
4. Select permissions:
   - **Read-only**: Can download packages
   - **Write**: Can download and manage packages
5. Click **Create**
6. **Copy the token immediately** - it's only shown once

## Step 8: Add a Repository Source

1. Navigate to **Sources** in the dashboard
2. Click **Add Source**
3. Enter repository details:
   - **URL**: Your repository URL (e.g., `https://github.com/your-org/your-package`)
   - **Type**: Select the VCS type (GitHub, GitLab, Bitbucket)
   - **Credentials**: Add authentication if the repository is private
4. Click **Save**

## Step 9: Test Package Installation

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

## Next Steps

- Learn about production deployment: [Deployment Overview](../deployment/overview)
- Understand authentication: [Token Management](../administration/tokens)
- Explore use cases: [E-shop Extension Vendor Integration](../use-cases/eshop-extension-vendor)
- Review operations: [Backups and Restore](../operations/backups-restore)

