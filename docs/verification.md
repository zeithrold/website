# Verification guide

Use Node 24 and pnpm 11.22.0 with the committed lockfile and the pinned `zt` CLI
from [frontend foundations](frontend-foundation.md). The complete local sequence is:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm check
git diff --check
```

Stop a local Worker before rebuilding `dist/`. For a filesystem-restricted Cloud
workspace, use writable temporary XDG/config/log directories as described in the
[README](../README.md#develop-and-verify). Set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an already installed Chromium.

## Current verification scope

| Check | Scope |
| --- | --- |
| Frozen dependency install | Committed resolution and approved supply-chain policies |
| Generated binding types | ASSETS only; no declaration drift |
| ESLint | Entire source with zero errors and zero warnings |
| CSS | Stylelint plus cross-file variable and semantic-color checks |
| TypeScript | Strict project with `noUncheckedIndexedAccess` |
| Unit tests | 32 tests: routing, preferences and the current deployment/domain boundaries |
| Production build | Production Worker and generated `dist/server/wrangler.json` |
| Build boundary checks | One Worker + ASSETS, exactly five approved domains, no addons or previews, Vercel Git deploy disabled |
| Chromium suite | 13 tests against the local production Worker, including variant regression fixtures |
| Failure evidence | Intentional unnamed-button failure must retain its full Axe scan, trace, screenshot, video and reports |
| Whitespace | `git diff --check` |

The seven tests for the removed one-time retirement feature are no longer part
of the suite. Negative domain ownership tests remain: legacy or unexpected
owners, missing/ambiguous records, HTTP errors, malformed responses and token-safe
network failures must still reject deployment. These tests stub GET responses;
they do not establish current live Cloudflare ownership.

Browser coverage includes 1440px desktop and 320/390/768px layouts, English and
Simplified Chinese, light/dark themes, system defaults, saved/malformed/unavailable
storage, keyboard skip links and anchors, reduced motion, source/service/contact
links, local fonts, canonical/Open Graph metadata, 404 navigation and static assets.
Actual Worker responses cover approved alias hosts and reject excluded/lookalike
hosts. The shared Axe helper checks WCAG 2/2.1/2.2 A/AA rules in both languages and both themes; automated
checks do not establish a complete accessibility audit. Other browser engines
are not covered by the current suite.

Named screenshots are attached by the suite:

- `desktop-en-light`
- `desktop-zh-dark`
- `mobile-en`
- `mobile-zh-CN`

Reports and captures are not committed. The aggregate keeps them below its unique
`.zt/artifacts` run directory; standalone browser runs use `.zt/browser`. CI uploads
the entire `.zt/artifacts` tree as `frontend-<run>-<attempt>` even on failure,
retained for seven days. The local production URL is
`http://127.0.0.1:4173`; local verification creates no remote preview deployment.

The local runner first validates the production configuration, then uses a
temporary route-free copy to prevent Wrangler from inferring the canonical
hostname as its local upstream and rewriting redirects. It exercises the same
bundle and ASSETS. The original five-domain deployment configuration is checked
again after browser testing.

Build output may include nonfatal upstream vinext/Rolldown notices about dynamic
imports and route classification. Verification exercises the production Worker
instead of relying on that classification output.

## CI evidence

[CI & Deploy](../.github/workflows/deploy.yml) repeats the full verification
profile for PRs and main pushes, installing the CLI from the exact reviewed source.
It runs the full browser suite once, including accessibility and keyboard checks. Verify has no Cloudflare credentials. Only a
successful main push may deploy its verified artifact; PRs only verify.

For each change, confirm the remote branch and PR head match the tested commit
and inspect that commit's Actions run. Local checks and mocked domain responses
do not replace remote CI or current production acceptance. Completed cutover
records and unverified legacy-service status are in [the history record](retirement.md).
