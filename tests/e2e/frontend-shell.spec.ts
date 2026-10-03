import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { PALETTES } from '../../components/ui/ztd-me/index.ts'
import { test } from './browser-fixtures'
import { assertAccessible } from './font-accessibility.mjs'
import { chooseLocale, chooseMode, choosePalette } from './frontend-helpers'

test('every palette and explicit mode works with project content', { tag: '@a11y' }, async ({ page }, info) => {
  await page.goto('/')
  for (const palette of PALETTES) {
    await choosePalette(page, palette)
    for (const mode of ['light', 'dark'] as const) {
      await chooseMode(page, mode)
      await assertAccessible(page, info, { label: `website-${palette}-${mode}` })
    }
  }
  await captureState(page, info, 'shared-graphite-dark')
})

test('menus and locale Select preserve keyboard focus and translated accessible names', { tag: '@a11y' }, async ({
  page,
}, info) => {
  await page.goto('/')
  for (const locale of ['en', 'zh-CN'] as const) {
    if (locale === 'zh-CN') {
      await chooseLocale(page, locale)
    }
    const appearance = page.getByRole('button', { name: locale === 'en' ? 'Appearance' : '外观', exact: true })
    await appearance.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitemradio', { name: locale === 'en' ? 'System' : '跟随系统' })).toBeFocused()
    await assertAccessible(page, info, { label: `appearance-open-${locale}` })
    await page.keyboard.press('Escape')
    await expect(appearance).toBeFocused()
    const language = page.getByRole('combobox', { name: locale === 'en' ? 'Language' : '语言' })
    await language.focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('option', { name: locale === 'en' ? 'English' : '简体中文' })).toBeFocused()
    await assertAccessible(page, info, { label: `language-open-${locale}` })
    await page.keyboard.press('Escape')
    await expect(language).toBeFocused()
  }
})

test('shared chrome and footer preserve the website links without cross-site navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveText('© ZeithroldGitHubhello@ztd.me')
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'GitHub repository' }))
    .toHaveAttribute('href', 'https://github.com/zeithrold/website')
  await expect(page.getByRole('banner').getByRole('navigation')).toHaveCount(0)
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(3)
  await page.setViewportSize({ width: 390, height: 844 })
  const navigation = await page.getByRole('navigation').boundingBox()
  const hero = await page.getByRole('heading', { level: 1 }).boundingBox()
  expect(navigation).not.toBeNull()
  expect(hero).not.toBeNull()
  expect(navigation?.y).toBeLessThan(hero?.y ?? 0)
  await page.getByRole('link', { name: 'Back to top', exact: true }).click()
  await expect(page).toHaveURL(/#top$/)
})
