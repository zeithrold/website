import { assertAccessible as scan } from '@ztd-me/frontend-checks/playwright'

const loadedFontSheets = new WeakMap()

export function observeFontSheets(page) {
  if (loadedFontSheets.has(page)) {
    return
  }
  const sheets = new Map()
  loadedFontSheets.set(page, sheets)
  page.on('response', (response) => {
    if (response.status() === 200 && new URL(response.url()).origin === 'https://fonts.googleapis.com') {
      sheets.set(response.url(), response.text().catch(() => null))
    }
  })
}

function installAnalysisCssReader({ sheets }) {
  const OriginalRequest = window.XMLHttpRequest
  const snapshot = new Map(sheets)
  window.XMLHttpRequest = class AnalysisRequest extends OriginalRequest {
    #cachedBody

    open(method, url, ...args) {
      this.#cachedBody = method === 'GET' ? snapshot.get(String(url)) : undefined
      return super.open(method, url, ...args)
    }

    get responseText() {
      return this.#cachedBody ?? super.responseText
    }

    send(...args) {
      if (this.#cachedBody !== undefined) {
        queueMicrotask(() => this.dispatchEvent(new ProgressEvent('loadend', { loaded: this.#cachedBody.length })))
        return
      }
      super.send(...args)
    }
  }
  return () => {
    window.XMLHttpRequest = OriginalRequest
  }
}

export async function assertAccessible(page, info, options) {
  const sheets = (await Promise.all(Array.from(loadedFontSheets.get(page) ?? [], async ([url, body]) => [
    url,
    await body,
  ]))).filter(([, body]) => body !== null)
  // Reuse actual completed CSS only during Axe analysis; browser requests and UI CSS stay unchanged.
  const restore = await page.evaluateHandle(installAnalysisCssReader, { sheets })
  try {
    return await scan(page, info, options)
  }
  finally {
    await restore.evaluate(callback => callback())
    await restore.dispose()
  }
}
