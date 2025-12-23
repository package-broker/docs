---
sidebar_position: 1
title: Token Management
description: Create and manage Composer access tokens
---

# Token Management

Access tokens allow Composer clients to authenticate with PACKAGE.broker and download packages.

## Creating Tokens

### Via Dashboard

1. Log into PACKAGE.broker dashboard
2. Navigate to **Access Tokens**
3. Click **Create Token**
4. Enter description (e.g., "CI/CD Pipeline")
5. Select permissions:
   - **Read-only**: Can download packages
   - **Write**: Can download and manage packages
6. Click **Create**
7. **Copy the token immediately** - it's only shown once

### Token Format

Tokens are used with HTTP Basic Authentication:
- **Username**: `token` (literal string)
- **Password**: The actual token value

## Using Tokens

### Configure Composer

```bash
composer config http-basic.package-broker.example.com token YOUR_TOKEN_HERE
```

This creates/updates `auth.json`:

```json
{
  "http-basic": {
    "package-broker.example.com": {
      "username": "token",
      "password": "YOUR_TOKEN_HERE"
    }
  }
}
```

### Test Token

```bash
curl -u token:YOUR_TOKEN_HERE \
  https://package-broker.example.com/health
```

## Token Permissions

### Read-only

- Download packages
- Access package metadata
- View repository information

**Use cases**: CI/CD pipelines, production deployments

### Write

- All read-only permissions
- Manage repository sources
- Create/update tokens (if enabled)

**Use cases**: Development environments, admin automation

## Token Management

### View Tokens

List all tokens in the dashboard:
- Token description
- Permissions
- Creation date
- Last used date
- Expiration (if set)

### Revoke Tokens

1. Navigate to **Access Tokens**
2. Find the token to revoke
3. Click **Delete**
4. Confirm deletion

**Note**: Revoked tokens cannot be recovered. Create a new token if needed.

### Token Expiration

Tokens can be set to expire automatically:
- Set expiration date when creating token
- Expired tokens are automatically rejected
- Create new token before expiration

## Security Best Practices

### Token Naming

Use descriptive names:
- ✅ `production-ci-cd`
- ✅ `staging-deployment`
- ❌ `token1`, `test`

### Token Rotation

Regularly rotate tokens:
- Revoke unused tokens
- Create new tokens for active services
- Update Composer configuration

### Scope Limitation

:::info Planned Feature

Vendor-namespace scoping for tokens is planned. This will allow restricting tokens to specific package vendors (e.g., `your-vendor/*`).

See [Roadmap](../reference/roadmap) for implementation timeline.

:::

## Rate Limiting

Tokens are rate-limited to prevent abuse:
- **Default**: 1000 requests/hour
- **Configurable**: Adjust in token settings
- **Headers**: Check `X-RateLimit-*` headers

## Troubleshooting

### 401 Unauthorized

- Verify token is correct
- Check token hasn't expired
- Ensure username is `token` (literal)

### 403 Forbidden

- Verify token permissions
- Check token hasn't been revoked
- Verify package access (if scoping enabled)

### Rate Limiting

- Check `X-RateLimit-Remaining` header
- Wait for rate limit reset
- Consider increasing rate limit

## Next Steps

- Review [Composer 101](../getting-started/composer-101) for authentication basics
- See [E-shop Integration](../use-cases/eshop-extension-vendor) for automated token provisioning
- Check [API Reference](../reference/api) for programmatic token management (planned)


