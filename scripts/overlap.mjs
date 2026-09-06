// 8-gram shingle overlap between the homepage and each service page.
// Two numbers per page: full body text, and <main> only (shared nav/footer removed).
const BASE = process.argv[2] || 'https://propel.co.il'
const pages = ['/he/services/websites','/he/services/automation','/he/services/management-systems','/he/services/ecommerce','/he/services/migration','/he/portfolio','/he/blog']
function text(html, mainOnly) {
  let h = html
  if (mainOnly) { const m = h.match(/<main[\s\S]*?<\/main>/); h = m ? m[0] : h }
  h = h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ')
  h = h.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&nbsp;/g,' ')
  return h.replace(/\s+/g,' ').trim().split(' ').filter(Boolean)
}
function shingles(words, n=8) { const s = new Set(); for (let i=0;i+n<=words.length;i++) s.add(words.slice(i,i+n).join(' ')); return s }
const home = await (await fetch(`${BASE}/he`)).text()
const hw = text(home,false), hm = text(home,true)
console.log(`homepage words: full=${hw.length} main=${hm.length}`)
const hs = shingles(hw), hms = shingles(hm)
for (const p of pages) {
  const html = await (await fetch(`${BASE}${p}`)).text()
  const w = text(html,false), m = text(html,true)
  const s = shingles(w), ms = shingles(m)
  let a=0; for (const x of s) if (hs.has(x)) a++
  let b=0; for (const x of ms) if (hms.has(x)) b++
  console.log(`${p.padEnd(36)} words=${String(w.length).padStart(5)} full-overlap=${(100*a/s.size).toFixed(1).padStart(5)}%  | main-only words=${String(m.length).padStart(5)} overlap=${(100*b/Math.max(ms.size,1)).toFixed(1).padStart(5)}%`)
}
