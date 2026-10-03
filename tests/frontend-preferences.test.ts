import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDeepStrictEqual } from 'node:util'
import {
  preferenceCookie,
  readPreferenceCookie,
  resolveInitialPreferences,
} from '@ztd-me/frontend'
import { websitePreferencePolicy } from '../lib/frontend-policy.ts'
import { frontendDeployment, frontendRenderRequest } from '../lib/frontend-request.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'

test('trusted production requests share only validated UI preferences', () => {
  const request = frontendRenderRequest(new Request('https://ztd.me'))
  const policy = websitePreferencePolicy(frontendDeployment(request.headers, true))
  assert.ok(isDeepStrictEqual(policy, {
    name: 'ztd.frontend.v1',
    domain: 'ztd.me',
    secure: true,
    mirrorKey: 'ztd.frontend.v1',
  }))
  const value = JSON.stringify({ version: 1, mode: 'dark', palette: 'moss', locale: 'zh-CN', auth: 'excluded' })
  const initial = resolveInitialPreferences({
    policy,
    cookieHeader: `ztd.frontend.v1=${encodeURIComponent(value)}`,
    acceptLanguage: 'en-US',
  })
  assert.ok(isDeepStrictEqual(initial, { version: 1, mode: 'dark', palette: 'moss', locale: 'zh-CN' }))
  const cookie = preferenceCookie(initial, policy)
  assert.match(cookie, /Domain=ztd\.me/)
  assert.match(cookie, /; Secure/)
  assert.ok(!cookie.includes('auth'))
}).catch(handleRegistrationFailure)

test('local and preview namespaces cannot read the production preference key', () => {
  for (const environment of ['development', 'preview'] as const) {
    const policy = websitePreferencePolicy({
      environment,
      protocol: 'https:',
    })
    const value = encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'plum', locale: 'zh-CN' }))
    const initial = resolveInitialPreferences({ policy, cookieHeader: `ztd.frontend.v1=${value}` })
    assert.ok(isDeepStrictEqual(initial, { version: 1, mode: 'system', palette: 'neutral', locale: 'en' }))
    assert.ok(Object.is(policy.domain, undefined))
    assert.ok(Object.is(policy.name, `ztd.frontend.${environment}.website.v1`))
  }
}).catch(handleRegistrationFailure)

test('development ignores a forged production marker when selecting the package policy', () => {
  const headers = new Headers({ 'x-ztd-frontend-deployment': 'production' })
  const policy = websitePreferencePolicy(frontendDeployment(headers, false))
  assert.ok(Object.is(policy.name, 'ztd.frontend.development.website.v1'))
  assert.ok(Object.is(policy.secure, false))
  assert.ok(Object.is(policy.domain, undefined))
}).catch(handleRegistrationFailure)

test('production preference sharing refuses HTTP deployment configuration', () => {
  assert.throws(() => websitePreferencePolicy({ environment: 'production', protocol: 'http:' }), /requires HTTPS/)
}).catch(handleRegistrationFailure)

test('duplicated and oversized cookie inputs stay invalid', () => {
  const policy = websitePreferencePolicy({
    environment: 'development',
    protocol: 'http:',
  })
  const value = encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'plum', locale: 'zh-CN' }))
  const duplicated = `${policy.name}=${value}; ${policy.name}=${value}`
  assert.ok(Object.is(readPreferenceCookie(duplicated, policy).status, 'invalid'))
  assert.ok(Object.is(readPreferenceCookie(`${policy.name}=${'x'.repeat(1025)}`, policy).status, 'invalid'))
}).catch(handleRegistrationFailure)
