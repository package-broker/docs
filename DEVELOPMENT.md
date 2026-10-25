# Local development

Use Node 24 and the pnpm version pinned in `package.json`.

## Security metadata

`pnpm start` does not emit `/.well-known/security.txt`; that path shows the
site's 404 page instead of security metadata. The security metadata plugin validates the shared
policy on configuration load and emits the file during `pnpm build`.
Inspect `build/.well-known/security.txt` or use `pnpm serve` to check the file
after building. Production HTTP status and content type must be checked on
the deployed site.

Source: `plugins/security-metadata.cjs` (WEB-01).

## Page metadata and LLM outputs

Run `pnpm build`, `pnpm typecheck` and `pnpm test`. The build checks every HTML
page, the sitemap and robots policy, and both LLM outputs. Metadata overrides
belong in `src/data/page-metadata.json`; change docs content in the product
repository and sync it. Stub-only docs are excluded from both LLM outputs.
Keep factual corrections in `content/llms-hand-written.md` with evidence links.

Sources: `scripts/check-seo.mjs`, `scripts/curate-llms.mjs`, `scripts/check-llms.mjs` (WEB-11, WEB-12).

## Social card rendering

The build generates 1200 by 630 SVG sources from design-system tokens and
self-hosted Inter, stored once beside the SVGs. `static/img/og/render-list.json` maps every source
to its PNG destination. The orchestrator rasterises these SVGs with a browser
that loads the adjacent font, then places the PNGs at the listed destinations.
After rendering, run `node scripts/og/record.mjs` to record the SVG, font and PNG
content hashes in `static/img/og/rendered.json`. Commit the PNGs and manifest
with their sources. The build never updates the rendered hashes. Every build
requires every PNG, checks its source and font against the manifest, and checks
the PNG's recorded hash, 1200 by 630 dimensions and maximum size of 300 KB.

Sources: `scripts/og/generate.cjs`, `scripts/og/check.mjs`, `scripts/og/record.mjs` (WEB-11).
