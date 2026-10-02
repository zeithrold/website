import type { i18n } from 'i18next'
import { createInstance } from 'i18next'
import { en, zh } from './copy'

function reportLanguageError(error: unknown): void {
  console.error('Unable to apply site language', error)
}

export function createSiteI18n(): i18n {
  const instance = createInstance()
  instance
    .init({
      lng: 'en',
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

export function applySitePreferences(instance: i18n, preferences: { locale: string, theme: string }): void {
  document.documentElement.classList.toggle('dark', preferences.theme === 'dark')
  document.documentElement.lang = preferences.locale
  instance.changeLanguage(preferences.locale).catch(reportLanguageError)
  const description = instance.getFixedT(preferences.locale)('meta.description')
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
}
