# Docker Compose Installation

:::info Coming Soon

Docker Compose support is currently in development as part of the architectural refactor. This guide will be updated when Docker images are available.

**Current Status**: Docker images are planned but not yet available. Please use [Cloudflare Workers installation](./cloudflare.md) for now.

:::

## Overview

Docker Compose provides an easy way to run PACKAGE.broker with all dependencies (database, cache, storage) in a single command.

## Prerequisites

- Docker installed (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- At least 4GB RAM available
- 20GB disk space for package storage

## Production Setup

Once Docker images are available, a production-ready `docker-compose.yml` will look like:

```yaml
services:
  package-broker:
    image: ghcr.io/package-broker/server:latest
    ports:
      - "8080:8080"
    environment:
      DB_DRIVER: postgres
      DB_URL: postgres://user:pass@postgres:5432/packages
      CACHE_DRIVER: redis
      CACHE_URL: redis://redis:6379
      STORAGE_DRIVER: s3
      S3_ENDPOINT: minio:9000
      S3_BUCKET: packages
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    depends_on:
      - postgres
      - redis
      - minio

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: packages
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

## Configuration

### Environment Variables

Create a `.env` file:

```bash
ENCRYPTION_KEY=$(openssl rand -base64 32)
DB_PASSWORD=your-secure-password
MINIO_ROOT_PASSWORD=your-secure-password
```

### Starting Services

```bash
docker-compose up -d
```

### Accessing Services

- **PACKAGE.broker Dashboard**: http://localhost:8080
- **MinIO Console**: http://localhost:9001
- **PostgreSQL**: localhost:5432

## Next Steps

1. [Configure authentication](../configuration/authentication.md)
2. [Add repository sources](../configuration/repository-sources.md)
3. [Set up monitoring](../operations/monitoring.md)
4. [Configure backups](../operations/backup-restore.md)

## Support

- Check [GitHub Issues](https://github.com/package-broker/server/issues) for Docker support status
- Join [GitHub Discussions](https://github.com/package-broker/server/discussions) for updates

