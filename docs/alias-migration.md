# Five-domain deployment and historical alias cutover

Routine deployments now use [CI & Deploy](../.github/workflows/deploy.yml): a
push to main verifies and automatically deploys the same build artifact; PRs only
verify. No manual confirmation, enable variable, or expected-SHA input is used.
All five domains must already belong to ztd-homepage before deployment. Domain
ownership checks reject missing/legacy owners, rather than repeating a cutover.

The remaining sections preserve the historical alias migration procedure. Its
manual dispatch, DNS handoff, and legacy rollback instructions are superseded
for routine releases. Do not repeat them or restore a retired service. See the
[README](../README.md#github-actions) for the current release process and the
[archived retirement record](retirement.md) for the later service-retirement scope.

The owner approved only `doa.ink`, `zeithrold.dev`, `www.zeithrold.dev` and
`ztd.one` becoming 308 redirects to `https://ztd.me`, preserving path/query.
Keep ztd.me online; do not retire/delete old Workers or Vercel projects.

Baseline: main `7694f052134cc41879334965f6925b6c2c30f629`, Worker version
`daa61e8e-af46-472e-b4a2-d9ca309af42c`. The canonical workflow and Mac public
acceptance passed. Mac holds the DNS/binding rollback snapshots.

## Historical five-host source state and trigger

`wrangler.jsonc` and the exact deployment policy contain only these enabled
Custom Domains: `ztd.me`, `doa.ink`, `zeithrold.dev`, `www.zeithrold.dev`,
`ztd.one`. Worker/Custom Domain previews and workers.dev remain disabled. The
application's four-host 308 logic is already implemented and unchanged.

After this phase PR's CI passes and it is merged, record the full new main SHA.
Dispatch `deploy.yml` on main only after the Mac DNS handoff, with
`confirmation=DEPLOY_ZTD_ME_AND_ALIASES` and `expected_commit=<that main SHA>`.
Existing account/enable variables and the existing token are reused; no secret
is retrieved, changed or printed. Push/PR cannot deploy.

The existing GET-only check now requires ztd.me to stay on ztd-homepage. Before
deployment doa.ink may be on doaink-home or ztd-homepage; the other aliases may
be unattached or already on ztd-homepage. Unexpected owners/extra hosts or
permission failures stop. The post-check requires exactly all five hosts on
ztd-homepage. Partial failure does not prove no bindings changed: inspect before
retrying or rolling back. Cloud does not repeat its known-blocked public HTTP
checks; Mac performs HTTPS/HTTP, 308 path/query, certificate and mail/DNS acceptance.

## DNS handoff: only the necessary web record

| Host | Mac's saved current state | Planned handling |
| --- | --- | --- |
| ztd.me | Live ztd-homepage Custom Domain | Keep in the five-host config and preserve online |
| doa.ink | doaink-home Custom Domain | Transfer directly in the single Cloud workflow; do not detach first |
| zeithrold.dev | A 76.76.21.21, DNS only | Generic web DNS conflict: coordinate removal of this exact record with Mac before binding; Cloud never deletes it |
| www.zeithrold.dev | CNAME cname.vercel-dns.com, DNS only | Known CNAME conflict: Mac verifies/saves the exact record ID, type, name, value, TTL/proxy state, deletes only that web record, then reports handoff |
| ztd.one | Mail records only; no web DNS | Add the Custom Domain's managed web record; delete no mail/TXT records |

[Cloudflare's Custom Domain documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
states that an existing CNAME blocks creation. The pinned Wrangler's
[domain publisher](https://github.com/cloudflare/workers-sdk/blob/main/packages/deploy-helpers/src/triggers/publish-routes.ts)
enables origin/DNS replacement in noninteractive CI. However, a
[Cloudflare maintainer's API clarification](https://github.com/cloudflare/workers-sdk/issues/9878#issuecomment-4479240529)
states that this option replaces records registered for another Worker, not
generic DNS records. This supports direct doa.ink reassignment, but does not
support overriding the external Vercel A/CNAME. Coordinate both exact web
records before dispatch; never discover this by a blind deployment/retry.

Mac's recorded zeithrold.dev zone ID is `249aa8f0d01c8b8514d137459babd79b`.
The apex A record ID is `dec377c75ea686af3fb1a54d06a21b0b`; the www CNAME record
ID is `07421e331a092c2176f02baa54122d66`. Mac must re-read their identity and save
the complete rollback fields immediately before any agreed deletion. Do not
delete doa.ink's Worker-managed AAAA (`f718aeff69b37bc290489164f5606137`), an
entire zone or any mail record. Do not expand token scopes.

Sequence: finish/merge code and CI first; report readiness and the API evidence
to the coordinator; hold dispatch while Mac clears only the agreed exact web
records; receive explicit handoff; then Cloud workflow is the sole binding
writer and Mac remains read-only. Expect a possible dev/www DNS/TLS gap
between removal and provisioning. No parallel dashboard binding writes. Mac
acceptance checks the four aliases without following the first redirect, plus
canonical home/assets/404 and the unchanged blog/showcase services.

## Alias rollback, keeping canonical online

Stop further dispatches and inspect which bindings actually changed. Restore
only doa.ink's captured doaink-home ownership, without redeploying the old Worker
from a partial domain list. Detach only the newly attached dev/www/one Custom
Domains as needed, then restore the exact saved dev A and www CNAME web records.
For ztd.one restore the prior absence of web records, retaining all mail/TXT.
Keep ztd.me on ztd-homepage. Revert this phase's source/guard/confirmation together
to the canonical baseline before the next deployment; code rollback alone does
not restore domain ownership. Cached 308s may persist despite no-store.

No MX/SPF/DKIM/DMARC/TXT mail record, other subdomain, blog/showcase, expired
zeithrold.cloud, zeithrold.com/ICP/SSH, Vercel project, old Worker code, credential,
authorization or addon is changed by this phase. Retirement needs separate approval.
