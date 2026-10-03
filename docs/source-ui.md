# Reviewed UI source delivery

The accepted public registry source is
[`7c708c0e0672a302cd751550276fb7a7a43cf1e5`](https://github.com/zeithrold/tools/tree/7c708c0e0672a302cd751550276fb7a7a43cf1e5).
Its generated item SHA256 is
`fd862845249d052d761a8661e8ec60683f42e0691f69d8afbeff88caf158995d`.
The actual `shadcn@4.21.1` dry run and public install copied 42 previously absent files;
all bytes matched the public item. Source identity is `@ztd-me/ui`, independent of npm.

`components.json` pins the full source SHA. `ui-source.lock.json` preserves original
installed hashes and reviewed local adaptations. `pnpm check:ui` checks those files
and the declaration-only patch. Keep the source lock, dependency pins and native
pnpm lock in the same review. Licenses and notices are part of the source lock.

For a proposed update, run the pinned CLI dry run in a temporary checkout. Compare
incoming source with the accepted hashes, review local adaptations, then merge
deliberately. Do not rerun `add --overwrite` blindly or synchronize these files as
managed Skills. Normal checks require no registry network access or source updater.

## Fonts and icons

The UI uses Noto Sans for Latin, Simplified Chinese, Japanese and Korean. Weight
400/500/600/700 requests match used weights; `font-synthesis:none` prevents faux
weights. Language rules select Japanese/Korean Noto variants. Noto Color Emoji
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
