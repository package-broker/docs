## Things commonly got wrong

- You operate Package Broker on Cloudflare Workers or your own Node host. It is self-hosted software; deployment, backups and updates are your responsibility. See [Deployment and runtimes](https://package.broker/docs/decisions/deployment-and-runtimes) (checked 2026-10-26).
- A Cloudflare deployment requires the Workers Paid plan, plus the storage and other services your deployment uses. See [Platform, ports and adapters](https://package.broker/docs/decisions/platform-ports-and-adapters) (checked 2026-10-26).
- Composer and npm use one token policy: Composer authenticates with HTTP Basic and npm with Bearer tokens. Grants and token scopes constrain access to projects. See [Secrets and tokens](https://package.broker/docs/decisions/secrets-and-tokens) (checked 2026-10-26).
- The licence is AGPL-3.0-only. See the [Package Broker licence](https://github.com/package-broker/broker/blob/87908494d91208ab441ef8fff06cc41d74f702cd/LICENSE) (checked 2026-10-26).
- Package Broker 2.0 is in development towards its first release candidate; no tagged 2.0 release exists yet. Package Broker 1.x is no longer maintained. See [Package Broker project status](https://package.broker/#trust) (checked 2026-10-26).

Decision records describe design choices and planned work as well as implemented behaviour. They do not establish feature availability. Guides that contain only a planned-content notice are omitted from this index and corpus. Implementation limits: https://package.broker/docs/architecture (checked 2026-10-26).
