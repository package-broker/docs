---
sidebar_position: 2
title: Authentication Model
description: How PACKAGE.broker authenticates Composer and dashboard access
---

# Authentication Model

PACKAGE.broker supports two primary authentication flows:

- **Composer access**: Token-based **HTTP Basic Auth** for Composer clients (CI/CD, local dev).
- **Dashboard access**: **Session-based** auth for the web UI.

## Composer authentication (Basic Auth)

Composer requests include an `Authorization: Basic ...` header. PACKAGE.broker validates the token, checks expiry and permissions, and applies rate limits when configured.

## Dashboard authentication (Session)

The UI uses a session token (Bearer) issued at login. Sessions are validated on each request and expire automatically.

## Next steps

- See the full request flow in [Architecture Overview](./architecture)

