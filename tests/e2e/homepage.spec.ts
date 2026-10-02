import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('WCAG AA checks in both languages and themes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: '切换到中文' })).toBeEnabled()
  for (const locale of ['en', 'zh-CN']) {
    if (locale === 'zh-CN') {
      await page.getByRole('button', { name: '切换到中文' }).click()
    }
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') {
        await page
          .getByRole('button', { name: locale === 'en' ? 'Switch to dark theme' : '切换到深色主题' })
          .click()
      }
      // Audit settled colors, including the button's hydration opacity transition.
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          document.getAnimations().map(async animation => await animation.finished.catch(() => {})),
        )
      })
      const results = await new AxeBuilder({ page }).withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21aa',
      ]).analyze()
      expect(
        results.violations.map(violation => ({
          id: violation.id,
          nodes: violation.nodes.map(node => node.target),
        })),
      ).toEqual([])
    }
    await page
      .getByRole('button', { name: locale === 'en' ? 'Switch to light theme' : '切换到浅色主题' })
      .click()
  }
})

test('desktop content, outbound links, metadata and local assets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const errors: string[] = []
  const externalRequests: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173')) {
      externalRequests.push(request.url())
    }
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas intouseful things.')
  await expect(page.getByRole('button', { name: '切换到中文' })).toBeEnabled()
  for (const href of [
    'https://github.com/zeithrold',
    'https://github.com/zeithrold/memory',
    'https://github.com/zeithrold/ledger',
    'https://github.com/zeithrold/ledger-app',
    'https://github.com/zeithrold/tools',
    'https://blog.ztd.me',
    'https://showcase.ztd.me',
    'mailto:hello@ztd.me',
  ]) {
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
  }
  await expect(page.getByText('Early development', { exact: true })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/ztd\.me\/?$/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://ztd.me/og.png')
  await page.evaluate(async () => await document.fonts.ready)
  expect(
    await page.evaluate(
      () => document.fonts.check('14px "Inter Variable"') && document.fonts.check('14px "DM Sans Variable"'),
    ),
  ).toBe(true)
  await page.screenshot({ path: 'artifacts/desktop-en-light.png', fullPage: true })
  expect(errors).toEqual([])
  expect(externalRequests).toEqual([])
})

test('language and theme persist after reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '切换到中文' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('让想法，变得有用。')
  await page.getByRole('button', { name: '切换到深色主题' }).click()
  await expect(page.locator('html')).toHaveClass('dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveClass('dark')
  await page.screenshot({ path: 'artifacts/desktop-zh-dark.png', fullPage: true })
})

for (const width of [
  320,
  390,
  768,
]) {
  test(`no clipping or horizontal overflow at ${width}px in both languages`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    for (const language of ['en', 'zh-CN']) {
      if (language === 'zh-CN') {
        await page.getByRole('button', { name: '切换到中文' }).click()
      }
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      const clipped = await page
        .locator('h1, h2, h3, .email-link, .project-links, .agent-nodes, .ledger-system')
        .evaluateAll(nodes =>
          nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent),
        )
      expect(clipped).toEqual([])
      if (width === 390) {
        await page.screenshot({ path: `artifacts/mobile-${language}.png`, fullPage: true })
      }
    }
  })
}

test('keyboard navigation, anchors and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await page.getByRole('link', { name: 'Explore the projects' }).click()
  await expect(page).toHaveURL(/#projects$/)
  await page.getByRole('link', { name: 'Contact', exact: true }).click()
  await expect(page).toHaveURL(/#contact$/)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  expect(
    await page
      .locator('.space-card')
      .first()
      .evaluate(node => getComputedStyle(node).transitionDuration),
  ).toBe('0s')
})

test('browser locale, system theme and unavailable storage', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'zh-CN', colorScheme: 'dark' })
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Unavailable', 'SecurityError')
      },
    })
  })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:4173/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveClass('dark')
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas intouseful things.')
  expect(errors).toEqual([])
  await context.close()
})

test('production Worker handles missing routes and static assets', async ({ page, request }) => {
  const response = await page.goto('/does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A page still to be made.')
  await page.getByRole('link', { name: 'Back to ztd.me', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas intouseful things.')
  for (const path of [
    '/favicon.svg',
    '/og.png',
    '/robots.txt',
    '/sitemap.xml',
  ]) {
    const asset = await request.get(path)
    expect(asset.status()).toBe(200)
    expect(asset.headers()['x-content-type-options']).toBe('nosniff')
  }
})

test('real Worker redirects before assets and refuses service hosts', async ({ request }) => {
  for (const host of [
    'doa.ink',
    'zeithrold.dev',
    'www.zeithrold.dev',
    'ztd.one',
  ]) {
    const response = await request.get('/favicon.svg?from=old%2Fhome', {
      headers: { Host: host },
      maxRedirects: 0,
    })
    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe('https://ztd.me/favicon.svg?from=old%2Fhome')
  }
  for (const host of [
    'blog.ztd.me',
    'showcase.ztd.me',
    'zeithrold.com',
    'zeithrold.cloud',
    'www.zeithrold.dev.evil.example',
    'evil.example',
  ]) {
    const response = await request.get('/', { headers: { Host: host }, maxRedirects: 0 })
    expect(response.status()).toBe(421)
    expect(response.headers().location).toBeUndefined()
  }
})

test('malformed stored preferences fall back and valid fields restore independently', async ({ browser }) => {
  for (const stored of [
    '{broken',
    JSON.stringify({ locale: 'en', theme: 'sepia' }),
  ]) {
    const context = await browser.newContext({ locale: 'zh-CN', colorScheme: 'dark' })
    await context.addInitScript((value) => {
      localStorage.setItem('ztd.home.v1', value)
    }, stored)
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:4173/')
    const locale = stored === '{broken' ? 'zh-CN' : 'en'
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.locator('html')).toHaveClass('dark')
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute(
      'content',
      locale === 'en' ? /Projects, experiments/ : /项目、实验与文字/,
    )
    await context.close()
  }
})
