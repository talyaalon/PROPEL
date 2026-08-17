import { chromium } from 'playwright-core'
import { join } from 'node:path'
const exe = join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1223/chrome-win64/chrome.exe')
const O = 'http://localhost:4455'
const browser = await chromium.launch({ executablePath: exe })
for (const [loc, w, pct] of [['he',320,100],['he',320,200],['en',320,200],['he',375,200],['he',1440,100]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } })
  const page = await ctx.newPage()
  await page.goto(`${O}/${loc}`, { waitUntil: 'load' })
  await page.evaluate(p => { if (p!==100) document.documentElement.style.fontSize = p+'%' }, pct)
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => {
    const dl = document.querySelector('dl')
    const cells = [...dl.children].map(c => {
      const dd = c.querySelector('dd'); const p = c.querySelector('p')
      const b = c.getBoundingClientRect(); const db = dd.getBoundingClientRect()
      const range = document.createRange(); range.selectNodeContents(dd)
      const tb = range.getBoundingClientRect()
      return { cell: Math.round(b.width), left: Math.round(b.left), right: Math.round(b.right),
               ddText: dd.textContent, textW: Math.round(tb.width), textL: Math.round(tb.left), textR: Math.round(tb.right),
               fs: getComputedStyle(dd).fontSize,
               label: p.textContent, labelH: Math.round(p.getBoundingClientRect().height) }
    })
    return { dlTop: Math.round(dl.getBoundingClientRect().top), cells }
  })
  console.log(`--- ${loc} ${w}px @${pct}%`)
  for (const c of r.cells) console.log('   ', JSON.stringify(c))
  await ctx.close()
}
await browser.close()
