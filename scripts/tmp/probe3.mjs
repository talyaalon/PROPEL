import { chromium } from 'playwright-core'
import { join } from 'node:path'
const exe = join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1223/chrome-win64/chrome.exe')
const O = 'http://localhost:4455'
const browser = await chromium.launch({ executablePath: exe })

const routes = ['/he', '/en', '/he/portfolio', '/he/blog', '/he/accessibility', '/en/services/migration']
for (const w of [320, 375]) {
  for (const pct of [100, 150, 200]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 780 } })
    const page = await ctx.newPage()
    for (const r of routes) {
      await page.goto(O + r, { waitUntil: 'load' })
      await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-visible')))
      await page.evaluate((p) => { if (p !== 100) document.documentElement.style.fontSize = p + '%' }, pct)
      await page.waitForTimeout(150)
      const res = await page.evaluate(() => {
        const de = document.documentElement
        const over = de.scrollWidth - de.clientWidth
        let worst = null
        if (over > 0) {
          const vw = de.clientWidth
          const rtl = de.dir === 'rtl'
          for (const el of document.querySelectorAll('body *')) {
            const b = el.getBoundingClientRect()
            if (b.width === 0) continue
            const spill = rtl ? Math.round(-b.left) : Math.round(b.right - vw)
            if (spill > 1 && (!worst || spill > worst.spill)) {
              worst = { spill, tag: el.tagName, cls: (el.className && String(el.className)).slice(0, 70), txt: (el.textContent||'').trim().slice(0,40) }
            }
          }
        }
        return { over, worst }
      })
      if (res.over > 0) console.log(`${w}px @${pct}%  ${r}  overflow=${res.over}px`, JSON.stringify(res.worst))
    }
    await ctx.close()
  }
}
console.log('done')
await browser.close()
