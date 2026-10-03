import type { Page } from '@playwright/test'
import type { Locale, Mode, Palette } from '../../components/ui/ztd-me/index.ts'
import { expect } from '@playwright/test'

const modeLabels = {
  'en': { light: 'Light', dark: 'Dark', system: 'System' },
  'zh-CN': { light: '浅色', dark: '深色', system: '跟随系统' },
}
const paletteLabels = {
  'en': {
    neutral: 'Neutral',
    terracotta: 'Terracotta',
    moss: 'Moss',
    ocean: 'Ocean',
    plum: 'Plum',
    graphite: 'Graphite',
  },
  'zh-CN': { neutral: '中性', terracotta: '暖陶', moss: '苔绿', ocean: '海蓝', plum: '莓紫', graphite: '石墨' },
}

export async function currentLocale(page: Page): Promise<Locale> {
  return await page.locator('html').getAttribute('lang') === 'zh-CN' ? 'zh-CN' : 'en'
}

export async function chooseMode(page: Page, mode: Mode): Promise<void> {
  const locale = await currentLocale(page)
  await page.getByRole('button', { name: locale === 'en' ? 'Appearance' : '外观', exact: true }).click()
  await page.getByRole('menuitemradio', { name: modeLabels[locale][mode], exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', mode)
  await expect(page.locator('.ztd-overlay')).toHaveCount(0)
}

export async function choosePalette(page: Page, palette: Palette): Promise<void> {
  const locale = await currentLocale(page)
  await page.getByRole('button', { name: locale === 'en' ? 'Appearance' : '外观', exact: true }).click()
  await page.getByRole('menuitemradio', { name: paletteLabels[locale][palette], exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', palette)
  await expect(page.locator('.ztd-overlay')).toHaveCount(0)
}

export async function chooseLocale(page: Page, locale: Locale): Promise<void> {
  const current = await currentLocale(page)
  await page.getByRole('combobox', { name: current === 'en' ? 'Language' : '语言' }).click()
  await page.getByRole('option', { name: locale === 'en' ? 'English' : '简体中文', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
  await expect(page.locator('.ztd-overlay')).toHaveCount(0)
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
    'content',
    locale === 'en' ? /Projects, experiments/ : /项目、实验与文字/,
  )
}
