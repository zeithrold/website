# Strict ESLint migration

The website now installs the public `@ztd-me/eslint@0.1.0`, with ESLint 10.11.0
and TypeScript 6.0.3. Node 24 satisfies its Node >=22.14 requirement. The default
ESM export and named `createConfig` are the same asynchronous function; the
configuration enables React and the repository's strict TypeScript project.

The previous TypeScript `latest` resolved to 7.0.2, outside the package's
`>=5.4.0 <6.1.0` peer range. The migrated configuration enables
`noUncheckedIndexedAccess` alongside `strict`.

## Supply-chain policy

The user explicitly approved `minimumReleaseAgeExclude` **only for
`@ztd-me/eslint`**. That is the sole release-age exception. The existing 24-hour age
gate, build-script permissions and patched ZIP-decoder override remain intact;
transitive and unrelated dependencies have no new age exception.

The coordinated follow-up pins pnpm 11.22.0 and enables the approved
`minimumReleaseAgeExcludePrune: true`, `shellEmulator: true` and
`trustPolicy: no-downgrade` settings. The public pnpm release requires Node >=22.13;
Node 24 is compatible. Its implementation supports all three settings, including
exception pruning added in 11.22.0. Unused package-age exceptions are pruned,
scripts use pnpm's shell emulator and dependency trust downgrades are rejected.

The user separately approved exactly `trustPolicyExclude: ['semver@6.3.1']`.
Babel 7's core and compilation-target helper require this newest 6.x release.
pnpm compares trust by publication date across major versions: semver 7.5.4 had
provenance on 2023-07-07, followed by 6.3.1 without provenance on 2023-07-10.
The locked package integrity matches the public registry. The approved exception
accepts missing provenance for that exact version; `no-downgrade` still applies
to every other package/version. No semver-major override was applied.

pnpm 11 removed `onlyBuiltDependencies`; the equivalent supported `allowBuilds`
map permits only the same two packages, esbuild and workerd. Strict build checks
remain enabled. Frozen installation passes all 758 supply-chain entries with
these two narrow, approved exceptions and unchanged dependency resolutions.

## Refactors and checks

- Extract homepage sections, diagrams, controls and footer while preserving
  copy, classes, links and accessibility attributes.
- Restore preferences through a per-provider store after subscription, retaining
  deterministic SSR, browser defaults, validated saved fields, optional storage,
  localization and metadata updates. Handle i18next promises explicitly.
- Separate context/hooks and button variants from component modules for Fast Refresh.
- Parse Cloudflare JSON as `unknown` and validate envelopes, pagination and records.
  Split the retirement preflight into small stages, preserving fixed targets,
  ownership rechecks, the single non-forced DELETE and post-deletion verification.
- Add malformed-record regression tests and explicit Node test promise handling.
- Declare vinext's generated virtual Worker module fetch contract, avoiding its
  unresolved imported type while preserving the runtime handler.
- Run `pnpm lint` with zero warnings in the existing CI Verify job. Deployment
  remains limited to a push to main; PRs only verify without Cloudflare credentials.

Only Wrangler's generated `worker-configuration.d.ts` is explicitly ignored by
lint; CI still regenerates it and requires no drift. No handwritten source is
ignored, no rules are suppressed and no numeric limits are relaxed.

## Upstream blockers in 0.1.0

The remaining framework error needs an upstream published fix. All independent
code violations are resolved, and no local rule overrides have been added.

### Framework metadata

`pnpm exec eslint app/layout.tsx` reports only
`react-refresh/only-export-components` at the required `metadata` export.
A minimal framework reproduction is:

```text
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Example' }
export default function RootLayout() { return <html><body /></html> }
```

Use the package's default config with `react: true`, an existing strict project
including this TSX file, and `noUncheckedIndexedAccess: true`. The named metadata
export is required by the vinext/Next App Router. Preserve this convention;
do not disable Fast Refresh globally or move the framework export to evade it.

The parent reports a framework-aware fix targeting public 0.1.1 in
[tools PR #4](https://github.com/zeithrold/tools/pull/4). Adoption waits for the
parent's public-registry verification; this repository still uses published
0.1.0. The verified follow-up will use `react: { framework: 'vinext' }` while
preserving required framework exports and all strict checks.

## Validation and completion

On Node 24.19.0 / pnpm 11.22.0, frozen installation, generated bindings without
drift, type checking, all 39 unit tests, the production Worker build and
build/deployment boundary guards passed. All 11 Chromium browser tests passed
against the production Worker, covering both languages/themes, WCAG AA,
320/390/768px layouts, keyboard navigation, reduced motion, saved or unavailable
storage, malformed preference values, metadata, local assets, redirects and 404s.

Full lint reports one error and zero warnings: the required framework metadata
export. The workspace settings satisfy the required key order and blank lines;
no settings or permissions were broadened. Completion requires the published
framework fix. Build/browser output includes nonfatal upstream bundler, proxy
and color-environment notices; lint is required to have zero warnings.

Keep the PR in draft until the framework error is resolved
and all final checks pass. Any follow-up must use the public registry and preserve
the package-only age exception and exact-version trust exception:

```sh
pnpm install --frozen-lockfile
pnpm types
git diff --exit-code -- worker-configuration.d.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check:build
pnpm test:e2e
pnpm check:build
```

Verify the pushed head and CI for that commit. No merge or manual deployment is
part of this migration.
