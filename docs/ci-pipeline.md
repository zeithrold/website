# Shared pipeline structure

Website is the comparison lead for the owner's website/showcase/Memory consistency
request. This is the consumer contract proposed for the generic tools standard;
repository scripts remain responsible for business tests and deployment policies.

The reviewed main snapshots are website `10e83157d4564b762f0d2386a8c105d59f97da19`,
showcase `e16153462461a4cb0b3786f9d8ce19267c2fde0b`, and Memory
`7556a7546a42b2bee8ffdf14bfa1629c122bb891`. Website's source UI merge passed its
main Verify/Deploy run and the five-domain ownership check. The comparison found
different job layouts, setup ordering, action/Go pins, provenance capture, outer
evidence steps, failure diagnostics and artifact naming/retention.

## Generic verification sequence

Workflow name: `CI & Deploy`. Job names: `Verify` and `Deploy`. Generic Verify steps:

1. Checkout the workflow commit
2. Setup pnpm
3. Setup Node.js
4. Install dependencies
5. Setup Go for verification
6. Install reviewed zt CLI
7. Record verification provenance
8. Install Chromium
9. Verify frontend and production Worker
10. Show failed native checks
11. Upload verified build
12. Upload frontend verification evidence

Checkout uses the workflow SHA with persisted credentials disabled. Setup retains
the repository's pnpm version and frozen lock, Node 24, immutable action references,
Go 1.27.1 and reviewed zt source `3f9a3a7d33befc5a954ba1e86d3aa6d72e2c762f`.
Provenance records the exact checkout, lock SHA256, Node/pnpm versions, CLI version
and compiler/module information in `.zt/artifacts/`.

`pnpm check` runs the explicit `zt.json` frontend profile. Native lint, CSS, types,
unit, build, browser/Axe/font and deliberate failure-evidence gates remain required.
Repositories may keep dedicated accessibility or business suites; shared steps do
not rerun or replace them. Required failure stops later gates, which remain
`not_run`. The diagnostic step only prints existing failed/blocked native logs.
Evidence retention belongs in the final required native integration gate rather
than an unrelated workflow step. Failure diagnostics never turn a failed gate green.

The verified Worker artifact is `worker-${github.sha}`; frontend evidence is
`frontend-${github.run_id}-${github.run_attempt}`, uploaded even on failure.
The normal website/showcase retention is seven days. Evidence includes all logs,
reports, glyph/weight/font transfer profiles, scans, captures and failure traces.
Required artifact absence remains an error. Actual Google Fonts checks and exact
English/Chinese cold and warm budgets remain inside the native browser gates.

## Deployment and project hooks

Deploy requires successful verification and an ordinary push to this repository's
main branch. There is no manual trigger, enabling switch or confirmation parameter.
The common order is checkout, pnpm/Node setup, frozen dependencies, preparation of
the production artifact, deployment-boundary checks, deployment, and Cloudflare
control-plane verification. Common website/showcase artifact-step names are:

- Download the tested Worker
- Verify deployment boundaries
- Deploy the tested Worker
- Verify Cloudflare deployment state

Preserve project commands and their credential scopes. Website retains its separate
main/source/account and domain-owner guards before deployment. Its final step,
`Verify production domain owners after deployment`, repeats the GET-only five-domain
check through `api.cloudflare.com`; it does not fetch the public sites. Its existing
production environment, secrets, permissions, concurrency and immutable build
artifact stay unchanged.

GitHub Actions must not run public production-site HTTP, page or asset acceptance
probes against the Cloudflare-protected domains. The owner confirmed a managed
challenge for Showcase's `GET /` at `2026-10-03T10:59:20Z`: edge HTTP 403, origin
status 0, Ray `a44b6fd76bcd7e51`. Such a response does not establish application
failure. Retain existing Cloudflare control-plane deployed-version and traffic
checks. Native local/CI browser, accessibility, preference, Google Fonts and
failure-evidence gates remain required. This policy does not change WAF settings,
credentials or actual deployment.

Memory may keep its broader branch coverage, versioned Chromium cache and 14-day
evidence retention. Authentication, session, HTTP/MCP/API and two distinct browser
builds remain native project gates. Its production preparation uses its existing
auth/Sentry settings and bundle/deployment checks; browser fixture builds must never
be promoted as production artifacts. Keep secrets confined to existing authorized
production steps. The generic tools standard should define this structure and
extension points, without embedding domains, account IDs, auth/Sentry configuration
or production-resource logic.
