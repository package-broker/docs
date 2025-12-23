---
sidebar_position: 2
title: API Reference
description: REST API endpoints for PACKAGE.broker
---

# API Reference

:::info Planned Feature

The Management API endpoints described below are planned but not yet fully implemented. The Composer API (`/packages.json`, `/p2/*`, `/dist/*`) is fully functional.

:::

PACKAGE.broker provides a REST API for programmatic access to repositories, tokens, and packages.

## Base URL

All API requests should be made to your PACKAGE.broker instance:

```
https://your-instance.package-broker.com/api
```

## Authentication

API requests require authentication using Bearer tokens:

```bash
Authorization: Bearer your-token-here
```

## Composer API

The Composer API endpoints are used by `composer` CLI and follow the [Composer repository protocol](https://getcomposer.org/doc/05-repositories.md).

### GET /packages.json

Returns metadata for all packages.

**Authentication**: Required (Composer token)

**Response**:
```json
{
  "packages": {},
  "metadata-url": "/p2/%package%$%hash%.json",
  "available-packages": ["vendor/package"]
}
```

### GET /p2/\{vendor\}/\{package\}.json

Returns version metadata for a specific package.

**Authentication**: Required (Composer token)

**Response**:
```json
{
  "packages": {
    "vendor/package": {
      "1.0.0": {
        "name": "vendor/package",
        "version": "1.0.0",
        "dist": {
          "type": "zip",
          "url": "/dist/vendor/package/1.0.0.zip"
        }
      }
    }
  }
}
```

### GET /dist/\{vendor\}/\{package\}/\{version\}.zip

Downloads the package distribution archive.

**Authentication**: Required (Composer token)

**Response**: Binary ZIP file

## Management API (Planned)

### Repositories

#### List Repositories

```http
GET /api/repositories
```

#### Create Repository

```http
POST /api/repositories
Content-Type: application/json

{
  "url": "https://github.com/org/repo",
  "vcs_type": "github",
  "credential_type": "token",
  "auth_credentials": "encrypted-token"
}
```

#### Get Repository

```http
GET /api/repositories/{id}
```

**Note**: Replace `{id}` with the actual repository ID.

#### Update Repository

```http
PATCH /api/repositories/{id}
```

**Note**: Replace `{id}` with the actual repository ID.

#### Delete Repository

```http
DELETE /api/repositories/{id}
```

**Note**: Replace `{id}` with the actual repository ID.

### Tokens

#### List Tokens

```http
GET /api/tokens
```

#### Create Token

```http
POST /api/tokens
Content-Type: application/json

{
  "description": "Customer token",
  "permissions": "readonly",
  "expires_at": 1735689600,
  "allowed_package_prefixes": ["vendor/"]
}
```

#### Get Token

```http
GET /api/tokens/{id}
```

**Note**: Replace `{id}` with the actual token ID.

#### Update Token

```http
PATCH /api/tokens/{id}
```

**Note**: Replace `{id}` with the actual token ID.

#### Delete Token

```http
DELETE /api/tokens/{id}
```

**Note**: Replace `{id}` with the actual token ID.

### Packages

#### List Packages

```http
GET /api/packages?repo_id={id}
```

**Note**: Replace `{id}` with the actual repository ID.

#### Get Package

```http
GET /api/packages/{id}
```

**Note**: Replace `{id}` with the actual package ID.

## Error Responses

All API endpoints return standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

Error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

API requests are rate-limited per token. Default limits:
- **Read-only tokens**: 1000 requests/hour
- **Write tokens**: 500 requests/hour

Rate limit headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

## Next Steps

- See [Configuration Reference](./configuration) for environment variables
- Review [E-shop Integration Use Case](../use-cases/eshop-extension-vendor) for API usage examples
- Check [Roadmap](./roadmap) for Management API implementation status

