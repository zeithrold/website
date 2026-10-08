import type { i18n, TOptions } from 'i18next'
import type { CopyKey } from './copy.ts'
import type { Locale } from '@/components/ui/ztd-me/index'
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
  if (instance.language !== locale) {
    instance.changeLanguage(locale).catch(reportLanguageError)
  }
  const description = siteTranslation(instance, locale)('meta.description')
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
}

export type SiteTranslation = (key: CopyKey, options?: TOptions) => string

export function siteTranslation(instance: i18n, locale: Locale): SiteTranslation {
  const translate = instance.getFixedT(locale)
  return (key, options) => {
    const values = { ...options, lng: locale, ns: 'translation' }
    // i18next prioritizes lngs over lng; callers cannot replace the root locale.
    delete values.lngs
    return translate(key, values)
  }
}
