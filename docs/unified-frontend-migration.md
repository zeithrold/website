# Shared frontend integration

The website uses published `@ztd-me/frontend@0.2.0` and
`@ztd-me/frontend-checks@0.1.1` with exact real-registry pins. The owner merged
reviewed tools source `757ecc6ae77a361680efb9e5875815ff28a65146` at
`1e8b408ccf165d1b0aa5eca679f9ea62a82cd1a3`; their source trees match exactly.
The promoted frontend tarball is byte-identical to the tested source candidate.

The [generic API upgrade](https://github.com/zeithrold/tools/blob/1e8b408ccf165d1b0aa5eca679f9ea62a82cd1a3/packages/frontend/docs/upgrade-0.2.md)
removes project enums, legacy storage extraction, automatic deployment/domain
selection and fixed footer identity. The version-1 preference schema, palette/mode
values, root attributes, provider and CSS contract are preserved.

Independent public-registry downloads match the reviewed package archives:

| Package | Registry tarball SHA256 |
| --- | --- |
| frontend 0.2.0 | `0dbe39fb76dbfd7d45a3d581fb4b66f9e5546ff4736c9e85028874377fda6c5c` |
| frontend-checks 0.1.1 | `a6ea816b3c4fbae8196784a4d1282e8da9906a6a69f685539c146a30ed7e6774` |

Website preparation PR #11 merged at `20172f6e99d63f0d5c9b4523863b6126a609e41c`.
The registry lock retains every unrelated resolution, including vinext/cloudflare
1.0.0, React 19.3.0, TypeScript 6.0.3 and Vite 8.3.1. No temporary tarball dependency,
vendor copy or transition adapter remains. The separate Inter dependency is removed
because shared CSS bundles its licensed font files. Release-age policy, its approved
age-only `@ztd-me/*` exception, trust policy, build permissions and managed Skills
remain unchanged.

## Consumer configuration

`lib/frontend-policy.ts` creates explicit policies from the website's trusted
Worker deployment decision. It preserves the existing current-format cookie names:

| Environment | Cookie and optional notification key | Domain/security |
| --- | --- | --- |
| Production | `ztd.frontend.v1` | `ztd.me`, HTTPS required |
| Development | `ztd.frontend.development.website.v1` | Host-only; Secure only over HTTPS |
| Preview | `ztd.frontend.preview.website.v1` | Host-only; Secure only over HTTPS |

The website Worker still rejects preview hosts; the isolated preview configuration
is tested as a policy boundary and does not authorize new deployment routes.

`SiteShell` supplies all footer identity and links through the generic `footer`
prop. It keeps © Zeithrold, the current GitHub repository, `hello@ztd.me` and
`mailto:hello@ztd.me`. Product translations supply the existing English/Chinese
accessible repository labels. Brand, home link and mark also stay consumer-owned.

There is no legacy key mapping, read, write, migration or cleanup in the package or
adapter. Old storage entries, drafts, account/auth data and unrelated cookies remain
untouched. The browser audit observes actual localStorage calls: hydration performs
none, and subsequent user changes only write the configured current notification
key. Notification values are never read. Missing current cookies use negotiated
locale and default appearance until the user chooses; existing valid version-1
cookies retain their selections before and after hydration and reload.

Verification covers all seven native gates, 41 unit tests, 33 Chromium tests,
full Axe scans and retained accessibility-failure evidence. Registry adoption uses
a frozen real registry lock. Exact-head CI and its actual uploaded evidence must
pass before review. The integration PR stays draft; only an owner merge can trigger
the existing main-only deployment.

## Ownership and composition

The package owns one `FrontendProvider`, `PublicShell`, appbar, footer, Radix
Appearance menu and locale Select. Neutral grayscale/system mode is the default.
Terracotta, moss, ocean, plum and graphite are additional palettes; all six support
light and dark. UI locales remain English and Simplified Chinese.

`SiteShell` supplies the original `BrandMark`, `zeithrold.` label, `/` home link,
`main` landmark ID and `https://github.com/zeithrold/website` repository. The shared
footer contains exactly © Zeithrold, the repository GitHub link and hello@ztd.me,
without a year. The three in-page links remain above the content on desktop and
mobile. The original caption and back-to-top action remain in product content.
There is one main, skip link and footer; no cross-site menu is added to the appbar.

Homepage/404 content, project data, diagrams, DM Sans, source/service/email links
and deployment boundaries remain project-owned. Local Button/CVA variants retain
link composition; the shared package exports no public Button primitive. Replaced
local header/footer, controls/context/store and preference normalizers are removed.
`preferences-hooks.ts` only provides typed product copy.

## Server snapshot and hydration

The existing Worker validates the canonical/local URL before rendering and
overwrites the deployment marker. `lib/website-frontend.ts` consumes it only in a
built Worker through Vite's compile-time `import.meta.env.PROD`. Dev SSR ignores
incoming markers; forwarded host/protocol headers cannot select production sharing.
Previews and unapproved hosts still receive the original rejection.

The resolver uses consumer-owned `websitePreferencePolicy` and server-safe `resolveInitialPreferences`,
with Cookie and Accept-Language as UI inputs. `app/layout.tsx` reads framework request
headers and uses the same snapshot for root locale/mode/palette attributes, provider
props and localized metadata. Only validated preferences and policy reach the client.
Language negotiation follows quality/order; a valid policy cookie takes precedence.

`WebsiteFrontend` initializes an independent synchronous i18next instance in that
locale. Its memoized callback updates product copy and description/Open Graph/Twitter
descriptions. It owns no theme listener, root attributes or persistence writer.
Shared media-query CSS handles system colors before hydration. The Tailwind block
variant reads the same attributes; no legacy `.dark` bridge or prepaint script remains.

Application HTML/RSC stays `private, no-store`, varying by Cookie and Accept-Language
while preserving existing Vary values. Assets retain their caching. Canonical URLs,
images, title and icon contracts are preserved.

## Preference boundary and recovery

Version 1 contains exactly version, mode, palette and locale. Auth, accounts, drafts
and other business data never enter shared preferences. Production HTTPS uses
`ztd.frontend.v1`, Domain ztd.me, Path /, SameSite Lax and Secure. Sibling subdomains
can overwrite this untrusted UI cookie; it is never an authorization source.
Development uses a website namespace and host-only cookie. Preview policy is
host-only and ignores the production key, although this Worker still rejects previews.

The package validates enums, unknown fields, duplicate/oversized/malformed values
and future versions. Future values are ignored for rendering and not silently
rewritten. The target integration has no legacy storage mapping, migration or
cleanup. Existing storage entries and unrelated business fields are left untouched.
Denied reads/writes keep controls usable in memory. Valid-cookie read recovery or a
later successful write restores persistence.

Same-origin tabs receive explicitly configured localStorage mirror notifications; the mirror is write-only. Across
subdomains, pages re-read cookies on focus/visibility. Sharing is eventual with
last-write-wins values; local storage is neither an SSR nor an auth source.

## CSS and verification

The root imports compiled package CSS once. Product CSS maps semantic roles to
public `--ztd-*` tokens without overriding palettes. The website retains its own
destructive role and validates CVA variants. The CSS gate covers all seven product
files and actual shared/Tailwind declarations. Helper 0.1.1 accepts Tailwind's block
custom variant while keeping strict nesting and semantic checks elsewhere.

`pnpm check` keeps seven required native gates. Browser tests use the built Worker
and actual controls: SSR without JavaScript, hydration, modes/palettes/locales,
keyboard/escape/focus, Axe, denied storage/recovery, business-storage isolation and tab updates.
Controlled simulated HTTPS origins forward only to a second local Wrangler emulator
configured with the canonical origin. They test production-policy SSR/cookies and a
synthetic sibling page without contacting or mutating production or claiming complete
showcase integration. The ordinary local Worker tests development isolation and host
rejection. Both temporary local configs are removed before the final build guard.

Reports, scans, captures and intentional accessibility-failure evidence remain under
`.zt/artifacts` and are uploaded by CI. Exact-head CI and artifacts must pass before
review. The PR stays draft; only an owner merge allows the existing main-only automatic
deployment. Visual baselines, performance budgets and other browser engines remain
outside the current suite.
