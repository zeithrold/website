# Strict ESLint migration — blocked on release age

This branch prepares the website for the published `@ztd-me/eslint@0.1.0`.
It is not a completed migration and must remain a draft until the steps below pass.

The package was published at **2026-10-02 02:06:15 UTC**. The repository's
unchanged `pnpm-workspace.yaml` requires `minimumReleaseAge: 1440` (24 hours).
Running the declared pnpm 10.33.0 with the exact public version produced:

```text
ERR_PNPM_NO_MATURE_MATCHING_VERSION
Version 0.1.0 of @ztd-me/eslint does not meet the minimumReleaseAge constraint
```

The earliest permitted install is **2026-10-03 02:06:15 UTC**. No exclusions,
policy overrides, local links, or tarball installations were used to bypass it.
The public tarball was inspected read-only for its README, declarations, and
rule definitions. It was not executed or installed.

## Prepared changes

- Pin the mature peer dependencies: ESLint 10.11.0 and TypeScript 6.0.3.
  The previous `typescript: latest` resolved to 7.0.2, outside the package's
  declared `>=5.4.0 <6.1.0` peer range.
- Enable `noUncheckedIndexedAccess` alongside the existing `strict` setting.
- Use the published async default export in `eslint.config.js`, explicitly
  enabling React and the repository TypeScript project, with no local rule
  overrides or source ignores.
- Provide `pnpm lint` with `--max-warnings 0`. It is blocked because the package
  cannot yet be installed. CI lint integration is still pending.
- Extract homepage sections, project diagrams, preference controls and footer.
  Preserve their classes, headings, links, copy and accessibility attributes.
- Restore preferences through a per-provider external store after subscription,
  avoiding effect-triggered React state updates and unstable context values.
  Keep deterministic English/light SSR, browser defaults, saved field validation,
  optional storage, localization and metadata updates.
- Add regression coverage for restoration timing, field updates, subscription
  cleanup, provider isolation, malformed storage and independent field fallback.

## Required completion after the gate opens

Use Node 24 and the declared pnpm 10.33.0. From this branch:

```sh
pnpm add -D -E @ztd-me/eslint@0.1.0
pnpm lint --fix
pnpm lint
```

Commit the generated lockfile. Preserve the existing age gate and package
policy. If another dependency is age-blocked, record its earliest permitted
install instead of bypassing the gate.

Fix all remaining violations by behavior-preserving refactoring, including
handwritten configuration, scripts, and tests. The prepared changes have not
been certified against the full lint policy. Do not suppress rules, relax
limits, disable typed/framework checks, or add broad ignores. Report a minimal
reproducer upstream if a genuine package bug prevents correct code.

Add `pnpm lint` to the existing Verify job after dependency installation; keep
the current production boundary unchanged. Validate the final commit with:

```sh
pnpm install --frozen-lockfile
pnpm types
git diff --exit-code -- worker-configuration.d.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check:build
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
pnpm check:build
```

CI currently verifies PRs without Cloudflare credentials. Deployment is limited
to a push to `main` in `zeithrold/website`, using the verified artifact; Vercel
Git deployment is disabled. Keep this migration in a draft PR, verify the remote
head and CI, and do not merge or manually deploy.

## Preparation validation

Checked in the saved Cloud environment with Node 24.19.0 and pnpm 10.33.0:

| Check | Result |
| --- | --- |
| Frozen lockfile installation of mature peers and existing dependencies | Passed |
| Generated binding types and unchanged generated declaration | Passed |
| TypeScript 6.0.3 with strict and indexed-access checks | Passed |
| Unit tests, including three new store regression tests | 37 passed |
| Production Worker build | Passed, with vinext/bundler and proxy notices |
| Build/deployment boundary guard before and after browser tests | Passed |
| Production Worker browser suite using available Chromium | 11 passed |
| Screenshots for desktop/mobile and English/Chinese themes | Captured and visually reviewed |
| Published package installation | Blocked by the 24-hour age gate |
| Full strict lint | Blocked at config import because package installation is forbidden until maturity |
| CI lint integration and remaining strict refactoring | Pending |

Browser checks cover both languages/themes, WCAG AA, local assets and metadata,
320/390/768px layouts, keyboard navigation, reduced motion, persisted preferences,
unavailable or malformed storage, static assets, missing routes and host routing.
No application behavior change requiring approval was identified.

The parent is investigating whether inherited Fast Refresh checks reject a
framework layout's metadata and component exports. Preserve `app/layout.tsx`
and its exported metadata. Once lint can run, report the concrete rule ID and
a minimal reproduction if encountered; do not add a local override or move
framework exports to evade the check. Any package fix needs a published,
verified release before final validation.
