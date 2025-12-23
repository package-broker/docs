---
sidebar_position: 3
title: Feature Comparison
description: Comprehensive feature comparison between PACKAGE.broker and other Composer repository solutions
---

# Feature Comparison

This page provides a detailed, evidence-based comparison between PACKAGE.broker and other Composer repository solutions available on the market.

:::info Legal Notice

All trademarks mentioned in this comparison are the property of their respective owners. This comparison is provided for informational purposes only. PACKAGE.broker is not affiliated with, endorsed by, or sponsored by any third-party services. See [Legal Notice](./migration/legal-notice.md) for details.

:::

## Overview

This comparison matrix is based on publicly available documentation, official feature pages, and verified information from each solution's official sources. Each feature claim includes citations to source documentation.

**Last verified:** December 23, 2025

## Comparison Matrix

import ComparisonTable from '@site/src/components/ComparisonTable';

<ComparisonTable 
  summaryOnly={false} 
  showCitations={true} 
  enableCompetitorSelector={true}
  defaultSelectedCompetitors={['private-packagist', 'satis', 'gitlab']}
  maxSelectedCompetitors={5}
/>

## Understanding the Comparison

### Value Types

- **✓ (Checkmark)**: Feature is supported
- **✗ (X)**: Feature is not supported
- **⚠ (Warning)**: Feature status is unknown or not verified
- **Text values**: Descriptive information about the feature

### Citations

When "Show citations" is enabled, each cell displays source links that verify the claim. These links point to official documentation, feature pages, or authoritative sources.

### Unknown Values

Some features are marked as "Unknown" when:
- Official documentation doesn't clearly state support
- Feature availability depends on plan/edition and cannot be verified
- Information is not publicly available

## Product Categories

### Self-Hosted Solutions

- **PACKAGE.broker**: Self-hosted Composer repository proxy and cache
- **Satis**: Static Composer repository generator
- **Packeton**: Self-hosted private Packagist alternative
- **Repman**: Self-hosted PHP repository manager

### SaaS Solutions

- **Private Packagist™**: Commercial hosted Composer repository service

### Platform-Integrated Solutions

- **GitLab**: Composer package registry integrated into GitLab

## Feature Groups

### Deployment

Features related to how the solution is deployed and operated:
- Deployment models (SaaS, self-hosted, serverless)
- Docker support
- Infrastructure requirements

### Features

Core functionality and capabilities:
- Private package hosting
- Web UI/dashboard
- Webhook synchronization
- Artifact caching strategies

### Integrations

Support for external services and platforms:
- GitHub integration
- GitLab integration
- Bitbucket integration
- Other VCS support

### Security & Compliance

Security features and compliance capabilities:
- Authentication methods
- Access control mechanisms
- Audit logging
- Compliance certifications

## How to Use This Comparison

1. **Identify your requirements**: Determine which features are essential for your use case
2. **Review the matrix**: Check which solutions support your required features
3. **Verify claims**: Use the citations to verify information directly from source documentation
4. **Consider deployment**: Evaluate whether SaaS or self-hosted fits your needs
5. **Test solutions**: When possible, test solutions in your environment before committing

## Contributing

If you find inaccuracies or have verified information about features marked as "Unknown", please:

- Open an issue on [GitHub](https://github.com/package-broker/server/issues)
- Provide links to official documentation supporting your claim
- Include the date of verification

We regularly update this comparison as new information becomes available.

## Related Documentation

- [Migration from Private Packagist™](./migration/from-private-packagist.md)
- [Migration from Satis](./migration/from-satis.md)
- [Legal Notice](./migration/legal-notice.md)
- [Getting Started](./intro.md)

