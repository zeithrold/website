import { expect, test } from '@playwright/test'
import { assertAccessible, captureState } from '@ztd-me/frontend-checks/playwright'
import { buttonVariants } from '../../components/ui/button-variants'

for (const theme of ['light', 'dark']) {
  test(`destructive and invalid button tokens render in ${theme}`, { tag: '@a11y' }, async ({ page }, info) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: '切换到中文' })).toBeEnabled()
    if (theme === 'dark') {
      await page.getByRole('button', { name: 'Switch to dark theme' }).click()
      await expect(page.locator('html')).toHaveClass('dark')
    }
    // Supplemental component fixtures exercise unused variants without adding product controls.
    await page.evaluate(({ destructive, invalid }) => {
      const main = document.querySelector('main')
      const button = document.createElement('button')
      button.type = 'button'
      button.className = destructive
      button.textContent = 'Destructive variant fixture'
      main?.appendChild(button)
      const error = document.createElement('button')
      error.type = 'button'
      error.className = invalid
      error.textContent = 'Invalid variant fixture'
      error.setAttribute('aria-invalid', 'true')
      main?.appendChild(error)
    }, {
      destructive: buttonVariants({ variant: 'destructive' }),
      invalid: buttonVariants({ variant: 'outline' }),
    })
    const destructive = page.getByRole('button', { name: 'Destructive variant fixture' })
    await expect(destructive).toBeVisible()
    await expect(destructive).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    const invalid = page.getByRole('button', { name: 'Invalid variant fixture' })
    await invalid.focus()
    const colors = await invalid.evaluate((node) => {
      const sample = document.createElement('span')
      sample.style.color = getComputedStyle(node).getPropertyValue('--destructive')
      node.appendChild(sample)
      const expected = getComputedStyle(sample).color
      sample.remove()
      return expected
    })
    await expect(invalid).toHaveCSS('border-color', colors)
    await captureState(page, info, `button-variants-${theme}`)
    await assertAccessible(page, info, { label: `button-variants-${theme}` })
  })
}
