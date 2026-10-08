import assert from 'node:assert/strict'
import { test } from 'node:test'
import { en, zh } from '../lib/copy.ts'
import { createSiteI18n, siteTranslation } from '../lib/site-i18n.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'

test('product translation instances initialize in the same locale as their request snapshot', () => {
  const english = createSiteI18n('en')
  const chinese = createSiteI18n('zh-CN')
  assert.ok(Object.is(english.language, 'en'))
  assert.ok(Object.is(chinese.language, 'zh-CN'))
  assert.ok(Object.is(english.t('hero.first'), en['hero.first']))
  assert.ok(Object.is(chinese.t('hero.first'), zh['hero.first']))
  assert.ok(Object.is(chinese.t('meta.description'), zh['meta.description']))
}).catch(handleRegistrationFailure)

test('translation changes stay within their own document instance', async () => {
  const first = createSiteI18n('zh-CN')
  const second = createSiteI18n()
  await second.changeLanguage('zh-CN')
  await first.changeLanguage('en')
  assert.ok(Object.is(first.t('hero.first'), en['hero.first']))
  assert.ok(Object.is(second.t('hero.first'), zh['hero.first']))
}).catch(handleRegistrationFailure)

test('typed product copy follows the root locale while language events catch up', () => {
  const instance = createSiteI18n('en')
  assert.ok(Object.is(siteTranslation(instance, 'zh-CN')('hero.first'), zh['hero.first']))
  instance.addResourceBundle('en', 'unrelated', { 'hero.first': 'Wrong namespace' })
  assert.ok(Object.is(siteTranslation(instance, 'zh-CN')('hero.first', {
    lng: 'en',
    lngs: ['en'],
    ns: 'unrelated',
  }), zh['hero.first']))
  assert.equal(instance.language, 'en')
}).catch(handleRegistrationFailure)
