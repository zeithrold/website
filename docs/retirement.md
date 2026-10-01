# Approved permanent retirement of old services

The owner explicitly approved permanent deletion of only these old services,
including their deployment history/configuration, and no longer wants them as
rollback targets:

- Cloudflare Worker `doaink-home`, account `a0df2e968b524bdd77c0eab565058522`.
- Vercel project `zeithrold-dev`, ID `prj_uHvWOMkmloKS3rIEpGNCy0zL7AAG`,
  team `team_5tyIvUUxyaJxNRtK5YYtgJcO`, old repository `zeithrold/zeithrold.dev`.

The [five-domain deployment](https://github.com/zeithrold/website/actions/runs/36816247881)
passed on main `355d0e1097d5684e4df0c3f7c8dcd4d0ebb50274`, Worker version
`9db951de-e23e-4b9a-a6f2-0b9cb8a974b6`. Mac reports public GET/308/path/query
acceptance passed and 60 protected DNS records plus blog/showcase bindings
unchanged. Mac is now unavailable; all further work must be remote.

## Cloudflare one-time remote path

There is no connected Cloudflare administration tool in this environment. The
only existing authorized token is the repository's `CLOUDFLARE_API_TOKEN`, used
inside Actions. Never retrieve it, print it, replace it or expand its scopes.

`retire-doaink-home.yml` is manual-only and defaults to `CHECK_ONLY`. It requires
main and its full reviewed SHA, reuses the production environment and deployment
concurrency group, and accepts no account/Worker/resource-name input. Push/PR
cannot delete anything or deploy the site.

After this workflow is merged, run `CHECK_ONLY` with its full main SHA first.
The script checks real-time state: no old Custom Domains/routes/Cron triggers;
one production environment; no service/Pages/DO/dispatch/Tail references; no
resource bindings other than internal assets/variables; no Logpush/events or
non-fetch handlers. The old workers.dev endpoint is reported and is part of the
approved retirement. It also requires the new site's exact five domains and
blog/showcase bindings. Unknown state or missing read permission stops.

Only after those reads pass, dispatch with
`confirmation=DELETE_DOAINK_HOME_PERMANENTLY` and the same reviewed main SHA.
Preflight repeats immediately. The sole mutation is
`DELETE /accounts/a0df2e968b524bdd77c0eab565058522/workers/scripts/doaink-home?force=false`.
No Wrangler delete command is used because it can also remove legacy KV asset
namespaces. This script never changes DNS, domains, routes, registrations,
KV/R2/DB, credentials, other Workers or Vercel projects.

Deletion uses no automatic retry or force escalation. A timeout, error or
uncertain outcome stops; inspect state read-only before any further action.
Success requires a fresh script list showing doaink-home absent and all other
Workers present, plus unchanged domain IDs/owners including the five new hosts
and blog/showcase. Already absent means no mutation. Remove the one-time
workflow after verified completion. This deletion has no service rollback.

## Vercel capability blocker

Remote reads verified the precise project ID/name/team and its latest
deployment's GitHub metadata (`githubOrg=zeithrold`, `githubRepo=zeithrold.dev`).
Remaining Vercel aliases include dev/www, the expired zeithrold.cloud and old
vercel.app URLs; dev/www public DNS now routes to Cloudflare.

The connected Vercel tools expose list/get/deployment operations but no project
DELETE, and no Vercel CLI is installed. Project integration/resource details are
also not fully exposed by the normalized read tool, so dependency verification
is incomplete. Do not extract OAuth tokens, install/login/create credentials,
invent a delete tool, use Mac or bypass the connector. The Vercel project remains
undeleted until an existing authorized remote deletion capability is supplied.
Deletion, when available, must be restricted to the exact project/team above and
verified by get/list reads afterwards. `zeithrold-com` is excluded.

All mail DNS, domain registrations/zones, zeithrold.com/ICP/SSH, the new site,
blog and showcase remain outside this retirement scope. Earlier documents'
legacy rollback instructions are historical and superseded by this approval.
