# Source-owned frontend integration

The website installs editable `@ztd-me/ui` from public tools source
`7c708c0e0672a302cd751550276fb7a7a43cf1e5` through `shadcn@4.21.1`.
The dry run showed all 42 targets absent; the real public install matched every
item file before intentional local adaptations. `ui-source.lock.json` records
the public item SHA256, original file hashes and reviewed adaptation hashes.
`pnpm check:ui` rejects unrecorded changes and runtime dependency regression.

The source replaces `@ztd-me/frontend@0.2.0`. Actual required dependencies use
exact pins; every unrelated lock resolution is retained. The reviewed Radix
Select 2.3.7 patch changes declarations only, resolving its `onPlaced` conflict.
No JavaScript package patch or automatic source synchronization is installed.
MIT, shadcn MIT and all Noto OFL notices remain with the source.

The server-safe source module imports use explicit `.ts` extensions so native Node
unit tests can execute them without a runtime loader. The README example lives
in `docs/snippets/ui-example.tsx`, included in native lint and strict types. This
also avoids the published ESLint configuration's typed Markdown virtual-file
parser issue while preserving a checked, executable example.

Application/UI and Worker programs check declarations with `skipLibCheck:false`,
strict and unchecked indexed access enabled. Cloudflare Workers globals use their
own program; browser types load only Vite import-meta declarations, since vinext
already declares CSS/image modules. The separate build-tool program preserves
the previous `skipLibCheck:true`: Cloudflare Vite/Wrangler declarations refer to
unpublished development-only modules. Its source remains strictly type checked
and receives the full typed ESLint rules. No rule or threshold is reduced.

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

Verification covers all seven native gates, 41 unit tests and the expanded Chromium suite,
full Axe scans and retained accessibility-failure evidence. Registry adoption uses
a frozen real registry lock. Exact-head CI and its actual uploaded evidence must
pass before review. The integration PR stays draft; only an owner merge can trigger
the existing main-only deployment.

## Ownership and composition

The installed source owns one `FrontendProvider`, `PublicShell`, appbar, footer, Radix
Appearance menu and locale Select. Neutral grayscale/system mode is the default.
Terracotta, moss, ocean, plum and graphite are additional palettes; all six support
light and dark. UI locales remain English and Simplified Chinese.

`SiteShell` supplies the original `BrandMark`, `zeithrold.` label, `/` home link,
`main` landmark ID and `https://github.com/zeithrold/website` repository. The shared
footer contains exactly © Zeithrold, the repository GitHub link and hello@ztd.me,
without a year. The three in-page links remain above the content on desktop and
mobile. The original caption and back-to-top action remain in product content.
There is one main, skip link and footer; no cross-site menu is added to the appbar.

Homepage/404 content, project data, diagrams, source/service/email links
and deployment boundaries remain project-owned. Local Button/CVA variants retain
link composition; the installed UI exports no public Button primitive. Replaced
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

The root imports installed source CSS once. Product CSS maps semantic roles to
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
