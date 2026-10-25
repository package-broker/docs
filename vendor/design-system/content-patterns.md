# Content patterns

English only. Applies to application, docs and website UI copy. Product copy never contains backlog ids (PB-nn), model class names or internal phase labels.

## Terminology

Use these words, exactly. One word per concept.

| Term | Meaning | Do not say |
|---|---|---|
| organization | The deployment's single tenant: owns projects, sources, proxies, customers, settings | tenant, account, suborganization |
| project | A named set of packages, grants and tokens; the unit developers install from | workspace, repo, suborganization |
| source | A configured origin Package Broker reads packages from (GitHub App, Git URL, Composer repository, npm registry) | upstream, remote, integration |
| proxy | A public pull-through to Packagist or npmjs, with cache rules | mirror, cache |
| package | A named distributable (`vendor/name`, `@scope/name`) | module, library |
| version | A release of a package (`3.3.1`) | release, tag |
| revision | An immutable stored build of one version (digest, commit, timestamp) | rebuild, snapshot |
| token | A credential. Kinds: `pat` personal access token, `svc` service token, `cst` customer token | key, API key (except "vendor API key" for a customer service token in vendor docs) |
| scope (token) | What a token may do: `read` (read packages), `write` (publish packages), `full` (all operations) | permission, role |
| scope (UI) | The Organization or a project chosen in the top bar | context, workspace |
| role | A person's rights: organization owner, admin, member; project maintainer, developer, reader | access level |
| customer | An external party that installs packages under a cut-off, with its own token | client, tenant, subscriber |
| grant | A recorded right of a person, group or customer to a project or package | permission, assignment |
| cut-off | The date up to which a customer sees versions; later versions are hidden | freeze date, validity |
| frozen | A customer state: the cut-off applies and new versions are not visible | locked |
| quarantine | A holding state for new versions until an admin approves them | hold, pending |
| publish | Make a package version available through the broker | upload (except when describing the file upload tab) |
| sync | Read a source and update stored metadata | refresh, pull |
| revoke | Permanently end a token | delete token |
| rotate | Replace a credential value and keep its identity | regenerate |
| disable | Reversible stop (customer, source, token) | deactivate |

Token kind prefixes shown in identifiers: `pb_pat_`, `pb_svc_`, `pb_cst_`.

## Microcopy rules

1. Buttons are verbs naming the result: "Create token", "Revoke token", "Add source", "Approve version". Never "OK", "Submit", "Yes". The cancel button is "Cancel". The confirm button repeats the action and, in a destructive case, the entity: "Disable customer acme".
2. Sentence case everywhere: "Add source", "Needs attention". Product names keep their case.
3. Labels are nouns: "Project slug", not "Enter the slug". Placeholders show an example, never an instruction, and never replace a label.
4. Errors say what happened, why if known, and what to do next, in that order, in one or two sentences. No codes without words. Never blame: "The token expired on 2026-10-01. Create a new token." Not "You entered an invalid token".
5. Dates are ISO 8601 with a timezone: `2026-10-14 09:30 UTC`. Date-only values are `2026-10-14`. Relative time is secondary: "3 h ago". No month names, no locale formats.
6. Numbers carry units everywhere: "48 s", "12.4 MB", "2 d", "99.2 %" (a thin space before `%` is optional). Large numbers use a comma for thousands in prose and plain digits in tables with tabular figures. Never "0" for "not measured": "Not measured".
7. Durations: "5 min", "2 h", "30 d". Expiry: "Expires in 7 days (2026-10-21 09:30 UTC)".
8. Counts use plural forms: "1 package", "2 packages". The empty case says "No packages".
9. Identifiers are code, never prose-wrapped: `vendor/package`, `@scope/name`, `pb_svc_ab12`. Show a prefix, never a masked secret ("ab12****").
10. Say "you" to the user, "we" never (the system is not a person). Prefer active voice. No exclamation marks, no emoji, no jokes in errors.
11. Status words: Healthy, Syncing, Queued, Running, Failed, Disabled, Frozen, Expired, Quarantined, Approved, Not measured, Not scanned. A status never contains a duration; that goes in its own column.
12. Security results never claim safety: "No known advisories as of 2026-10-14 (source OSV)". Not "Clean" or "Safe".
13. Permissions: say who can do it. Disabled actions explain why: "Only project maintainers can revoke tokens."
14. Link text is the destination: "Token scopes", never "here".
15. Secrets: "Copy it now. You cannot see it again." Not "Make sure to save this".

## Button and action labels

| Situation | Primary | Secondary |
|---|---|---|
| Create | Create token | Cancel |
| Confirm destructive | Revoke token ci-install | Cancel |
| Wizard | Next, Back, Create source | Cancel |
| After show-once | Done | Copy |
| Retry | Try again | Cancel |
| Navigation to create | Add source (button in header) | |

## Empty state templates

Structure: heading (what is empty), one sentence (why or what it is for), one primary action, optional link.

| Kind | Heading | Body | Action |
|---|---|---|---|
| First use | No sources yet | Sources are where Package Broker reads packages from. Add one to start. | Add source |
| No results | No packages match "acme" | Check the spelling or clear a filter. | Clear filters |
| No grants | You have no projects yet | Ask an organization admin to add you to a project. | (link) Who are the admins |
| Discovery pending | Looking for packages | The source is connected. Discovery usually takes under a minute. | View job |
| Discovery failed | Discovery failed (401) | Package Broker could not read the repositories. The credential may have expired. | Test connection |
| No tokens in project | No tokens for project-x | Create a token so developers and CI can install packages. | Create token |

## Error templates

| Situation | Message |
|---|---|
| Validation | "Project slug must use lowercase letters, digits and dashes. Try `project-x`." |
| Required | "Enter a project name." |
| Duplicate | "A project named project-x already exists. Choose a different name." |
| Unauthorized (401) | "Your session expired. Sign in to continue; your changes are kept." |
| Forbidden (403) | Page: "You do not have access to this project. Ask a project maintainer to add you." |
| Not found (404) | "We could not find this package. It may have been removed upstream. Back to packages" |
| Conflict (409) | "Someone else changed this source. Reload to see their changes, then try again." |
| Rate limited (429) | "Too many requests. Try again in 30 s." (with `Retry-After`) |
| Server (5xx) | "Something went wrong on our side. Try again. If it continues, quote request id req_ab12cd." |
| Network | "Cannot reach Package Broker. Check your connection and try again." |
| Timeout | "The source did not respond in 30 s. Test the connection or try again later." |
| Partial | "3 of 12 packages imported. 9 failed. Download the list of failures." |
| Connection test | "Failed (403): the token cannot read repository contents. Grant 'Contents: read' and test again." |

Rules: the request id is shown on 5xx errors, copyable; internal causes never appear in the UI; the same message appears in the API error envelope as a client-safe string.

## Confirmation copy

Title: action plus entity ("Disable customer acme"). Body: what changes, who is affected, whether it can be undone. Example: "dev1 loses access to project-x. 2 tokens stop working. You can enable the customer again later." Permanent: "This cannot be undone." Typed field label: "Type acme to confirm".

## Docs and website voice

Plain, direct, specific. Lead with what the reader can do. Commands are copyable code blocks with placeholders in angle brackets. Do not use marketing intensifiers ("powerful", "seamless"). Every claim names the mechanism ("Versions after the cut-off are hidden from the customer token").
