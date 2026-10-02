'use client'

import type { ReactElement, ReactNode } from 'react'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { I18nextProvider } from 'react-i18next'
import { persistBrowserPreferences, restoreBrowserPreferences } from '@/lib/browser-preferences'
import { createPreferencesStore } from '@/lib/preferences-store'
import { applySitePreferences, createSiteI18n } from '@/lib/site-i18n'
import { PreferencesContext } from './preferences-context'

export function PreferencesProvider({ children }: { children: ReactNode }): ReactElement {
  const instance = useMemo(createSiteI18n, [])
  const store = useMemo(() => createPreferencesStore(restoreBrowserPreferences), [])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const value = useMemo(() => ({ ...snapshot, update: store.update }), [snapshot, store])

  useEffect(() => {
    if (!snapshot.ready) {
      return
    }
    applySitePreferences(instance, snapshot.preferences)
    persistBrowserPreferences(snapshot.preferences)
  }, [instance, snapshot])

  return (
    <I18nextProvider i18n={instance}>
      <PreferencesContext value={value}>{children}</PreferencesContext>
    </I18nextProvider>
  )
}
