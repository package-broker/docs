---
sidebar_position: 4
title: Kubernetes Deployment (Planned)
description: Kubernetes/Helm deployment support is planned for future release
---

# Kubernetes Deployment (Planned)

:::info Planned Feature

Kubernetes/Helm chart support is planned but not yet available. This page outlines what to expect when the feature is released.

:::

PACKAGE.broker will support deployment on Kubernetes using an official Helm chart for production-ready, scalable deployments.

## Planned Features

### Helm Chart

- Official Helm repository
- Production-ready defaults
- Configurable resource limits
- Support for PostgreSQL, Redis, S3-compatible storage
- Ingress configuration templates

### Deployment Options

- **PostgreSQL**: Production database backend
- **Redis**: Caching and session storage
- **S3-compatible**: Object storage for artifacts
- **Horizontal scaling**: Multiple pod replicas

## Timeline

**Target**: Q2 2025

See [Roadmap](../reference/roadmap) for detailed timeline and updates.

## Current Deployment Options

While Kubernetes support is being developed, you can deploy PACKAGE.broker using:

- **[Docker Quickstart](quickstart-docker)** - Single container deployment
- **[Cloudflare Workers Quickstart](quickstart-cloudflare)** - Serverless edge deployment

## Getting Updates

- Check [GitHub Issues](https://github.com/package-broker/server/issues) for Kubernetes-related updates
- Follow [GitHub Discussions](https://github.com/orgs/package-broker/discussions) for announcements
- Review [Roadmap](../reference/roadmap) for feature status

## Next Steps

- Deploy using [Docker Quickstart](quickstart-docker) or [Cloudflare Workers Quickstart](quickstart-cloudflare)
- Review [Architecture](../concepts/architecture) to understand deployment requirements
- Check [Roadmap](../reference/roadmap) for Kubernetes implementation timeline
- See [Deployment Overview](../deployment/overview) for production considerations
