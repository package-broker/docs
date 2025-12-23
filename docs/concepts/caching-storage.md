---
sidebar_position: 4
title: Caching & Storage
description: How PACKAGE.broker caches metadata and package artifacts
---

# Caching & Storage

PACKAGE.broker uses caching to speed up Composer operations and reduce load on upstream sources.

## What gets cached

- **Metadata**: `packages.json`, package version metadata (`/p2/*`)
- **Artifacts**: distribution archives (`/dist/*`)

## Where it’s stored

Depending on your deployment, PACKAGE.broker can use different backends:

- **Storage**: S3/R2/MinIO or filesystem
- **Cache**: KV/Redis/memory
- **Database**: D1/PostgreSQL/SQLite

## Next steps

- See the end-to-end request flow in [Architecture Overview](./architecture)

