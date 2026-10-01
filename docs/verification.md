# Verification evidence

Validated in the selected Codex Cloud environment on 2026-10-01, with Node
24.19.0, pnpm 10.33.0, the frozen lockfile, and the environment's Chromium.

| Check | Result | Scope |
| --- | --- | --- |
| Frozen dependency install | Passed | 24-hour minimum release age and committed resolution |
| Generated Worker binding types | Passed | `wrangler types --include-runtime=false`; ASSETS only |
| TypeScript | Passed | `pnpm typecheck` |
| Unit tests | 28 passed | Redirect/preferences plus exact canonical deployment scope, stale release rejection and mocked GET-only Cloudflare domain checks |
| Production build | Passed | `pnpm build`; generated `dist/server/wrangler.json` |
| Build boundary check | Passed | One Worker + ASSETS, exactly ztd.me Custom Domain, no aliases/addons, workers.dev/all previews off, Vercel Git deploy off |
| Browser suite | 10 passed | `pnpm test:e2e` against the local production Worker |
| Actions syntax | Passed | actionlint 1.7.12, downloaded from its official GitHub release with checksum verification |
| Whitespace | Passed | `git diff --check` |

Browser coverage includes 1440px desktop and 320/390/768px layouts in both
languages, English and Simplified Chinese, light/dark preference restoration,
system defaults, unavailable localStorage, keyboard skip link and anchor
navigation, reduced motion, source/service/contact links, local font loading,
canonical/Open Graph metadata, 404 navigation, static resources, and actual Worker
responses with alias and excluded service Host headers, including the explicit
`www.zeithrold.dev` alias and rejection of expired `zeithrold.cloud`/host lookalikes.
Axe checks WCAG A/AA
rules in both languages and both themes. Automated checks do not establish a
complete accessibility audit.

Screenshots are written by the suite:

- `artifacts/desktop-en-light.png`
- `artifacts/desktop-zh-dark.png`
- `artifacts/mobile-en.png`
- `artifacts/mobile-zh-CN.png`

They are not committed. GitHub Checks uploads screenshots and any failure traces
as the `browser-<run>-<attempt>` artifact, retained for seven days. To reproduce,
follow the commands in the README. There is no remote preview deployment in this
phase; the local production URL is `http://127.0.0.1:4173`.

An additional agent-browser inspection verified production HTML, meaningful
content, working controls, no error overlay, and no horizontal overflow. Initial
browser verification caught missing CSS/JS when the Worker ran first; explicit
ASSETS forwarding fixed it. Axe caught contact-description contrast; it was
corrected. The canonical test accepts the framework's equivalent URL with or
without a trailing slash. The final browser suite passed after those corrections.

Build output includes upstream vinext/Rolldown notices about ineffective dynamic
imports and unknown static route classification. They are nonfatal; the complete
production Worker was exercised rather than relying on classification output.

## Prior worker-only deployment and this phase's boundary

[Run 36808706116, attempt 2](https://github.com/zeithrold/website/actions/runs/36808706116)
passed on main `b0b2e2cc3baf2cb25bdbd93189c8e8fde458d57d`. Its deployment logs
confirm version `d2f3ed95-176c-4c97-b698-35c0dabb8907`, ASSETS only and no targets.
It did not establish public HTTP reachability. The account and existing old
bindings were separately checked by the Mac coordinator, not by Cloud API reads.

New deployment checks were tested with stubbed GET responses, including HTTP
403, changed ownership, ambiguous records, extra domains, failed post-checks,
malformed responses and token-safe network failures. Cloud has no copy of the
repository secret and did not execute these reads against Cloudflare.

The canonical phase initially timed out local browser readiness because Wrangler
inferred ztd.me as the local upstream and rewrote the canonical HTTPS redirect
back to localhost. `start-local.mjs` validates the original production config and
uses a temporary route-free copy for local emulation of the same bundle/ASSETS.
The deployed config remains canonical-only and is checked again after testing.

The following were deliberately not executed while preparing this canonical phase PR:

- Cloudflare production/manual deployment or remote version upload.
- Live HTTP release verification or a claim that ztd.me already serves the new site.
- DNS, Custom Domain attachment, TLS policy changes, mail-record changes.
- Vercel project changes or retirement.
- Persistent authorization, new credentials, or addon provisioning.

GitHub workflow status is available on the phase PR; this document records local
evidence and does not substitute for remote Actions or live cutover acceptance.
The coordinator's handoff, fresh web/binding snapshot and exact merged main SHA
are still needed before dispatch. Alias migration and legacy-resource retirement
remain separate approvals described in `docs/migration.md`.
