import type { Preferences } from '../lib/preferences.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDeepStrictEqual } from 'node:util'
import { detectLocale, readPreferences } from '../lib/preferences.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'

const fallback: Preferences = { locale: 'zh-CN', theme: 'dark' }
test('Chinese browser variants use Simplified Chinese; other locales use English', () => {
  for (const locale of [
    'zh',
    'zh-CN',
    'zh-TW',
    'ZH-hans',
  ]) {
    assert.ok(Object.is(detectLocale([locale]), 'zh-CN'))
  }
  assert.ok(Object.is(detectLocale(['fr-FR', 'en-US']), 'en'))
  assert.ok(Object.is(detectLocale([]), 'en'))
}).catch(handleRegistrationFailure)
test('invalid stored values fall back independently', () => {
  for (const value of [
    null,
    [],
    'en',
    42,
  ]) {
    assert.ok(isDeepStrictEqual(readPreferences(value, fallback), fallback))
  }
  assert.ok(
    isDeepStrictEqual(readPreferences({ locale: 'en', theme: 'sepia' }, fallback), {
      locale: 'en',
      theme: 'dark',
    }),
  )
  assert.ok(
    isDeepStrictEqual(readPreferences({ locale: 'de', theme: 'light', unrelated: true }, fallback), {
      locale: 'zh-CN',
      theme: 'light',
    }),
  )
  assert.ok(
    isDeepStrictEqual(readPreferences({ locale: 'en', theme: 'light' }, fallback), {
      locale: 'en',
      theme: 'light',
    }),
  )
}).catch(handleRegistrationFailure)
