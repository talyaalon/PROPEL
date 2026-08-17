import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
const exe = [join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => p && existsSync(p))
console.log('exe', exe)
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('response', (r) => { if (r.url().includes('.css')) console.log('CSS', r.status(), r.url()) })
page.on('requestfailed', (r) => console.log('FAILED', r.url(), r.failure()?.errorText))
await page.goto('http://localhost:4455/he', { waitUntil: 'networkidle' })
const info = await page.evaluate(() => ({
  sheets: [...document.styleSheets].map((s) => { try { return [s.href, s.cssRules.length] } catch { return [s.href, 'X'] } }),
  pad: getComputedStyle(document.querySelector('.section')).paddingLeft,
  links: [...document.querySelectorAll('link')].map((l) => l.rel + ' ' + l.href),
}))
console.log(JSON.stringify(info, null, 1))
await browser.close()
