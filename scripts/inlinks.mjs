/**
 * Inbound internal links per page, counted on the SERVED HTML.
 *
 * The acceptance test for the internal-linking work: a page in the sitemap
 * with fewer than three inbound links from other pages is a page Google finds
 * by sitemap alone, which is what "crawled, currently not indexed" looked like
 * for /he/portfolio, /en/portfolio and five case studies.
 *
 * Counted on the rendered output rather than by grepping components, because
 * a link that a conditional drops is not a link. Site-wide chrome counts once
 * per linking page, which is the point: the footer is what makes a case study
 * reachable from an article.
 *
 *   node scripts/inlinks.mjs [origin] [--min N]
 */
const origin = (process.argv[2] ?? 'http://localhost:4519').replace(/\/$/, '')
const minIndex = process.argv.indexOf('--min')
const MIN = minIndex > -1 ? Number(process.argv[minIndex + 1]) : 3

const sitemapXml = await (await fetch(`${origin}/sitemap.xml`)).text()
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (urls.length === 0) {
  console.error(`No URLs in ${origin}/sitemap.xml`)
  process.exit(1)
}

/** Absolute site URL -> its path, or null when the URL leaves the site. */
const toPath = (href, base) => {
  try {
    const u = new URL(href, base)
    const site = new URL(urls[0])
    if (u.host !== site.host) return null
    return u.pathname.replace(/\/$/, '') || '/'
  } catch {
    return null
  }
}

const paths = urls.map((u) => new URL(u).pathname.replace(/\/$/, '') || '/')
const inbound = new Map(paths.map((p) => [p, new Set()]))
const broken = new Map()

for (const [i, url] of urls.entries()) {
  const from = paths[i]
  const html = await (await fetch(`${origin}${from}`)).text()
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])

  for (const href of hrefs) {
    // Fragments and non-page schemes are not internal links to a page.
    if (/^(mailto:|tel:|https?:\/\/(?!.*propel)|#)/.test(href)) continue
    const target = toPath(href, url)
    if (target === null) continue
    if (target === from) continue

    if (inbound.has(target)) inbound.get(target).add(from)
    // A locale-prefixed path that is not in the sitemap and is not a metadata
    // route is a link into the 404 page.
    else if (/^\/(he|en)\//.test(target) && !/\/(opengraph-image|twitter-image|icon)$/.test(target)) {
      if (!broken.has(target)) broken.set(target, new Set())
      broken.get(target).add(from)
    }
  }
}

const rows = [...inbound.entries()]
  .map(([path, sources]) => ({ path, count: sources.size }))
  .sort((a, b) => a.count - b.count || a.path.localeCompare(b.path))

const width = Math.max(...rows.map((r) => r.path.length))
console.log(`\nInbound internal links, ${rows.length} pages, minimum ${MIN}\n`)
for (const row of rows) {
  const flag = row.count < MIN ? '  BELOW MINIMUM' : ''
  console.log(`  ${String(row.count).padStart(3)}  ${row.path.padEnd(width)}${flag}`)
}

const failing = rows.filter((r) => r.count < MIN)

if (broken.size > 0) {
  console.log(`\nLinks to paths that are not in the sitemap (these 404):\n`)
  for (const [target, sources] of broken) {
    console.log(`  ${target}  <- ${[...sources].join(', ')}`)
  }
}

console.log(
  `\n${failing.length === 0 ? 'PASS' : 'FAIL'}: ${failing.length} page(s) under ${MIN} inbound links, ${broken.size} broken internal target(s)\n`,
)
process.exit(failing.length === 0 && broken.size === 0 ? 0 : 1)
