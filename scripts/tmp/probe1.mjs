import { chromium } from 'playwright-core'
import { join } from 'node:path'

const exe = join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1223/chrome-win64/chrome.exe')
const O = 'http://localhost:4455'

const browser = await chromium.launch({ executablePath: exe })

// ---- 1. Hero visual with JS disabled -------------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${O}/he`, { waitUntil: 'load' })
  const r = await page.evaluate(() => {
    const s = document.querySelector('.screens')
    if (!s) return { found: false }
    const d = s.querySelector('.screen--desktop')
    const p = s.querySelector('.screen--phone')
    const cs = (el) => el ? getComputedStyle(el).backgroundImage : 'NO EL'
    const box = (el) => { const b = el.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top) } }
    return { found: true, desktopBg: cs(d), phoneBg: cs(p), desktopBox: box(d), phoneBox: box(p),
             shotVar: getComputedStyle(d).getPropertyValue('--shot') }
  })
  console.log('NOJS hero:', JSON.stringify(r, null, 1))
  await ctx.close()
}

// ---- 2. Hero visual with JS enabled --------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${O}/he`, { waitUntil: 'networkidle' })
  const r = await page.evaluate(() => {
    const d = document.querySelector('.screen--desktop')
    return { bg: getComputedStyle(d).backgroundImage, cursor: getComputedStyle(d).cursor,
             screensRole: document.querySelector('.screens')?.getAttribute('role'),
             label: document.querySelector('.screens')?.getAttribute('aria-label') }
  })
  console.log('JS hero:', JSON.stringify(r))
  // stats
  const stats = await page.evaluate(() => [...document.querySelectorAll('dl dd')].map(e => e.textContent))
  console.log('stats:', stats)
  await ctx.close()
}

await browser.close()
