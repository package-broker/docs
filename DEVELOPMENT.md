# Local development

Use Node 24 and the pnpm version pinned in `package.json`.

## Security metadata

`pnpm start` does not emit `/.well-known/security.txt`; that path shows the
site's 404 page instead of security metadata. The security metadata plugin validates the shared
policy on configuration load and emits the file during `pnpm build`.
Inspect `build/.well-known/security.txt` or use `pnpm serve` to check the file
after building. Production HTTP status and content type must be checked on
the deployed site.

Source: `/Users/lbajsarowicz/lbajsarowicz/package-broker/site-main/plugins/security-metadata.cjs`.

## Page metadata and LLM outputs

Run `pnpm build`, `pnpm typecheck` and `pnpm test`. The build checks every HTML
page, the sitemap and robots policy, and both LLM outputs. Metadata overrides
belong in `src/data/page-metadata.json`; change docs content in the product
repository and sync it. Stub-only docs are excluded from both LLM outputs.
Keep factual corrections in `content/llms-hand-written.md` with evidence links.

Source: `/Users/lbajsarowicz/lbajsarowicz/package-broker/site-main/scripts/check-seo.mjs`.

## Social card rendering

The build generates 1200 by 630 SVG sources from design-system tokens and
embedded self-hosted Inter. `static/img/og/render-list.json` maps every source
to its PNG destination. The orchestrator rasterises these SVGs with a browser
that loads the embedded font, then places the PNGs at the listed destinations.
Rebuild after rendering and run `node scripts/og/check.mjs build --require-png`
before publishing. Every PNG must be 1200 by 630 pixels and at most 300 KB.
The ordinary build reports missing PNGs so a source-only handoff is possible;
the strict check fails if any referenced PNG is missing.

Source: `/Users/lbajsarowicz/lbajsarowicz/package-broker/site-main/scripts/og/check.mjs`.
