import { launch, ORIGIN, ROUTES, settle, open } from './lib.mjs'
const ch = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const L = ([r,g,b]) => 0.2126*ch(r)+0.7152*ch(g)+0.0722*ch(b)
const ratio = (a,b) => { const [hi,lo]=[L(a),L(b)].sort((p,q)=>q-p); return (hi+0.05)/(lo+0.05) }
const MODES = [
  { name: 'light  ', theme:null, hc:false },
  { name: 'dark   ', theme:'dark', hc:false },
  { name: 'lightHC', theme:null, hc:true },
  { name: 'darkHC ', theme:'dark', hc:true },
]
const browser = await launch()
const rows = new Map()
for (const locale of ['he','en']) {
for (const route of ROUTES) {
  for (const m of MODES) {
    const page = await browser.newPage({ viewport:{width:1440,height:900} })
    try {
    await open(page, `${ORIGIN}/${locale}${route}`)
    await page.evaluate(({theme,hc}) => { if(theme) document.documentElement.setAttribute('data-theme',theme); if(hc) document.documentElement.setAttribute('data-a11y-contrast','') }, m)
    await settle(page)
    const list = await page.evaluate(() => {
      const parse = s => (s.match(/[\d.]+/g)??[]).slice(0,3).map(Number)
      const alpha = s => { const p=(s.match(/[\d.]+/g)??[]).map(Number); return p.length>3?p[3]:1 }
      const blend = (fg,a,bg)=>fg.map((c,i)=>c*a+bg[i]*(1-a))
      const backdrop = (el,skipSelf) => {
        let acc=null
        for (let n = skipSelf ? el.parentElement : el; n; n = n.parentElement) {
          const c = getComputedStyle(n).backgroundColor; const a = alpha(c)
          if (a===0) continue
          const rgb = parse(c)
          if (acc===null) acc={rgb,a}; else acc={rgb:blend(acc.rgb,acc.a,rgb),a:1}
          if (acc.a>=1) return acc.rgb
        }
        return acc?blend(acc.rgb,acc.a,[255,255,255]):[255,255,255]
      }
      const out=[]
      const els=[...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')]
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.width===0||r.height===0) continue
        if (getComputedStyle(el).display==='none') continue
        el.focus()
        const cs = getComputedStyle(el)
        out.push({
          key: el.tagName+'|'+String(el.className||'').slice(0,34),
          name: (el.getAttribute('aria-label')||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,30),
          ring: parse(cs.outlineColor), width: cs.outlineWidth, style: cs.outlineStyle,
          behind: backdrop(el, true),
          onself: backdrop(el, false),
        })
      }
      return out
    })
    for (const s of list) {
      if (s.style === 'none' || parseFloat(s.width) === 0) {
        const k = 'NO-RING '+s.key
        const rec = rows.get(k)||{k,worst:0,name:s.name,where:[]}
        rec.where.push(`${locale}${route||'/'}:${m.name}`); rows.set(k,rec); continue
      }
      const r = ratio(s.ring, s.behind)
      if (r < 3) {
        const k = s.key
        const rec = rows.get(k)||{k,worst:99,name:s.name,where:[]}
        rec.worst = Math.min(rec.worst,r); rec.ring=s.ring; rec.behind=s.behind
        rec.where.push(`${locale}${route||'/'}:${m.name}:${r.toFixed(2)}`); rows.set(k,rec)
      }
    }
    } catch(e) { console.log('SKIP '+locale+route+' '+m.name+': '+e.message) }
    await page.close()
  }
}
}
console.log('\n===== FOCUS INDICATOR < 3:1 or ABSENT (1.4.11 / 2.4.7) =====')
for (const f of [...rows.values()].sort((a,b)=>a.worst-b.worst)) {
  console.log(`\n${(f.worst===99?'  n/a':f.worst.toFixed(2)+':1')}  ${f.k}  "${f.name}"`)
  if (f.ring) console.log(`   ring=${f.ring.map(Math.round)} behind=${f.behind.map(Math.round)}`)
  console.log(`   ${[...new Set(f.where)].slice(0,8).join('  ')}`)
}
if (!rows.size) console.log('  none - every focus ring >= 3:1 in all four modes')
await browser.close()
