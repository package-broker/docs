# Migration from Private Packagist

This guide will help you migrate from Private Packagist to PACKAGE.broker.

## Overview

Private Packagist is a commercial SaaS solution for hosting private Composer packages. PACKAGE.broker offers similar functionality as a self-hosted, open-source alternative that can save you hundreds of euros per year.

## Prerequisites

- Access to your Private Packagist account
- Access to your PACKAGE.broker instance (Cloudflare Workers or Docker)
- Basic knowledge of Composer configuration

## Migration Steps

### Step 1: Export Your Current Configuration

1. **List all repositories** in Private Packagist:
   - Log into your Private Packagist dashboard
   - Navigate to "Repositories" section
   - Document all repository URLs and authentication tokens

2. **Export package list**:
   - Note all private packages currently hosted
   - Document any custom package filters or access rules

3. **Export credentials**:
   - Save your Private Packagist authentication tokens
   - Note any webhook configurations

### Step 2: Set Up PACKAGE.broker

1. **Deploy PACKAGE.broker**:
   - Follow the [Cloudflare Workers installation guide](../installation/cloudflare.md) or
   - Follow the [Docker installation guide](../installation/docker.md) (when available)

2. **Create access tokens**:
   - Log into your PACKAGE.broker dashboard
   - Navigate to "Access Tokens"
   - Create tokens for each environment (development, staging, production)

### Step 3: Add Repositories to PACKAGE.broker

For each repository in Private Packagist:

1. **Add repository source**:
   - In PACKAGE.broker dashboard, go to "Sources"
   - Click "Add Source"
   - Enter the repository URL (GitHub, GitLab, Bitbucket, etc.)
   - Configure authentication if needed

2. **Configure webhooks** (optional but recommended):
   - Set up webhooks in your Git provider
   - Point webhooks to your PACKAGE.broker instance
   - This enables automatic package updates

### Step 4: Update Composer Configuration

Update your `composer.json` files to use PACKAGE.broker:

**Before (Private Packagist):**
```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://repo.packagist.com/your-org/"
    }
  ],
  "require": {
    "your-org/private-package": "^1.0"
  }
}
```

**After (PACKAGE.broker):**
```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://package-broker.your-domain.com"
    }
  ],
  "require": {
    "your-org/private-package": "^1.0"
  }
}
```

### Step 5: Update Authentication

**Before (Private Packagist):**
```bash
composer config --global http-basic.repo.packagist.com username password
```

**After (PACKAGE.broker):**
```bash
composer config --global http-basic.package-broker.your-domain.com token-name your-token
```

Or use `auth.json`:
```json
{
  "http-basic": {
    "package-broker.your-domain.com": {
      "username": "token-name",
      "password": "your-token"
    }
  }
}
```

### Step 6: Parallel Testing (Recommended)

Run both systems in parallel for a transition period:

1. **Keep Private Packagist active** during migration
2. **Test PACKAGE.broker** with a subset of packages
3. **Verify package downloads** work correctly
4. **Monitor for any issues** before full cutover

### Step 7: Cutover Strategy

Once testing is complete:

1. **Update all `composer.json` files** to use PACKAGE.broker
2. **Update CI/CD pipelines** with new authentication
3. **Update team documentation** with new repository URL
4. **Monitor for 24-48 hours** to ensure smooth transition
5. **Cancel Private Packagist subscription** after successful migration

## Cost Comparison

| Item | Private Packagist | PACKAGE.broker |
|------|-------------------|----------------|
| Annual Cost | €700-3500 | €0-60 |
| Setup Time | Instant | 10-15 minutes |
| Maintenance | Zero (SaaS) | Minimal |
| Data Control | Limited | Full |

## Troubleshooting

### Packages Not Found

If packages aren't found after migration:

1. Verify repository sources are added in PACKAGE.broker dashboard
2. Check webhook configuration is correct
3. Manually trigger package sync if needed
4. Verify authentication tokens are correct

### Authentication Issues

If authentication fails:

1. Verify token is created in PACKAGE.broker dashboard
2. Check token has correct permissions
3. Verify `auth.json` or global config is correct
4. Test with `composer config --list` to see current settings

### Performance Issues

If downloads are slow:

1. Check your PACKAGE.broker deployment location
2. Consider using Cloudflare Workers for edge caching
3. Verify network connectivity
4. Check for any rate limiting

## Support

If you encounter issues during migration:

- Open an issue on [GitHub](https://github.com/package-broker/server/issues)
- Join [GitHub Discussions](https://github.com/package-broker/server/discussions)

## Next Steps

After successful migration:

- Review [compliance settings](../soc2-compliance.md)
- Check the [getting started guide](../intro.md)

