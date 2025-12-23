---
sidebar_position: 4
title: Roadmap
description: Planned features and upcoming improvements for PACKAGE.broker
---

# Roadmap

This page outlines planned features and improvements for PACKAGE.broker. Features are organized by priority and implementation status.

## High Priority

### Enhanced CLI Onboarding (Cloudflare)

**Status**: Planned  
**Target**: Q2 2025

Interactive CLI that simplifies Cloudflare deployment to a single command:

```bash
npm install @package-broker/cloudflare
npx package-broker-cloudflare init --interactive
```

**Features**:
- Tier selection (free/paid)
- Automatic Cloudflare resource creation
- Auto-generated `wrangler.toml` with all IDs populated
- One-command deployment

See [FUTURE.md](https://github.com/package-broker/server/blob/main/FUTURE.md#87-enhanced-cli-onboarding-cloudflare) for detailed specification.

### Kubernetes/Helm Chart

**Status**: Planned  
**Target**: Q2 2025

Official Helm chart for Kubernetes deployments with:
- Production-ready defaults
- Configurable resource limits
- Support for PostgreSQL, Redis, S3-compatible storage
- Ingress configuration templates

### Management API for Token Provisioning

**Status**: Planned  
**Target**: Q1 2025

API endpoints for programmatic token management:
- `POST /api/tokens/generate` - Create customer tokens
- `GET /api/tokens/:id` - Retrieve token metadata
- `DELETE /api/tokens/:id` - Revoke tokens
- `PATCH /api/tokens/:id` - Update token properties

**Use Case**: E-shop integration for automatic customer token provisioning.

See [E-shop Extension Vendor Integration](../use-cases/eshop-extension-vendor) for details.

### Fine-Grained Package Permissions

**Status**: Planned  
**Target**: Q1 2025

Token scoping to specific vendor namespaces:
- Restrict tokens to `vendor-name/*` packages
- Package-level access control
- Enhanced security for multi-tenant deployments

## Medium Priority

### Persistent Audit Logging

**Status**: Planned  
**Target**: Q2 2025

Durable audit log storage with:
- Database-backed audit log table
- Configurable retention policies
- Export capabilities for compliance
- Search and filtering interface

**Note**: Structured logging and Analytics Engine events are currently available. This feature adds persistent storage and compliance-grade retention.

### Webhook-Triggered Repository Sync

**Status**: Planned  
**Target**: Q2 2025

Automatic repository synchronization via webhooks:
- GitHub webhook integration
- GitLab webhook integration
- Bitbucket webhook integration
- Configurable sync triggers

### Key Rotation Tool

**Status**: Planned  
**Target**: Q3 2025

CLI tool for rotating encryption keys:
- Generate new encryption key
- Re-encrypt stored credentials
- Zero-downtime rotation process

## Low Priority

### Config Export/Import

**Status**: Planned  
**Target**: Q3 2025

Export and import configuration:
- Backup repository sources
- Export token metadata (not tokens themselves)
- Import configuration for migration

### Platform-Agnostic Session Storage

**Status**: Planned  
**Target**: Q3 2025

Session storage adapters for:
- Redis (already supported for cache)
- Database-backed sessions
- Cloudflare KV sessions

## Contributing

If you'd like to contribute to any of these features, please:
1. Check [GitHub Issues](https://github.com/package-broker/server/issues) for existing discussions
2. Open a new issue to discuss the feature
3. See [Contributing Guide](../contributing/index) for development setup

## Feature Requests

Have an idea for a feature? Share it in [GitHub Discussions](https://github.com/orgs/package-broker/discussions).

