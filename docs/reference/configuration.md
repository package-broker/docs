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
DB_URL="/data/database.sqlite"
```

**Note**: For SQLite, use a file path (e.g., `/data/database.sqlite`), not a URI with `file:` prefix.

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

## Email Configuration (SMTP)

SMTP configuration enables email sending for user invitations and notifications. Email sending is **optional** - if SMTP is not configured, user creation will still work, but no emails will be sent.

### SMTP_HOST

**Type**: `string`  
**Required**: Yes (for email functionality)  
**Description**: SMTP server hostname.

**Examples**:
- Gmail: `smtp.gmail.com`
- SendGrid: `smtp.sendgrid.net`
- AWS SES: `email-smtp.us-east-1.amazonaws.com`
- Mailgun: `smtp.mailgun.org`
- Custom: `mail.example.com`

### SMTP_PORT

**Type**: `string`  
**Required**: No  
**Default**: `587`  
**Description**: SMTP server port.

**Common Values**:
- `587` - STARTTLS (recommended for most providers)
- `465` - SSL/TLS (automatically enabled)
- `25` - Unencrypted (not recommended for production)

**Example**:
```bash
SMTP_PORT=587
```

### SMTP_USER

**Type**: `string`  
**Required**: Yes (for email functionality)  
**Description**: SMTP authentication username.

**Examples**:
- Gmail: Your Gmail address (e.g., `your-email@gmail.com`)
- SendGrid: `apikey` (literal string)
- AWS SES: IAM access key ID
- Mailgun: Your Mailgun account email
- Custom: SMTP username provided by your email provider

### SMTP_PASS

**Type**: `string`  
**Required**: Yes (for email functionality)  
**Description**: SMTP authentication password or API key.

**Security**: Store as environment variable or secret. Never commit to version control.

**Examples**:
- Gmail: App-specific password (not your regular Gmail password)
- SendGrid: API key from SendGrid dashboard
- AWS SES: IAM secret access key
- Mailgun: API key from Mailgun dashboard
- Custom: SMTP password provided by your email provider

### SMTP_FROM

**Type**: `string`  
**Required**: No  
**Default**: Value of `SMTP_USER`  
**Description**: "From" email address displayed in sent emails.

**Examples**:
```bash
SMTP_FROM=noreply@example.com
SMTP_FROM="Package Broker <noreply@example.com>"
```

**Note**: Some email providers require the "From" address to match your verified domain or account.

### Email Functionality

When SMTP is configured (`SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are set), the system will:
- Automatically send invitation emails when admins create new users
- Include invitation links or temporary passwords in emails
- Use HTML email templates for better formatting

**Note**: Email sending is optional. If SMTP is not configured, user creation will still work, but no emails will be sent. Email failures are logged but don't block user creation.

### Email Provider Examples

#### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=your-email@gmail.com
```

**Note**: Gmail requires an [app-specific password](https://support.google.com/accounts/answer/185833) for SMTP authentication. Regular passwords won't work.

#### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

**Note**: SendGrid uses `apikey` as the username and your API key as the password.

#### AWS SES

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIAIOSFODNN7EXAMPLE
SMTP_PASS=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SMTP_FROM=noreply@yourdomain.com
```

**Note**: Use IAM credentials with SES SMTP access. Ensure your domain/email is verified in SES.

#### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.yourdomain.com
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

**Note**: Mailgun provides SMTP credentials in the dashboard under Sending → Domain Settings.

#### Custom SMTP Server

```bash
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
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
DB_URL="/data/database.sqlite"
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

