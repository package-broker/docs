---
sidebar_position: 2
title: API Reference
description: REST API endpoints for PACKAGE.broker
---

# API Reference

PACKAGE.broker provides a REST API for programmatic access to repositories, tokens, and packages.

## Interactive API Documentation

For complete, interactive API documentation with the ability to test endpoints directly, visit:

- **Swagger UI**: `/api/swagger` - Interactive API explorer
- **OpenAPI Spec**: `/api/openapi.json` - Raw OpenAPI 3.0 specification

The Swagger UI provides:
- Complete endpoint documentation
- Request/response schemas
- Interactive "Try it out" functionality
- Authentication support

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

## Management API

All Management API endpoints are fully documented in the [Swagger UI](/api/swagger). Key endpoint categories include:

- **Authentication**: Login, logout, user management, 2FA
- **Repositories**: Create, list, update, delete, verify, sync repositories
- **Tokens**: Create, list, update, delete API tokens
- **Packages**: List packages, get package details, readme, changelog, statistics
- **Settings**: Configure Packagist mirroring and other settings
- **Artifacts**: Manage package artifacts and cleanup

For detailed request/response schemas, parameter descriptions, and examples, please use the interactive Swagger UI documentation.

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

