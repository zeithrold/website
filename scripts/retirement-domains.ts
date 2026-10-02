import assert from 'node:assert/strict'
import { isDeepStrictEqual } from 'node:util'
import { requireArray, requireRecord, requireString } from './cloudflare-json.ts'
import { EXPECTED_ROUTES, LEGACY_WORKER_NAME, WORKER_NAME } from './deployment-policy.ts'

export interface RetirementDomain {
  id: string
  hostname: string
  service: string
  environment: string
  zone_id: string
}

export function retirementDomains(value: unknown): RetirementDomain[] {
  return requireArray(value, 'Invalid domain list').map((item) => {
    const domain = requireRecord(item, 'Invalid domain record')
    return {
      id: requireString(domain.id, 'Invalid domain ID'),
      hostname: requireString(domain.hostname, 'Invalid domain hostname'),
      service: requireString(domain.service, 'Invalid domain service'),
      environment: requireString(domain.environment, 'Invalid domain environment'),
      zone_id: requireString(domain.zone_id, 'Invalid domain zone ID'),
    }
  })
}

export function verifyRetirementDomains(domains: RetirementDomain[]): void {
  assert.ok(
    !domains.some(domain => domain.service === LEGACY_WORKER_NAME),
    'Old Worker still has Custom Domains',
  )
  const approved = domains.filter(domain => domain.service === WORKER_NAME)
  assert.ok(
    isDeepStrictEqual(
      approved.map(domain => domain.hostname).toSorted(),
      EXPECTED_ROUTES.map(route => route.pattern).toSorted(),
    ),
    'New Worker must retain exactly five approved domains',
  )
  assert.ok(
    approved.every(domain => domain.environment === 'production'),
    'Unexpected new Worker environment',
  )
  for (const host of ['blog.ztd.me', 'showcase.ztd.me']) {
    assert.ok(
      domains.filter(domain => domain.hostname === host).length === 1,
      `${host} binding must be present`,
    )
  }
}

export function domainSnapshot(domains: RetirementDomain[]): RetirementDomain[] {
  return domains.toSorted((a, b) => a.id.localeCompare(b.id))
}

export function retirementScripts(value: unknown): string[] {
  return requireArray(value, 'Invalid script list').map((item) => {
    return requireString(requireRecord(item, 'Invalid script record').id, 'Invalid script ID')
  })
}
