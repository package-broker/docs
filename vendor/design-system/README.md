# Vendored design system

Provenance and per-file hashes are in `SOURCE.txt` and `SOURCE.sha256` (WEB-03).
Run checks from the site repository root:

```sh
shasum -a 256 -c vendor/design-system/SOURCE.sha256
node vendor/design-system/scripts/ds-health-check.mjs --strict src
node vendor/design-system/scripts/contrast-check.mjs
```

The research workspace owns `build-tokens.mjs` and the tokens build check;
do not regenerate tokens or run that build check in the site repository.
Update the source design system first, then copy the files and refresh both
provenance manifests. `tokens.json` supplies the contrast gate; `scripts/lib/`
contains the source helper modules. Copy rules are in `content-patterns.md`.
