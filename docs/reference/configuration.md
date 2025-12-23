---
sidebar_position: 1
title: Configuration Reference
description: Complete reference for all environment variables and configuration options
---

# Configuration Reference

Complete reference for all PACKAGE.broker configuration options.

## Required Configuration

### ENCRYPTION_KEY

**Type**: `string`  
**Required**: Yes  
**Description**: Base64-encoded 32-byte encryption key for credential storage.

**Generation**:
```bash
$ openssl rand -base64 32
```

**Example**:
```bash
ENCRYPTION_KEY="dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGVuY3J5cHRpb24="
```

**Security**: Store securely. If lost, stored credentials cannot be decrypted.

## Database Configuration

### DB_DRIVER

**Type**: `string`  
**Required**: Yes  
**Options**: `d1` | `postgres` | `sqlite`  
**Default**: `sqlite`  
**Description**: Database driver to use.

**Example**:
```bash
DB_DRIVER=postgres
```

### DB_URL

**Type**: `string`  
**Required**: Yes  
**Description**: Database connection URL.

**PostgreSQL**:
```bash
DB_URL="postgresql://user:password@host:5432/database"
```

**SQLite**:
```bash
DB_URL="file:/data/database.sqlite"
```

**Cloudflare D1**: Set via `wrangler.toml` bindings (no URL needed).

## Storage Configuration

### STORAGE_DRIVER

**Type**: `string`  
**Required**: Yes  
**Options**: `s3` | `r2` | `fs`  
**Default**: `fs`  
**Description**: Storage driver for package artifacts.

**Example**:
```bash
STORAGE_DRIVER=s3
```

### S3 Configuration

**S3_ENDPOINT**
- **Type**: `string`
- **Required**: When `STORAGE_DRIVER=s3`
- **Description**: S3-compatible endpoint URL
- **Example**: `https://s3.amazonaws.com` or `https://minio.example.com:9000`

**S3_BUCKET**
- **Type**: `string`
- **Required**: When `STORAGE_DRIVER=s3`
- **Description**: S3 bucket name
- **Example**: `package-broker-artifacts`

**S3_REGION**
- **Type**: `string`
- **Required**: When `STORAGE_DRIVER=s3`
- **Description**: AWS region or S3-compatible region
- **Example**: `us-east-1`

**S3_ACCESS_KEY_ID**
- **Type**: `string`
- **Required**: When `STORAGE_DRIVER=s3`
- **Description**: S3 access key ID

**S3_SECRET_ACCESS_KEY**
- **Type**: `string`
- **Required**: When `STORAGE_DRIVER=s3`
- **Description**: S3 secret access key

### Filesystem Configuration

**STORAGE_FS_PATH**
- **Type**: `string`
- **Required**: When `STORAGE_DRIVER=fs`
- **Description**: Path to storage directory
- **Example**: `/data/storage`

### R2 Configuration

**R2_BUCKET**
- **Type**: `string`
- **Required**: When `STORAGE_DRIVER=r2` (Cloudflare only)
- **Description**: R2 bucket name
- **Set via**: `wrangler.toml` bindings

## Cache Configuration

### CACHE_DRIVER

**Type**: `string`  
**Required**: No (defaults to `memory`)  
**Options**: `kv` | `redis` | `memory`  
**Description**: Cache driver for metadata and rate limiting.

**Example**:
```bash
CACHE_DRIVER=redis
```

### Redis Configuration

**CACHE_REDIS_URL**
- **Type**: `string`
- **Required**: When `CACHE_DRIVER=redis`
- **Description**: Redis connection URL
- **Example**: `redis://localhost:6379` or `redis://user:pass@host:6379`

### KV Configuration

**KV Namespace**
- **Type**: Binding
- **Required**: When `CACHE_DRIVER=kv` (Cloudflare only)
- **Set via**: `wrangler.toml` bindings

## Queue Configuration

### QUEUE_DRIVER

**Type**: `string`  
**Required**: No  
**Options**: `cf` | `redis` | `rabbitmq` | `sqs`  
**Description**: Queue driver for async operations.

**Example**:
```bash
QUEUE_DRIVER=redis
```

### Queue URLs

**QUEUE_REDIS_URL**
- **Type**: `string`
- **Required**: When `QUEUE_DRIVER=redis`
- **Description**: Redis connection URL for queue

**QUEUE_SQS_URL**
- **Type**: `string`
- **Required**: When `QUEUE_DRIVER=sqs`
- **Description**: AWS SQS queue URL

## Session Configuration

### SESSION_DRIVER

**Type**: `string`  
**Required**: No (defaults to platform-specific)  
**Options**: `kv` | `redis` | `database` | `jwt`  
**Description**: Session storage driver for admin authentication.

**Example**:
```bash
SESSION_DRIVER=redis
```

**Note**: Currently defaults to KV on Cloudflare, requires implementation for other platforms.

## Application Configuration

### PORT

**Type**: `number`  
**Required**: No  
**Default**: `8080`  
**Description**: HTTP server port (Docker/Node.js deployments).

**Example**:
```bash
PORT=3000
```

### LOG_LEVEL

**Type**: `string`  
**Required**: No  
**Options**: `debug` | `info` | `warn` | `error`  
**Default**: `info`  
**Description**: Application log level.

**Example**:
```bash
LOG_LEVEL=debug
```

### NODE_ENV

**Type**: `string`  
**Required**: No  
**Options**: `development` | `production`  
**Default**: `production`  
**Description**: Node.js environment.

**Example**:
```bash
NODE_ENV=production
```

## Cloudflare-Specific Configuration

### Workers Bindings

Configured in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "package-broker-db"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-id"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "package-broker-artifacts"
```

## Configuration Examples

### Docker (SQLite + Filesystem)

```bash
ENCRYPTION_KEY="your-key-here"
DB_DRIVER=sqlite
DB_URL="file:/data/database.sqlite"
STORAGE_DRIVER=fs
STORAGE_FS_PATH="/data/storage"
CACHE_DRIVER=memory
PORT=8080
```

### Docker (PostgreSQL + S3 + Redis)

```bash
ENCRYPTION_KEY="your-key-here"
DB_DRIVER=postgres
DB_URL="postgresql://user:pass@postgres:5432/packages"
STORAGE_DRIVER=s3
S3_ENDPOINT="https://s3.amazonaws.com"
S3_BUCKET="package-broker-artifacts"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
CACHE_DRIVER=redis
CACHE_REDIS_URL="redis://redis:6379"
QUEUE_DRIVER=redis
QUEUE_REDIS_URL="redis://redis:6379"
PORT=8080
```

### Kubernetes (via Helm values.yaml)

```yaml
database:
  driver: postgres
  url: postgresql://user:pass@postgres-service:5432/packages

storage:
  driver: s3
  s3:
    endpoint: https://s3.amazonaws.com
    bucket: package-broker-artifacts
    region: us-east-1

cache:
  driver: redis
  redis:
    url: redis://redis-service:6379
```

## Next Steps

- Review deployment guides: [Deployment Overview](../deployment/overview)
- Check API reference: [API Reference](./api)
- See [CLI Reference](./cli) for configuration management

