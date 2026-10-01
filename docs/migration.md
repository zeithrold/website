# Migration proposal — approval required

This document is a plan. This PR performs no production deployment, DNS mutation,
domain attachment, Vercel shutdown, email change, or persistent authorization.

## Confirm before any infrastructure change

1. Approve homepage copy/project selection and the release commit.
2. Confirm the destination Cloudflare account. Showcase publicly declares
   `a0df2e968b524bdd77c0eab565058522`; this is a candidate, not authorization to
   reuse it. Set the public `CLOUDFLARE_ACCOUNT_ID` variable only after confirmation.
3. Confirm `ztd-homepage` is a new/appropriate Worker name and inspect any existing
   Worker with that name before replacing it.
4. Confirm the existing repository `CLOUDFLARE_API_TOKEN` secret has Workers Script
   Edit permission on that account. Custom Domains later need Zone Read / Workers
   Routes Edit for each involved zone. Do not retrieve the token, replace it, or
   broaden credentials without explicit approval; stop if its scope is insufficient.
5. Inventory the current apex A/AAAA/CNAME and web routing for `ztd.me`, `doa.ink`,
   `zeithrold.dev`, `ztd.one`, their proxy/TLS settings, Vercel domain assignments,
   and Cloudflare Rules/Builds integrations. Save a rollback snapshot of web
   records and deployment IDs. Do not change mail records.
6. Confirm the three aliases mean **apex hosts only**. `www` and all other
   subdomains are not matched. Confirm preserving legacy path/query is desired;
   unknown paths will land on the new site's 404. Add explicit reviewed mappings
   if old important URLs need a different destination. Fragments are client-side
   and never reach the Worker.
7. Choose an observation period before retiring `zeithrold-dev`. Confirm its exact
   project ID and dependent domain inventory. Leave its existing deployment and
   domains available for rollback until that period ends.

Webhook inventory through GitHub was unavailable to this session (HTTP 403).
Do not treat that as proof there are no external integrations. Before release,
inspect any GitHub/Cloudflare automatic build integrations separately. This PR's
Actions cannot deploy on push/PR; `vercel.json` prevents automatic Vercel Git
deployments from this repository.

## Proposed changes, in order

| Phase | Exact proposed change | Risk | Rollback |
| --- | --- | --- | --- |
| Worker only | After approval, set the account variable and `WEBSITE_DEPLOY_ENABLED=true`, protect the `production` environment if desired, merge the reviewed commit, then manually dispatch `Deploy Worker manually` on `main` with `DEPLOY_WORKER_ONLY` | Replaces an existing same-name Worker if one exists; insufficient token scope fails deployment | Do not enable until Worker name is confirmed. For later releases use the recorded previous Worker version; pause the switch to stop future dispatches |
| Canonical host | In a separate reviewed change, attach only `ztd.me` as a Worker Custom Domain | Apex web origin/DNS ownership changes; TLS provisioning or old page parity can cause outages | Detach that Custom Domain and restore the captured apex web records / old web deployment; keep the Vercel project alive |
| Alias hosts | After `ztd.me` passes live verification, attach only `doa.ink`, `zeithrold.dev`, `ztd.one` as Custom Domains to the same Worker | 308 responses alter bookmarks/SEO; cached permanent redirects can outlive a rollback despite `no-store`; old deep paths can return 404 | Detach aliases and restore their captured apex web records / old redirects. Cached client redirects may require time to clear |
| Observe | Test all four apex hosts over HTTPS, HTTP-to-HTTPS, assets, path/query, TLS, 404s, and directly verify blog/showcase still work | Zone-level rules could run before this Worker; DNS propagation and certificates are separate from application tests | Restore affected apex web route only. Do not touch subdomain or mail configuration |
| Retire legacy | Separately approve final shutdown/removal of only Vercel `zeithrold-dev` after the observation period and a dependency check | Deletion can remove a rollback origin and project metadata; domain leftovers can break routes | Prefer a reversible pause first if available. Export project settings/domain records and retain source/deployment artifacts. Deletion may need project recreation and is the last irreversible step |

The exact future `wrangler.jsonc` route diff would replace `"routes": []` with:

```json
"routes": [
  { "pattern": "ztd.me", "custom_domain": true },
  { "pattern": "doa.ink", "custom_domain": true },
  { "pattern": "zeithrold.dev", "custom_domain": true },
  { "pattern": "ztd.one", "custom_domain": true }
]
```

Introduce the canonical route first, then the three alias routes after validation.
**The current manual workflow deliberately rejects nonempty routes.** Domain
attachment requires a separate reviewed update to both the config and
`scripts/check-build.mjs`, or a separately approved, precise dashboard operation.
No wildcard route such as `*.ztd.me/*` is proposed. Custom Domain deployment can
create/replace web DNS records; it is itself an approval-required operation.

## Redirect policy and live acceptance

- Exact apex allowlist, fixed destination `https://ztd.me`, 308 preserving methods.
- Preserve the URL-parsed/normalized path and the original encoded query ordering.
  Never use `next`, `url`, `redirect_uri`, forwarded host, or referrer as destination.
- Redirect asset paths too. Worker runs first; the ASSETS binding is explicitly
  served after host policy, and vinext renders only misses/non-GET/HEAD requests.
- Canonical HTTP and nonstandard ports converge to canonical HTTPS in one hop.
- Subdomains and unrelated hosts fail closed with 421 if mistakenly attached.
  This does not change DNS or intercept traffic currently routed elsewhere.
- `Cache-Control: no-store` is set for redirects. No broad HSTS/includeSubDomains
  change is included.

After an approved migration, verify (without following the first response):

```sh
curl -I 'http://doa.ink/example/path?from=old%2Fhome'
curl -I 'https://zeithrold.dev/favicon.svg?from=old'
curl -I 'https://ztd.one//evil.example/path?next=https://evil.example'
curl -I 'http://ztd.me/?q=1'
curl -I 'https://ztd.me/'
curl -I 'https://blog.ztd.me/'
curl -I 'https://showcase.ztd.me/'
```

First four responses must target the same HTTPS canonical origin and retain the
path/query. Canonical home/assets must return 200, an unknown page 404, and the
two services must remain on their existing hosts. Use a dedicated live smoke
check in that release; the current browser suite intentionally targets only the
local production Worker and must not claim to verify a live deployment.

## Explicit exclusions

`zeithrold.com` (including `www`), its ICP filing setup, website, DNS, SSH server,
and the `zeithrold-com` Vercel project are completely outside this migration.
All MX, SPF, DKIM, DMARC and other email records on every domain remain unchanged.
No account OAuth configuration, new API token, persistent login, or addon is
created by this PR.
