# Content Security Policy hosts

`static/_headers` allows these hosts beyond `'self'`. They exist only for Google Analytics 4, which `src/lib/analytics.ts` loads after the visitor accepts. With no `GA4_MEASUREMENT_ID` at build time, the site makes no request to any of them.

| Directive | Host | Used for |
|---|---|---|
| `script-src` | `https://www.googletagmanager.com` | `gtag/js` tag script |
| `connect-src` | `https://*.google-analytics.com` | `g/collect` measurement requests, including regional endpoints |
| `connect-src` | `https://*.analytics.google.com` | `g/collect` measurement requests on the Google Analytics domain |
| `connect-src` | `https://*.googletagmanager.com` | tag configuration requests |
| `img-src` | `https://*.google-analytics.com`, `https://*.googletagmanager.com` | image-beacon fallback for measurement requests |

`script-src` keeps `'unsafe-inline'` because Docusaurus emits inline bootstrap scripts; the tag is injected as an external script, so no extra inline allowance was added.

## Verification status

These hosts come from Google's tag documentation, not from observed traffic: the build sandbox has no network. Before the first production deploy, run the consent test in live mode from a networked machine and compare the logged hosts with this table:

```sh
ANALYTICS_TEST_URL=<preview-url> node tests/analytics-consent.mjs --live
```

The script prints every Google host it observes after accepting. Remove any host in the table that does not appear, and add any host that does and is missing.

## Upgrade checks

`src/lib/analytics.ts` reads markup it does not own. After upgrading Docusaurus or `@easyops-cn/docusaurus-search-local`, confirm these selectors still match and the consent suite passes:

- `.theme-code-block` (Docusaurus code blocks, for `copy_command`)
- `[class*="noResults"]` (search empty state, for `search_zero_results`)
- `.navbar__search-input` (search field, read only to avoid repeat events)

Live check against a preview with a real or fake ID: `node tests/analytics-consent.mjs <preview-url> --live`
