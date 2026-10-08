# Reviewed UI source delivery

The accepted public registry source is
[`9abea5a57b97f63109fb7dc5255543b53629c3ba`](https://github.com/zeithrold/tools/tree/9abea5a57b97f63109fb7dc5255543b53629c3ba).
Its generated item SHA256 is
`0ea6c065dc4da6608fb8b2beb817b8607c03ad694f40af1a49160971c804ddd4`.
The Tools public-source CI performed the actual `shadcn@4.21.1` dry run and fresh
77-file public install. This consumer's installed bytes match that verified graph,
with 16 explicit TypeScript import adaptations recorded for native Node tests.
Source identity is `@ztd-me/ui`, independent of npm. The durable receipt and guard
are described in [the consumer foundation contract](consumer-foundation.md).

For an update, compare a new verified full public source and preserve reviewed
adaptations. Do not rerun `add --overwrite` blindly. Normal checks require no
registry network or source updater; licenses and notices are part of the inventory.

## Fonts and icons

The UI uses Noto Sans for Latin, Simplified Chinese, Japanese and Korean. Weight
400/500/600/700 use the API's variable `400..700` range; `font-synthesis:none` prevents faux
weights. This preserves all required weights while removing repeated API CSS
face rules. [Google documents axis ranges](https://developers.google.com/fonts/docs/css2#axis_ranges).
Language rules select Japanese/Korean Noto variants. Noto Color Emoji
renders intentional emoji and complex sequences. The website does not need a serif
role, so it loads no unused serif family. Action/status/navigation symbols use Lucide;
the decorative hero plus and accounting equality mark now use its SVGs. Meaningful
prose, mathematical content and the local brand mark remain consumer-owned.

CSS loads directly from `https://fonts.googleapis.com`; font files load from
`https://fonts.gstatic.com`. These third parties receive browser network metadata,
and their CSS/font responses can change independently of this source SHA. No font
binaries, Fontsource dependency or production proxy/fallback is added. Preserve all
Noto OFL notices. Remote outage can use the ordinary final CSS fallback family.

The Worker currently sets no CSP header or meta directive. Its existing nosniff,
referrer, frame and permissions headers remain unchanged. If a future CSP is added,
review the two exact font origins with the owner before changing allowed sources.

## Verification and limits

Ordinary real homepage cold loads enforce combined API CSS plus font responses of
at most 500000 bytes in English and 1000000 bytes in Chinese. Both warm reloads
enforce 10000 bytes. CDP records actual encoded HTTP bytes, decoded response bodies,
cache state, request counts and families. The full multilingual/emoji specimen has
no ordinary byte cap, but fewer than 80 font requests, glyph, real-weight, complete
emoji sequence, mixed-text, CSP/error and full-page Axe checks remain required.

Cloud Chromium cannot validate Google's certificate chain in this environment.
`ZTD_LOCAL_FONT_PREVIEW=1` is an isolated test-only route that downloads actual HTTPS
responses with curl's normal certificate validation. It verifies layout and glyphs,
records its preview status, and cannot validate remote transfer budgets. It changes
no source CSS, application code or security settings. GitHub Actions refuses preview
mode and runs direct Google browser requests with every budget enabled. No TLS
validation bypass is supported. Final acceptance requires those exact-head CI gates.

Axe's temporary analysis document reuses passively captured completed API CSS when
its CSSOM reader requests it. This analysis-only adapter is restored after each scan;
it supplies no application font response, modifies no installed runtime and relaxes
no CSP. Full scans, captures and browser evidence remain CI artifacts rather than
tracked review files.
