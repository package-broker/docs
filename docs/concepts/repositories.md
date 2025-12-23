---
sidebar_position: 3
title: Repository Sources
description: How PACKAGE.broker connects to upstream package sources
---

# Repository Sources

PACKAGE.broker can proxy and cache packages from multiple upstream sources, such as:

- Git providers (GitHub, GitLab, Bitbucket)
- Composer repositories (Packagist, private repositories, Satis)

## How it works (high level)

1. An admin adds a repository source in the dashboard.
2. PACKAGE.broker syncs package metadata.
3. Artifacts are cached on demand when requested by Composer.

## Next steps

- Learn how caching works in [Caching & Storage](./caching-storage)
- See overall system design in [Architecture Overview](./architecture)

