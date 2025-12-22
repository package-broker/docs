---
sidebar_position: 3
title: SOC2 Compliance
description: Overview of PACKAGE.broker security features and SOC2 compliance mapping for Cloudflare and Self-Hosted environments.
---

# SOC2 Compliance

PACKAGE.broker is designed with security and compliance as first-class citizens. This document outlines how the solution maps to SOC2 Trust Services Criteria and provides a guide for deploying the solution in a compliant manner, whether you are running on **Cloudflare's Edge**, **Cloud Platforms (AWS, DigitalOcean)**, or **Self-Hosted** environments.

## Compliance Matrix

The following table maps standard SOC2 requirements to PACKAGE.broker's technical implementation across supported platforms.

| SOC2 Control Area | Requirement | Cloudflare Edge Implementation | Containers (AWS/DO/Self-Hosted) |
|-------------------|-------------|--------------------------------|---------------------------------|
| **CC6.1 (Security)** | Logical access restricted to authorized users. | **Token & Access Control**: Unified logic. API tokens are encrypted. UI supports Role-Based Access Control (Admin/Viewer). | **Same**: The core application enforces identical access control logic regardless of infrastructure. |
| **CC6.1 (Security)** | Credentials must be stored securely. | **D1 + AES-256**: Credentials stored in generic D1 database, encrypted with AES-256-GCM. | **Any DB + AES-256**: Credentials encrypted in PostgreSQL/SQLite using the same AES-256 keys. Secrets can be injected via AWS Secrets Manager or DO App Config. |
| **CC6.7 (Security)** | Transmission of data must be encrypted. | **TLS 1.3**: Enforced automatically by Cloudflare's global edge network. | **Load Balancer Required**: Terminate TLS at the Ingress level (AWS ALB, DO Load Balancer, or Traefik/Nginx). |
| **CC2.2 (Availability)** | System logging must capture security events. | **Workers Logs**: Structured JSON logs emitted to Cloudflare logging pipeline. | **Stdout/Stderr**: Logs emitted to CloudWatch (AWS), DO Log Forwarding, or centralized logging (ELK) via container drivers. |
| **CC2.3 (Availability)** | Data backup and retention/recovery. | **Cloudflare Built-in**: D1 time-travel recovery and R2 automatic redundancy. | **Managed Services**: Rely on AWS RDS / DO Managed DB automated backups and S3/Spaces versioning. |
| **CC6.8 (Security)** | Prevent unauthorized code execution. | **Serverless Isolation**: Strong V8 Isolate security boundary per request. | **Container Isolation**: ECS Tasks (AWS), App Platform Isolation (DO), or unprivileged Docker containers. |
| **CC7.1 (Availability)** | System capacity management. | **Auto-scaling**: Native Cloudflare scaling. | **Auto-scaling**: AWS App Runner / DO App Platform auto-scaling based on CPU/Memory metrics. |
| **CC8.1 (Processing)** | Input validation and data integrity. | **Schema Validation**: Shared Zod schemas enforce strict input validation for all protocols. | **Same**: Input validation is part of the application core. |

## Deployment Guide for Compliance

To ensure your PACKAGE.broker deployment remains SOC2 compliant, you must properly configure your specific environment.

### 1. Persistent Logging (Required)

SOC2 requires retaining logs for audit purposes (typically 1 year).

**Cloudflare Users:**
*   **Option A: App-Level Logging (Standard/Pro)**:
    *   **Strategy**: application explicitly sends structured JSON audit logs to an external destination during the request lifecycle.
    *   **Implementation**: Use `context.waitUntil()` to dispatch critical events (`auth_login`, `repository_delete`) to:
        *   **Cloudflare R2**: Store raw JSON lines in a "logs" bucket (Retention: Infinite).
        *   **External API**: Post to Datadog/Axiom/BetterStack logging endpoints.
    *   *Note*: This requires specific configuration in `wrangler.toml` (e.g., `LOG_SINK_URL`).
*   **Option B: Logpush (Enterprise)**:
    *   Native integration that streams all Worker logs (stdout/console) to your SIEM/S3.
    *   *Pros*: Zero code change, captures runtime errors.

**Cloud & Self-Hosted Users:**
*   **AWS**: Configure CloudWatch Logs retention to 365+ days or stream to S3/Glacier.
*   **DigitalOcean**: Enable Log Forwarding to an external provider (Datadog, Papertrail).
*   **Generic**: Ensure `stdout` is captured and stored permanently.

### 2. Database & Storage Security

**Encryption at Rest:**
*   **Cloudflare**: Enabled by default on D1 and R2.
*   **AWS**: Enable KMS Encryption for RDS and S3 Buckets.
*   **DigitalOcean**: Managed Databases and Spaces are encrypted at rest by default.
*   **Self-Hosted**: Ensure volume encryption (e.g., LUKS) for database paths.

**Backups:**
*   **AWS/DO**: Enable "Point-in-Time Recovery" (PITR) and daily snapshots for Managed Databases.
*   **Self-Hosted**: Configure automated backup scripts (`pg_dump`) to remote storage.

### 3. Encryption Key Rotation

The `ENCRYPTION_KEY` environment variable protects all stored credentials.

*   **AWS**: Store this in AWS Secrets Manager and rotate using Lambda/ECS deployment updates.
*   **General**: Follow the standard rotation procedure: Deploy new key -> Run Rotation Script -> Deprecate old key.

### 4. Network Isolation & WAF

*   **Cloudflare**: Enable WAF rules on your zone.
*   **AWS**: Attach AWS WAF to the Application Load Balancer (ALB) or App Runner service.
*   **DigitalOcean**: Use Cloud Firewalls to restrict access to the Load Balancer ports only.
*   **Network Policy**: Ensure the database is in a private subnet, inaccessible from the public internet.

### 5. Dependency Management

*   Periodically update the docker image or npm packages to receive security patches.
*   **Container Scanning**: Use AWS ECR Scanning or similar tools to detect CVEs in the application image before deployment.
