import type { PreferencePolicy } from '@ztd-me/frontend'
import { createPreferencePolicy } from '@ztd-me/frontend'

interface WebsitePreferenceEnvironment {
  environment: 'production' | 'preview' | 'development'
  protocol: 'http:' | 'https:'
}

const cookieNames = {
  production: 'ztd.frontend.v1',
  preview: 'ztd.frontend.preview.website.v1',
  development: 'ztd.frontend.development.website.v1',
}

/** Call with the website's trusted deployment decision, never forwarded host data. */
export function websitePreferencePolicy({ environment, protocol }: WebsitePreferenceEnvironment): PreferencePolicy {
  if (environment === 'production' && protocol !== 'https:') {
    throw new Error('Production frontend sharing requires HTTPS')
  }
  const name = cookieNames[environment]
  return createPreferencePolicy({
    name,
    secure: protocol === 'https:',
    mirrorKey: name,
    ...(environment === 'production' ? { domain: 'ztd.me' } : {}),
  })
}
