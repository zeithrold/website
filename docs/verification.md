# Verification evidence

Validated in the selected Codex Cloud environment on 2026-10-01, with Node
24.19.0, pnpm 10.33.0, the frozen lockfile, and the environment's Chromium.

| Check | Result | Scope |
| --- | --- | --- |
| Frozen dependency install | Passed | 24-hour minimum release age and committed resolution |
| Generated Worker binding types | Passed | `wrangler types --include-runtime=false`; ASSETS only |
| TypeScript | Passed | `pnpm typecheck` |
| Unit tests | 19 passed | HTTPS/exact-host/path/query/method policy, open-redirect attempts, subdomain isolation, preference validation |
| Production build | Passed | `pnpm build`; generated `dist/server/wrangler.json` |
| Build boundary check | Passed | One Worker + ASSETS, no addons, empty routes, workers.dev/previews off, Vercel Git deploy off |
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

## Deliberately not executed

- Cloudflare production/manual deployment or remote version upload.
- Live release verification of the new site (there is no new deployed site yet).
- DNS, Custom Domain attachment, TLS policy changes, mail-record changes.
- Vercel project changes or retirement.
- Persistent authorization, new credentials, or addon provisioning.

GitHub workflow status is available on the draft PR; this document records local
evidence and does not substitute for the remote Actions result. The Cloudflare
account, existing token scope, web DNS snapshot, alias path policy, and legacy
project retirement plan still require the confirmations in `docs/migration.md`.
