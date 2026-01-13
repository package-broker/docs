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

## SMTP Configuration (Optional)

To enable email sending for user invitations, configure SMTP environment variables:

```bash
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data:/data \
  -e ENCRYPTION_KEY=$(openssl rand -base64 32) \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASS=your-app-password \
  -e SMTP_FROM=noreply@example.com \
  packagebroker/server:latest
```

### Email Provider Examples

#### Gmail
```bash
-e SMTP_HOST=smtp.gmail.com \
-e SMTP_PORT=587 \
-e SMTP_USER=your-email@gmail.com \
-e SMTP_PASS=your-app-specific-password \
-e SMTP_FROM=your-email@gmail.com
```
**Note**: Gmail requires an [app-specific password](https://support.google.com/accounts/answer/185833) for SMTP authentication.

#### SendGrid
```bash
-e SMTP_HOST=smtp.sendgrid.net \
-e SMTP_PORT=587 \
-e SMTP_USER=apikey \
-e SMTP_PASS=SG.your-sendgrid-api-key \
-e SMTP_FROM=noreply@yourdomain.com
```

#### AWS SES
```bash
-e SMTP_HOST=email-smtp.us-east-1.amazonaws.com \
-e SMTP_PORT=587 \
-e SMTP_USER=AKIAIOSFODNN7EXAMPLE \
-e SMTP_PASS=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY \
-e SMTP_FROM=noreply@yourdomain.com
```

**Note**: Email sending is optional. If SMTP is not configured, user creation will still work, but no emails will be sent. See [Configuration Reference](../reference/configuration#email-configuration-smtp) for complete SMTP documentation.

## Production Considerations

For production deployments, see the [Docker Compose guide](./docker-compose.md) for:
- PostgreSQL database setup
- Redis caching
- S3-compatible storage
- SSL/TLS configuration
- Backup procedures
- SMTP email configuration

## Support

- Check [GitHub Issues](https://github.com/package-broker/server/issues) for Docker support status
- Join [GitHub Discussions](https://github.com/package-broker/server/discussions) for updates

