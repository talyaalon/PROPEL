/**
 * Inbound internal links per page, counted on the SERVED HTML.
 *
 * The acceptance test for the internal-linking work: a page in the sitemap
 * with fewer than three inbound links from other pages is a page Google finds
 * by sitemap alone, which is what "crawled, currently not indexed" looked like
 * for /he/portfolio, /en/portfolio and five case studies.
 *
 * Counted on the rendered output rather than by grepping components, because
 * a link that a conditional drops is not a link.
 *
 * **Two counts, and the second is the one that can fail.**
 *
 * The first version of this script counted every link on the page, site-wide
 * chrome included, and reported a flat 21 inbound for all 42 URLs. That number
 * is real but it is not a test: the footer links to every page from every
 * page, so the minimum was satisfied before any editorial link existed and the
 * check could not fail. A Search Console audit found eight portfolio URLs
 * still unindexed while this script reported PASS, which is exactly the shape
 * of a green test measuring the wrong thing.
 *
 * So chrome links and editorial links are counted separately. `chrome` is any
 * link outside `<main>` - the navigation, the footer, the skip link. `main` is
 * a link from inside another page's `<main>`, which is the one Google weighs
 * and the one a human actually follows from a sentence. The minimum applies to
 * the editorial count; the total is printed beside it as context.
 *
 *   node scripts/inlinks.mjs [origin] [--min N]
 */
const origin = (process.argv[2] ?? 'http://localhost:4519').replace(/\/$/, '')
const minIndex = process.argv.indexOf('--min')
const MIN = minIndex > -1 ? Number(process.argv[minIndex + 1]) : 3

/**
 * Paths a visitor is meant to reach through site chrome, not through a sentence.
 *
 * The homepage is what the logo points at from every page. The legal documents
 * are what the footer exists to carry, and a marketing page that worked a link
 * to the privacy policy into its prose would be a strange page. Holding these
 * to an editorial minimum would make the check fail permanently on pages that
 * are linked correctly, which is the fastest way to teach everyone to ignore it.
 *
 * Everything NOT listed here is a page someone should have a reason to link to.
 * `/services` is the case that motivated the list: it sits in the navigation and
 * the footer and had zero links from anybody's prose, which is how a commercial
 * hub with five children ends up with nothing pointing at it but a sitemap.
 */
const CHROME_LINKED = new Set(['', '/privacy', '/accessibility', '/terms'])

/** The locale-stripped path, so the allowlist is written once and not per language. */
const withoutLocale = (path) => path.replace(/^\/(he|en)/, '')

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

const hrefsIn = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])

const paths = urls.map((u) => new URL(u).pathname.replace(/\/$/, '') || '/')
const inbound = new Map(paths.map((p) => [p, { main: new Set(), chrome: new Set() }]))
const broken = new Map()
const noMain = []

for (const [i, url] of urls.entries()) {
  const from = paths[i]
  const html = await (await fetch(`${origin}${from}`)).text()

  /*
   * Split the document at the main landmark. A page with no <main> is a bug in
   * its own right, so say so rather than silently counting everything as
   * chrome and reporting a healthy-looking zero.
   */
  const open = html.search(/<main[^>]*>/i)
  const close = html.search(/<\/main>/i)
  const hasMain = open > -1 && close > open
  if (!hasMain) noMain.push(from)

  const mainHtml = hasMain ? html.slice(open, close) : ''
  const chromeHtml = hasMain ? html.slice(0, open) + html.slice(close) : html

  const record = (href, bucket) => {
    // Fragments and non-page schemes are not internal links to a page.
    if (/^(mailto:|tel:|https?:\/\/(?!.*propel)|#)/.test(href)) return
    const target = toPath(href, url)
    if (target === null || target === from) return

    if (inbound.has(target)) inbound.get(target)[bucket].add(from)
    // A locale-prefixed path that is not in the sitemap and is not a metadata
    // route is a link into the 404 page.
    else if (/^\/(he|en)\//.test(target) && !/\/(opengraph-image|twitter-image|icon)$/.test(target)) {
      if (!broken.has(target)) broken.set(target, new Set())
      broken.get(target).add(from)
    }
  }

  for (const href of hrefsIn(mainHtml)) record(href, 'main')
  for (const href of hrefsIn(chromeHtml)) record(href, 'chrome')
}

const rows = [...inbound.entries()]
  .map(([path, sets]) => ({
    path,
    main: sets.main.size,
    chrome: sets.chrome.size,
    sources: [...sets.main],
    chromeLinked: CHROME_LINKED.has(withoutLocale(path)),
  }))
  .sort((a, b) => a.main - b.main || a.path.localeCompare(b.path))

const width = Math.max(...rows.map((r) => r.path.length))
console.log(`\nInbound internal links, ${rows.length} pages. Editorial minimum ${MIN}.\n`)
console.log(`  ${'main'.padStart(4)} ${'chrome'.padStart(6)}  ${'path'.padEnd(width)}`)
for (const row of rows) {
  const flag = row.chromeLinked ? '  chrome by design' : row.main < MIN ? '  BELOW MINIMUM' : ''
  console.log(
    `  ${String(row.main).padStart(4)} ${String(row.chrome).padStart(6)}  ${row.path.padEnd(width)}${flag}`,
  )
}

const failing = rows.filter((r) => !r.chromeLinked && r.main < MIN)

if (failing.length > 0) {
  console.log(`\nPages under ${MIN} editorial inbound links, and who does link to them:\n`)
  for (const row of failing) {
    console.log(`  ${row.path}  <- ${row.sources.length ? row.sources.join(', ') : 'nothing but site chrome'}`)
  }
}

if (noMain.length > 0) {
  console.log(`\nPages with no <main> landmark (counted entirely as chrome):\n`)
  for (const path of noMain) console.log(`  ${path}`)
}

if (broken.size > 0) {
  console.log(`\nLinks to paths that are not in the sitemap (these 404):\n`)
  for (const [target, sources] of broken) {
    console.log(`  ${target}  <- ${[...sources].join(', ')}`)
  }
}

console.log(
  `\n${failing.length === 0 && broken.size === 0 && noMain.length === 0 ? 'PASS' : 'FAIL'}: ` +
    `${failing.length} page(s) under ${MIN} editorial inbound links, ` +
    `${broken.size} broken internal target(s), ${noMain.length} page(s) with no main landmark\n`,
)
process.exit(failing.length === 0 && broken.size === 0 && noMain.length === 0 ? 0 : 1)
