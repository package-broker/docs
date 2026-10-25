# Documentation Style Guide

This guide ensures consistency across all PACKAGE.broker documentation.

## Voice and Tone

- **Concise and direct**: Get to the point quickly. Avoid unnecessary words.
- **Action-oriented**: Use imperative mood for instructions ("Create a token" not "You should create a token").
- **Professional but approachable**: Technical accuracy without being intimidating.
- **No apologies**: Don't apologize for missing features. State facts clearly.

## Code Block Formatting

### Bash/Shell Commands

Always include the prompt (`$`) to distinguish commands from output:

```bash
$ docker run -d -p 8080:8080 ghcr.io/package-broker/server:latest
```

### Configuration Files

Use language tags for syntax highlighting:

```toml
# wrangler.toml
name = "package-broker"
main = "node_modules/@package-broker/main/dist/index.js"
```

```yaml
# docker-compose.yml
services:
  package-broker:
    image: ghcr.io/package-broker/server:latest
```

```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://package-broker.example.com"
    }
  ]
}
```

### Inline Code

Use backticks for:
- File paths: `wrangler.toml`
- Environment variables: `ENCRYPTION_KEY`
- Command names: `composer install`
- API endpoints: `/api/tokens`
- Package names: `vendor/package`

## Page Structure Templates

### Quickstart Template

```markdown
# Title

Brief one-sentence overview.

## Prerequisites

- Item 1
- Item 2

## Step 1: [Action]

Description of what this step does.

```bash
$ command here
```

**Expected output:**
```
Output shown here
```

## Step 2: [Action]

...

## Verify Installation

1. Action to verify
2. Expected result

## Next Steps

- Link to next guide
- Link to related concept
```

### How-To Template

```markdown
# How to [Achieve Goal]

Brief description of what this guide accomplishes.

## Goal

What the user will achieve by following this guide.

## Steps

### Step 1: [Action]

```bash
$ command
```

### Step 2: [Action]

...

## Verification

How to verify the goal was achieved.

## Troubleshooting

Common issues and solutions.

## Related Documentation

- Link to related guides
```

### Reference Template

```markdown
# [Topic] Reference

Brief overview of what this reference covers.

## [Category 1]

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `PARAM` | string | Yes | - | Description |

## [Category 2]

...

## Examples

### Example 1

```language
code example
```
```

## Terminology

- **PACKAGE.broker**: Always use this exact capitalization and formatting
- **Composer**: Capitalize when referring to the PHP dependency manager
- **composer.json**: Lowercase when referring to the file
- **Repository**: Capitalize when referring to a Composer repository concept
- **repository**: Lowercase when referring to a Git repository or PACKAGE.broker repository source
- **Token**: Capitalize when referring to access tokens in general
- **token**: Lowercase when referring to a specific token instance

## Feature Status Indicators

When documenting features that are not yet implemented:

```markdown
:::info Planned Feature

This feature is planned but not yet implemented. See [Roadmap](../roadmap.md) for details.

:::
```

For implemented features, no indicator is needed.

## Links

- Use relative paths for internal documentation links: `[Getting Started](./getting-started.md)`
- Use absolute URLs for external links: `[GitHub](https://github.com/package-broker/server)`
- Always include descriptive link text, not "click here"

## Tables

Use tables for comparisons and reference data. Always include headers:

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |

## Admonitions

Use Docusaurus admonitions sparingly:

- `:::info` for informational notes
- `:::tip` for helpful tips
- `:::warning` for important warnings
- `:::danger` for critical security or data loss warnings

## Consistency Checklist

Before publishing any documentation:

- [ ] Code blocks use correct language tags
- [ ] Commands include `$` prompt
- [ ] File paths use backticks
- [ ] Terminology matches style guide
- [ ] Links are relative for internal docs
- [ ] Tables have headers
- [ ] Page follows appropriate template
- [ ] No unimplemented features claimed as available
- [ ] Trademark compliance checked (no competitor names in marketing copy)

