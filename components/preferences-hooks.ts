import type { i18n } from 'i18next'
import type { SiteTranslation } from '@/lib/site-i18n'
import { use } from 'react'
import { I18nContext } from 'react-i18next'
import { useFrontendPreferences } from '@/components/ui/ztd-me/client'
import { siteTranslation } from '@/lib/site-i18n'

function requireInstance(context: { i18n: i18n } | undefined): i18n {
  if (context === undefined) {
    throw new Error('useCopy requires the root I18nextProvider')
  }
  return context.i18n
}

export function useCopy(): SiteTranslation {
  const instance = requireInstance(use(I18nContext))
  const { preferences: { locale } } = useFrontendPreferences()
  return siteTranslation(instance, locale)
}
