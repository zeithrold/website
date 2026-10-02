# Unified frontend migration checkpoint

## Preparation status

Preparation starts from main commit
`abfaee81d02ec50974761c92cd2e95b1e9b715fc`, after the foundation checks in PR #10.
The saved Cloud executor and checkout have been confirmed by real commands.
Node 24.19.0, pinned pnpm 11.22.0 and the reviewed `zt` CLI are available.

This phase isolates the existing header and footer from the content wrapper.
It preserves the rendered markup, classes, links, translated labels, preferences
and public `BrandMark` export. The existing homepage and 404 entry points still
use `SiteShell`. No shared-package API, storage protocol or palette value is
invented during preparation.

The parent verified the stable contract at tools commit
`7f9401ae1aae60ceb130670a9ce427f4d643df96`. Its six CI jobs passed, including
an independent packed consumer with unpatched dependencies. The contract is
mapped in [the concrete adapter plan](unified-frontend-adapter.md).

Package 0.1.0 is not yet public. The remaining release gate is owner merge,
automatic stage, owner promotion and a successful parent registry smoke check.
Do not install a guessed version or commit a vendor/tarball copy. These records
and preparation checks do not establish shared-package migration readiness.

Independent preparation now initializes product translations from a supplied
locale, separates the locale/metadata bridge from legacy theme mutation, isolates
the project brand and in-page links, and adds the trusted Worker request/cache
boundary. Nine regression cases bring the unit suite to 41 tests. The runtime
still uses the existing local preferences until the package is public.

## Approved target and ownership

The shared package owns the shadcn/Radix shell and non-sensitive appearance/UI
locale preferences. The approved appearance is neutral grayscale by default,
with the existing five colorful palettes. Modes are light, dark and system;
system is the default. Supported website UI translations remain English and
Simplified Chinese.

Appearance and UI locale may be shared across production `ztd.me` subdomains.
Authentication, accounts, business state and unrelated settings must never enter
that shared preference payload. Local development and preview hosts must remain
isolated from production preferences. Versioning, validation, SSR/hydration,
storage failures and cross-site updates follow the verified package contract.

The footer must contain © Zeithrold, the current repository link
`https://github.com/zeithrold/website` and `mailto:hello@ztd.me`. The website does
not gain a cross-site navigation menu. Existing in-page project/spaces/contact
links and editorial project/service cards remain product content.

The project keeps its routes, Worker, domain boundaries, local assets/fonts,
project selection, diagrams, paired translation dictionaries and metadata.
The approved theme/default/footer changes supersede the current visual and
preference choices only when the published package is actually integrated.

## Exact replacement points

| Current owner | Integration work after contract verification |
| --- | --- |
| `app/layout.tsx` | Use the published provider and supported SSR initialization; preserve framework metadata and children |
| `components/site-shell.tsx` | Adapt homepage/404 content to the published shell; retain main/skip-link and anchor behavior |
| `components/site-header.tsx` | Replace legacy controls/header with the shared shell; keep product identity and in-page links through supported composition |
| `components/site-footer.tsx` | Replace the legacy footer with the shared footer and this repository's approved links |
| `components/preferences-controls.tsx` | Replace local language/theme toggles with the shared locale/mode/palette controls |
| `components/preferences-provider.tsx` and `preferences-context.ts` | Remove local shared-state ownership after the published provider replaces it |
| `components/preferences-hooks.ts` | Retain typed product copy access; bridge only the published locale state to product translations |
| `lib/preferences.ts`, `browser-preferences.ts`, `preferences-store.ts` | Remove replaced normalization/persistence/store code; use the package's declared legacy migration policy |
| `lib/site-i18n.ts` | Keep website dictionaries and localized metadata; stop independently mutating the shared theme |
| `app/globals.css` and `app/styles/` | Import actual exported package CSS and map product diagrams/layout to documented semantic tokens |
| `components/ui/button.tsx` and `button-variants.ts` | Use published primitives where their verified contract preserves link composition and variants |
| `lib/copy.ts`, `lib/projects.ts`, `components/home/` | Preserve project content, data contracts, paired translations and product-specific controls |
| `app/not-found.tsx` and `components/not-found-page.tsx` | Preserve 404 status/content/home navigation under the new shell |
| `tests/preferences*.test.ts` | Replace superseded local-store tests with package-contract integration and legacy migration tests |
| `tests/e2e/homepage.spec.ts` and `button.spec.ts` | Preserve product coverage and update control interactions against actual published semantics |

The package handoff must identify exports/types, peer dependencies, CSS entry
points/token names, shell composition, control labels, locale/mode/palette values,
preference version and transport, legacy precedence, SSR initialization and host
isolation. The parent verifies the registry artifact before integration starts.
Retain a thin website translation/metadata adapter, rather than another shared
preferences implementation.

## Verification checklist for the integration phase

| Area | Required evidence |
| --- | --- |
| Registry and dependencies | Install the actual published exact version, check peers, freeze the lockfile and preserve other dependency resolutions |
| Defaults and appearance | Neutral initial/default palette; all five named colorful palettes from the real contract; light/dark/system and live system changes |
| SSR/hydration | Deterministic server and first client tree; no hydration errors or browser globals during SSR; localized metadata remains correct |
| Validated persistence | Reload, malformed/unknown/stale versions, allowed-field validation and the package's legacy `ztd.home.v1` migration policy |
| Sharing and isolation | Non-sensitive locale/appearance synchronization on approved production hosts; local/preview isolation; no auth/account/business fields |
| Storage recovery | Blocked cookie/local storage and browser failures retain usable in-memory controls without uncaught errors |
| Shell and footer | Homepage and 404; current repository/email/copyright links; no new cross-site navigation menu; working in-page anchors |
| Product content | Existing project cards, diagrams, source/service/contact links, local fonts/assets, canonical/Open Graph data and Worker redirects |
| Interaction | Keyboard opening/selection/dismissal, focus return, skip link, visible focus, translated accessible names and reduced motion |
| Reflow and contrast | Narrow/wide viewports, long translations, modes/palettes, overflow checks and full-page Axe scans |
| Runtime and deployment | Build and test the production Worker; retain all five approved domains, ASSETS-only binding and main-push-only deployment guards |
| Evidence | Native check logs, zero-warning CSS/lint reports, full Axe JSON, named captures and retained failure trace/image/video/reports |

Keep the current strict `@ztd-me/eslint@0.1.1`,
`@ztd-me/frontend-checks@0.1.0` and reviewed `zt` checks unless the parent supplies
another verified published update. `pnpm check` runs the required native profile
once without recursion; selected accessibility tests are focused subsets.
Add regression tests for substantive preference and shell changes using the
real public package API. Run frozen installation, lint, CSS, bindings/types,
unit/integration, build, browser/accessibility and failure-evidence checks again
against the final integration commit. Verify the remote/PR head, that commit's
CI, uploaded evidence and skipped PR deployment.

The approved `@ztd-me/*` minimum-release-age exception stays age-only.
`trustPolicy: no-downgrade`, exact `semver@6.3.1`, existing build permissions,
override, pruning and all other protections stay intact. No secret, grant,
infrastructure or security-setting changes are authorized by this preparation.
Draft PRs and work-branch pushes are authorized; merges, manual deployments,
credential changes and npm promotions are not. Outward-facing prose and
commit/PR metadata remain English. Visual baselines and performance budgets
remain deferred. There is no implementation work on the blog.
