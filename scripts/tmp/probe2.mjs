import { chromium } from 'playwright-core'
import { join } from 'node:path'
const exe = join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1223/chrome-win64/chrome.exe')
const O = 'http://localhost:4455'
const browser = await chromium.launch({ executablePath: exe })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 } })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR:', e.message))
page.on('console', m => { if (m.type()==='error') console.log('CONSOLE ERR:', m.text()) })

const snap = () => page.evaluate(() => ({
  overflow: document.body.style.overflow,
  inertCount: [...document.body.children].filter(n => n.hasAttribute('inert')).length,
  bodyKids: [...document.body.children].map(n => n.tagName + (n.id?'#'+n.id:'') + (n.hasAttribute('inert')?'[inert]':'')),
  drawer: !!document.getElementById('mobile-menu'),
  scrollY: window.scrollY,
}))

await page.goto(`${O}/he`, { waitUntil: 'networkidle' })
console.log('initial     ', JSON.stringify(await snap()))

// --- open drawer
await page.click('button[aria-controls="mobile-menu"]')
await page.waitForTimeout(200)
console.log('drawer open ', JSON.stringify(await snap()))

// --- rotate to landscape >=768
await page.setViewportSize({ width: 900, height: 400 })
await page.waitForTimeout(300)
console.log('after rotate', JSON.stringify(await snap()))

// --- back to phone, open again, press Escape
await page.setViewportSize({ width: 390, height: 780 })
await page.waitForTimeout(200)
await page.click('button[aria-controls="mobile-menu"]')
await page.waitForTimeout(150)
await page.keyboard.press('Escape')
await page.waitForTimeout(200)
console.log('after esc   ', JSON.stringify(await snap()))
console.log('focus after esc:', await page.evaluate(() => document.activeElement?.outerHTML?.slice(0,90)))

// --- open drawer then click the LOGO link (no onNavigate)
await page.click('button[aria-controls="mobile-menu"]')
await page.waitForTimeout(150)
const before = await snap()
await page.click('header a[aria-label]')
await page.waitForTimeout(600)
console.log('logo click before/after:', JSON.stringify(before), '=>', JSON.stringify(await snap()))

await browser.close()
