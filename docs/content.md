# Public content evidence

Reviewed 2026-10-01. These are editable examples selected for a balanced personal
index, not user-confirmed priorities. Descriptions summarize public project
READMEs; there is no runtime GitHub API feed, activity badge, private data, or
claim that a repository is a publicly usable hosted service.

| Entry | Public evidence | What the homepage says |
| --- | --- | --- |
| Shared Memory | [README](https://github.com/zeithrold/memory#readme) describes a private memory library shared across AI agents, HTTP/MCP contracts, and vinext/Cloudflare | Private memory library with HTTP and MCP, linked to source only |
| Ledger + Ledger App | [API README](https://github.com/zeithrold/ledger#readme) and [client README](https://github.com/zeithrold/ledger-app#readme) describe exact multi-currency accounting and a Flutter client | One project card with separate API/client source links; schematic currency codes with no personal balances |
| Tools | [README](https://github.com/zeithrold/tools#readme) explicitly implements inspect, plan, sync and calls check/run/doctor unimplemented | Early development; inspect/plan/Skill sync only |
| Showcase | [README and source at 3466f3a](https://github.com/zeithrold/showcase/tree/3466f3a6afa363fcd7fb5cdbd6d6e91fac844cc1) describes an interface/tool collection at showcase.ztd.me | A service card linking to the collection; no copied clock layout |
| Blog | User supplied `blog.ztd.me`; public HTTPS endpoint responded 200 on review | Writing/notes service card; no invented post titles or publishing cadence |
| Contact | User supplied `hello@ztd.me` | `mailto:hello@ztd.me`, without asserting delivery was verified |

Public source HEADs at review: Memory `4095080432d2fc995e9e61ec5319bfb087435a9a`,
Ledger `8ecd7d1910b5e5f7e6f0d4967d3ce5f0c11631ad`, Ledger App
`e600fcd92c9d2ecfe8a578c56381ff973b3d4b7d`, Tools
`9a4c16b95d14ad91a88e274220eb55f35a20fd06`. Selection copy is based on those
public snapshots; it does not imply ongoing priority.

Workbench was considered from its public README but left out to keep the index
focused. Nothing about a repository's existence or recent commit date is used to
claim that it is a current priority, released product, or production service.

The identity is limited to the public handle **Zeithrold**. No occupation,
location, employer, availability-for-hire statement, private career material,
personal finances, or email migration details are included.

Edit `lib/projects.ts` to change selection/order/links; edit both typed dictionaries
in `lib/copy.ts` for paired descriptions. Dates and delivery status do not update
automatically. Review claims against each README when changing copy.

## Visual contract

The shared frontend package supplies Inter, the appbar/footer and six palettes;
neutral/system is the default. Local DM Sans, the connected-ideas illustration,
project architecture sketches, rounded content surfaces and editorial hierarchy
remain website-owned. Product color roles map to the package's semantic tokens.
See [shared frontend integration](unified-frontend-migration.md) for ownership,
SSR, cookie/locale sharing, legacy migration and storage recovery.

English/Simplified Chinese copy remains paired and typed. Appearance and UI locale
may share across production ztd.me subdomains; auth and business data do not. CSS
respects reduced motion, outbound links remain ordinary same-tab links, and contact
is an email link without a form or addon.
