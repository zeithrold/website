# Consumer Tailwind, typography and translation foundation

`app/globals.css` imports Tailwind and the installed shared `tailwind.css` entry once.
The Tools source graph owns semantic colors, configurable Noto body/control/help roles
(18/16/14px), shared shell layout and primitive behavior. Consumer components express
ordinary layout, spacing and responsive states with Tailwind utilities. Product CSS
retains intentional hero typography, illustration strokes, locale adjustments and
reduced-motion behavior; `app/styles/typography.css` is a compatibility marker rather
than another typography implementation. The existing app roots, main landmark,
routing, persistence authority and palette policy remain intact.

`lib/copy.ts` owns the complete `CopyKey` dictionary contract. `lib/site-i18n.ts`
provides a typed translation boundary around the existing request-local factory.
`components/website-frontend.tsx` constructs one instance per root, and
`components/preferences-hooks.ts` derives translations from the FrontendProvider
locale. The boundary ignores caller `lng`, `lngs` and `ns` overrides while preserving
pluralization and interpolation options. No second engine or locale authority is
introduced.

Application object contracts use TypeScript `type` aliases. The project enforces
`ts/consistent-type-definitions: ["error", "type"]` during the published ESLint
transition. Required native/global declaration merging remains interface-based in
handwritten declaration files; generated declarations and installed shared source
are separate provenance boundaries.

The project preserves its current `app/`, `components/`, `lib/` and `tests/` roots.
New translation behavior stays in named i18n modules and hooks. Project policy and
content remain outside the generic shared provider.

## Shared-source review boundary

`ui-source.lock.json` retains the original 42-file public pin and records the
installed 76-file reviewed local candidate separately. `check:ui` verifies the
candidate inventory digest, every installed file byte, reviewed import adaptations,
atomic installation and exact direct dependency pins. The candidate is explicitly
not an approved public installation. Final source acceptance requires owner review,
a full approved public source SHA and a fresh public registry installation.

The CSS-first checker is a portable patch of published
`@ztd-me/frontend-checks@0.1.1`; its runtime TypeScript dependency is declared through
`packageExtensions`. Dependency pins, patches, shared licenses and the lockfile
must be reviewed together. These local candidates do not imply Tools publication
or a dependency release.

## Native verification

Run `pnpm check:ui`, `pnpm lint`, `pnpm lint:css`, `pnpm check:types` and `pnpm test`
for source identity, strict ESLint, CSS/import/utility validation, generated Worker
type drift, all project TypeScript configurations and unit behavior. `pnpm check:worker`
validates the native Worker build and existing deployment-domain guards.
`pnpm check:browser` runs the complete browser suite against real local Worker
fixtures, including menus, SSR, preferences, storage, accessibility and actual
Google Noto font loading. `pnpm check:evidence` retains the failure-evidence gate.
No security policy, native check threshold or production binding is relaxed.

Ordinary and simulated-canonical fixtures accept `WEBSITE_TEST_PORT` and
`WEBSITE_CANONICAL_TEST_PORT` (defaults 4173/4174) so verification can avoid an
existing local preview. `ZT_ARTIFACTS_DIR` selects generated reports and captures;
`.zt/`, build output and temporary local Worker configurations are run artifacts,
not source files. Current run results belong in those reports and PR validation,
not this durable integration contract.
