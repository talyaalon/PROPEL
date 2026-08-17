import { launch, ORIGIN, ROUTES, settle, open } from './lib.mjs'

const ch = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const L = ([r, g, b]) => 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
const ratio = (a, b) => { const [hi, lo] = [L(a), L(b)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05) }

const MODES = [
  { name: 'light', theme: null, hc: false },
  { name: 'dark ', theme: 'dark', hc: false },
  { name: 'lightHC', theme: null, hc: true },
  { name: 'darkHC ', theme: 'dark', hc: true },
]

const browser = await launch()
const fails = new Map()
for (const locale of ['he', 'en']) {
  for (const route of ROUTES) {
    for (const m of MODES) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      try {
      await open(page, `${ORIGIN}/${locale}${route}`)
      await page.evaluate(({ theme, hc }) => {
        if (theme) document.documentElement.setAttribute('data-theme', theme)
        if (hc) document.documentElement.setAttribute('data-a11y-contrast', '')
      }, m)
      await settle(page)
      await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true))
      await page.waitForTimeout(200)

      const samples = await page.evaluate(() => {
        const parse = (s) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
        const alpha = (s) => { const p = (s.match(/[\d.]+/g) ?? []).map(Number); return p.length > 3 ? p[3] : 1 }
        const blend = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a))
        const backdrop = (el) => {
          let acc = null
          for (let n = el; n; n = n.parentElement) {
            const cs = getComputedStyle(n)
            const c = cs.backgroundColor
            const a = alpha(c)
            if (a === 0) continue
            const rgb = parse(c)
            if (acc === null) acc = { rgb, a }
            else acc = { rgb: blend(acc.rgb, acc.a, rgb), a: 1 }
            if (acc.a >= 1) return acc.rgb
          }
          return acc ? blend(acc.rgb, acc.a, [255,255,255]) : [255, 255, 255]
        }
        const out = []
        const seen = new Set()
        const push = (el, extra, pseudo) => {
          const cs = getComputedStyle(el, pseudo)
          const size = parseFloat(cs.fontSize)
          const weight = Number(cs.fontWeight) || 400
          const a = alpha(cs.color)
          const bg = backdrop(el)
          const fg = a < 1 ? blend(parse(cs.color), a, bg) : parse(cs.color)
          const txt = (el.textContent||'').trim().replace(/\s+/g,' ').slice(0,34)
          const key = el.tagName + '|' + String(el.className).slice(0,26) + '|' + (pseudo||'') + '|' + cs.color + '|' + JSON.stringify(bg)
          if (seen.has(key)) return
          seen.add(key)
          out.push({ tag: el.tagName, cls: String(el.className||'').slice(0,34), txt, fg, bg, size, weight,
            large: size >= 24 || (size >= 18.66 && weight >= 700), pseudo: pseudo||'', extra: extra||'' })
        }
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el)
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
          if (el.closest('[aria-hidden="true"]')) continue
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          // only elements with their own direct text
          const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)
          if (own) push(el)
          if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.getAttribute('placeholder')) push(el, 'placeholder', '::placeholder')
        }
        return out
      })

      for (const s of samples) {
        const r = ratio(s.fg, s.bg)
        const need = s.large ? 3 : 4.5
        if (r < need) {
          const key = `${s.tag}.${s.cls}${s.pseudo} ${s.extra}`
          const rec = fails.get(key) || { key, worst: 99, where: [], txt: s.txt, size: s.size, weight: s.weight, need }
          rec.worst = Math.min(rec.worst, r)
          rec.where.push(`${locale}${route||'/'}:${m.name}:${r.toFixed(2)}`)
          rec.fg = s.fg; rec.bg = s.bg
          fails.set(key, rec)
        }
      }
      } catch (e) { console.log('SKIP ' + locale + route + ' ' + m.name + ': ' + e.message) }
      await page.close()
    }
  }
}
console.log('\n===== TEXT CONTRAST FAILURES (1.4.3) =====')
for (const f of [...fails.values()].sort((a,b)=>a.worst-b.worst)) {
  console.log(`\n${f.worst.toFixed(2)}:1  needs ${f.need}  ${f.key}`)
  console.log(`   text "${f.txt}"  ${f.size}px/${f.weight}  fg=${f.fg?.map(Math.round)} bg=${f.bg?.map(Math.round)}`)
  console.log(`   ${f.where.slice(0,10).join('  ')}${f.where.length>10?' …'+f.where.length+' total':''}`)
}
if (!fails.size) console.log('  none')
await browser.close()
