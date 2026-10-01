# Canonical ztd.me cutover

The owner approved replacing the ztd.me homepage only. This phase PR prepares
source configuration and checks; preparing it performs no Cloudflare writes.
After merge and coordinator handoff, Cloud workflow is the sole cutover writer.
The Mac coordinator owns the cutover/rollback coordination and stays read-only
during deployment. Keep one writer at a
time. Merging this PR runs Checks only, never a deployment.

## Verified starting point

- Account: Zeithrold Personal, `a0df2e968b524bdd77c0eab565058522`, confirmed through
  the owner's existing Mac dashboard session.
- Worker-only main: `b0b2e2cc3baf2cb25bdbd93189c8e8fde458d57d`.
- [Worker-only run 36808706116, attempt 2](https://github.com/zeithrold/website/actions/runs/36808706116)
  passed. Its logs confirm `ztd-homepage`, ASSETS only, no targets, and version
  `d2f3ed95-176c-4c97-b698-35c0dabb8907`. This did not establish public HTTP reachability.
- The coordinator's read-only dashboard check found both `ztd.me` and `doa.ink`
  attached to the existing **`doaink-home`** Worker. Keep that Worker and its
  `doa.ink` binding. Do not deploy its source or change its other settings.
- GitHub repository-variable reads from Cloud return 403. Values are not claimed
  as read back. The release job checks the approved public account ID and the
  exact `WEBSITE_DEPLOY_ENABLED=true` value. It references the existing
  `CLOUDFLARE_API_TOKEN`; never retrieve/print it, replace it, or broaden access.

## Exact repository state for this phase

```json
"routes": [
  { "pattern": "ztd.me", "custom_domain": true, "enabled": true, "previews_enabled": false }
]
```

`wrangler.jsonc` and `scripts/deployment-policy.ts` now agree on exactly this
array. `scripts/check-build.mjs` asserts the generated deployment config against
that policy. Empty routes, extra hosts, wildcards, disabled canonical routing,
preview URLs, another Worker/account, addons, schedules and environment overrides
fail. `workers_dev` and `preview_urls` remain false. This is persistent source
configuration for ztd.me, not a temporary dashboard-only binding.

The manual workflow requires `main`, the exact confirmation `DEPLOY_ZTD_ME_ONLY`,
the full reviewed **main SHA after merge** in `expected_commit`, the approved
account ID, and the existing enable switch. An explicit authorization job reports
invalid/missing values rather than silently skipping them. It runs all Checks,
then deploys only that run's tested artifact. Pushes/PRs cannot deploy.
`DEPLOY_WORKER_ONLY` is no longer accepted by this phase.

Before Wrangler, two GET-only reads verify that ztd.me is one production Custom
Domain in the ztd.me zone owned by `doaink-home` or `ztd-homepage`, and that
`ztd-homepage` has no other Custom Domains. Missing records, unexpected ownership,
ambiguous/paginated state or HTTP/auth failures stop before deployment without
fallback credentials. After deployment the same checks require the new owner.
A failed post-check can follow a completed switch: it does not prove nothing changed
and must not trigger an automatic rollback or blind retry.

## Existing-domain behavior and preferred order

Official [Custom Domain documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
explains exact-host origin routing and managed web DNS/certificates. A Custom
Domain change can therefore affect web records even without a separate DNS edit.

The locked Wrangler **4.144.0** implementation was inspected locally and compared
with [Cloudflare's publish-routes source](https://github.com/cloudflare/workers-sdk/blob/main/packages/deploy-helpers/src/triggers/publish-routes.ts).
In non-TTY CI it enables both `override_existing_origin` and
`override_existing_dns_record`, then publishes the listed Custom Domains through
one records PUT. Interactive use asks before taking another Worker's domain;
ordinary Workers route conflicts behave differently and can require unassignment.
The generated route here is a Custom Domain, not `ztd.me/*`.

Recommended sequence (aims to avoid a delete/add gap; zero downtime is not guaranteed):

1. The Mac coordinator rechecks only the relevant bindings/rules, ztd.me web DNS,
   TLS status, the old Worker version, and current responses. Save the domain,
   zone and certificate identifiers plus the web-record snapshot privately for
   rollback. Record baseline responses for doa.ink, blog.ztd.me and showcase.ztd.me.
   Never edit/export mail records into this public repo. Stop on unexpected DNS,
   another owner, a route/rule that intercepts requests, or permissions errors.
2. Merge this phase PR. Wait for main Checks and record its exact merge SHA.
   Keep Cloudflare unchanged until source, exact guard and workflow agree.
3. Hold other dispatches/dashboard writes. The agreed single writer is Cloud workflow:
   coordinator authorizes one main workflow run with `DEPLOY_ZTD_ME_ONLY` and that
   merge SHA. Its read-only preflight runs before Wrangler, which uploads code/
   assets and reassigns only the existing ztd.me domain. **Do not detach it first.**
   Cloud must wait for the Mac coordinator's handoff before any dispatch.
4. If the coordinator instead performs an existing-domain reassignment in the
   dashboard, do it only after the source commit is merged, only if the interface
   supports direct reassignment, and only from doaink-home to ztd-homepage.
   Hand off sequentially before the reconciliation workflow. Do not have both
   actors write concurrently. If the UI requires deleting/recreating the domain,
   stop and report the gap before proceeding; do not invent an API/auth bypass.
5. Read back the exact domain owner, zone, certificate/production status, disabled
   previews and new Worker version. Confirm the new Worker has only ztd.me,
   doaink-home still has doa.ink, and no excluded binding changed.
6. Only after the switch, perform live HTTP/HTTPS acceptance: home, CSS/JS/fonts,
   favicon, robots/sitemap/OG image, unknown-page 404, both languages and themes,
   contact/service links, HTTP-to-HTTPS and path/query behavior. Keep blog/showcase
   on their existing hosts and compare the doa.ink baseline without changing it.
   Zone-level redirects may run before the Worker. Local tests and a successful
   upload are not substitutes for these live checks.

The [Attach Worker Domain API](https://developers.cloudflare.com/api/resources/workers/subresources/domains/methods/update/)
is account-scoped and documents Workers Scripts Write. The read-only domain list
accepts Workers Scripts Read or Write. This is evidence about API requirements,
not a reason to expand the existing token. If any required read/write returns
403 or otherwise lacks scope, stop and report. No new credential or addon is proposed.

## Rollback for this phase

1. Stop further dispatches and coordinate a single rollback writer. If necessary,
   the owner can disable the repository enable switch; do not alter the secret.
2. Reassign **only ztd.me** back to its captured production `doaink-home` binding.
   Keep doa.ink and all other old targets exactly as captured. Recheck HTTPS,
   certificate status, previous content and service baselines. If managed web
   records changed, restore only the captured ztd.me web configuration as needed.
   Do not delete either Worker or redeploy the old Worker's entire domain list.
3. Revert this phase commit on main, synchronously restoring the previous empty
   routes, matching build guard and `DEPLOY_WORKER_ONLY` workflow. Hold deployment
   until source agrees with the restored live owner. The manual canonical workflow
   would otherwise reclaim ztd.me if dispatched again.
4. Do not assume reverting the file to empty routes detaches a Custom Domain:
   this pinned Wrangler calls its Custom Domain publisher only when the array
   contains Custom Domains. Also, `wrangler rollback` changes code versions, not
   domain ownership. Explicit owner restoration/read-back remains necessary.
   The recorded worker-only version is useful code evidence, not a domain rollback.

## Later phases require separate approval

`doa.ink`, `zeithrold.dev`, `www.zeithrold.dev` and `ztd.one` are recognized by
application redirect policy but **are not attached by this phase**. Later alias
migration must change source routes, exact policy, tests and the confirmation
value together. Keep 308 HTTPS redirects with path/query preservation as the
proposal; unknown deep paths reach the new 404 unless reviewed mappings are added.

Old Worker retirement and Vercel `zeithrold-dev` retirement are not approved here.
The earlier read-only Vercel lookup identified `prj_uHvWOMkmloKS3rIEpGNCy0zL7AAG`;
recheck dependencies before any later retirement. The proposed default remains
seven stable days after all separately approved domains pass live acceptance,
then a separately approved reversible retirement where supported, with deletion last.

## Explicit exclusions

No alias/domain wildcard, unrelated subdomain, email record, SSH setting,
Vercel project, new token, persistent authorization or addon is changed by this PR.
`blog.ztd.me` and `showcase.ztd.me` retain their existing infrastructure.
`zeithrold.cloud` (including www) has expired and is excluded completely.
`zeithrold.com`, its ICP filing system, website/DNS/SSH server and the
`zeithrold-com` Vercel project remain completely outside scope. All MX, SPF,
DKIM, DMARC and other mail records on every domain remain unchanged.
