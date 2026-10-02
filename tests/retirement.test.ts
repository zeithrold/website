import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDeepStrictEqual } from 'node:util'
import { ACCOUNT_ID } from '../scripts/deployment-policy.ts'
import { RETIRE_CONFIRMATION, retireDoainkHome } from '../scripts/retire-doaink-home.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'
import { api } from './helpers/retirement-api.ts'

function request(confirmation = 'CHECK_ONLY') {
  return {
    accountId: ACCOUNT_ID,
    token: 'fake-retirement-token',
    confirmation,
  }
}
test('retirement check is read-only and inspects the fixed old Worker', async () => {
  const fake = api()
  assert.ok(
    isDeepStrictEqual(await retireDoainkHome(request(), fake.fetcher), {
      deleted: false,
      alreadyAbsent: false,
      workersDev: true,
    }),
  )
  assert.ok(fake.calls.every(call => call.method === 'GET'))
}).catch(handleRegistrationFailure)

test('permanent retirement sends exactly one fixed DELETE with force=false and verifies absence', async () => {
  const fake = api()
  assert.ok(Object.is((await retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher)).deleted, true))
  assert.ok(
    isDeepStrictEqual(
      fake.calls.filter(call => call.method !== 'GET'),
      [
        { path: '/scripts/doaink-home?force=false', method: 'DELETE' },
      ],
    ),
  )
  assert.ok(
    isDeepStrictEqual(
      fake.calls.slice(-2).map(call => call.path),
      ['/scripts', '/domains'],
    ),
  )
}).catch(handleRegistrationFailure)

test('an already absent old Worker never produces DELETE', async () => {
  const fake = api({ absent: true })
  assert.ok(
    Object.is((await retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher)).alreadyAbsent, true),
  )
  assert.ok(fake.calls.every(call => call.method === 'GET'))
}).catch(handleRegistrationFailure)

test('permission failures, incoming references and other resource bindings stop before DELETE', async () => {
  for (const options of [
    { forbidden: true },
    { dependency: true },
    { resource: true },
    { unknownCategory: true },
    { domainReference: true },
    { malformedDomains: true },
  ]) {
    const fake = api(options)
    const attempt = retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher)
    if (options.unknownCategory === true) {
      await assert.rejects(attempt, /Unknown dependency categories require review: unreviewed_dependency/)
    }
    else {
      await assert.rejects(attempt)
    }
    assert.ok(fake.calls.every(call => call.method === 'GET'))
  }
}).catch(handleRegistrationFailure)

test('uncertain deletion and failed absence verification do not repeat DELETE', async () => {
  for (const options of [
    { uncertain: true },
    { stillListed: true },
  ]) {
    const fake = api(options)
    await assert.rejects(
      retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher),
      /do not retry|do not repeat DELETE/,
    )
    assert.ok(Object.is(fake.calls.filter(call => call.method === 'DELETE').length, 1))
  }
}).catch(handleRegistrationFailure)

test('another account or unapproved confirmation cannot issue any request', async () => {
  const fake = api()
  await assert.rejects(retireDoainkHome({ ...request(), accountId: 'b'.repeat(32) }, fake.fetcher))
  await assert.rejects(retireDoainkHome(request('DELETE_ZTD_HOMEPAGE'), fake.fetcher))
  assert.ok(Object.is(fake.calls.length, 0))
}).catch(handleRegistrationFailure)

test('malformed preflight records stop retirement before mutation', async () => {
  for (const overrides of [
    { '/domains': [null] },
    { '/scripts': [
      { id: 42 },
    ] },
    { '/services/doaink-home': { id: 'other-worker' } },
    { '/scripts/doaink-home/settings': { bindings: [
      {},
    ] } },
    { '/scripts/doaink-home/references': { services: {} } },
    { '/scripts/doaink-home/deployments': { deployments: [] } },
    { '/services/doaink-home/environments/production/subdomain': { enabled: 'unknown' } },
  ]) {
    const fake = api({ overrides })
    await assert.rejects(retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher))
    assert.ok(fake.calls.every(call => call.method === 'GET'))
  }
}).catch(handleRegistrationFailure)
