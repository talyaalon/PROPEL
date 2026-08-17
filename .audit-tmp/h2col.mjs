import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { load } from './goto.mjs'
const exe = [join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe')].find(existsSync)
const browser = await chromium.launch({ executablePath: exe })
for (const theme of ['light','dark']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await load(page, 'http://localhost:4455/he')
  await page.evaluate((t)=>document.documentElement.setAttribute('data-theme',t), theme)
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible')))
  await page.waitForTimeout(300)
  const rows = await page.evaluate(() => [...document.querySelectorAll('h1,h2')].map(h => ({
    tag: h.tagName, size: getComputedStyle(h).fontSize, color: getComputedStyle(h).color,
    txt: h.textContent.trim().slice(0,30),
  })))
  console.log('\n== theme', theme)
  for (const r of rows) console.log(` ${r.tag} ${r.size.padEnd(9)} ${r.color.padEnd(20)} ${r.txt}`)
  await page.close()
}
await browser.close()
