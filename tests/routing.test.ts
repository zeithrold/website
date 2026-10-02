import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CANONICAL_ORIGIN, REDIRECT_HOSTS, routeRequest } from '../lib/routing.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'

for (const host of REDIRECT_HOSTS) {
  for (const protocol of ['http', 'https']) {
    test(`${protocol}://${host} keeps path and query on the HTTPS canonical origin`, () => {
      const response = routeRequest(
        new Request(`${protocol}://${host}/notes/%E4%BD%A0%E5%A5%BD?tag=a%2Fb&tag=c&utm_source=old`),
      )
      assert.ok(response !== null)
      assert.ok(Object.is(response.status, 308))
      assert.ok(
        Object.is(
          response.headers.get('location'),
          `${CANONICAL_ORIGIN}/notes/%E4%BD%A0%E5%A5%BD?tag=a%2Fb&tag=c&utm_source=old`,
        ),
      )
      assert.ok(Object.is(response.headers.get('cache-control'), 'no-store'))
    }).catch(handleRegistrationFailure)
  }
  test(`${host} redirects static files and method-preserving requests`, () => {
    for (const [path, method] of [
      ['/favicon.svg', 'GET'],
      ['/assets/main.js?q=1', 'HEAD'],
      ['/submit', 'POST'],
    ] as const) {
      const response = routeRequest(new Request(`https://${host}${path}`, { method }))
      assert.ok(response !== null)
      assert.ok(Object.is(response.status, 308))
      assert.ok(Object.is(response.headers.get('location'), `${CANONICAL_ORIGIN}${path}`))
    }
  }).catch(handleRegistrationFailure)
}

test('canonical HTTP and nonstandard ports converge in one hop', () => {
  for (const url of ['http://ztd.me/?q=1', 'https://ztd.me:8443/?q=1']) {
    assert.ok(Object.is(routeRequest(new Request(url))?.headers.get('location'), 'https://ztd.me/?q=1'))
  }
  assert.ok(Object.is(routeRequest(new Request('https://ztd.me/path?next=https://evil.example')), null))
}).catch(handleRegistrationFailure)

test('host casing is normalized and source port is discarded', () => {
  assert.ok(
    Object.is(routeRequest(new Request('http://ZTD.ONE:8080/'))?.headers.get('location'), 'https://ztd.me/'),
  )
}).catch(handleRegistrationFailure)

test('host-like paths and redirect parameters cannot change destination origin', () => {
  for (const path of [
    '//evil.example/path',
    '/%2f%2fevil.example',
    '/%5c%5cevil.example',
    '/?next=https://evil.example&url=//evil.example',
    '/?redirect_uri=https%3A%2F%2Fevil.example',
  ]) {
    const response = routeRequest(new Request(`https://doa.ink${path}`))
    assert.ok(response !== null)
    const location = response.headers.get('location')
    assert.ok(location !== null)
    assert.ok(Object.is(new URL(location).origin, CANONICAL_ORIGIN))
  }
}).catch(handleRegistrationFailure)

test('subdomains, lookalikes, unrelated hosts and the protected domain fail closed', () => {
  for (const host of [
    'blog.ztd.me',
    'showcase.ztd.me',
    'www.ztd.me',
    'www.doa.ink',
    'blog.doa.ink',
    'blog.zeithrold.dev',
    'www.zeithrold.dev.evil.example',
    'test.ztd.one',
    'ztd.one.evil.example',
    'evilztd.one',
    'zeithrold.cloud',
    'www.zeithrold.cloud',
    'zeithrold.com',
    'www.zeithrold.com',
    'ztd.one.',
    'evil.example',
  ]) {
    const response = routeRequest(new Request(`https://${host}/`))
    assert.ok(response !== null)
    assert.ok(Object.is(response.status, 421), host)
    assert.ok(Object.is(response.headers.has('location'), false), host)
  }
}).catch(handleRegistrationFailure)

test('local production previews are allowed without a canonical redirect', () => {
  for (const host of [
    'localhost:4173',
    '127.0.0.1:8787',
    '[::1]:5173',
  ]) {
    assert.ok(Object.is(routeRequest(new Request(`http://${host}/`)), null))
  }
}).catch(handleRegistrationFailure)
