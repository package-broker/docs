# Site contributor instructions

This repository holds the Package Broker website, layouts, configuration and
deployment code. Documentation content belongs to `package-broker/broker/docs`
(DEC-G06). Never hand edit pulled content in `docs-content/`; change it in
`broker/docs` and let the sync workflow update the site.

## Stack and scope

Use Node 24 and the pnpm version in `package.json`. Keep dependency versions
exact and use the committed lockfile. The site uses Docusaurus 3 classic,
English only, no blog, and fails on broken links (DEC-G05, DEC-G10, WEB-01).
Do not enable `future.v4`: the Docusaurus 3 build works without it.
Keep the package's default module mode: Docusaurus generates mixed-module
route code that fails during static rendering under `type: module`.
Docs rendering is disabled in this scaffold; WEB-02 enables it with synced
content and the sidebar. WEB-06 supplies the landing page.

Preserve `static/img/logo.svg` at its public path (WEB-01). Branch protection,
the default-branch switch and preservation of v1 as `v1-archive` are owner
steps. Do not change repository settings as part of site implementation.

## Design system

DEC-G08 binds this site to the research design system. Files under
`vendor/design-system/` are copies, pinned by `SOURCE.txt` and `SOURCE.sha256`.
Change the source first, then re-vendor with updated provenance and hashes.
The research workspace owns token generation; do not run its tokens build
check here (WEB-03).

Keep CSS imports in this order: `tokens.css`, `components.css`,
`generated/infima.css`, then the self-hosted Fontsource fonts. Use tokens for
colours, spacing, typography and motion. Do not put `.pb-app` on docs pages;
Infima supplies their base styles. Do not use `button--success`,
`button--warning` or `button--info`. Do not add remote fonts or CDN assets.
New marketing components belong in the source component catalogue before
site use (WEB-10); the growth mocks are visual references.

## Copy rules

Read `vendor/design-system/content-patterns.md` before writing UI, docs or
marketing copy (DEC-G08). Its terminology table and templates are binding.
Use organization, project, source, proxy, package, version, revision, token,
scope, role, customer, grant, cut-off, frozen, quarantine, publish, sync,
revoke, rotate and disable as defined there. Use client only for an agency's
client in that scenario; avoid upstream, mirror and account as product terms.
Distinguish token kinds `pat`, `svc`, `cst` and token scopes `read`, `write`,
`full`. Do not infer support for an unshipped feature from the design system.

Use plain, direct English and sentence case. Lead with what the reader can
do, and name the mechanism behind each claim. Buttons name the resulting
action; labels are nouns; placeholders are examples and never replace labels.
Errors state what happened, why if known, and the next action in one or two
sentences, without blame or internal details. Show a copyable request id for
server errors. Disabled actions explain who can act. Link text names its
destination. Confirmations name the action and entity, effects, affected
people and reversibility; permanent actions say so.

Use ISO dates and explicit timezones for timestamps. Give numbers and
durations units, use correct plurals, and say "Not measured" for missing
measurements. Format identifiers as code. Show token prefixes rather than
masked secrets; use the show-once warning from the copy patterns. Use the
catalogue's status words, with durations separate. Say "you", use active
voice, and avoid exclamation marks, emoji and jokes in errors. Empty states
name what is empty, explain its purpose and offer one primary action.
Commands are copyable blocks with angle-bracket placeholders. Product copy
contains no backlog ids, model class names or internal phase labels.

Never: free, zero-ops, enterprise-ready, security scanning before PB-97,
or SOC 2 compatibility before PB-131.
Marketing intensifiers such as "powerful" or "seamless" are banned.
Never claim security results
mean "safe" or "clean"; name the advisory source and date instead.
Do not publish script-rendered numbers, screenshots of unshipped UI, or
unsourced competitor prices (POS section 1). Check feature claims against
the product source and decisions. Apply the growth `bin/gate-doc.sh` to
applicable Markdown copy (WEB-01).

## Required checks

Run from the site repository root (WEB-01, WEB-03):

```sh
export NO_UPDATE_NOTIFIER=1
pnpm install --offline --frozen-lockfile
pnpm build
pnpm typecheck
jq -e '[.dependencies,.devDependencies]|add|to_entries|all(.[]; .value|test("^[0-9]"))' package.json
shasum -a 256 -c vendor/design-system/SOURCE.sha256
node vendor/design-system/scripts/ds-health-check.mjs --strict src
node vendor/design-system/scripts/contrast-check.mjs
git rev-list --max-parents=0 HEAD | wc -l
grep -rn INSERT SECURITY.md
grep -rEn 'fonts\.(googleapis|gstatic)\.com|cdn\.' build
```

The root count must be 1; both grep checks must produce no matches (exit 1).
Review the diff against the ticket before reporting. Actions from `actions/*`
and `github/*` use `@vN`; third-party actions use a full SHA with a version
comment. Network-restricted work must record action versions for an online
re-check by the orchestrator. Security reports follow `SECURITY.md` (DEC-G16).
