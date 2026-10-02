import type { Preferences } from '@/lib/preferences'
import { createContext } from 'react'

export interface SitePreferences {
  preferences: Preferences
  ready: boolean
  update: (values: Partial<Preferences>) => void
}

export const PreferencesContext = createContext<SitePreferences | null>(null)
