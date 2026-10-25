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
