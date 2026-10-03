import type { Locale } from '@ztd-me/frontend'
import type { i18n } from 'i18next'
import { createInstance } from 'i18next'
import { en, zh } from './copy.ts'

function reportLanguageError(error: unknown): void {
  console.error('Unable to apply site language', error)
}

export function createSiteI18n(locale: Locale = 'en'): i18n {
  const instance = createInstance()
  instance
    .init({
      lng: locale,
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh-CN'],
      resources: { 'en': { translation: en }, 'zh-CN': { translation: zh } },
      keySeparator: false,
      initAsync: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    })
    .catch(reportLanguageError)
  return instance
}

export function applySiteLocale(instance: i18n, locale: Locale): void {
  instance.changeLanguage(locale).catch(reportLanguageError)
  const description = instance.getFixedT(locale)('meta.description')
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
}
