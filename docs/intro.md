---
sidebar_position: 1
slug: /
---

# Introduction

**PACKAGE.broker** is a minimalistic, platform-agnostic Composer repository proxy and cache.

> Enterprise-grade private package management for PHP — secure, compliant, and lightweight.

![Dashboard View](/img/dashboard-view.png)

## What is PACKAGE.broker?

PACKAGE.broker is a self-hosted server application that acts as a proxy and cache for Composer packages. It sits between your PHP applications and upstream package sources (GitHub, GitLab, Bitbucket, or other Composer repositories), providing:

- **Caching**: Reduces bandwidth and speeds up `composer install` operations
- **Security**: Encrypted credential storage and token-based access control
- **Compliance**: Built-in audit logging and SOC 2 compatible architecture
- **Flexibility**: Deploy on Docker, Kubernetes, Cloudflare Workers, or any Node.js-compatible platform

## Key Principles

### Security First

- **AES-256-GCM** encrypted credential storage
- **Token-based authentication** with configurable permissions
- **Audit logging** for compliance requirements
- **Supply chain security**: Mirrors only what you need, reducing exposure to upstream vulnerabilities

### Minimalistic Core

We believe in doing one thing perfectly.

- **No bloat**: Core application focuses solely on package proxying and caching
- **Efficient**: Designed to run on low-resource environments or serverless edge networks
- **API-first**: Full REST API for automation and integration

### Platform Agnostic

Deploy PACKAGE.broker wherever you need it.

- **Docker**: Single container deployment with SQLite or PostgreSQL
- **Kubernetes**: Helm chart for production deployments
- **Cloudflare Workers**: Edge-optimized serverless deployment
- **Self-hosted**: Run on any VPS or dedicated server

## Architecture Overview

```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────┐
│  Composer   │ ──▶ │   PACKAGE.broker    │ ──▶ │   Storage   │
│   Client    │     │  Gateway & Cache    │     │  S3 • R2    │
└─────────────┘     └─────────────────────┘     └─────────────┘
                              ▲
                              │
              ┌───────────────┴───────────────┐
              │                               │
        ┌─────┴─────┐                 ┌───────┴───────┐
        │  GitHub   │                 │    GitLab     │
        │  Private  │                 │   Bitbucket   │
        └───────────┘                 └───────────────┘
```

1. **Composer Client** requests packages from PACKAGE.broker
2. **Application Core** validates tokens, checks cache, and serves packages
3. **Storage Layer** (S3, R2, or local filesystem) stores package artifacts
4. **Upstream Sync** securely fetches private dependencies from configured sources

## Quick Start

Choose your deployment method:

- **[Docker Quickstart](getting-started/quickstart-docker)** - Recommended for most users
- **[Cloudflare Workers](getting-started/quickstart-cloudflare)** - Zero-cost edge deployment
- **[Kubernetes](getting-started/quickstart-kubernetes)** - Production deployments

## Next Steps

- Learn the basics: [Composer 101 for DevOps](getting-started/composer-101)
- Explore use cases: [E-shop Extension Vendor Integration](use-cases/eshop-extension-vendor)
- Understand the architecture: [Architecture Overview](concepts/architecture)
