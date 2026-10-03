import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDeepStrictEqual } from 'node:util'
import { frontendDeployment, frontendRenderRequest, privateApplicationResponse } from '../lib/frontend-request.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'

test('canonical rendering replaces forged deployment headers and preserves the request payload', async () => {
  const request = new Request('https://ztd.me/settings', {
    method: 'POST',
    body: 'preserved input',
    headers: {
      'x-ztd-frontend-deployment': 'development-http',
      'x-forwarded-host': 'unrelated.example',
      'cookie': 'existing=value',
      'accept-language': 'zh-CN',
    },
  })
  const rendered = frontendRenderRequest(request)
  assert.ok(isDeepStrictEqual(frontendDeployment(rendered.headers, true), {
    environment: 'production',
    protocol: 'https:',
  }))
  assert.ok(Object.is(rendered.method, 'POST'))
  assert.ok(Object.is(await rendered.text(), 'preserved input'))
  assert.ok(Object.is(rendered.headers.get('cookie'), 'existing=value'))
  assert.ok(Object.is(rendered.headers.get('accept-language'), 'zh-CN'))
  assert.ok(Object.is(request.headers.get('x-ztd-frontend-deployment'), 'development-http'))
}).catch(handleRegistrationFailure)

test('local rendering cannot select production sharing through incoming headers', () => {
  for (const origin of [
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'https://localhost:4173',
    'http://[::1]:4173',
  ]) {
    const request = new Request(origin, { headers: {
      'x-ztd-frontend-deployment': 'production',
      'x-forwarded-host': 'ztd.me',
      'x-forwarded-proto': 'https',
    } })
    const actual = frontendDeployment(frontendRenderRequest(request).headers, true)
    assert.ok(Object.is(actual.environment, 'development'))
    assert.ok(Object.is(actual.protocol, new URL(origin).protocol))
  }
}).catch(handleRegistrationFailure)

test('aliases, previews, unapproved hosts and noncanonical origins cannot reach rendering', () => {
  for (const origin of [
    'https://doa.ink',
    'http://ztd.me',
    'https://ztd.me:444',
    'https://preview.ztd.me',
    'https://showcase.ztd.me',
    'https://ztd.me.unrelated.example',
  ]) {
    assert.throws(() => frontendRenderRequest(new Request(origin)), /accepted canonical or local request/)
  }
}).catch(handleRegistrationFailure)

test('absent or invalid Worker context uses isolated development defaults', () => {
  for (const marker of [
    '',
    'production-unknown',
    'preview',
  ]) {
    const actual = frontendDeployment(new Headers({
      'x-ztd-frontend-deployment': marker,
      'host': 'ztd.me',
      'x-forwarded-host': 'ztd.me',
    }))
    assert.ok(isDeepStrictEqual(actual, {
      environment: 'development',
      protocol: 'http:',
    }))
  }
}).catch(handleRegistrationFailure)

test('development SSR ignores even a valid-looking production marker', () => {
  const headers = new Headers({ 'x-ztd-frontend-deployment': 'production' })
  assert.ok(Object.is(frontendDeployment(headers).environment, 'development'))
  assert.ok(Object.is(frontendDeployment(headers, false).environment, 'development'))
}).catch(handleRegistrationFailure)

test('application responses prevent shared caching and preserve status, body and Vary', async () => {
  const response = new Response('localized HTML', { status: 404, headers: {
    'Vary': 'Accept-Encoding, cookie',
    'Cache-Control': 'public, max-age=600',
    'Content-Type': 'text/html',
    'Set-Cookie': 'existing=value; HttpOnly',
  } })
  const secured = privateApplicationResponse(response)
  assert.ok(Object.is(secured.status, 404))
  assert.ok(Object.is(await secured.text(), 'localized HTML'))
  assert.ok(Object.is(secured.headers.get('cache-control'), 'private, no-store'))
  assert.ok(Object.is(secured.headers.get('vary'), 'Accept-Encoding, cookie, Accept-Language'))
  assert.ok(Object.is(secured.headers.get('set-cookie'), 'existing=value; HttpOnly'))
}).catch(handleRegistrationFailure)

test('application responses preserve an existing wildcard Vary', () => {
  const result = privateApplicationResponse(new Response(null, { headers: { Vary: '*' } }))
  assert.ok(Object.is(result.headers.get('vary'), '*'))
}).catch(handleRegistrationFailure)
