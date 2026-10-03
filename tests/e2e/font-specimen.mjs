import { expect } from '@playwright/test'

export function watchErrors(page) {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  return errors
}

export async function addFontSpecimen(page) {
  await expect(page.getByRole('button', { name: /Appearance|外观/u, exact: true })).toBeEnabled()
  await page.evaluate(() => {
    const section = document.createElement('section')
    section.setAttribute('aria-label', 'Multilingual font verification specimen')
    section.innerHTML = `
      <h2>Multilingual font specimen</h2>
      <p id="font-en" lang="en">English Noto language and real font weights</p>
      <p id="font-zh" lang="zh-CN">简体中文字体与标点，语言选择。</p>
      <p id="font-ja" lang="ja">日本語の文字と句読点、言語選択。</p>
      <p id="font-ko" lang="ko">한국어 글꼴과 문장 부호, 언어 선택.</p>
      <p id="font-bold" lang="zh-CN"><strong>中文真实字重</strong></p>
      <p id="font-mixed">English 😀 简体中文</p>
      <p><span id="emoji-face" class="ztd-emoji">😀</span></p>
      <p><span id="emoji-heart" class="ztd-emoji">❤️</span></p>
      <p><span id="emoji-technologist" class="ztd-emoji">👩🏽‍💻</span></p>
      <p><span id="emoji-family" class="ztd-emoji">👨‍👩‍👧‍👦</span></p>
      <p><span id="emoji-rainbow" class="ztd-emoji">🏳️‍🌈</span></p>
      <p><span id="emoji-flag" class="ztd-emoji">🇨🇳</span></p>`
    section.querySelector('strong').style.fontWeight = '600'
    document.querySelector('main').append(section)
    section.getBoundingClientRect()
  })
  await page.evaluate(async () => document.fonts.ready)
}

export async function renderedFonts(session, selector) {
  const { root } = await session.send('DOM.getDocument')
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector })
  return (await session.send('CSS.getPlatformFontsForNode', { nodeId })).fonts
}

export async function fontSession(page) {
  const session = await page.context().newCDPSession(page)
  await session.send('DOM.enable')
  await session.send('CSS.enable')
  return session
}

export async function renderedWeight(page) {
  return page.locator('#font-bold strong').evaluate((node) => {
    const canvas = document.createElement('canvas').getContext('2d')
    const widths = [400, 600].map((weight) => {
      canvas.font = `${weight} 24px "Noto Sans"`
      return canvas.measureText('English Noto weight').width
    })
    const faces = Array.from(document.fonts).filter(face => face.weight === '600' && face.status === 'loaded')
    return {
      weight: getComputedStyle(node).fontWeight,
      synthesis: getComputedStyle(node).fontSynthesis,
      faces: faces.map(face => ({ family: face.family, weight: face.weight })),
      widths,
    }
  })
}
