import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { installLocalFontPreview, test } from './browser-fixtures'

const cookieName = 'ztd.frontend.development.website.v1'

test('SSR negotiates locale and renders system dark without JavaScript', async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, locale: 'zh-CN', colorScheme: 'dark' })
  const page = await context.newPage()
  await installLocalFontPreview(page)
  const response = await page.goto('http://127.0.0.1:4173/')
  expect(response?.headers()['cache-control']).toBe('private, no-store')
  expect(response?.headers().vary).toContain('Accept-Language')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'system')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'neutral')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /项目、实验与文字/)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /项目、实验与文字/)
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /项目、实验与文字/)
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(23, 23, 23)')
  await captureState(page, info, 'ssr-zh-neutral-system-dark')
  await context.close()
})

test('cookie snapshot agrees before and after hydration and overrides Accept-Language', async ({ browser }) => {
  const stored = { version: 1, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }
  const cookie = { name: cookieName, value: encodeURIComponent(JSON.stringify(stored)), url: 'http://127.0.0.1:4173' }
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled, locale: 'en-US', colorScheme: 'light' })
    await context.addCookies([cookie])
    const page = await context.newPage()
    await installLocalFontPreview(page)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text())
      }
    })
    await page.goto('http://127.0.0.1:4173/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(25, 33, 38)')
    if (javaScriptEnabled) {
      await page.getByRole('button', { name: '外观', exact: true }).click()
      await expect(page.getByRole('menuitemradio', { name: '深色', exact: true })).toHaveAttribute('aria-checked', 'true')
      await page.keyboard.press('Escape')
    }
    expect(errors).toEqual([])
    await context.close()
  }
})

for (const value of [
  '{broken',
  JSON.stringify({ version: 2, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }),
  JSON.stringify({ version: 1, mode: 'unknown', palette: 'unknown', locale: 'en', auth: 'discarded' }),
]) {
  test(`invalid or future cookie has deterministic SSR defaults: ${value}`, async ({ page, context }) => {
    await context.addCookies([
      { name: cookieName, value: encodeURIComponent(value), url: 'http://127.0.0.1:4173' },
    ])
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Appearance', exact: true })).toBeEnabled()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'neutral')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'system')
    const after = (await context.cookies()).find(cookie => cookie.name === cookieName)
    expect(after?.value).toBe(encodeURIComponent(value))
  })
}
