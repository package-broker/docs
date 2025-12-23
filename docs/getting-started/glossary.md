---
sidebar_position: 5
title: Glossary
description: Key terms and concepts used in PACKAGE.broker documentation
---

# Glossary

## A

**Access Token**: A credential used to authenticate Composer requests to PACKAGE.broker. Tokens have configurable permissions (readonly or write) and optional rate limits.

**Artifact**: A package distribution file (typically a ZIP archive) containing the actual package code. Stored in R2, S3, or filesystem storage.

**Audit Log**: A record of all significant events in PACKAGE.broker, including authentication, package access, and configuration changes. Required for compliance.

## C

**Cache**: Temporary storage for frequently accessed data. PACKAGE.broker uses caching for package metadata and rate limiting counters.

**Composer**: PHP's dependency manager. Downloads and installs PHP packages based on `composer.json` declarations.

**composer.json**: A JSON file that declares a PHP project's dependencies and repository sources.

**composer.lock**: A file that pins exact versions of all dependencies (including transitive) for reproducible builds.

**Credential Type**: The authentication method used for a repository source (e.g., `github_token`, `gitlab_token`, `http_basic`).

## D

**Dist (Distribution)**: A pre-built package archive (ZIP file) ready for installation. Faster than source distributions.

**Driver**: An implementation of a port interface. Examples: `D1Driver`, `PostgresDriver`, `S3Driver`, `RedisDriver`.

## M

**Management API**: REST API endpoints for managing PACKAGE.broker resources (tokens, repositories, users). Requires management API tokens for authentication.

## P

**Package**: A PHP library identified by `vendor/package-name` (e.g., `monolog/monolog`).

**Package Filter**: A pattern that restricts which packages are synced from a repository source (e.g., `vendor/*`).

**Packagist**: The default public Composer repository at packagist.org.

**Port**: An interface defining a contract for infrastructure components (database, cache, storage, queue). Part of hexagonal architecture.

## R

**Repository**: A source where Composer can find packages. Types include VCS (GitHub, GitLab, Bitbucket) and Composer repositories.

**Repository Source**: A configured upstream repository in PACKAGE.broker that provides packages.

## S

**Source Distribution**: A Git repository clone of a package. Slower to download but allows development modifications.

**Storage Driver**: The implementation used for storing package artifacts (S3, R2, filesystem).

## T

**Token**: See Access Token.

**Token Scoping**: Restricting a token's access to specific packages or namespaces (e.g., `vendor/*`).

## V

**VCS (Version Control System)**: Git-based repositories (GitHub, GitLab, Bitbucket) that can serve as package sources.

**Vendor Namespace**: The first part of a package name (e.g., `vendor` in `vendor/package`). Used for access control scoping.


