---
sidebar_position: 1
title: Migration from Satis
description: Guide to migrating from Satis to PACKAGE.broker
---

# Migration from Satis

This guide will help you migrate from Satis to PACKAGE.broker.

:::info Legal Notice

Satis is an open-source project maintained by the Composer team. This guide is provided for informational purposes only. PACKAGE.broker is not affiliated with, endorsed by, or sponsored by the Composer project or Satis maintainers. See [Legal Notice](./legal-notice.md) for details.

:::

## Overview

Satis is a static Composer repository generator. PACKAGE.broker is a dynamic, web-based Composer repository proxy and cache with a modern UI, webhook support, and edge caching capabilities.

## Prerequisites

- Access to your Satis configuration file (`satis.json`)
- Access to your PACKAGE.broker instance
- Basic knowledge of Composer and Git

## Key Differences

| Feature | Satis | PACKAGE.broker |
|--------|-------|----------------|
| Type | Static generator | Dynamic web service |
| Updates | Manual rebuild required | Automatic via webhooks |
| UI | None | Modern web dashboard |
| Authentication | Basic HTTP | Token-based |
| Caching | Manual | Built-in edge caching |
| Maintenance | High | Low |

## Migration Steps

### Step 1: Export Satis Configuration

1. **Locate your `satis.json` file**:
   ```bash
   cat satis.json
   ```

2. **Document all repositories**:
   - Note all repository URLs
   - Document any authentication requirements
   - List all packages being hosted

3. **Export package list**:
   ```bash
   # If you have Satis output directory
   ls -la satis-output/packages/
   ```

### Step 2: Set Up PACKAGE.broker

1. **Deploy PACKAGE.broker**:
   - Follow the [Cloudflare Workers Quickstart](../getting-started/quickstart-cloudflare.md) or
   - Follow the [Docker installation guide](../installation/docker.md)

2. **Access the dashboard**:
   - Navigate to your PACKAGE.broker URL
   - Create an admin account
   - Generate access tokens

### Step 3: Import Repositories

For each repository in your `satis.json`:

**Example Satis configuration:**
```json
{
  "name": "my-org/packages",
  "homepage": "https://packages.my-org.com",
  "repositories": [
    {
      "type": "vcs",
      "url": "https://github.com/my-org/package1"
    },
    {
      "type": "vcs",
      "url": "https://github.com/my-org/package2"
    }
  ],
  "require-all": true
}
```

**In PACKAGE.broker:**

1. Navigate to "Sources" in the dashboard
2. Click "Add Source"
3. For each repository:
   - Enter the repository URL
   - Configure authentication if needed
   - Set up webhooks for automatic updates

### Step 4: Update Composer Configuration

**Before (Satis):**
```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://packages.my-org.com"
    }
  ]
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
  ]
}
```

### Step 5: Update Authentication

If your Satis repository was password-protected:

**Before (Satis):**
```bash
composer config --global http-basic.packages.my-org.com username password
```

**After (PACKAGE.broker):**
```bash
composer config --global http-basic.package-broker.your-domain.com token-name your-token
```

### Step 6: Set Up Webhooks (Recommended)

Unlike Satis, PACKAGE.broker supports automatic updates via webhooks:

1. **For GitHub repositories**:
   - Go to repository Settings → Webhooks
   - Add webhook URL: `https://package-broker.your-domain.com/api/webhooks/github`
   - Select "Just the push event"
   - Save webhook

2. **For GitLab repositories**:
   - Go to repository Settings → Webhooks
   - Add webhook URL: `https://package-broker.your-domain.com/api/webhooks/gitlab`
   - Select "Push events"
   - Save webhook

3. **For Bitbucket repositories**:
   - Go to repository Settings → Webhooks
   - Add webhook URL: `https://package-broker.your-domain.com/api/webhooks/bitbucket`
   - Select "Repository push"
   - Save webhook

### Step 7: Verify Migration

1. **Test package installation**:
   ```bash
   composer clear-cache
   composer require your-org/package1
   ```

2. **Verify in dashboard**:
   - Check PACKAGE.broker dashboard shows all packages
   - Verify package versions are up to date
   - Test webhook by pushing a new tag

3. **Update CI/CD pipelines**:
   - Update repository URLs
   - Update authentication tokens
   - Test builds

### Step 8: Decommission Satis

Once everything is working:

1. **Keep Satis running** for 1-2 weeks as backup
2. **Monitor PACKAGE.broker** for any issues
3. **Update all documentation** with new URLs
4. **Remove Satis** after successful transition

## Feature Differences

### Automatic Updates
- **Satis**: Requires manual `satis build` after each package update
- **PACKAGE.broker**: Automatic updates via webhooks

### Performance
- **Satis**: Static files, no caching
- **PACKAGE.broker**: Edge caching, CDN distribution

### User Interface
- **Satis**: No UI, command-line only
- **PACKAGE.broker**: Web dashboard for management

### Maintenance
- **Satis**: Manual rebuilds, server management
- **PACKAGE.broker**: Serverless or Docker deployment options

## Troubleshooting

### Packages Not Appearing

If packages don't appear after adding sources:

1. Check webhook configuration
2. Manually trigger sync in dashboard
3. Verify repository URLs are correct
4. Check authentication if repositories are private

### Webhook Not Working

If webhooks aren't triggering updates:

1. Verify webhook URL is correct
2. Check webhook secret is configured
3. Test webhook with a test push
4. Check PACKAGE.broker logs for errors

### Authentication Issues

If authentication fails:

1. Verify token is created correctly
2. Check token permissions
3. Verify `auth.json` format
4. Test with `composer config --list`

## Deployment Comparison

| Item | Satis | PACKAGE.broker |
|------|-------|----------------|
| Deployment Model | Self-hosted (server required) | Self-hosted (Cloudflare Workers or Docker) |
| Setup Time | ~30 minutes | ~10-15 minutes |
| Update Method | Manual rebuilds | Automatic via webhooks |
| User Interface | Command-line only | Web dashboard |

## Support

If you encounter issues:

- Open an issue on [GitHub](https://github.com/package-broker/server/issues)
- Join [GitHub Discussions](https://github.com/package-broker/server/discussions)

## Next Steps

After successful migration:

- Review the [getting started guide](../intro.md)
- Check [compliance documentation](../soc2-compliance.md)

