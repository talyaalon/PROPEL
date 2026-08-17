import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { load } from './goto.mjs'
const exe = [join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe')].find(existsSync)
const browser = await chromium.launch({ executablePath: exe })
for (const locale of ['he','en']) {
 for (const w of [375, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } })
  await load(page, `http://localhost:4455/${locale}`)
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible')))
  await page.waitForTimeout(300)
  const out = await page.evaluate(() => {
    const docH = document.documentElement.scrollHeight
    const heads = [...document.querySelectorAll('h1,h2,h3')].map(h => {
      const cs = getComputedStyle(h)
      return { tag: h.tagName, size: Math.round(parseFloat(cs.fontSize)), weight: cs.fontWeight, font: cs.fontFamily.split(',')[0].replace(/"/g,''),
        y: Math.round(h.getBoundingClientRect().top + window.scrollY),
        text: h.textContent.trim().slice(0, 42) }
    })
    // CTA inventory
    const ctas = [...document.querySelectorAll('a[href^="https://wa.me"],a[href^="tel:"],a[href^="mailto:"],a[href*="#contact"],button[type=submit]')].map(a => ({
      kind: a.getAttribute('href')?.slice(0,26) ?? 'submit',
      y: Math.round(a.getBoundingClientRect().top + window.scrollY),
      fixed: getComputedStyle(a).position === 'fixed' || !!a.closest('[style*="fixed"]') ,
      txt: a.textContent.trim().slice(0,24),
    }))
    return { docH, heads, ctas }
  })
  console.log(`\n### ${locale} @${w}  doc=${out.docH}px = ${(out.docH/900).toFixed(1)} screens(900)`)
  for (const h of out.heads) console.log(`  ${h.tag} ${String(h.size).padStart(3)}px ${h.weight} ${h.font.padEnd(14)} y=${String(h.y).padStart(5)} (${(h.y/out.docH*100).toFixed(0)}%)  ${h.text}`)
  console.log('  --- CTAs ---')
  for (const c of out.ctas) console.log(`   y=${String(c.y).padStart(5)} (${(c.y/out.docH*100).toFixed(0)}%) ${c.fixed?'FIXED ':'      '}${c.kind}  ${c.txt}`)
  await page.close()
 }
}
await browser.close()
