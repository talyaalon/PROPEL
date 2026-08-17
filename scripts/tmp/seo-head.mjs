const ORIGIN = 'http://localhost:4455'
const paths = ['', '/portfolio', '/portfolio/jcafe-kosher', '/portfolio/hagorer2', '/portfolio/cnafim-lauf', '/portfolio/bom-recipes', '/portfolio/air-manage', '/services/migration', '/blog', '/accessibility', '/privacy']
const routes = []
for (const lang of ['he','en']) for (const p of paths) routes.push(`/${lang}${p}`)

const out = []
for (const r of routes) {
  const res = await fetch(ORIGIN + r, { redirect: 'manual' })
  const html = await res.text()
  const head = html.slice(0, html.indexOf('</head>'))
  const get = (re) => { const m = head.match(re); return m ? m[1] : null }
  const all = (re) => [...head.matchAll(re)].map(m => m[0])
  const rec = {
    route: r,
    status: res.status,
    title: get(/<title>([^<]*)<\/title>/),
    desc: get(/<meta name="description" content="([^"]*)"/),
    canonical: get(/<link rel="canonical" href="([^"]*)"/),
    hreflang: [...head.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map(m => `${m[1]}=${m[2]}`),
    ogUrl: get(/<meta property="og:url" content="([^"]*)"/),
    ogTitle: get(/<meta property="og:title" content="([^"]*)"/),
    ogType: get(/<meta property="og:type" content="([^"]*)"/),
    ogLocale: get(/<meta property="og:locale" content="([^"]*)"/),
    ogImage: get(/<meta property="og:image" content="([^"]*)"/),
    ogDesc: get(/<meta property="og:description" content="([^"]*)"/),
    twCard: get(/<meta name="twitter:card" content="([^"]*)"/),
    robots: get(/<meta name="robots" content="([^"]*)"/),
    viewport: get(/<meta name="viewport" content="([^"]*)"/),
    htmlLang: (html.match(/<html[^>]*lang="([^"]*)"/)||[])[1],
    htmlDir: (html.match(/<html[^>]*dir="([^"]*)"/)||[])[1],
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => m[1].replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()),
    jsonld: [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]),
    preloads: all(/<link rel="preload"[^>]*>/g),
    bytes: html.length,
  }
  out.push(rec)
}
console.log(JSON.stringify(out, null, 1))
