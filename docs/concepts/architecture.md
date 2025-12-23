---
sidebar_position: 1
title: Architecture Overview
description: Understand how PACKAGE.broker works under the hood
---

# Architecture Overview

This document explains the internal architecture of PACKAGE.broker and how requests flow through the system.

## High-Level Architecture

PACKAGE.broker follows a **hexagonal architecture** (ports and adapters) pattern, separating business logic from infrastructure concerns.

```
┌─────────────────────────────────────────────────────────┐
│                    Application Core                      │
│  (Business Logic - Platform Agnostic)                   │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Routes  │  │ Services │  │  Sync    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Database   │  │   Storage    │  │    Cache     │
│    Port      │  │    Port      │  │    Port      │
└──────────────┘  └──────────────┘  └──────────────┘
           │              │              │
           ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Drivers    │  │   Drivers   │  │   Drivers    │
│ D1/Postgres/ │  │ S3/R2/FS    │  │ KV/Redis/    │
│   SQLite     │  │             │  │  Memory      │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Request Flow

### Composer Package Request

```
1. Composer Client
   └─> GET /packages.json
       └─> Authentication Middleware
           └─> Token Validation (Basic Auth)
               └─> Rate Limiting Check
                   └─> Packages Route Handler
                       └─> Database Query (cached)
                           └─> Response: packages.json

2. Composer Client
   └─> GET /p2/vendor/package.json
       └─> Authentication Middleware
           └─> Token Validation
               └─> Package Route Handler
                   └─> Database Query
                       └─> Response: package versions

3. Composer Client
   └─> GET /dist/vendor/package/1.0.0.zip
       └─> Authentication Middleware
           └─> Token Validation
               └─> Dist Route Handler
                   └─> Storage Driver Check
                       ├─> If cached: Serve from storage
                       └─> If not: Download from upstream
                           └─> Store in cache
                               └─> Serve to client
```

## Core Components

### Routes

HTTP request handlers organized by functionality:

- **Composer Routes**: `/packages.json`, `/p2/*`, `/dist/*`
- **API Routes**: `/api/tokens`, `/api/repositories`, `/api/packages`
- **Auth Routes**: `/api/auth/login`, `/api/auth/logout`

### Services

Business logic components:

- **UserService**: User management, authentication, 2FA
- **TokenService**: Token creation, validation, revocation
- **RepositoryService**: Repository source management
- **SyncService**: Package synchronization from upstream sources

### Storage Drivers

Abstraction layer for package artifact storage:

- **S3Driver**: AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2
- **FileSystemDriver**: Local disk storage
- **R2Driver**: Native Cloudflare R2 bindings

### Database Drivers

Abstraction layer for metadata storage:

- **D1Driver**: Cloudflare D1 (SQLite-compatible)
- **PostgresDriver**: PostgreSQL via Drizzle ORM
- **SQLiteDriver**: Local SQLite database

### Cache Drivers

Abstraction layer for caching:

- **KVDriver**: Cloudflare KV
- **RedisDriver**: Redis or Valkey
- **MemoryDriver**: In-memory LRU cache

## Data Flow

### Package Synchronization

1. **Repository Source Added**: Admin adds GitHub/GitLab/Bitbucket repository
2. **Credential Storage**: Credentials encrypted with AES-256-GCM and stored
3. **Initial Sync**: System validates credentials and fetches package metadata
4. **Lazy Loading**: Packages loaded on-demand when requested by Composer
5. **Artifact Caching**: ZIP files downloaded and stored in storage driver
6. **Metadata Caching**: Package metadata cached in database and cache driver

### Authentication Flow

**Composer Token Authentication**:
1. Client sends Basic Auth: `Authorization: Basic <base64(token:token-value)>`
2. Middleware extracts token and hashes with SHA-256
3. Database lookup for token hash
4. Validate expiration and permissions
5. Check rate limits (if KV/Redis available)
6. Attach token context to request

**Admin Session Authentication**:
1. Client sends Bearer token: `Authorization: Bearer <session-token>`
2. Session storage lookup (KV/Redis/Database)
3. Validate session expiration
4. Attach user context to request

## Caching Strategy

### Metadata Caching

- **packages.json**: Cached in database, refreshed on repository sync
- **Package versions**: Cached in database, updated on-demand
- **Rate limit counters**: Cached in KV/Redis with TTL

### Artifact Caching

- **ZIP files**: Stored in storage driver (S3/R2/filesystem)
- **On-demand download**: If artifact not cached, download from upstream
- **Cache headers**: Aggressive CDN caching for public packages

## Security Architecture

### Encryption

- **Credential Storage**: AES-256-GCM encryption with configurable key
- **Token Hashing**: SHA-256 for token storage (tokens never stored in plaintext)
- **TLS**: All communications encrypted in transit

### Access Control

- **Token Permissions**: Read-only vs write permissions
- **Token Scoping**: Package namespace restrictions (planned)
- **Rate Limiting**: Per-token rate limits to prevent abuse

### Audit Logging

- **Event Logging**: All write operations logged (planned)
- **Access Logging**: Package access events logged (planned)
- **Export Capability**: Logs exportable for compliance (planned)

## Platform Abstraction

The core application is platform-agnostic through the ports and adapters pattern:

- **Cloudflare Workers**: Uses D1, KV, R2, Queue drivers
- **Docker**: Uses PostgreSQL/SQLite, Redis, S3/FS drivers
- **Kubernetes**: Uses PostgreSQL, Redis, S3 drivers

The same business logic runs on all platforms - only the drivers change.

## Next Steps

- Learn about authentication: [Authentication Model](./authentication)
- Understand repositories: [Repository Sources](./repositories)
- Explore caching: [Caching & Storage](./caching-storage)

