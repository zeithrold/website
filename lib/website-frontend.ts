import type { FrontendPreferences, PreferencePolicy } from '@ztd-me/frontend'
import { resolveInitialPreferences } from '@ztd-me/frontend'
import { websitePreferencePolicy } from './frontend-policy.ts'
import { frontendDeployment } from './frontend-request.ts'

export function resolveWebsiteFrontend(headers: Headers): {
  initialPreferences: FrontendPreferences
  policy: PreferencePolicy
} {
  const policy = websitePreferencePolicy(frontendDeployment(headers, import.meta.env.PROD))
  const initialPreferences = resolveInitialPreferences({
    policy,
    cookieHeader: headers.get('cookie') ?? undefined,
    acceptLanguage: headers.get('accept-language') ?? undefined,
  })
  return { policy, initialPreferences }
}
