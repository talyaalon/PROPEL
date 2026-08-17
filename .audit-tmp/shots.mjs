import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
const exe = [join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => p && existsSync(p))
const ORIGIN = 'http://localhost:4455'
const OUT = '.audit-tmp/shots'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: exe })

async function shoot(locale, theme, vp) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } })
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(`${ORIGIN}/${locale}`, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle')
    const ok = await page.evaluate(() => {
      const s = document.querySelector('.section')
      return s ? parseFloat(getComputedStyle(s).paddingLeft) > 0 : false
    })
    if (ok) break
    console.log('UNSTYLED, retrying', locale, theme, vp.n)
    await page.waitForTimeout(1000)
  }
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')))
  await page.waitForTimeout(1200)
  const pad = await page.evaluate(() => getComputedStyle(document.querySelector('.section')).paddingLeft)
  const tag = `${locale}-${theme}-${vp.n}`
  console.log(tag, 'section padding', pad)
  await page.screenshot({ path: `${OUT}/${tag}-fold.png` })
  const hero = await page.$('section')
  if (hero) await hero.screenshot({ path: `${OUT}/${tag}-hero.png` })
  await page.close()
}

for (const locale of ['he', 'en'])
  for (const theme of ['light', 'dark'])
    for (const vp of [{ n: '375', w: 375, h: 812 }, { n: '1440', w: 1440, h: 900 }])
      await shoot(locale, theme, vp)

await browser.close()
console.log('done')
