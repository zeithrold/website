import assert from 'node:assert/strict'
import { isDeepStrictEqual } from 'node:util'
import { ACCOUNT_ID, LEGACY_WORKER_NAME, WORKER_NAME } from './deployment-policy.ts'
import { deleteLegacyWorker } from './retirement-delete.ts'
import {
  domainSnapshot,
  retirementDomains,
  retirementScripts,
  verifyRetirementDomains,
} from './retirement-domains.ts'
import { verifyRetirementPreflight } from './retirement-preflight.ts'
import { createRetirementRead } from './retirement-read.ts'

export const RETIRE_CONFIRMATION = 'DELETE_DOAINK_HOME_PERMANENTLY'

function verifyFixedTargets(targets: { account: string, legacy: string, current: string }): void {
  assert.ok(targets.account === 'a0df2e968b524bdd77c0eab565058522', 'Unexpected retirement account')
  assert.ok(targets.legacy === 'doaink-home', 'Unexpected legacy retirement target')
  assert.ok(targets.current === 'ztd-homepage', 'Unexpected current Worker')
}

// Target, account and DELETE URL are fixed. No resource name is accepted as input.
export async function retireDoainkHome(
  request: { token?: string, accountId?: string, confirmation?: string },
  fetcher: typeof fetch = fetch,
): Promise<{ deleted: boolean, alreadyAbsent: boolean, workersDev?: boolean }> {
  verifyFixedTargets({ account: ACCOUNT_ID, legacy: LEGACY_WORKER_NAME, current: WORKER_NAME })
  assert.equal(request.accountId, ACCOUNT_ID, 'Use only the approved Cloudflare account')
  assert.ok(
    request.token !== undefined && request.token !== '',
    'The existing CLOUDFLARE_API_TOKEN secret is required',
  )
  const deleting = request.confirmation === RETIRE_CONFIRMATION
  assert.ok(deleting || request.confirmation === 'CHECK_ONLY', 'Invalid retirement confirmation')
  const read = createRetirementRead(request.token, fetcher)
  const beforeDomains = retirementDomains(await read('/domains'))
  verifyRetirementDomains(beforeDomains)
  const beforeScripts = retirementScripts(await read('/scripts'))
  assert.ok(beforeScripts.includes(WORKER_NAME), 'New Worker must exist')
  if (!beforeScripts.includes(LEGACY_WORKER_NAME)) {
    return { deleted: false, alreadyAbsent: true }
  }
  const workersDev = await verifyRetirementPreflight(read)
  console.log(
    `Preflight passed: only ${LEGACY_WORKER_NAME}; no domains/routes/Cron/references/resource integrations; `
    + `workers.dev=${String(workersDev)}.`,
  )
  if (!deleting) {
    return { deleted: false, alreadyAbsent: false, workersDev }
  }
  // Refresh ownership immediately before deletion. Never detach domains or touch DNS.
  assert.ok(
    isDeepStrictEqual(
      domainSnapshot(retirementDomains(await read('/domains'))),
      domainSnapshot(beforeDomains),
    ),
    'Bindings changed during preflight; stop',
  )
  await deleteLegacyWorker(request.token, fetcher)
  const afterScripts = retirementScripts(await read('/scripts'))
  assert.ok(!afterScripts.includes(LEGACY_WORKER_NAME), 'Old Worker is still listed; do not repeat DELETE')
  assert.ok(
    isDeepStrictEqual(
      afterScripts.toSorted(),
      beforeScripts.filter(id => id !== LEGACY_WORKER_NAME).toSorted(),
    ),
    'Unexpected change to other Workers',
  )
  const afterDomains = retirementDomains(await read('/domains'))
  verifyRetirementDomains(afterDomains)
  assert.ok(
    isDeepStrictEqual(domainSnapshot(afterDomains), domainSnapshot(beforeDomains)),
    'Domain bindings changed after deletion; stop for review',
  )
  return { deleted: true, alreadyAbsent: false, workersDev }
}
