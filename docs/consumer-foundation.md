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

Application object contracts use TypeScript `type` aliases. The official
`@ztd-me/eslint@0.1.4` profile enforces
`ts/consistent-type-definitions: ["error", "type"]`. Required native/global
declaration merging remains interface-based in handwritten declaration files; generated declarations and installed shared source
are separate provenance boundaries.

The project preserves its current `app/`, `components/`, `lib/` and `tests/` roots.
New translation behavior stays in named i18n modules and hooks. Project policy and
content remain outside the generic shared provider.

## Shared-source review boundary

`ui-source.lock.json` pins the complete 77-file public Tools UI graph at
[`9abea5a57b97f63109fb7dc5255543b53629c3ba`](https://github.com/zeithrold/tools/tree/9abea5a57b97f63109fb7dc5255543b53629c3ba).
Its payload SHA256 is
`0ea6c065dc4da6608fb8b2beb817b8607c03ad694f40af1a49160971c804ddd4`.
The [public-source CI gate](https://github.com/zeithrold/tools/actions/runs/37713345587)
performed a fresh `shadcn@4.21.1` install, checked every public byte and license,
and passed native lint/CSS/types, 14 source-consumer units and 32 real browser cases
with actual Google Fonts. `docs/ui-public-installation.json` preserves its receipt
with a final newline; the source lock records both the original CI receipt hash and
the checked-in receipt hash.

The source guard checks that receipt, upstream and installed hashes, the complete
inventory digest, reviewed adaptations, atomic delivery and exact dependency pins.
It rejects altered bytes, extra files, changed inventory digests and unverified
installation claims. The installed graph is a verified public source rather than a
local candidate. Source updates require a new verified full commit and reviewed
inventory; normal checks use the committed evidence without network access.

Website retains 16 reviewed TypeScript relative-import adaptations for its native
Node tests. All other delivered bytes match the public graph.

The CSS and Tailwind checker uses official `@ztd-me/frontend-checks@0.1.3`,
including its declared runtime TypeScript dependency. Consumer patches and package
extensions are not used for the checker. Review exact dependency pins, shared
source licenses and the lockfile together.

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
