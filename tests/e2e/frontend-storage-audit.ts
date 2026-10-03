import type { Page } from '@playwright/test'

/** Records browser storage access without introducing additional persisted data. */
export async function recordStorageAccess(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const operations: Array<{ operation: string, key: string }> = []
    Object.defineProperty(window, 'websiteTestStorageAccess', { value: operations })
    const storage = localStorage
    const getItem: unknown = Object.getOwnPropertyDescriptor(Storage.prototype, 'getItem')?.value
    const setItem: unknown = Object.getOwnPropertyDescriptor(Storage.prototype, 'setItem')?.value
    const removeItem: unknown = Object.getOwnPropertyDescriptor(Storage.prototype, 'removeItem')?.value
    const clear: unknown = Object.getOwnPropertyDescriptor(Storage.prototype, 'clear')?.value
    if (typeof getItem !== 'function' || typeof setItem !== 'function'
      || typeof removeItem !== 'function' || typeof clear !== 'function') {
      throw new TypeError('Storage methods are unavailable for this browser audit')
    }
    Storage.prototype.getItem = function (key) {
      if (this === storage) {
        operations.push({ operation: 'read', key })
      }
      const value: unknown = Reflect.apply(getItem, this, [key])
      return typeof value === 'string' ? value : null
    }
    Storage.prototype.setItem = function (key, value) {
      if (this === storage) {
        operations.push({ operation: 'write', key })
      }
      Reflect.apply(setItem, this, [key, value])
    }
    Storage.prototype.removeItem = function (key) {
      if (this === storage) {
        operations.push({ operation: 'remove', key })
      }
      Reflect.apply(removeItem, this, [key])
    }
    Storage.prototype.clear = function () {
      if (this === storage) {
        operations.push({ operation: 'clear', key: '*' })
      }
      Reflect.apply(clear, this, [])
    }
  })
}

export async function recordedStorageAccess(page: Page): Promise<unknown> {
  return await page.evaluate(() => {
    const value: unknown = Reflect.get(window, 'websiteTestStorageAccess')
    return value
  })
}
