# Website frontend foundations

Current source provenance and the verified 77-file inventory are defined in
[the consumer foundation contract](consumer-foundation.md). Earlier acceptance
records below describe their original test runs.

The executable helper is the registry package `@ztd-me/frontend-checks@0.1.3`,
with `@playwright/test@1.62.0`. Strict `@ztd-me/eslint@0.1.4`, TypeScript 6.0.3,
Node 24 and pnpm 11.22.0 remain in use. Vite is pinned to its existing tested
8.3.1 resolution to avoid an unrelated upgrade during helper installation.

The CLI and complete Skills come from reviewed, merged tools commit
`3f9a3a7d33befc5a954ba1e86d3aa6d72e2c762f`:

```sh
go install github.com/zeithrold/tools/cmd/zt@3f9a3a7d33befc5a954ba1e86d3aa6d72e2c762f
zt inspect --root . --json
zt sync --root . --plan
zt sync --root .
```

Put GOBIN or GOPATH/bin on PATH. CI installs that exact CLI source with Go 1.27.1.
`zt.lock.json` records versions and hashes for `js-ts-testing`, `ui-foundation`,
`ui-web`, `frontend-engineering` and `frontend-verification`. Sync previews were
reviewed before installation; managed local edits are refused. Project design
and deployment decisions remain here, outside the managed Skill directories.

## Explicit checks

After frozen dependency and Chromium installation, run `pnpm check`. Its ordered,
required `frontend` profile maps native commands as follows:

| Capability | Native command | Actual scope |
| --- | --- | --- |
| lint | `pnpm lint` | Strict ESLint, zero errors and warnings |
| css | `pnpm lint:css` | CSS imports, Tailwind utility classes and cross-file token inventory |
| typecheck | `pnpm check:types` | Regenerate bindings, require no drift, run TypeScript |
| unit | `pnpm test` | Routing, shared preference, translation, SSR/cache and deployment-boundary tests |
| build | `pnpm check:worker` | Build once and check the original deployment configuration |
| e2e | `pnpm check:browser` | Full production-Worker browser suite, then recheck deployment boundaries |
| integration | `pnpm check:evidence` | Deliberate accessibility failure must retain complete useful evidence |

The e2e suite includes full-page Axe scans, keyboard paths, both locales/themes,
responsive checks, storage fallback, metadata, assets, redirects and 404s.
`pnpm test:a11y` selects tagged accessibility/keyboard/variant tests for focused
work; it is not run again by the aggregate. Native commands do not invoke the
aggregate recursively. Required failures stop later profile entries.

The evidence probe runs a separate synthetic page with an intentionally unnamed
button. Its wrapper succeeds only when Playwright fails with the expected
`button-name` violation and retains the embedded complete Axe scan, trace,
screenshot, video and HTML/JSON reports. It changes no product content or services.

## Local visual and token contract

Editable `@ztd-me/ui` source at tools commit `9abea5a57b97f63109fb7dc5255543b53629c3ba`
supplies the appbar/footer, shared controls and CSS. `app/globals.css` imports product
styles and maps business roles to public shared tokens. Noto Sans Latin/CJK and
Noto Color Emoji load directly from the Google Fonts API. Neutral/system is default;
all six palettes and light/dark/system are covered in the browser suite.

`app/styles/` separates content layout, hero, diagrams/cards, sections and responsive
rules. Website content, brand, ordinary source/service links and Button/CVA variants
remain local. The destructive role stays `#a84225` in light mode and `#ee8661` in dark
mode, including system-dark before hydration. Browser fixtures verify variant colors
and contrast without adding unused product controls.

`css-check.config.mjs` inventories every product CSS file and actual Tailwind/shared
source declarations. Explicit external custom properties come from Radix positioning and Vaul motion
at runtime; every product and source CSS file remains checked. Official helper
0.1.3 validates Tailwind imports, utilities and the block variants used for
explicit and system dark; invalid nesting elsewhere remains checked. Cross-file
inventory complements real browser palette/variant checks.

SSR initializes root attributes, product translations and localized metadata from
the same validated cookie/Accept-Language snapshot. English/Simplified Chinese and
non-sensitive appearance share through the package policy; blocked persistence is
nonfatal. See [shared frontend integration](unified-frontend-migration.md) for cookie,
storage isolation, hydration and ownership boundaries. The full-page helper uses its
default WCAG 2/2.1/2.2 A/AA tags. Font transfer budgets and glyph-level browser evidence are required; pixel-diff baselines remain deferred.

## Evidence and CI

`zt check` creates a unique directory below `.zt/artifacts` and records native
argv, directories, statuses, exits and logs. The CSS CLI writes `css.json` there;
Playwright's shared settings retain JSON/HTML reports, named PNG captures, full
Axe scans and failure traces/screenshots/videos under the same root. Direct
browser runs use `.zt/browser` instead. An Axe attachment may be embedded as a
base64 body in `playwright.json`; it need not be a separately named JSON file.

CI records the CLI module/toolchain, workflow revision, lockfile checksum and
Node/pnpm versions. It uploads the entire `.zt/artifacts` tree on success or
failure, with missing evidence treated as an error. Evidence and verified Worker
artifacts are retained for seven days. GitHub's upload does not grant the check
job production credentials.

The Deploy job remains main-push-only and publishes the same verified Worker
artifact. Existing account/domain owners, ASSETS-only bindings, protected hosts,
GET-only ownership checks, Vercel Git-deploy disablement and rollback remain intact.
No check command installs dependencies, deploys, or deletes a remote resource.

## Dependency policy

The owner approved `@ztd-me/*` as the sole scope exception to the 24-hour release-age
gate, anticipating frequent own-package updates. It replaces redundant individual
age entries. It is not a trust exemption: `no-downgrade` and the exact approved
`semver@6.3.1` exception remain, as do exception pruning, shell emulation, the
fflate override and only esbuild/workerd build permissions.
