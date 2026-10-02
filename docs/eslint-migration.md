# Strict ESLint migration

The website now installs the public `@ztd-me/eslint@0.1.1`, with ESLint 10.11.0
and TypeScript 6.0.3. Node 24 satisfies its Node >=22.14 requirement. The default
ESM export and named `createConfig` are the same asynchronous function; the
configuration enables the vinext React profile and the strict TypeScript project.
The parent verified the published archive against tested source
`5133cc6c2eb4f2e87fc9d376fed146a8d3370ce5` before adoption.

The previous TypeScript `latest` resolved to 7.0.2, outside the package's
`>=5.4.0 <6.1.0` peer range. The migrated configuration enables
`noUncheckedIndexedAccess` alongside `strict`.

Wrangler is pinned to the already tested 4.144.0 resolution. Normal pnpm
resolution otherwise upgraded its `latest` selector to 4.145.0, which required
newer Worker bindings. Keeping the existing version preserves deployment tooling;
the only changed package version is ESLint 0.1.0 to 0.1.1. pnpm 11 rewrites peer
snapshots, and the resulting graph has no peer dependency issues.

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
- Parse Cloudflare JSON as `unknown` and validate envelopes, pagination and records
  for the current GET-only domain ownership checks.
- Remove the unused one-time retirement implementation and its dedicated tests.
  Preserve deployment guards, shared JSON validation and negative ownership tests;
  retain historical status without runnable cutover or deletion instructions.
- Add malformed-record regression tests and explicit Node test promise handling.
- Declare vinext's generated virtual Worker module fetch contract, avoiding its
  unresolved imported type while preserving the runtime handler.
- Run `pnpm lint` with zero warnings in the existing CI Verify job. Deployment
  remains limited to a push to main; PRs only verify without Cloudflare credentials.

Only Wrangler's generated `worker-configuration.d.ts` is explicitly ignored by
lint; CI still regenerates it and requires no drift. No handwritten source is
ignored, no rules are suppressed and no numeric limits are relaxed.

## Framework integration

The published 0.1.1 API uses `react: { framework: 'vinext' }`. Its
`ztd/app-router-exports` rule allows required framework exports only in server
page/layout modules. The root layout retains its required typed metadata export.
Client page/layout modules and ordinary component modules retain strict mixed-export
checking; no local allowlist or disabled rule was added.

The installed-package smoke check verified the asynchronous default/named exports,
server-layout metadata acceptance, rejection of the same export in a client layout
and ordinary component, and the effective strict limits: complexity 10, cognitive
complexity 15, function length 60, file length 300, line length 120 and array-layout
checking. Typed unsafe-call checking remains an error.

## Validation and completion

On Node 24.19.0 / pnpm 11.22.0, frozen installation, generated bindings without
drift, type checking, all 32 unit tests, the production Worker build and
build/deployment boundary guards passed. All 11 Chromium browser tests passed
against the production Worker, covering both languages/themes, WCAG AA,
320/390/768px layouts, keyboard navigation, reduced motion, saved or unavailable
storage, malformed preference values, metadata, local assets, redirects and 404s.

Full lint passes with zero errors and zero warnings using published 0.1.1. Frozen
installation, peer checks, package API/export-boundary smoke checks, generated
bindings without drift and whitespace checks also pass. Desktop/mobile browser
captures were inspected after the production Worker tests. These results apply
to the final package and dependency graph.

Run all final checks with zero lint warnings. Build/browser output can include
nonfatal upstream bundler, proxy and color-environment notices. Follow-ups must
use the public registry and preserve the package-only age exception and exact-version
trust exception:

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
part of this migration; the migration PR remains draft for user review.
