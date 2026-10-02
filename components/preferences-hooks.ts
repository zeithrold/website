import type { SitePreferences } from './preferences-context'
import type { CopyKey } from '@/lib/copy'
import { use } from 'react'
import { useTranslation } from 'react-i18next'
import { PreferencesContext } from './preferences-context'

export function useSitePreferences(): SitePreferences {
  const context = use(PreferencesContext)
  if (context === null) {
    throw new Error('useSitePreferences requires PreferencesProvider')
  }
  return context
}

export function useCopy(): (key: CopyKey) => string {
  const { t } = useTranslation()
  return key => t(key)
}
