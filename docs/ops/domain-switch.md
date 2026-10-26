# Move the website domains to the Worker

Use this checklist to move `package.broker` and `www.package.broker` from the
Pages project `package-broker-docs` to the Worker `package-broker-site`.
Only the owner changes domains, DNS, TLS settings or the Pages project.
The deployment workflows do not perform these changes (DEC-G09).

## Prepare the switch

- Create repository secrets named `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`, plus `BROKER_DOCS_READ_TOKEN` for the docs sync
  workflow. The Cloudflare token needs **Account / Workers Scripts / Edit**
  on the selected Cloudflare account, with no DNS or zone permissions. Do not
  paste any secret value into files, commands, comments or this checklist.
- Complete the branch preparation below before the first production deploy
  (DEC-G01, DEC-G07). The redirect test requires a local or fetched
  `v1-archive` containing the v1 docs. It fails with an action message if that
  archive is missing; it never falls back to `main`.
- Let the first production workflow create the Worker on its `workers.dev`
  address before running PR previews. Confirm that preview URLs are enabled.
  Keep both custom domains on Pages until step 2 below. Leave the repository
  variable `SITE_ON_WORKER` unset or `false`; production redirect checks run
  only when it is `true`.
- Record the current Pages production deployment, project build settings,
  domain bindings and DNS records, and the last working Worker version. Retain
  a build of the old site for recovery. Store no credentials in that record.
- Use Node 24 and the pnpm version in `package.json`. At the commit deployed
  to the preview, run `pnpm install --frozen-lockfile`, `pnpm typecheck`,
  `pnpm build` and `pnpm test` before the online checks.

Source: [Workers custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
The owner must verify the current dashboard controls before the switch.

## Prepare branches and the first deployment

The owner performs these steps in order. Keep both domains on Pages throughout
this preparation (DEC-G01, DEC-G09; WEB-04, WEB-05).

1. **Preserve the current v1 `main` as `v1-archive`.** Verify the current remote
   `main` commit, create `v1-archive` at that commit and push the archive before
   replacing `main`. Confirm the archive contains the v1 docs and sidebar.
   Do not move this archive to a 2.0 commit. Fetch it into local validation
   checkouts before running the redirect tests.
2. **Push `next-main` after owner approval.** Review and commit the website
   changes first, then approve the first push. Run the branch checks on
   `next-main`; this push does not trigger `deploy.yml`, which targets `main`.
   Stop and fix any failed checks before continuing.
3. **Switch the default branch to the 2.0 site.** Make `next-main` the default
   branch and complete the owner-controlled rename/replacement so the 2.0
   default branch is named `main`. Merely selecting `next-main` as the default
   does not trigger a workflow configured for pushes to `main`. Retain
   `v1-archive` and apply the intended branch protection to the new `main`.
4. **Run the first `deploy.yml` deployment.** With the secrets configured,
   trigger a push to the new 2.0 `main` after the default-branch switch. A
   default-branch setting change alone does not create a push event. Confirm
   the build, typecheck and tests pass before the workflow deploys the Worker.
   Confirm the Worker responds on its `workers.dev` address before creating
   PR previews or moving domains. Keep `SITE_ON_WORKER` unset or `false` until
   the domain checks below pass.

If any preparation step fails, stop before changing domains. Pages continues
serving the retained v1 deployment. The owner can restore the previous default
branch and protection using the recorded v1 commit and `v1-archive`.

## Execute the switch

1. **Verify the preview.** Open the same-repository PR's posted preview URL.
   Check `/`, `/sitemap.xml`, both quickstarts, local search and a missing URL
   (which must show the 404 page). Check response headers in browser developer
   tools: the security headers, plain-text LLM files and immutable hashed assets.
   Run the redirect test against the preview:

   ```sh
   BASE_URL='https://<preview-host>' node --test tests/redirects.test.mjs
   ```

   **Rollback:** stop the switch and fix or replace the preview. Pages continues
   serving both domains; no domain changes have occurred.

2. **Remove the custom domains from Pages.** In `package-broker-docs`, remove
   `package.broker` and `www.package.broker` from Custom domains. Retain the Pages
   project and its production deployment. Record the start time in UTC and move
   directly to step 3; requests can fail between removal and attachment.

   **Rollback:** remove any partial Worker domain bindings, re-add the two
   domains to the Pages project, restore the recorded DNS records as needed,
   and confirm HTTPS serves the retained deployment on both domains.

3. **Attach both domains to the Worker.** Open `package-broker-site` → Settings
   → Domains & routes → Add → Custom domain. Add `package.broker`, then
   `www.package.broker`. Confirm both point to the intended Worker. Use custom
   domains rather than a zone-wide route. Keep domain bindings in the dashboard;
   `wrangler.jsonc` intentionally contains no domain routes or zone ids.

   **Rollback:** remove both Worker custom domains, then restore both Pages
   custom domains and their recorded DNS records. Set `SITE_ON_WORKER` to
   `false` when returning to Pages. Verify the Pages deployment
   over HTTPS before ending recovery.

4. **Confirm TLS on both domains.** Wait for active certificates and successful
   HTTPS responses. Do not bypass certificate verification. Confirm that `/` and
   `/sitemap.xml` return 200 on each host:

   ```sh
   curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' https://package.broker/
   curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' https://package.broker/sitemap.xml
   curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' https://www.package.broker/
   curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' https://www.package.broker/sitemap.xml
   ```

   **Rollback:** if certificates or responses do not recover, remove the Worker
   bindings and restore the retained Pages domains and DNS records as in step 3.

5. **Enable and run the redirect check on production.** After attaching both
   domains and confirming TLS, set the repository Actions variable
   `SITE_ON_WORKER` to `true`. Use the same commit as
   the deployed Worker. The check covers all v1 docs, sidebar indexes, the blog,
   trailing slashes, exact redirect destinations, one-hop 200 targets, kept
   paths, the landing page, sitemap and a missing URL (WEB-05).

   ```sh
   BASE_URL=https://package.broker node --test tests/redirects.test.mjs
   BASE_URL=https://www.package.broker node --test tests/redirects.test.mjs
   ```

   Rerun the production workflow and confirm its `post-deploy` job passed.
   Deployments before `SITE_ON_WORKER` is `true` skip that job.

   **Rollback:** for a Worker version regression, restore the recorded working
   Worker version in the dashboard and repeat these checks. If no working 2.0
   version exists, set `SITE_ON_WORKER` to `false`, then restore the retained
   Pages domains and DNS records.

6. **Watch for 10 minutes.** Record start and end timestamps in UTC. During the
   full interval, check both hosts every 30 seconds for `/`, `/sitemap.xml`, both
   quickstarts and at least one legacy redirect. Watch Cloudflare request errors
   and check for CSP violations while using search and navigation. Retain Pages
   until the full interval completes without unresolved failures.

   **Rollback:** stop the observation interval on failure. Restore the previous
   working Worker version and restart the checks and interval, or restore Pages
   domains and DNS records if the Worker cannot serve the site.

7. **Delete the Pages project last.** Confirm the two domains remain attached
   to the Worker, the production redirect job passed, the 10-minute observation
   completed and the recovery records and old build are retained. Delete
   `package-broker-docs` only after all those checks. Deletion permanently removes
   its deployments and settings; people using its Pages addresses lose access.

   **Rollback:** deletion cannot be undone. Restore a working Worker version
   for a site regression. If you must return to Pages, create a replacement
   project from the retained settings and old build, remove the Worker domain
   bindings, attach both domains to the replacement project and verify DNS and
   TLS. The old project and deployment addresses may not be recoverable.

Source: WEB-04b and WEB-05 in the growth ticket set; domain ownership and Pages
retirement remain owner actions under DEC-G09. Do not publish a `/v1/` site
(DEC-G01).
