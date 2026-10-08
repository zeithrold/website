import { expect } from '@playwright/test'
import { localFontPreview, test } from './browser-fixtures.ts'
import { addFontSpecimen, fontSession, renderedFonts, watchErrors } from './font-specimen.mjs'
import { transferProfile } from './font-transfer-profile.mjs'
import { websiteTestOrigin } from './test-origins.ts'

const scenarios = [
  { scenario: 'ordinary-english-homepage', locale: 'en', coldCap: 500_000 },
  { scenario: 'ordinary-chinese-homepage', locale: 'zh-CN', coldCap: 1_000_000 },
  { scenario: 'full-multilingual-emoji-specimen', locale: 'en' },
]

function summarize(resources) {
  const byFamily = {}
  for (const resource of resources) {
    const family = [
      ...new Set(resource.faces.map(face => face.family)),
    ].join(', ') || resource.kind
    const row = byFamily[family] ?? { requests: 0, cached: 0, httpResponseBytes: 0, httpDecodedBodyBytes: 0 }
    row.requests++
    row.cached += Number(resource.cached)
    row.httpResponseBytes += resource.httpResponseBytes
    row.httpDecodedBodyBytes += resource.httpDecodedBodyBytes ?? 0
    byFamily[family] = row
  }
  return byFamily
}

async function recordPhase(page, info, scenario, { phase, resources, headers }) {
  expect(resources.every(resource => resource.status === 200 || resource.status === 304)).toBe(true)
  const fonts = resources.filter(resource => resource.kind === 'font')
  expect(fonts.length).toBeGreaterThan(0)
  expect(fonts.length).toBeLessThan(80)
  expect(fonts.every(resource => resource.faces.length)).toBe(true)
  expect(resources.some(resource => resource.kind === 'font-css')).toBe(true)
  const httpResponseBytes = resources.reduce((total, resource) => total + resource.httpResponseBytes, 0)
  const phaseCap = phase === 'cold' ? scenario.coldCap : 10_000
  const cap = scenario.coldCap === undefined ? undefined : phaseCap
  const session = await fontSession(page)
  const glyphs = await renderedFonts(session, 'h1')
  expect(glyphs.every(font => font.isCustomFont && font.familyName.startsWith('Noto Sans'))).toBe(true)
  const profile = {
    scenario: scenario.scenario,
    phase,
    localFontPreview,
    actualGoogleFontsBrowserLoad: !localFontPreview,
    httpResponseBytes,
    budgetBytes: cap ?? null,
    remoteBudgetEnforced: !localFontPreview && cap !== undefined,
    headers,
    metaCsp: await page.evaluate(() => (
      document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') ?? null
    )),
    policyViolations: await page.evaluate(() => window.fontPolicyViolations),
    byFamily: summarize(resources),
    glyphs,
    resources,
  }
  await info.attach(`${scenario.scenario}-${phase}-font-profile`, {
    body: JSON.stringify(profile),
    contentType: 'application/json',
  })
  if (!localFontPreview && cap !== undefined) {
    expect(httpResponseBytes).toBeLessThanOrEqual(cap)
  }
}

async function runScenario(browser, info, scenario) {
  const context = await browser.newContext({ locale: scenario.locale })
  try {
    await context.addCookies([
      {
        name: 'ztd.frontend.development.website.v1',
        value: encodeURIComponent(JSON.stringify({
          version: 1,
          mode: 'light',
          palette: 'neutral',
          locale: scenario.locale,
        })),
        url: websiteTestOrigin,
      },
    ])
    const page = await context.newPage()
    const { installLocalFontPreview } = await import('./browser-fixtures.ts')
    await installLocalFontPreview(page)
    const errors = watchErrors(page)
    await page.addInitScript(() => {
      window.fontPolicyViolations = []
      document.addEventListener('securitypolicyviolation', (event) => {
        window.fontPolicyViolations.push({ directive: event.violatedDirective, uri: event.blockedURI })
      })
    })
    const sample = await transferProfile(page)
    for (const phase of ['cold', 'warm']) {
      let headers
      const resources = await sample(phase, async () => {
        const response = await (phase === 'cold' ? page.goto(`${websiteTestOrigin}/`) : page.reload())
        headers = response.headers()
        if (scenario.coldCap === undefined) {
          await addFontSpecimen(page)
        }
      })
      await recordPhase(page, info, scenario, { phase, resources, headers })
      expect(await page.evaluate(() => window.fontPolicyViolations)).toEqual([])
      expect(errors).toEqual([])
    }
  }
  finally {
    await context.close()
  }
}

test('ordinary cold and warm Google Fonts budgets and complete specimen transfers', async ({ browser }, info) => {
  for (const scenario of scenarios) {
    await runScenario(browser, info, scenario)
  }
})
