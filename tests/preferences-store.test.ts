import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDeepStrictEqual } from 'node:util'
import { createPreferencesStore } from '../lib/preferences-store.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'

test('preferences stay deterministic until subscription and restore only once', () => {
  let loads = 0
  const store = createPreferencesStore(() => {
    loads++
    return { locale: 'zh-CN', theme: 'dark' }
  })
  const serverSnapshot = store.getSnapshot()
  assert.ok(
    isDeepStrictEqual(serverSnapshot, { preferences: { locale: 'en', theme: 'light' }, ready: false }),
  )
  assert.ok(Object.is(store.getSnapshot(), serverSnapshot))
  assert.ok(Object.is(loads, 0))
  const unsubscribe = store.subscribe(() => {})
  assert.ok(
    isDeepStrictEqual(store.getSnapshot(), { preferences: { locale: 'zh-CN', theme: 'dark' }, ready: true }),
  )
  unsubscribe()
  const unsubscribeAgain = store.subscribe(() => {})
  assert.ok(Object.is(loads, 1))
  unsubscribeAgain()
}).catch(handleRegistrationFailure)

test('preference updates merge fields, replace snapshots and notify only active subscribers', () => {
  const store = createPreferencesStore(() => ({ locale: 'zh-CN', theme: 'dark' }))
  const observed: unknown[] = []
  const unsubscribe = store.subscribe(() => {
    observed.push(store.getSnapshot())
  })
  const restored = store.getSnapshot()
  store.update({ locale: 'en' })
  assert.ok(
    isDeepStrictEqual(store.getSnapshot(), { preferences: { locale: 'en', theme: 'dark' }, ready: true }),
  )
  assert.notEqual(store.getSnapshot(), restored)
  assert.ok(isDeepStrictEqual(restored.preferences, { locale: 'zh-CN', theme: 'dark' }))
  assert.ok(Object.is(observed.length, 2))
  unsubscribe()
  store.update({ theme: 'light' })
  assert.ok(Object.is(observed.length, 2))
  assert.ok(
    isDeepStrictEqual(store.getSnapshot(), { preferences: { locale: 'en', theme: 'light' }, ready: true }),
  )
}).catch(handleRegistrationFailure)

test('separate providers never share preference snapshots', () => {
  const first = createPreferencesStore(() => ({ locale: 'en', theme: 'light' }))
  const second = createPreferencesStore(() => ({ locale: 'zh-CN', theme: 'dark' }))
  const unsubscribe = first.subscribe(() => {})
  first.update({ theme: 'dark' })
  assert.ok(
    isDeepStrictEqual(second.getSnapshot(), { preferences: { locale: 'en', theme: 'light' }, ready: false }),
  )
  unsubscribe()
}).catch(handleRegistrationFailure)
