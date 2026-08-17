import { launch, ORIGIN, ROUTES, settle } from './lib.mjs'

const browser = await launch()
const W = Number(process.argv[2] || 1440)
for (const locale of ['he', 'en']) {
  for (const route of ROUTES) {
    const url = `${ORIGIN}/${locale}${route}`
    const page = await browser.newPage({ viewport: { width: W, height: 900 } })
    await page.goto(url, { waitUntil: 'networkidle' })
    await settle(page)
    await page.evaluate(() => { document.body.setAttribute('tabindex','-1'); document.body.focus(); document.body.removeAttribute('tabindex') })
    const stops = []
    const seen = new Set()
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(45)
      const s = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body || el === document.documentElement) return null
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        // does the focus ring get clipped by an overflow ancestor?
        let clipped = null
        const ring = { top: r.top - 5, bottom: r.bottom + 5, left: r.left - 5, right: r.right + 5 }
        for (let n = el.parentElement; n; n = n.parentElement) {
          const st = getComputedStyle(n)
          if (st.overflow === 'visible' && st.overflowX === 'visible' && st.overflowY === 'visible') continue
          if (st.overflow === 'auto' || st.overflowY === 'auto' || st.overflow==='scroll') continue
          const nr = n.getBoundingClientRect()
          if (ring.top < nr.top - 0.5 || ring.bottom > nr.bottom + 0.5 || ring.left < nr.left - 0.5 || ring.right > nr.right + 0.5) {
            clipped = (n.className && String(n.className).slice(0,40)) || n.tagName
            break
          }
        }
        const label = el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') ? document.getElementById(el.getAttribute('aria-labelledby'))?.textContent : '') || el.textContent || el.getAttribute('title') || ''
        return {
          tag: el.tagName,
          id: el.id,
          cls: String(el.className || '').slice(0, 30),
          name: label.trim().replace(/\s+/g, ' ').slice(0, 46),
          href: el.getAttribute('href') || '',
          op: cs.opacity, vis: cs.visibility,
          inert: !!el.closest('[inert]'),
          hidden: !!el.closest('[aria-hidden="true"]'),
          zero: r.width === 0 || r.height === 0,
          off: r.bottom < 0 || r.top > (window.innerHeight + document.documentElement.scrollTop*0),
          outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor,
          clipped,
          rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        }
      })
      if (!s) { stops.push({ END: 'focus left to body/document at step ' + (i+1) }); break }
      const key = s.tag + '|' + s.name + '|' + s.href + '|' + s.rect.join(',')
      if (seen.has(key) && stops.length > 3) { stops.push({ END: 'WRAPPED (repeat of earlier stop) at ' + (i+1) }); break }
      seen.add(key)
      stops.push(s)
    }
    console.log(`\n##### ${locale}${route || '/'}  @${W}`)
    stops.forEach((s, i) => {
      if (s.END) return console.log(`   -- ${s.END}`)
      const flags = [
        s.op === '0' ? 'OPACITY-0' : '', s.vis === 'hidden' ? 'VIS-HIDDEN' : '',
        s.inert ? 'inert' : '', s.hidden ? 'ARIA-HIDDEN' : '', s.zero ? 'ZERO-SIZE' : '',
        !s.name ? 'NO-NAME' : '', s.outline.startsWith('0px') ? 'NO-OUTLINE' : '',
        s.clipped ? 'CLIPPED-BY:' + s.clipped : '',
      ].filter(Boolean).join(' ')
      console.log(`  ${String(i + 1).padStart(3)} ${s.tag.padEnd(6)} ${s.name.padEnd(48)} ${s.href.slice(0,28).padEnd(28)} ${flags}`)
    })
    await page.close()
  }
}
await browser.close()
