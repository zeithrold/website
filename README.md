# ztd.me

Zeithrold's personal index: selected open-source projects, experiments, writing,
and `hello@ztd.me`. English and Simplified Chinese, light/dark themes, local fonts,
keyboard navigation, and reduced-motion support.

Built with vinext App Router, React, TypeScript, Vite, Tailwind, Shadcn's new-york
Button, Radix, and Lucide. Architecture and visual foundations follow
[zeithrold/showcase](https://github.com/zeithrold/showcase), reviewed at
`3466f3a6afa363fcd7fb5cdbd6d6e91fac844cc1` on 2026-10-01. The layout is a project
index, with no clock implementation. One Cloudflare Worker plus built-in `ASSETS`;
no KV, R2, D1, database, external font service, or other addons.

## Develop and verify

Use Node.js 24 and pnpm 11.22.0 (declared in `package.json`).
Install the reviewed `zt` CLI with Go 1.24 or newer and put its binary directory
on `PATH`:

```sh
go install github.com/zeithrold/tools/cmd/zt@3f9a3a7d33befc5a954ba1e86d3aa6d72e2c762f
```

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm exec playwright install --with-deps chromium
pnpm check
```

`pnpm check` runs the explicit `zt.json` frontend profile: strict lint, CSS/token
validation, generated bindings plus types, unit tests, build plus deployment
guards, the full production-Worker browser suite and failure-evidence verification.
The browser suite includes Axe and keyboard checks; it runs once in the profile.
`pnpm test:a11y` runs its tagged subset for focused work. Native scripts remain
available; [frontend foundations](docs/frontend-foundation.md) records the mapping.

`pnpm start --port 4173` runs the production Worker locally, using the generated
`dist/server/wrangler.json`. It first validates the production config, then uses
a temporary copy with empty local routes so Wrangler does not infer the live
domain as its local upstream and rewrite redirects. The deployed config/code,
ASSETS and bindings stay intact; the copy is removed on shutdown. `wrangler.jsonc`
is the source configuration.
Dependencies have a 24-hour minimum release age; the user-approved `@ztd-me/*`
scope is exempt from age checks. This is not a scope-wide trust exception.
CI uses the committed lockfile. Browser tests run against the production Worker
and retain reports, scans, screenshots and failure traces in `.zt/artifacts/`
under the aggregate, or `.zt/browser/` when run directly. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
can select an already installed Chromium in a restricted environment.

In a filesystem-restricted Cloud workspace, point `XDG_CONFIG_HOME`,
`XDG_DATA_HOME`, and `WRANGLER_LOG_PATH` at writable temporary directories.
Stop a local Worker before rebuilding its `dist/` directory.

## Content and design

- `lib/projects.ts`: editable project selection and links.
- `lib/copy.ts`: paired, typed English/Chinese copy.
- `app/globals.css`: local Inter/DM Sans and the warm-white/ink/terracotta system.
- `components/home/`: project diagrams, service cards, and homepage sections.
- [Content evidence and selection policy](docs/content.md).
- [Strict ESLint configuration and dependency policy](docs/eslint-migration.md).
- [Verification guide](docs/verification.md).
- [Frontend foundations, token roles and Skill source](docs/frontend-foundation.md).
- [Unified frontend migration checkpoint](docs/unified-frontend-migration.md).

The selection is editorial, not a claim about current priorities or project
availability. Tools is explicitly early development. Its implemented inspect,
plan, and Skill sync are described without promising check/run/doctor commands.

## GitHub Actions

[`CI & Deploy`](.github/workflows/deploy.yml) runs on pushes to `main` and pull
requests targeting `main`. Its **Verify** job installs the pinned `zt` CLI and
runs `pnpm check`, including CSS/token validation, generated binding types,
strict ESLint with zero warnings, TypeScript, unit tests, the production build,
deployment boundaries, browser accessibility/keyboard checks and retained failure
evidence. The desktop/mobile suite exercises the production Worker locally. It uploads
the verified `dist/` artifact named for the workflow commit. PRs only verify;
the verification job has no Cloudflare credentials.

After a successful main push verification, **Deploy** automatically downloads
that same run's artifact, checks out the same commit, and deploys it without
rebuilding, tagged with the Git SHA. There is no manual dispatch, confirmation,
enable switch, or expected-SHA input. Stale PR checks are canceled; an active main
run is never interrupted, and the latest pending main run waits for it to finish.
Frontend evidence is uploaded even on failure; it and verified builds are
retained for seven days.

Deployment reuses the existing `CLOUDFLARE_API_TOKEN` secret,
`CLOUDFLARE_ACCOUNT_ID` variable (`a0df2e968b524bdd77c0eab565058522`), and
`production` environment. Their values, permissions, and protection settings are
not changed by the workflow. Missing credentials, an unexpected account, or
permission errors stop deployment without a credential fallback.

The Worker stays `ztd-homepage`, with exactly `ztd.me`, `doa.ink`,
`zeithrold.dev`, `www.zeithrold.dev`, and `ztd.one`; workers.dev and preview URLs
stay disabled. Build guards still reject extra hosts and addons. GET-only domain
checks before and after deployment require all five existing domains to remain
on this Worker. Missing domains or legacy/unexpected owners fail before Wrangler,
so routine deployment cannot repeat the old cutover or reclaim retired bindings.
This workflow never retires a service.

`vercel.json` disables automatic Vercel Git deployments for this repository. It
does not modify an existing Vercel project or deployment.

## Redirects

The Worker recognizes only the exact hosts `doa.ink`, `zeithrold.dev`,
`www.zeithrold.dev`, and `ztd.one`: 308 to `https://ztd.me`, preserving path and query, including asset
paths. Canonical HTTP requests upgrade in one hop. A fixed destination origin
prevents open redirects. Responses use `no-store` to reduce cached migration
state. All other subdomains and unrelated hosts receive 421 if incorrectly routed here.

The checked-in configuration persists all four approved aliases. `blog.ztd.me`
and `showcase.ztd.me` continue on their own infrastructure. The expired
`zeithrold.cloud` is excluded. `zeithrold.com`, its
DNS/website/SSH server, `zeithrold-com`, and all mail records are outside scope.

## Rollback and history

To roll back the current site's code, revert the affected change through a
reviewed PR to `main`. The normal verification and deployment workflow publishes
the reverted build after merge. Keep the current Worker, all five domain owners,
ASSETS-only bindings and deployment guards intact; code rollback does not require
restoring a legacy service or repeating a domain cutover.

See [deployment history and legacy-service status](docs/retirement.md) for the
completed cutovers and last recorded retirement status. Historical operation
instructions remain in Git; the repository contains no one-time retirement tool.
