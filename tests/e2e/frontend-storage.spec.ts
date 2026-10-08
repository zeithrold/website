import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { test } from './browser-fixtures'
import { chooseLocale, chooseMode, choosePalette } from './frontend-helpers'
import { recordedStorageAccess, recordStorageAccess } from './frontend-storage-audit'
import { websiteTestOrigin } from './test-origins.ts'

test('preference persistence only accesses its configured current-format storage key', async ({ page }) => {
  await recordStorageAccess(page)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Appearance', exact: true })).toBeEnabled()
  expect(await recordedStorageAccess(page)).toEqual([])
  await choosePalette(page, 'moss')
  await chooseMode(page, 'dark')
  await chooseLocale(page, 'zh-CN')
  const accesses = await recordedStorageAccess(page)
  expect(accesses).toEqual(expect.arrayContaining([
    { operation: 'write', key: 'ztd.frontend.development.website.v1' },
  ]))
  expect(accesses).toEqual(expect.arrayOf(expect.objectContaining({
    key: 'ztd.frontend.development.website.v1',
    operation: 'write',
  })))
})

for (const denied of [
  'cookie-read',
  'cookie-write',
  'local-storage-read',
  'both-read',
]) {
  test(`denied ${denied} keeps appearance and locale usable`, async ({ page }, info) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript((kind) => {
      if (kind === 'cookie-read' || kind === 'both-read') {
        Object.defineProperty(document, 'cookie', {
          configurable: true,
          get() { throw new DOMException('Denied cookie read', 'SecurityError') },
          set() {},
        })
      }
      if (kind === 'cookie-write') {
        Object.defineProperty(document, 'cookie', { configurable: true, get: () => '', set() {} })
      }
      if (kind === 'local-storage-read' || kind === 'both-read') {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() { throw new DOMException('Denied localStorage read', 'SecurityError') },
        })
      }
    }, denied)
    await page.goto('/')
    await choosePalette(page, 'ocean')
    await chooseMode(page, 'dark')
    await chooseLocale(page, 'zh-CN')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'ztd.frontend.development.website.v1' }))
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
    await chooseMode(page, 'system')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light')
    await chooseLocale(page, 'en')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas intouseful things.')
    await captureState(page, info, `recovery-${denied}`)
    expect(errors).toEqual([])
  })
}

test('denied cookie read preserves SSR preferences and ignores unrelated storage', async ({ page, context }) => {
  const stored = { version: 1, mode: 'dark', palette: 'plum', locale: 'zh-CN' }
  await context.addCookies([
    {
      name: 'ztd.frontend.development.website.v1',
      value: encodeURIComponent(JSON.stringify(stored)),
      url: websiteTestOrigin,
    },
  ])
  await page.addInitScript(() => {
    localStorage.setItem('website-test.business-record', JSON.stringify({ locale: 'en', draft: 'Retained draft' }))
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() { throw new DOMException('Denied', 'SecurityError') },
      set() {},
    })
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('button', { name: '外观', exact: true })).toBeEnabled()
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'plum')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
  await chooseLocale(page, 'en')
  expect(errors).toEqual([])
})

test('same-origin tabs observe real cookie and mirror updates', async ({ page, context }) => {
  await page.goto('/')
  const second = await context.newPage()
  await second.goto(`${websiteTestOrigin}/`)
  await expect(second.getByRole('button', { name: 'Appearance', exact: true })).toBeEnabled()
  await choosePalette(page, 'plum')
  await chooseMode(page, 'dark')
  await chooseLocale(page, 'zh-CN')
  await expect(second.locator('html')).toHaveAttribute('data-frontend-palette', 'plum')
  await expect(second.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
  await expect(second.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
  await second.close()
})

test('preference updates leave unrelated business storage unchanged', async ({ page, context }) => {
  const current = { version: 1, mode: 'light', palette: 'moss', locale: 'en' }
  const business = { locale: 'zh-CN', draft: 'Synthetic retained draft', account: 'Synthetic account' }
  await context.addCookies([
    {
      name: 'ztd.frontend.development.website.v1',
      value: encodeURIComponent(JSON.stringify(current)),
      url: websiteTestOrigin,
    },
  ])
  await page.addInitScript((value) => {
    localStorage.setItem('website-test.business-record', JSON.stringify(value))
  }, business)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Appearance', exact: true })).toBeEnabled()
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'moss')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'light')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas intouseful things.')
  await chooseLocale(page, 'zh-CN')
  expect(await page.evaluate(() => {
    const value: unknown = JSON.parse(localStorage.getItem('website-test.business-record') ?? 'null')
    return value
  })).toEqual(business)
  const stored = (await context.cookies()).find(cookie => cookie.name === 'ztd.frontend.development.website.v1')
  const decoded: unknown = JSON.parse(decodeURIComponent(stored?.value ?? '{}'))
  expect(decoded).toEqual({ version: 1, mode: 'light', palette: 'moss', locale: 'zh-CN' })
})

test('cookie read recovery restores the saved locale and appearance on focus', async ({ page, context }) => {
  const preferences = { version: 1, mode: 'light', palette: 'moss', locale: 'zh-CN' }
  await context.addCookies([
    {
      name: 'ztd.frontend.development.website.v1',
      value: encodeURIComponent(JSON.stringify(preferences)),
      url: websiteTestOrigin,
    },
  ])
  await page.addInitScript(() => {
    const original = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() {
        if (!document.documentElement.hasAttribute('data-test-storage-recovered')) {
          throw new DOMException('Denied', 'SecurityError')
        }
        const value: unknown = original?.get?.call(document)
        return typeof value === 'string' ? value : ''
      },
      set() {},
    })
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await chooseLocale(page, 'en')
  await choosePalette(page, 'ocean')
  await chooseMode(page, 'dark')
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-test-storage-recovered', '')
    window.dispatchEvent(new Event('focus'))
  })
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'moss')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'light')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
  expect(errors).toEqual([])
})
