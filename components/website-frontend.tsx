'use client'

import type { ReactElement, ReactNode } from 'react'
import type { FrontendPreferences, PreferencePolicy } from '@/components/ui/ztd-me/index'
import { useCallback, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { FrontendProvider } from '@/components/ui/ztd-me/client'
import { applySiteLocale, createSiteI18n } from '@/lib/site-i18n'

export function WebsiteFrontend({ children, initialPreferences, policy }: {
  children: ReactNode
  initialPreferences: FrontendPreferences
  policy: PreferencePolicy
}): ReactElement {
  const [instance] = useState(() => createSiteI18n(initialPreferences.locale))
  const updateLocale = useCallback((preferences: FrontendPreferences) => {
    applySiteLocale(instance, preferences.locale)
  }, [instance])
  return (
    <FrontendProvider initialPreferences={initialPreferences} policy={policy} onPreferencesChange={updateLocale}>
      <I18nextProvider i18n={instance}>
        {children}
      </I18nextProvider>
    </FrontendProvider>
  )
}
