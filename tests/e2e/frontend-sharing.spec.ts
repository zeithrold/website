import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { preferenceCookie } from '../../components/ui/ztd-me/index.ts'
import { test } from './browser-fixtures'
import { assertAccessible } from './font-accessibility.mjs'
import { chooseLocale, chooseMode, choosePalette } from './frontend-helpers'
import { websiteCanonicalTestOrigin, websiteTestOrigin } from './test-origins.ts'

/** The second local emulator presents a canonical HTTPS URL to the built Worker. */
async function interceptWebsite(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    const origin = new URL(route.request().url()).origin
    if (origin === 'https://fonts.googleapis.com' || origin === 'https://fonts.gstatic.com') {
      await route.continue()
    }
    else {
      await route.abort()
    }
  })
  await page.route('https://ztd.me/**', async (route) => {
    const original = route.request()
    const url = new URL(original.url())
    const response = await page.request.fetch(`${websiteCanonicalTestOrigin}${url.pathname}${url.search}`, {
      method: original.method(),
      headers: await original.allHeaders(),
      data: original.postDataBuffer() ?? undefined,
      maxRedirects: 0,
    })
    if (response.status() >= 300 && response.status() < 400) {
      throw new Error('Local simulated HTTPS requests must not redirect to a real origin')
    }
    await route.fulfill({ response })
  })
}

test('production UI cookie shares with a synthetic sibling and refreshes on focus', async ({ page, context }, info) => {
  await interceptWebsite(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('https://ztd.me/')
  await choosePalette(page, 'ocean')
  await chooseMode(page, 'dark')
  await chooseLocale(page, 'zh-CN')
  const saved = (await context.cookies()).find(cookie => cookie.name === 'ztd.frontend.v1')
  expect(saved?.domain).toBe('.ztd.me')
  expect(saved?.secure).toBe(true)
  expect(saved?.sameSite).toBe('Lax')
  expect(JSON.parse(decodeURIComponent(saved?.value ?? 'null'))).toEqual({
    version: 1,
    mode: 'dark',
    palette: 'ocean',
    locale: 'zh-CN',
  })
  const sibling = await context.newPage()
  await assertAccessible(page, info, { label: 'canonical-zh-ocean-dark' })
  await captureState(page, info, 'canonical-zh-ocean-dark')
  await sibling.route('https://showcase.ztd.me/**', async route => await route.fulfill({
    contentType: 'text/html',
    body: '<title>Synthetic UI peer</title><h1>Synthetic UI peer</h1>',
  }))
  await sibling.goto('https://showcase.ztd.me/')
  expect(await sibling.evaluate(() => document.cookie)).toContain('ztd.frontend.v1=')
  const replacement = preferenceCookie({ version: 1, mode: 'light', palette: 'moss', locale: 'en' }, {
    name: 'ztd.frontend.v1',
    domain: 'ztd.me',
    secure: true,
  })
  await sibling.evaluate((cookie) => {
    document.cookie = cookie
  }, replacement)
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'moss')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'light')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas intouseful things.')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'moss')
  expect(errors).toEqual([])
})

test('canonical SSR honors the shared cookie over development preferences', async ({ page, context }) => {
  await interceptWebsite(page)
  await context.addCookies([
    {
      name: 'ztd.frontend.v1',
      domain: '.ztd.me',
      path: '/',
      secure: true,
      value: encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'plum', locale: 'zh-CN' })),
    },
    {
      name: 'ztd.frontend.development.website.v1',
      domain: 'ztd.me',
      path: '/',
      secure: true,
      value: encodeURIComponent(JSON.stringify({ version: 1, mode: 'light', palette: 'moss', locale: 'en' })),
    },
  ])
  const response = await page.goto('https://ztd.me/')
  expect(response?.headers()['cache-control']).toBe('private, no-store')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'plum')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /项目、实验与文字/)
})

test('local runtime stays isolated despite production UI cookies and forged deployment headers', async ({
  page,
  context,
}) => {
  const value = encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'plum', locale: 'zh-CN' }))
  await context.addCookies([
    { name: 'ztd.frontend.v1', value, url: websiteTestOrigin },
  ])
  await page.setExtraHTTPHeaders({ 'x-ztd-frontend-deployment': 'production', 'x-forwarded-host': 'ztd.me' })
  await page.goto(`${websiteTestOrigin}/`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'neutral')
  await choosePalette(page, 'moss')
  const cookies = await context.cookies()
  const isolated = cookies.find(cookie => cookie.name === 'ztd.frontend.development.website.v1')
  expect(isolated?.domain).toBe('127.0.0.1')
  expect(isolated?.secure).toBe(false)
  expect(cookies.find(cookie => cookie.name === 'ztd.frontend.v1')?.value).toBe(value)
})
