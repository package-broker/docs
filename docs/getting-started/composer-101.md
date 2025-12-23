---
sidebar_position: 1
title: Composer 101 for DevOps
description: Learn the basics of PHP Composer for DevOps engineers who are new to PHP package management
---

# Composer 101 for DevOps

This guide explains PHP Composer concepts for DevOps engineers who may be unfamiliar with PHP package management.

## What is Composer?

Composer is PHP's dependency manager, similar to:
- `npm` for Node.js
- `pip` for Python
- `bundler` for Ruby
- `cargo` for Rust

Composer manages PHP libraries (packages) that your application depends on.

## Key Concepts

### Packages

A **package** is a PHP library identified by a name in the format `vendor/package-name`:

- `monolog/monolog` - Logging library
- `symfony/http-foundation` - HTTP component
- `laravel/framework` - Web framework

### Repositories

A **repository** is a source where Composer can find packages. Common types:

- **Packagist**: The default public repository (packagist.org)
- **VCS repositories**: GitHub, GitLab, Bitbucket
- **Composer repositories**: Custom repositories that serve `packages.json`

### composer.json

The `composer.json` file declares your project's dependencies:

```json
{
  "name": "my-org/my-project",
  "require": {
    "monolog/monolog": "^2.0",
    "vendor/private-package": "^1.0"
  },
  "repositories": [
    {
      "type": "composer",
      "url": "https://package-broker.example.com"
    }
  ]
}
```

### composer.lock

The `composer.lock` file pins exact versions of all dependencies (including transitive dependencies). This ensures reproducible builds across environments.

## How Composer Downloads Packages

When you run `composer install`, Composer:

1. **Reads `composer.json`** to determine required packages
2. **Queries repositories** (starting with `packages.json`) to find available versions
3. **Resolves dependencies** to find compatible versions
4. **Downloads packages** as ZIP archives (distributions)
5. **Installs packages** into `vendor/` directory

### Repository Protocol

Composer uses a simple HTTP-based protocol:

1. **GET `/packages.json`**: Returns metadata about all packages
2. **GET `/p2/{vendor}/{package}.json`**: Returns versions for a specific package
3. **GET `/dist/{vendor}/{package}/{version}.zip`**: Downloads the package archive

## Authentication

Private repositories require authentication. Composer supports:

### HTTP Basic Authentication

Configured via `auth.json`:

```json
{
  "http-basic": {
    "package-broker.example.com": {
      "username": "token-name",
      "password": "your-token-value"
    }
  }
}
```

Or via command line:

```bash
$ composer config http-basic.package-broker.example.com token-name your-token-value
```

### Token Format

PACKAGE.broker uses token-based authentication:
- **Username**: `token` (literal string)
- **Password**: The actual token value

## Common Failure Modes

### 401 Unauthorized

**Cause**: Invalid or missing authentication credentials.

**Solution**:
- Verify token is correct in `auth.json`
- Check token hasn't expired
- Ensure token has required permissions

### 403 Forbidden

**Cause**: Token lacks required permissions or package access.

**Solution**:
- Verify token permissions (readonly vs write)
- Check package access policies (if vendor-namespace scoping is enabled)
- Confirm token hasn't been revoked

### 404 Not Found

**Cause**: Package or version doesn't exist in the repository.

**Possible reasons**:
- Package name is misspelled
- Version doesn't exist
- Repository source hasn't synced the package yet
- Package filter excludes this package

**Solution**:
- Verify package name and version
- Check repository sync status
- Review package filters in PACKAGE.broker dashboard

### Rate Limiting (429)

**Cause**: Too many requests in a short time period.

**Solution**:
- Wait before retrying
- Check token rate limit settings
- Consider increasing rate limit for the token

## Package Distribution Types

Composer supports two distribution types:

### Dist (Distribution)

Pre-built ZIP archives. Faster to download, preferred for production.

```json
{
  "dist": {
    "type": "zip",
    "url": "https://package-broker.example.com/dist/vendor/package/1.0.0.zip",
    "reference": "1.0.0"
  }
}
```

### Source

Git repository clones. Slower but allows development modifications.

```json
{
  "source": {
    "type": "git",
    "url": "https://github.com/vendor/package.git",
    "reference": "1.0.0"
  }
}
```

PACKAGE.broker primarily serves **dist** packages for performance.

## Version Constraints

Composer uses semantic versioning with constraint operators:

- `^1.2.3` - Compatible with 1.2.3, allows 1.x.x (not 2.0.0)
- `~1.2.3` - Compatible with 1.2.3, allows 1.2.x (not 1.3.0)
- `>=1.2.3` - Greater than or equal to 1.2.3
- `1.2.3` - Exact version

## Next Steps

- Deploy PACKAGE.broker: [Docker Quickstart](quickstart-docker) or [Cloudflare Workers Quickstart](quickstart-cloudflare)
- Configure authentication: [Token Management](../administration/tokens)
- Understand architecture: [Architecture Overview](../concepts/architecture)

