import assert from 'node:assert/strict'
import { isDeepStrictEqual } from 'node:util'
import { cloudflareResult, requireArray, requireRecord, requireString } from './cloudflare-json.ts'
import { ACCOUNT_ID, EXPECTED_ROUTES, WORKER_NAME } from './deployment-policy.ts'

interface WorkerDomain {
  hostname: string
  service: string
  environment: string
  zone_name: string
  zone_id: string
}

function parseDomains(value: unknown): WorkerDomain[] {
  const message = 'Cloudflare domain response could not be verified'
  return requireArray(value, message).map((item) => {
    const domain = requireRecord(item, message)
    return {
      hostname: requireString(domain.hostname, message),
      service: requireString(domain.service, message),
      environment: requireString(domain.environment, message),
      zone_name: requireString(domain.zone_name, message),
      zone_id: requireString(domain.zone_id, message),
    }
  })
}

async function readDomains(
  token: string,
  fetcher: typeof fetch,
  query: Record<string, string>,
): Promise<WorkerDomain[]> {
  const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains`)
  url.search = new URLSearchParams(query).toString()
  let response: Response
  try {
    response = await fetcher(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    })
  }
  catch {
    throw new Error(
      'Cloudflare domain read failed; stop and inspect connectivity/access without printing credentials',
    )
  }
  if (!response.ok) {
    throw new Error(
      `Cloudflare domain read returned HTTP ${response.status}; stop without changing permissions`,
    )
  }
  let body: unknown
  try {
    body = await response.json()
  }
  catch {
    throw new Error('Cloudflare domain response was not JSON; stop before deployment')
  }
  return parseDomains(
    cloudflareResult(
      body,
      'Cloudflare domain response could not be verified',
      'Paginated domain state requires manual review',
    ),
  )
}

function verifyOwner(domain: WorkerDomain, host: string): void {
  assert.ok(domain.hostname === host, `Unexpected ${host} hostname`)
  assert.ok(
    domain.zone_name === (host === 'www.zeithrold.dev' ? 'zeithrold.dev' : host),
    `Unexpected ${host} zone`,
  )
  assert.match(domain.zone_id, /^[a-f0-9]{32}$/)
  assert.ok(domain.environment === 'production', `Unexpected ${host} environment`)
  assert.ok(domain.service === WORKER_NAME, `Unexpected ${host} owner; stop for review`)
}

// GET only. Fail on unavailable permissions, ambiguous results or changed ownership.
// Never log credentials, raw responses, or a whole-account inventory.
export async function checkCloudflareTarget(
  { accountId, token }: { accountId?: string, token?: string },
  fetcher: typeof fetch = fetch,
): Promise<string> {
  assert.equal(accountId, ACCOUNT_ID, 'Unexpected Cloudflare account')
  assert.ok(token !== undefined && token !== '', 'The existing CLOUDFLARE_API_TOKEN secret is required')
  const hosts = EXPECTED_ROUTES.map(route => route.pattern)
  const owners: string[] = []
  for (const host of hosts) {
    const records = await readDomains(token, fetcher, { hostname: host })
    assert.ok(records.length === 1, `Required ${host} Custom Domain is missing or ambiguous`)
    const [domain] = records
    assert.ok(domain !== undefined, `Required ${host} Custom Domain is missing`)
    verifyOwner(domain, host)
    owners.push(`${host}: ${domain.service}`)
  }
  const targets = await readDomains(token, fetcher, { service: WORKER_NAME })
  assert.ok(
    targets.every(
      target =>
        hosts.includes(target.hostname)
        && target.service === WORKER_NAME
        && target.environment === 'production',
    ),
    'Worker has unapproved domains; do not remove or replace them',
  )
  const actualHosts = targets.map(target => target.hostname)
  assert.ok(new Set(actualHosts).size === targets.length, 'Worker domain state is ambiguous')
  assert.ok(
    isDeepStrictEqual(actualHosts.toSorted(), hosts.toSorted()),
    'Worker must keep exactly the five existing hosts',
  )
  return owners.join('; ')
}
