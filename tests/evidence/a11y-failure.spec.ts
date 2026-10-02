import { test } from '@playwright/test'
import { assertAccessible } from '@ztd-me/frontend-checks/playwright'

test('intentional missing button name retains accessibility failure evidence', async ({ page }, info) => {
  await page.setContent('<html lang="en"><head><title>Evidence probe</title></head>'
    + '<body><main><h1>Evidence probe</h1><button type="button"></button></main></body></html>')
  await assertAccessible(page, info, { label: 'retention-probe' })
})
