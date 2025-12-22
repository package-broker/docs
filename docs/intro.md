---
sidebar_position: 1
slug: /
---

# Introduction

**Minimalistic, SOC-2 Compatible Composer Mirror.**

> Enterprise-grade private package management for PHP — secure, compliant, and lightweight.

![Dashboard View](/img/dashboard-view.png)

## Why This Exists

Managing private Composer packages requires a solution that is secure, audit-ready, and cost-effective.

**PACKAGE.broker** provides a robust, minimalistic server application for mirroring composer packages. It is designed to be **SOC-2 compatible**, ensuring your software supply chain meets enterprise security standards.

## Key Principles

### 🛡️ SOC-2 Ready & Secure

- **AES-256-GCM** encrypted credential storage.
- **Audit Logging** for all access and modification events.
- **Token-based authentication** with strict scope control.
- **Supply Chain Security**: Mirrors specifically what you need, reducing exposure to upstream vulnerabilities.

### ⚡ Minimalistic Core

We believe in doing one thing perfectly.
- **No bloat**: Does not bundle unnecessary UI frameworks or complex dependencies in the core.
- **Efficient**: Written to run on low-resource environments or serverless edge networks.

### ☁️ Flexible Deployment

While **PACKAGE.broker** is platform-agnostic, it is highly optimized for **Cloudflare**.
- **Small Projects**: Deploy to **Cloudflare Pages / Workers** for a zero-maintenance, free-tier compatible experience.
- **Enterprise**: Deploy to your own infrastructure with strict network controls.

## Features Comparison

| Feature | PACKAGE.broker | Commercial SaaS | Legacy Self-Hosted |
|---------|----------------|-----------------|--------------------|
| **Compliance** | ✅ SOC-2 Ready | Varies | ❌ Manual Effort |
| **Cost** | ✅ Minimal / Free | ❌ $$$ Per User | ❌ Server Costs |
| **Architecture** | ✅ Minimalistic | ❌ Closed Source | ❌ Heavy / Bloated |
| **Performance** | ✅ Edge Optimized | ✅ Global CDN | ❌ Single Server |
| **Private Packages** | ✅ Unlimited | ✅ Tiered | ✅ |
| **Artifact Caching** | ✅ | ✅ | ❌ |

## Architecture

![Architecture Diagram](/img/architecture-diagram.svg)

1.  **Composer Client** requests packages.
2.  **Application Core** validates tokens and checks cache.
3.  **Storage Layer** (D1/R2 or S3/Postgres) serves metadata and artifacts.
4.  **Upstream Sync** securely fetches private dependencies.
