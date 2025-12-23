# Docker Installation

:::info Coming Soon

Docker support is currently in development as part of the architectural refactor. This guide will be updated when Docker images are available.

**Current Status**: Docker images are planned but not yet available. Please use [Cloudflare Workers installation](./cloudflare.md) for now.

:::

## Overview

PACKAGE.broker can be deployed using Docker for easy self-hosting on any platform that supports Docker.

## Prerequisites

- Docker installed (version 20.10 or later)
- Docker Compose (optional, for multi-container setup)
- At least 2GB RAM available
- 10GB disk space for package storage

## Quick Start

Once Docker images are available, installation will be as simple as:

```bash
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data:/data \
  -e ENCRYPTION_KEY=$(openssl rand -base64 32) \
  ghcr.io/package-broker/server:latest
```

## Access Dashboard

After starting the container:

1. Open your browser to `http://localhost:8080`
2. Create an admin account
3. Start adding repository sources

## Next Steps

1. [Add your first repository source](../configuration/repository-sources.md)
2. [Create access tokens](../configuration/authentication.md)
3. [Configure webhooks](../configuration/webhooks.md)

## Production Considerations

For production deployments, see the [Docker Compose guide](./docker-compose.md) for:
- PostgreSQL database setup
- Redis caching
- S3-compatible storage
- SSL/TLS configuration
- Backup procedures

## Support

- Check [GitHub Issues](https://github.com/package-broker/server/issues) for Docker support status
- Join [GitHub Discussions](https://github.com/package-broker/server/discussions) for updates

