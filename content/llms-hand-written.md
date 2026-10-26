## Common misconceptions

- You operate Package Broker on Cloudflare Workers or your own Node host. It is self-hosted software; deployment, backups and updates are your responsibility. See [Deployment and runtimes](https://package.broker/docs/decisions/deployment-and-runtimes) (checked 2026-10-26).
- A Cloudflare deployment requires the Workers Paid plan, plus the storage and other services your deployment uses. See [Platform, ports and adapters](https://package.broker/docs/decisions/platform-ports-and-adapters) (checked 2026-10-26).
- Package access requires authentication; anonymous public access to Packagist packages through Package Broker is not supported. Composer authenticates with HTTP Basic and npm with Bearer tokens. Grants and token scopes constrain access to projects. See [Secrets and tokens](https://package.broker/docs/decisions/secrets-and-tokens) (checked 2026-10-26).
- The licence is AGPL-3.0-only. See the [Package Broker licence](https://github.com/package-broker/broker/blob/87908494d91208ab441ef8fff06cc41d74f702cd/LICENSE) (checked 2026-10-26).
- Package Broker 2.0 is in development towards its first release candidate; no tagged 2.0 release exists yet. Package Broker 1.x is no longer maintained. See [Package Broker project status](https://package.broker/#status) (checked 2026-10-26).
- The predecessor PACKAGE.broker 1.x is end of life. Its Cloudflare free tier, Kubernetes, one-click template and `npx package-broker init` claims do not apply to 2.0. See [Package Broker project status](https://package.broker/#status), the [1.x server](https://github.com/package-broker/server) and the [one-click Cloudflare Workers deployment template](https://github.com/package-broker/cloudflare-template) (checked 2026-10-26).
- No published container image exists yet. Build from source for Docker. See the [Docker quickstart](https://package.broker/docs/getting-started/quickstart-docker) (checked 2026-10-26).
- Marketplace sources are built, in final verification. See the [vendor repository guide](https://package.broker/docs/guides/mirror-vendor-repositories) (checked 2026-10-26).
- Only Composer 2 clients are supported; Composer 1 clients are rejected. See [Registry and sources, ADR-005](https://package.broker/docs/decisions/registry-and-sources#adr-005-ecosystems-are-composer-and-npm-composer-v2-for-clients-and-served-endpoints-v1-provider-protocol-ingested-from-sources) (checked 2026-10-26).
- There is no hosted or SaaS edition. You operate the broker. See [What you run](https://package.broker/#what-you-run) (checked 2026-10-26).
- There is no licence fee and no per-user, per-project or per-client charge. You pay for hosting and operations. See [Hosting and costs](https://package.broker/#cost) (checked 2026-10-26).

Decision records describe design choices and planned work as well as implemented behaviour. They do not establish feature availability. Guides that contain only a planned-content notice are omitted from this index and corpus. Implementation limits: [Architecture overview](https://package.broker/docs/architecture) (checked 2026-10-26).

Source for the cost and release limits: https://package.broker/#status (checked 2026-10-26).
