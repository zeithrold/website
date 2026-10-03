import { expect } from '@playwright/test'
import { installLocalFontPreview, test } from './browser-fixtures.ts'
import { assertAccessible } from './font-accessibility.mjs'
import { watchErrors } from './font-specimen.mjs'

const appbar = page => page.locator('.ztd-appbar')

async function settleOverlay(page) {
  await page.locator('.ztd-menu').evaluateAll(async nodes => Promise.all(nodes.flatMap(node =>
    node.getAnimations().map(animation => animation.finished.catch(() => undefined)),
  )))
}

test('compact chrome preserves hit areas, focus and narrow layout', async ({ context, page }, info) => {
  await context.addCookies([
    {
      name: 'ztd.frontend.development.website.v1',
      value: encodeURIComponent(JSON.stringify({ version: 1, mode: 'light', palette: 'ocean', locale: 'zh-CN' })),
      url: 'http://127.0.0.1:4173',
    },
  ])
  await page.goto('/')
  for (const width of [
    320,
    390,
    768,
    1500,
    1920,
  ]) {
    await page.setViewportSize({ width, height: 860 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    const controls = await appbar(page).locator('.ztd-control').evaluateAll(nodes => nodes.map((node) => {
      const bounds = node.getBoundingClientRect()
      const style = getComputedStyle(node)
      return { width: bounds.width, height: bounds.height, fontSize: style.fontSize, border: style.borderColor }
    }))
    for (const control of controls) {
      expect(control.width).toBeGreaterThanOrEqual(44)
      expect(control.height).toBeGreaterThanOrEqual(44)
      expect(control.fontSize).toBe('13px')
      expect(control.border).toBe('rgba(0, 0, 0, 0)')
    }
  }
  await page.setViewportSize({ width: 320, height: 844 })
  const brandLabel = appbar(page).locator('.ztd-brand > span').last()
  await brandLabel.evaluate(node => node.textContent = 'Long consumer-owned studio name')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  const trigger = appbar(page).getByRole('button', { name: '外观', exact: true })
  await trigger.press('Enter')
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  expect(await trigger.evaluate(node => getComputedStyle(node).outlineWidth)).toBe('2px')
  await assertAccessible(page, info)
})

async function verifyMotion(page, trigger, role) {
  await page.evaluate(() => {
    window.recordedUiMotion = []
    document.addEventListener('animationstart', (event) => {
      const node = event.target
      if (node instanceof HTMLElement && node.classList.contains('ztd-menu')) {
        window.recordedUiMotion.push({
          name: event.animationName,
          state: node.dataset.state,
          connected: node.isConnected,
          duration: getComputedStyle(node).animationDuration,
          frames: node.getAnimations()[0]?.effect.getKeyframes(),
        })
      }
    })
  })
  await trigger.press('Enter')
  const content = page.getByRole(role)
  await expect(content).toHaveAttribute('data-state', 'open')
  const motion = await content.evaluate(node => ({
    name: getComputedStyle(node).animationName,
    origin: getComputedStyle(node).transformOrigin,
    side: node.getAttribute('data-side'),
  }))
  expect(motion.name).toBe('ztd-menu-enter')
  expect(motion.origin).toMatch(/px/u)
  expect(motion.side).toBe('bottom')
  await settleOverlay(page)
  await page.keyboard.press('Escape')
  await content.waitFor({ state: 'detached' })
  const events = await page.evaluate(() => window.recordedUiMotion)
  const entry = events.find(event => event.name === 'ztd-menu-enter')
  const exit = events.find(event => event.name === 'ztd-menu-exit')
  expect(entry).toMatchObject({ state: 'open', connected: true, duration: '0.15s' })
  expect(entry.frames[0].opacity).toBe('0')
  expect(entry.frames[0].transform).toContain('0.95')
  expect(exit).toMatchObject({ state: 'closed', connected: true, duration: '0.1s' })
  await expect(trigger).toBeFocused()
  await expect(page.locator('[inert]')).toHaveCount(0)
  return { role, events }
}

test('DropdownMenu and Select animate entry and suspended exit with focus restoration', async ({ page }, info) => {
  const errors = watchErrors(page)
  await page.goto('/')
  const menu = await verifyMotion(page, appbar(page).getByRole('button', { name: 'Appearance' }), 'menu')
  const select = await verifyMotion(page, appbar(page).getByRole('combobox', { name: 'Language' }), 'listbox')
  await info.attach('actual-menu-motion', { body: JSON.stringify({ menu, select }), contentType: 'application/json' })
  await assertAccessible(page, info)
  expect(errors).toEqual([])
})

test('reduced motion keeps keyboard selection and immediate dismissal usable', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const trigger = appbar(page).getByRole('button', { name: 'Appearance' })
  await trigger.press('Enter')
  await expect(page.getByRole('menuitemradio', { name: 'System', exact: true })).toBeFocused()
  expect(await page.getByRole('menu').evaluate(node => getComputedStyle(node).animationName)).toBe('none')
  await page.keyboard.press('End')
  await expect(page.getByRole('menuitemradio', { name: 'Graphite', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'graphite')
  await expect(trigger).toBeFocused()
  const locale = appbar(page).getByRole('combobox', { name: 'Language' })
  await locale.press('Enter')
  await expect(page.getByRole('option', { name: 'English', exact: true })).toBeFocused()
  expect(await page.getByRole('listbox').evaluate(node => node.getAnimations().length)).toBe(0)
  await page.keyboard.press('End')
  await expect(page.getByRole('option', { name: '简体中文', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(appbar(page).getByRole('combobox', { name: '语言' })).toBeFocused()
  await expect(page.locator('[inert]')).toHaveCount(0)
  await assertAccessible(page, info)
})

test('coarse pointer menus retain 44px choices', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  const page = await context.newPage()
  await installLocalFontPreview(page)
  try {
    await page.goto('/')
    await appbar(page).getByRole('button', { name: 'Appearance' }).tap()
    await expect(page.getByRole('menu')).toBeVisible()
    await settleOverlay(page)
    const heights = await page.locator('.ztd-menu-item').evaluateAll(nodes =>
      nodes.map(node => node.getBoundingClientRect().height),
    )
    expect(heights.every(height => height >= 44)).toBe(true)
    await assertAccessible(page, info)
  }
  finally {
    await context.close()
  }
})
