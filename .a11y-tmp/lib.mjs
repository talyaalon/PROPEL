import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const BROWSERS = [
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]
export function findBrowser() {
  const f = BROWSERS.find((p) => p && existsSync(p))
  if (!f) throw new Error('no chromium')
  return f
}
export const ORIGIN = 'http://localhost:4455'
export const launch = () => chromium.launch({ executablePath: findBrowser() })

export const ROUTES = [
  '', '/portfolio', '/portfolio/jcafe-kosher', '/services/migration',
  '/blog', '/accessibility', '/privacy',
]

const check = (page) => page.evaluate(() => {
  const s = document.querySelector('.section')
  const padded = s ? parseFloat(getComputedStyle(s).paddingLeft) > 0
    : getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)'
  const sheets = [...document.styleSheets].filter(x => { try { return x.cssRules.length > 0 } catch { return true } }).length
  return padded && sheets > 0
})

/** goto with retry: the shared server on 4455 intermittently drops connections. */
export async function open(page, url) {
  for (let i = 0; i < 12; i++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      if (await check(page)) return
    } catch (e) { /* retry */ }
    await page.waitForTimeout(1500)
  }
  throw new Error('UNSTYLED / unreachable after 5 tries: ' + url)
}

export async function settle(page) {
  if (!(await check(page))) throw new Error('UNSTYLED PAGE')
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')))
  await page.waitForTimeout(300)
}
