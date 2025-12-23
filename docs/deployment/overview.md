---
sidebar_position: 1
title: Deployment Overview
description: Production deployment guides for PACKAGE.broker
---

# Deployment Overview

PACKAGE.broker supports multiple deployment platforms, each optimized for different use cases.

## Deployment Options

### Docker

**Best for**: Self-hosted deployments, development, small teams

- Single container deployment
- SQLite or PostgreSQL database
- Filesystem or S3-compatible storage
- Easy to set up and maintain

**Quickstart**: [Docker Quickstart](../getting-started/quickstart-docker)

### Cloudflare Workers

**Best for**: Edge-optimized deployments, zero-cost hosting, global distribution

- Serverless edge deployment
- D1 database, KV cache, R2 storage
- Free tier available
- Automatic scaling

**Quickstart**: [Cloudflare Workers Quickstart](../getting-started/quickstart-cloudflare)

### Kubernetes

**Best for**: Production deployments, enterprise scale, high availability

:::info Planned Feature

Kubernetes/Helm chart support is planned for Q1 2026. See [Roadmap](../reference/roadmap) for timeline.

:::

## Deployment Comparison

| Feature | Docker | Cloudflare Workers | Kubernetes |
|---------|--------|-------------------|------------|
| **Setup Complexity** | Low | Medium | High |
| **Cost** | Server costs | Free tier available | Cluster costs |
| **Scaling** | Manual | Automatic | Automatic |
| **Database** | SQLite/PostgreSQL | D1 | PostgreSQL |
| **Storage** | FS/S3 | R2 | S3 |
| **Best For** | Small teams | Edge deployment | Enterprise |

## Production Considerations

### Database

**Recommended**: PostgreSQL for production
- Better performance
- Concurrent access support
- Backup and replication options

**Development**: SQLite is acceptable
- Single-user deployments
- Simple setup
- Not recommended for production

### Storage

**Recommended**: S3-compatible storage
- Scalable
- Durable
- Cost-effective

**Development**: Filesystem storage
- Simple setup
- Local development
- Limited scalability

### Caching

**Recommended**: Redis
- Fast response times
- Reduced database load
- Session storage

**Development**: Memory cache
- Simple setup
- No external dependencies
- Not persistent

## Security

### Encryption Key

- Generate secure key: `openssl rand -base64 32`
- Store securely (environment variable, secret manager)
- Never commit to version control
- Rotate periodically (planned feature)

### Network Security

- Use HTTPS/TLS for all deployments
- Restrict database access
- Use firewall rules
- Enable authentication

### Access Control

- Create tokens with minimal permissions
- Rotate tokens regularly
- Monitor token usage
- Revoke unused tokens

## Monitoring

### Health Checks

Monitor the health endpoint:
```bash
curl https://your-instance/health
```

### Logging

- Configure log aggregation
- Monitor error rates
- Track package downloads
- Review authentication events

### Metrics

Track key metrics:
- Request rate
- Package download count
- Cache hit rate
- Error rate

## Backup and Recovery

### Database Backups

**PostgreSQL**:
```bash
pg_dump -h host -U user -d database > backup.sql
```

**SQLite**:
```bash
cp database.sqlite backup.sqlite
```

### Storage Backups

- S3: Enable versioning
- Filesystem: Regular file backups
- R2: Export to S3 for backup

### Recovery

1. Restore database from backup
2. Restore storage artifacts
3. Verify encryption key matches
4. Test health endpoint

## Next Steps

- Choose deployment method: [Docker](../getting-started/quickstart-docker) or [Cloudflare Workers](../getting-started/quickstart-cloudflare)
- Review [Configuration Reference](../reference/configuration) for all options
- See [Troubleshooting](../troubleshooting/index) for common issues

