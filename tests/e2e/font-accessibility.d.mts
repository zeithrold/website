import type { Page } from '@playwright/test'
import type { assertAccessible as scan } from '@ztd-me/frontend-checks/playwright'

export const assertAccessible: typeof scan
export function observeFontSheets(page: Page): void
