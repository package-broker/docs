---
sidebar_position: 1
title: Troubleshooting
description: Common issues and solutions for PACKAGE.broker deployments
---

# Troubleshooting

Common issues and solutions for PACKAGE.broker deployments.

## Docker Deployment

### Container Won't Start

**Symptoms**: Container exits immediately or fails to start.

**Solutions**:

1. **Check logs**:
   ```bash
   docker logs package-broker
   ```

2. **Verify environment variables**:
   - `ENCRYPTION_KEY` must be set (32-byte base64)
   - `DB_DRIVER` and `DB_URL` must be valid
   - `STORAGE_DRIVER` must match available storage

3. **Check port conflicts**:
   ```bash
   # Change port if 8080 is in use
   docker run -p 8081:8080 ...
   ```

### Health Check Fails

**Symptoms**: `curl http://localhost:8080/health` returns error.

**Solutions**:

1. **Verify container is running**:
   ```bash
   docker ps | grep package-broker
   ```

2. **Check port mapping**:
   ```bash
   docker port package-broker
   ```

3. **Inspect container logs**:
   ```bash
   docker logs package-broker --tail 50
   ```

### Database Connection Errors

**Symptoms**: Logs show database connection failures.

**Solutions**:

1. **SQLite**: Verify data directory is writable
   ```bash
   ls -la ./package-broker-data
   chmod 755 ./package-broker-data
   ```

2. **PostgreSQL**: Verify connection string
   ```bash
   # Test connection
   psql "postgresql://user:pass@host:5432/dbname"
   ```

## Cloudflare Workers Deployment

### Deployment Fails

**Symptoms**: `npx wrangler deploy` fails with errors.

**Solutions**:

1. **Invalid database ID**:
   - Verify D1 database ID in `wrangler.toml`
   - Re-run: `npx wrangler d1 create package-broker-db`

2. **KV namespace not found**:
   - Verify KV namespace ID
   - Re-run: `npx wrangler kv:namespace create PACKAGE_BROKER_KV`

3. **R2 bucket not found**:
   - Verify bucket name matches
   - Create bucket: `npx wrangler r2 bucket create package-broker-artifacts`

### Can't Access Dashboard

**Symptoms**: Worker URL returns error or blank page.

**Solutions**:

1. **Verify deployment**:
   ```bash
   npx wrangler deployments list
   ```

2. **Check Worker logs**:
   ```bash
   npx wrangler tail
   ```

3. **Ensure HTTPS**:
   - Workers require HTTPS
   - Use `https://` not `http://`

### Database Migration Errors

**Symptoms**: Migrations fail to apply.

**Solutions**:

1. **Check migration status**:
   ```bash
   npx wrangler d1 migrations list package-broker-db --remote
   ```

2. **Re-run migrations**:
   ```bash
   npx wrangler d1 migrations apply package-broker-db --remote
   ```

3. **Verify migrations directory**:
   - Ensure `migrations/` exists in project root
   - Check migration files are present

## Composer Integration

### 401 Unauthorized

**Symptoms**: `composer install` fails with authentication error.

**Solutions**:

1. **Verify token**:
   ```bash
   composer config http-basic.package-broker.example.com
   ```

2. **Check token format**:
   - Username: `token` (literal)
   - Password: Your actual token value

3. **Verify token hasn't expired**:
   - Check token expiration in dashboard
   - Create new token if expired

### 403 Forbidden

**Symptoms**: Token accepted but package access denied.

**Solutions**:

1. **Check token permissions**:
   - Verify token has `readonly` or `write` permission
   - Ensure token hasn't been revoked

2. **Verify package access** (if vendor scoping enabled):
   - Check `allowed_package_prefixes` matches package vendor
   - Verify package exists in repository

### 404 Not Found

**Symptoms**: Package or version not found.

**Solutions**:

1. **Verify package name**:
   - Check spelling: `vendor/package`
   - Ensure package exists in repository sources

2. **Check repository sync**:
   - Verify repository source is synced
   - Check sync status in dashboard
   - Manually trigger sync if needed

3. **Verify version exists**:
   - Check package versions in dashboard
   - Ensure version tag exists in VCS

### Rate Limiting (429)

**Symptoms**: Too many requests error.

**Solutions**:

1. **Wait before retrying**:
   - Rate limits reset hourly
   - Check `X-RateLimit-Reset` header

2. **Increase rate limit**:
   - Update token rate limit in dashboard
   - Default: 1000 requests/hour

## General Issues

### Encryption Key Issues

**Symptoms**: Credentials can't be decrypted.

**Solutions**:

1. **Verify key format**:
   ```bash
   # Key must be base64, 32 bytes
   echo "YOUR_KEY" | base64 -d | wc -c  # Should be 32
   ```

2. **Key rotation** (planned):
   - See [Roadmap](../reference/roadmap) for key rotation tool

### Storage Access Errors

**Symptoms**: Package downloads fail or artifacts missing.

**Solutions**:

1. **S3-compatible storage**:
   - Verify credentials
   - Check bucket permissions
   - Verify endpoint URL

2. **Filesystem storage**:
   - Check directory permissions
   - Verify disk space
   - Check path configuration

### Cache Issues

**Symptoms**: Stale package metadata or slow responses.

**Solutions**:

1. **Clear cache** (if Redis):
   ```bash
   redis-cli FLUSHDB
   ```

2. **Check cache driver**:
   - Verify `CACHE_DRIVER` setting
   - Check cache connection (Redis URL)

## Getting Help

If you can't resolve an issue:

1. **Check logs**: Review application logs for detailed error messages
2. **Search issues**: [GitHub Issues](https://github.com/package-broker/server/issues)
3. **Ask community**: [GitHub Discussions](https://github.com/orgs/package-broker/discussions)

## Next Steps

- Review [Configuration Reference](../reference/configuration) for all options
- See [Deployment Guides](../getting-started/quickstart-docker) for setup details
- Check [Roadmap](../reference/roadmap) for planned improvements


