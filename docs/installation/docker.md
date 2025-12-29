# Docker Installation

## Overview

PACKAGE.broker can be deployed using Docker for easy self-hosting on any platform that supports Docker.

## Prerequisites

- Docker installed (version 20.10 or later)
- Docker Compose (optional, for multi-container setup)
- At least 2GB RAM available
- 10GB disk space for package storage

## Quick Start

Pull the Docker image from Docker Hub (recommended):

```bash
docker pull packagebroker/server:latest
```

Or from GitHub Container Registry:

```bash
docker pull ghcr.io/package-broker/server:latest
```

Then run the container:

```bash
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data:/data \
  -e ENCRYPTION_KEY=$(openssl rand -base64 32) \
  packagebroker/server:latest
```

## Access Dashboard

After starting the container:

1. Open your browser to `http://localhost:8080`
2. Create an admin account
3. Start adding repository sources

## Next Steps

1. Review the [Docker Quickstart guide](../getting-started/quickstart-docker.md) for detailed setup instructions
2. Check the [Cloudflare Workers Quickstart](../getting-started/quickstart-cloudflare.md) for serverless deployment options

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

