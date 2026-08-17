import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { load } from './goto.mjs'
const exe = [join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe')].find(existsSync)
const browser = await chromium.launch({ executablePath: exe })

for (const locale of ['he','en']) {
 for (const w of [1440, 1024, 768, 375]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } })
  await load(page, `http://localhost:4455/${locale}`)
  const m = await page.evaluate(() => {
    const R = (el) => el ? (({x,y,width,height,top,bottom,left,right}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height),t:Math.round(top),b:Math.round(bottom),l:Math.round(left),r:Math.round(right)}))(el.getBoundingClientRect()) : null
    const hero = document.querySelector('section')
    const grid = hero.querySelector('.grid')
    const cols = [...grid.children]
    const h1 = hero.querySelector('h1')
    const focusSpan = h1.querySelector('span.relative.inline-block')
    const wash = focusSpan ? focusSpan.querySelector('span[class*="accentWash"]') : null
    const focusText = focusSpan ? focusSpan.querySelector('span.relative.z-10') : null
    const phone = hero.querySelector('.phone')
    const brow = hero.querySelector('.browser')
    const dl = hero.querySelector('dl')
    const cta = hero.querySelector('a[data-analytics="whatsapp:hero"]')
    const cs = getComputedStyle(h1)
    let lines = []
    if (focusText) {
      const range = document.createRange(); range.selectNodeContents(focusText)
      lines = [...range.getClientRects()].map(r => ({x:Math.round(r.x), w:Math.round(r.width), y:Math.round(r.y)}))
    }
    return {
      heroH: Math.round(hero.getBoundingClientRect().height),
      h1: R(h1), fs: cs.fontSize, font: cs.fontFamily.split(',')[0], tt: cs.textTransform,
      colWords: R(cols[0]), colWork: R(cols[1]),
      focusSpan: R(focusSpan), wash: R(wash), focusLines: lines,
      phone: R(phone), browser: R(brow), dl: R(dl), cta: R(cta),
      docW: document.documentElement.scrollWidth, winW: window.innerWidth,
      align: getComputedStyle(grid).alignItems,
    }
  })
  console.log(`\n### ${locale} @${w}  heroH=${m.heroH} h1=${m.fs} ${m.font} ${m.tt} align=${m.align} doc=${m.docW}/${m.winW}`)
  console.log(' words col', JSON.stringify(m.colWords))
  console.log(' work  col', JSON.stringify(m.colWork))
  console.log(' h1       ', JSON.stringify(m.h1))
  console.log(' focusSpan', JSON.stringify(m.focusSpan))
  console.log(' wash     ', JSON.stringify(m.wash))
  console.log(' lines    ', JSON.stringify(m.focusLines))
  console.log(' phone    ', JSON.stringify(m.phone))
  console.log(' browser  ', JSON.stringify(m.browser))
  console.log(' cta      ', JSON.stringify(m.cta))
  console.log(' dl       ', JSON.stringify(m.dl))
  await page.close()
 }
}
await browser.close()
