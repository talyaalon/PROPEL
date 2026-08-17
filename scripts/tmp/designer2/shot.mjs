import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const BROWSERS = [
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
]
const exe = BROWSERS.find((p) => p && existsSync(p))
const ORIGIN = 'http://localhost:4455'
const OUT = 'scripts/tmp/designer2/shots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: exe })

const combos = []
for (const locale of ['he', 'en'])
  for (const theme of ['light', 'dark'])
    for (const vp of [ { w: 375, h: 812 }, { w: 1440, h: 900 } ])
      combos.push({ locale, theme, ...vp })

for (const c of combos) {
  const page = await browser.newPage({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: 1 })
  await page.emulateMedia({ colorScheme: c.theme === 'dark' ? 'dark' : 'light' })
  await page.goto(`${ORIGIN}/${c.locale}`, { waitUntil: 'networkidle' })
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), c.theme)
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')))
  await page.waitForTimeout(700)
  const name = `${c.locale}-${c.theme}-${c.w}`
  await page.screenshot({ path: `${OUT}/${name}-fold.png` })
  // hero section full
  const hero = page.locator('section.header-band').first()
  await hero.screenshot({ path: `${OUT}/${name}-hero.png` })
  await page.close()
}
await browser.close()
console.log('done')
