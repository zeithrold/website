import type { Preferences } from './preferences'
import { detectLocale, PREFERENCES_KEY, readPreferences } from './preferences'

export function restoreBrowserPreferences(): Preferences {
  const fallback: Preferences = {
    locale: detectLocale(navigator.languages),
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  }
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY)
    const parsed: unknown = saved === null ? null : JSON.parse(saved)
    return readPreferences(parsed, fallback)
  }
  catch {
    // Preferences remain usable when storage is unavailable or malformed.
    return fallback
  }
}

export function persistBrowserPreferences(preferences: Preferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }
  catch {
    // Storage is optional; in-memory updates still work.
  }
}
