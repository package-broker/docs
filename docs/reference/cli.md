---
sidebar_position: 3
title: CLI Reference
description: Command-line interface for PACKAGE.broker
---

# CLI Reference

PACKAGE.broker provides a CLI tool (`@package-broker/cli`) for initializing deployments and managing configuration.

## Installation

```bash
npm install @package-broker/cli @package-broker/main
```

## Commands

### init

Initialize a new PACKAGE.broker deployment.

```bash
npx package-broker
```

**What it does**:
- Creates `wrangler.toml` from template
- Copies migration files to `migrations/` directory
- Displays next steps for configuration

**Example output**:
```
🚀 Initializing PACKAGE.broker...

✅ Created wrangler.toml
✅ Copied 10 migration files

📝 Next steps:
1. Edit wrangler.toml with your configuration
2. Login to Cloudflare: npx wrangler login
3. Create Cloudflare resources
4. Apply database migrations
5. Deploy: npx wrangler deploy
```

## Future Commands (Planned)

### init --interactive

Interactive setup wizard:

```bash
npx package-broker init --interactive
```

**Features** (planned):
- Tier selection (free/paid)
- Automatic Cloudflare resource creation
- Auto-generated configuration
- One-command deployment

See [Roadmap](./roadmap) for implementation timeline.

## Configuration Files

### wrangler.toml

Cloudflare Workers configuration file. Created by `init` command.

**Location**: Project root

**Template**: Copied from `@package-broker/main/wrangler.example.toml`

### migrations/

Directory containing database migration SQL files.

**Location**: `migrations/` in project root

**Source**: Copied from `@package-broker/main/migrations/`

## Environment Variables

The CLI respects standard Node.js environment variables:

- `NODE_ENV` - Environment mode (development/production)
- `LOG_LEVEL` - Logging verbosity (debug/info/warn/error)

## Troubleshooting

### Command Not Found

If `npx package-broker` fails:

```bash
# Verify installation
npm list @package-broker/cli

# Reinstall if needed
npm install @package-broker/cli @package-broker/main
```

### Missing wrangler.toml

If `wrangler.toml` is not created:

```bash
# Check node_modules
ls node_modules/@package-broker/main/wrangler.example.toml

# Manually copy if needed
cp node_modules/@package-broker/main/wrangler.example.toml wrangler.toml
```

## Next Steps

- See [Cloudflare Quickstart](../getting-started/quickstart-cloudflare) for complete setup guide
- Review [Configuration Reference](./configuration) for all options
- Check [Roadmap](./roadmap) for upcoming CLI features

