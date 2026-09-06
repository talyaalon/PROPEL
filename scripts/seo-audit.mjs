/**
 * Per-page SEO conformance, measured on the SERVED HTML.
 *
 *   node scripts/seo-audit.mjs [origin]
 *
 * Reads the sitemap, fetches every URL in it, and checks the things that are
 * true or false about a page rather than the things that are a matter of
 * taste. Every rule below is one a search engine or a validator actually
 * applies; nothing here scores a page out of a hundred.
 *
 * It reads the rendered output rather than the components, for the same reason
 * scripts/inlinks.mjs does: a tag a conditional drops is not a tag, and this
 * repository has twice shipped metadata that was correct in source and absent
 * in the response.
 *
 * Exits non-zero when any FAIL is present. WARN lines are reported and do not
 * fail the run - they are the judgement calls, and a build should not break
 * on one.
 */

const origin = (process.argv[2] ?? 'http://localhost:4523').replace(/\/$/, '')

const TITLE = { min: 30, max: 60 }
const DESCRIPTION = { min: 120, max: 158 }

const sitemapXml = await (await fetch(`${origin}/sitemap.xml`)).text()
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (urls.length === 0) {
  console.error(`No URLs in ${origin}/sitemap.xml`)
  process.exit(1)
}
const sitemapPaths = new Set(urls.map((u) => new URL(u).pathname.replace(/\/$/, '') || '/'))

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const rows = []
let failures = 0
let warnings = 0

for (const url of urls) {
  const path = new URL(url).pathname
  const response = await fetch(`${origin}${path}`)
  const html = await response.text()
  const fail = []
  const warn = []

  if (response.status !== 200) fail.push(`status ${response.status}`)

  // ── title ──────────────────────────────────────────────────────────────
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? '')
  if (!title) fail.push('no <title>')
  else if (title.length < TITLE.min || title.length > TITLE.max)
    warn.push(`title ${title.length} chars (want ${TITLE.min}-${TITLE.max})`)

  // ── description ────────────────────────────────────────────────────────
  const descriptions = [...html.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) =>
    decode(m[1]),
  )
  if (descriptions.length === 0) fail.push('no meta description')
  else if (descriptions.length > 1) fail.push(`${descriptions.length} meta descriptions`)
  else if (descriptions[0].length < DESCRIPTION.min || descriptions[0].length > DESCRIPTION.max)
    warn.push(`description ${descriptions[0].length} chars (want ${DESCRIPTION.min}-${DESCRIPTION.max})`)

  // ── canonical ──────────────────────────────────────────────────────────
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1])
  if (canonicals.length !== 1) fail.push(`${canonicals.length} canonical tags`)
  else if (!/^https?:\/\//.test(canonicals[0])) fail.push('canonical is not absolute')
  else if (new URL(canonicals[0]).pathname !== path)
    fail.push(`canonical points at ${new URL(canonicals[0]).pathname}`)

  // ── hreflang ───────────────────────────────────────────────────────────
  // Next serialises the attribute as hrefLang; HTML attribute names are
  // case-insensitive, so a case-sensitive check here would report every page.
  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi)]
  const langs = alternates.map((m) => m[1].toLowerCase())
  for (const required of ['he', 'en', 'x-default']) {
    if (!langs.includes(required)) fail.push(`no hreflang ${required}`)
  }
  // Reciprocity: the alternate for this page's own locale must be this page.
  const ownLocale = path.split('/')[1]
  const self = alternates.find((m) => m[1].toLowerCase() === ownLocale)
  if (self && new URL(self[2]).pathname !== path)
    fail.push(`hreflang ${ownLocale} points at ${new URL(self[2]).pathname}`)

  // ── headings ───────────────────────────────────────────────────────────
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)]
  if (h1s.length !== 1) fail.push(`${h1s.length} h1`)

  const levels = [...html.matchAll(/<h([1-6])[^>]*>/g)].map((m) => Number(m[1]))
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      warn.push(`heading jumps h${levels[i - 1]} to h${levels[i]}`)
      break
    }
  }

  // ── images ─────────────────────────────────────────────────────────────
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0])
  const noAlt = imgs.filter((tag) => !/\balt=/.test(tag))
  if (noAlt.length > 0) fail.push(`${noAlt.length} img without alt`)

  // ── structured data ────────────────────────────────────────────────────
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  if (blocks.length === 0) fail.push('no JSON-LD')
  let faqCount = 0
  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(decode(raw))
      if (parsed['@type'] === 'FAQPage') faqCount += 1
      const flat = JSON.stringify(parsed)
      if (flat.includes('"undefined"')) fail.push('JSON-LD carries the string "undefined"')
    } catch (error) {
      fail.push(`JSON-LD does not parse: ${error.message.slice(0, 40)}`)
    }
  }
  if (faqCount > 1) fail.push(`${faqCount} FAQPage blocks`)

  // ── robots ─────────────────────────────────────────────────────────────
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) ?? [])[1] ?? ''
  if (/noindex/.test(robots)) fail.push('page is in the sitemap and noindex')

  // ── internal links ─────────────────────────────────────────────────────
  const internal = [...html.matchAll(/href="(\/[^"#][^"]*)"/g)]
    .map((m) => m[1].replace(/[?#].*$/, '').replace(/\/$/, ''))
    .filter((href) => /^\/(he|en)(\/|$)/.test(href))
  const dead = [...new Set(internal)].filter(
    (href) => !sitemapPaths.has(href) && !/\/(opengraph-image|twitter-image|icon)$/.test(href),
  )
  if (dead.length > 0) fail.push(`links to ${dead.length} path(s) not in the sitemap: ${dead[0]}`)

  failures += fail.length > 0 ? 1 : 0
  warnings += warn.length > 0 ? 1 : 0
  rows.push({ path, title: title.length, desc: descriptions[0]?.length ?? 0, fail, warn })
}

const width = Math.max(...rows.map((r) => r.path.length))
console.log(`\nSEO audit, ${rows.length} pages from ${origin}/sitemap.xml\n`)
console.log(`  ${'PAGE'.padEnd(width)}  TITLE  DESC  STATUS`)
for (const row of rows) {
  const status = row.fail.length > 0 ? 'FAIL' : row.warn.length > 0 ? 'warn' : 'ok'
  console.log(
    `  ${row.path.padEnd(width)}  ${String(row.title).padStart(5)}  ${String(row.desc).padStart(4)}  ${status}`,
  )
  for (const message of row.fail) console.log(`  ${' '.repeat(width)}         FAIL  ${message}`)
  for (const message of row.warn) console.log(`  ${' '.repeat(width)}         warn  ${message}`)
}

console.log(
  `\n${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} page(s) with failures, ${warnings} with warnings\n`,
)
process.exit(failures === 0 ? 0 : 1)
