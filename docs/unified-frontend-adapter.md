# Verified frontend adapter preparation

This plan uses the exact [consumer contract](https://github.com/zeithrold/tools/blob/7f9401ae1aae60ceb130670a9ce427f4d643df96/packages/frontend/README.md)
and source at tools commit `7f9401ae1aae60ceb130670a9ce427f4d643df96`, reviewed in
[tools PR #8](https://github.com/zeithrold/tools/pull/8). It is consumer code, not a
copy of the shared implementation. Package 0.1.0 still requires owner merge,
automatic staging, owner promotion and the parent's successful registry smoke.
The examples below are not imported by the running application before that gate.

## Server request and translation snapshot

`lib/frontend-request.ts` now derives a Worker-owned deployment marker only
after the existing canonical/local URL policy accepts the request. It overwrites
an incoming marker, preserves the request body and other headers, and ignores
forwarded host/protocol values. Canonical production uses fixed `ztd.me`/HTTPS;
local rendering uses the website development namespace and its actual protocol.
Unknown or absent context defaults to development. A false built-Worker flag
ignores even a valid-looking incoming marker; the application request boundary
supplies the overwritten marker in the built Worker.
Preview and other unapproved hosts remain rejected by the existing routing policy.

After publication, a server-only `resolveWebsiteFrontend` resolver uses the
verified root exports `createPreferencePolicy` and `resolveInitialPreferences`.
Pass `frontendDeployment(requestHeaders, import.meta.env.PROD)` to the policy
factory. The second argument is a trusted build flag, not a request header;
[Vite replaces its built-in constants at build time](https://vite.dev/guide/env-and-mode).
Add Vite's provided client declaration types for this compile-time API without
changing compiler strictness or introducing a new deployment variable.

Resolve the initial snapshot with the resulting `policy`, `cookieHeader` from
the Cookie header and `acceptLanguage` from Accept-Language, using undefined for
absent headers. The resolver returns only the typed `FrontendPreferences` and
`PreferencePolicy` values. `app/layout.tsx` reads
`await headers()` from `next/headers`, resolves the snapshot and renders
`<html {...frontendRootAttributes(initialPreferences)}>`. Pass exactly that
snapshot and policy to the client adapter; never pass raw request headers/cookies.
The request API keeps locale-sensitive rendering dynamic. Use the same resolver
in `generateMetadata` for description, Open Graph and Twitter descriptions while
preserving canonical URLs, title, image and icon contracts.

`createSiteI18n(initialPreferences.locale)` now supports per-document synchronous
initialization. `applySiteLocale` updates product translations and localized
metadata without owning root mode, palette or locale attributes. The old
`applySitePreferences` wrapper remains only until the legacy provider is removed.

Application responses now have `Cache-Control: private, no-store` and vary by
Cookie and Accept-Language while preserving existing Vary fields and wildcard
semantics. The ASSETS path retains its own caching; redirects and rejected hosts
keep their original no-store behavior. No CDN configuration or infrastructure
changes are introduced. Regression tests cover the trusted marker, payload,
allowed-host boundary, cache headers and independent translation instances.

## One client provider

The verified client exports are `FrontendProvider`, `useFrontendPreferences`,
`PublicShell`, `ApplicationShell`, `Appbar`, `SiteFooter`, `AppearanceMenu` and
`LocaleSelect`. The website uses one provider and `PublicShell`:

The client `WebsiteFrontend` adapter receives `initialPreferences`, `policy`
and React children. Initialize its i18next instance once with
`createSiteI18n(initialPreferences.locale)`. Memoize an `onPreferencesChange`
callback that passes only the updated locale to `applySiteLocale`. Render the
single `FrontendProvider` with those snapshot/policy/callback props, containing
the existing `I18nextProvider` and children. Import preference/policy types from
the server-safe root and runtime components from `/client`.

Use explicit published types and the component return type. If retained local
Tailwind variants require `.dark`, a child hook bridge may update that legacy
class from `resolvedMode`; it must not implement its own system listener/store.
Business surfaces read shared tokens directly, so system colors work before
hydration through the package's media-query CSS. The package owns the root
`data-frontend-mode`, `data-frontend-palette` and `lang` attributes.

Remove local preference controls/context/store/normalizers after their consumers
move to the hook. Keep only typed product-copy access in `preferences-hooks.ts`.
The package handles limited `ztd.home.v1` migration after hydration; do not create
a second writer or delete the legacy key. Persisted data stays exactly version,
mode, palette and locale. Different subdomains synchronize on focus/visibility,
with same-origin mirror notifications; tests must not assume instant broadcasting.

## Public shell and product-owned content

The client `SiteShell` adapter uses these verified props:

| Prop/content | Website adapter value |
| --- | --- |
| `brand.label` | `zeithrold.` |
| `brand.homeHref` | `/` |
| `brand.mark` | The project-owned `BrandMark` element, constructed in the client adapter |
| `repositoryUrl` | `https://github.com/zeithrold/website` |
| `mainId` | `main` |
| children | One `site-content` wrapper with `id="top"`, `SiteSectionLinks`, existing sections and product caption/back-to-top action |

`BrandMark` and `SiteSectionLinks` are now independent project components. Keep
the three in-page anchors in the content area so narrow shared chrome does not
overflow. These are product navigation, not a cross-site menu. Keep the existing
back-to-top action and product caption in content because the shared footer is
fixed. Do not create another main landmark or duplicate skip link/footer.
The package's footer provides exactly © Zeithrold, this repository's GitHub link
and hello@ztd.me. The hero's owner-profile GitHub link remains unchanged.

Keep homepage/404 sections, diagrams and editorial service cards. The package
does not export its internal Button primitive, so retain project-specific local
Button/CVA link composition and variants with shared semantic token mappings.
No `ApplicationShell` business navigation, identity or cross-site menu is needed.

## CSS and actual control contract

Import `@ztd-me/frontend/styles.css` once at the root. Its actual package export
targets `dist/styles.css`; include
`node_modules/@ztd-me/frontend/dist/styles.css` in CSS checker `tokenFiles` after
registry installation. No node_modules Tailwind scan or arbitrary variable
exemptions are needed. The package supplies Inter Latin/Latin Extended fonts;
retain project-owned DM Sans and CJK fallback behavior.

Map existing business background/foreground/card/subtle/muted/border/focus roles
to `--ztd-background`, `--ztd-foreground`, `--ztd-surface`, `--ztd-muted`,
`--ztd-muted-foreground`, `--ztd-border` and `--ztd-focus`. Accent/action roles use
`--ztd-accent`, `--ztd-action` and `--ztd-action-foreground`. Retain and verify
the website's destructive role; no public shared destructive token is declared.
Do not override the shared `--ztd-*` values or retain terracotta as the default.

Modes are `system`, `light`, `dark`; palettes are `neutral`, `terracotta`, `moss`,
`ocean`, `plum`, `graphite`. Appearance is a Radix menu with mode/palette radio
items. Locale is a Radix Select/combobox with English and 简体中文 options.
The English labels are Appearance/Language and the Chinese labels are 外观/语言.
Browser tests must use those actual semantics, verify focus/escape restoration,
and scan the full page plus open menu/Select states in both languages. Cookie
rejection must leave in-memory controls usable. No CSP exists in this Worker;
this preparation adds none and does not claim compatibility with a future
policy that forbids Radix style attributes.

## Publication and final validation checkpoint

After the parent's registry smoke succeeds, install the exact promoted version
with pnpm and freeze its real registry lockfile. Apply the server/client/CSS
adapters, remove replaced local preference code and update documentation to the
actual behavior. Run the complete strict profile against the built Worker,
including sharing/isolation, defaults, legacy/future preferences, hydration,
localized metadata, all modes/palettes, keyboard, Axe and retained failure proof.
Recheck remote/PR head, exact-head CI, uploaded artifacts and skipped deployment.
Until then, only the independent preparation changes and their tests are passing.
