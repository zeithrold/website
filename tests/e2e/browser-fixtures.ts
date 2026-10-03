import type { Page } from '@playwright/test'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { test as baseTest } from '@playwright/test'
import { observeFontSheets } from './font-accessibility.mjs'

export const localFontPreview = process.env.ZTD_LOCAL_FONT_PREVIEW === '1'
if (localFontPreview && process.env.GITHUB_ACTIONS === 'true') {
  throw new Error('Normal CI must verify actual Google Fonts browser loads and transfer budgets')
}

export async function installLocalFontPreview(page: Page): Promise<void> {
  observeFontSheets(page)
  if (!localFontPreview) {
    return
  }
  const directory = '/tmp/website-noto-preview'
  mkdirSync(directory, { recursive: true })
  await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, async (route) => {
    const url = route.request().url()
    const path = join(directory, createHash('sha256').update(url).digest('hex'))
    if (!existsSync(path)) {
      const result = spawnSync('curl', [
        '--fail',
        '--silent',
        '--show-error',
        '--max-time',
        '30',
        '--user-agent',
        await route.request().headerValue('user-agent') ?? '',
        '--output',
        path,
        url,
      ], { encoding: 'utf8' })
      if (result.status !== 0) {
        throw new Error(`Trusted TLS font preview download failed: ${result.stderr}`)
      }
    }
    await route.fulfill({
      body: readFileSync(path),
      contentType: new URL(url).origin === 'https://fonts.googleapis.com' ? 'text/css' : 'font/woff2',
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  })
}

export const test = baseTest.extend<{ localFontSetup: undefined }>({
  localFontSetup: [
    async ({ context }, use) => {
      const pending: Promise<void>[] = []
      context.on('page', page => pending.push(installLocalFontPreview(page)))
      await Promise.all(context.pages().map(installLocalFontPreview))
      await use(undefined)
      await Promise.all(pending)
    },
    { auto: true },
  ],
})
