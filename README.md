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

Use Node.js 24 and pnpm 10.33.0 (declared in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm types
pnpm typecheck
pnpm test
pnpm build
pnpm check:build
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

`pnpm start --port 4173` runs the production Worker locally, using the generated
`dist/server/wrangler.json`. It first validates the production config, then uses
a temporary copy with empty local routes so Wrangler does not infer the live
domain as its local upstream and rewrite redirects. The deployed config/code,
ASSETS and bindings stay intact; the copy is removed on shutdown. `wrangler.jsonc`
is the source configuration.
Dependencies have a 24-hour minimum release age; CI uses the committed lockfile.
Browser tests run against the production Worker, save screenshots under
`artifacts/`, and retain traces on failure. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
can select an already installed Chromium in a restricted environment.

In a filesystem-restricted Cloud workspace, point `XDG_CONFIG_HOME`,
`XDG_DATA_HOME`, and `WRANGLER_LOG_PATH` at writable temporary directories.
Stop a local Worker before rebuilding its `dist/` directory.

## Content and design

- `lib/projects.ts`: editable project selection and links.
- `lib/copy.ts`: paired, typed English/Chinese copy.
- `app/globals.css`: local Inter/DM Sans and the warm-white/ink/terracotta system.
- `components/homepage.tsx`: project diagrams, service cards, and contact section.
- [Content evidence and selection policy](docs/content.md).

The selection is editorial, not a claim about current priorities or project
availability. Tools is explicitly early development. Its implemented inspect,
plan, and Skill sync are described without promising check/run/doctor commands.

## CI and staged deployment

[Checks](.github/workflows/checks.yml) runs on pushes and PRs and checks binding
types, TypeScript, unit tests, the production build, deployment boundaries, and
desktop/mobile browser behavior. It has no Cloudflare credential or deploy step.

[Deploy Worker manually](.github/workflows/deploy.yml) is **manual-only**. It
requires `main`, `WEBSITE_DEPLOY_ENABLED=true`, the exact confirmation
`DEPLOY_ZTD_ME_AND_ALIASES`, the full reviewed main SHA in `expected_commit`, the approved
account ID, and the `production` environment. Invalid inputs fail explicitly.
It repeats all checks and deploys the same tested artifact. Configure environment
reviewer protection only
after user approval; the workflow does not create or configure that protection.

The deploy step references the existing `CLOUDFLARE_API_TOKEN` repository secret.
Do not read its value or create a replacement credential. Set a confirmed public
account ID `a0df2e968b524bdd77c0eab565058522` in `CLOUDFLARE_ACCOUNT_ID`.
Neither variable is configured by this phase PR. The checked-in config and exact
build guard allow exactly `ztd.me` plus the four approved alias Custom Domains,
with `workers_dev` and all preview URLs disabled. Older phase confirmations are rejected.
Before deployment, GET-only checks reject unexpected domain ownership, missing
Custom Domain state or extra targets on the new Worker. A post-check verifies the
five approved owners while keeping the canonical host online. Permission errors stop without credential changes.

The Mac coordinator must hand off the agreed exact dev A/www CNAME cleanup before dispatch.
Merge/finish CI first, then coordinate one binding writer: Cloud workflow.
Wrangler can transfer doa.ink directly; do not detach it first. Keep the old
Worker and Vercel projects for rollback. See the record-specific sequence below.

`vercel.json` disables automatic Vercel Git deployments for this repository. It
does not modify an existing Vercel project or deployment.

## Redirects and migration

The Worker recognizes only the exact hosts `doa.ink`, `zeithrold.dev`,
`www.zeithrold.dev`, and `ztd.one`: 308 to `https://ztd.me`, preserving path and query, including asset
paths. Canonical HTTP requests upgrade in one hop. A fixed destination origin
prevents open redirects. Responses use `no-store` to reduce cached migration
state. All other subdomains and unrelated hosts receive 421 if incorrectly routed here.

The checked-in configuration persists all four approved aliases. `blog.ztd.me`
and `showcase.ztd.me` continue on their own infrastructure. The expired
`zeithrold.cloud` is excluded. `zeithrold.com`, its
DNS/website/SSH server, `zeithrold-com`, and all mail records are outside scope.

See [the current alias cutover and rollback plan](docs/alias-migration.md) and
[the completed canonical phase record](docs/migration.md).
The subsequently approved permanent retirement of the two exact old services
has a separate [remote retirement procedure](docs/retirement.md).
Do not dispatch deployment, attach domains, change DNS, configure persistent
authorization, or retire `zeithrold-dev` during the review phase.
