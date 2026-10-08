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
 *
 * ── The second pass ──────────────────────────────────────────────────────────
 *
 * Six classes of defect cannot be seen from one page in isolation, so every
 * page is collected first and cross-checked afterwards:
 *
 *   - **Duplicate titles and descriptions.** A per-page check sees a title and
 *     calls it present. Two pages sharing one title is the defect, and it is
 *     invisible until you have both.
 *   - **hreflang reciprocity, properly.** The first pass only confirmed that a
 *     page's own-locale alternate points at itself. Real reciprocity is that
 *     the OTHER page points back, which needs the other page.
 *   - **The host inside canonical, hreflang and og:url.** The path was checked
 *     and the host was not, so a `www.` or an `http://` leaking into any of
 *     them would have passed. Search Console lists four non-canonical host
 *     variants as "page with redirect"; this is the check that proves the site
 *     itself never points at one.
 *   - **Open Graph and Twitter.** Three pages once shipped `openGraph` without
 *     `images`, and six inherited the homepage's whole block including its
 *     `url`. Both were found by hand. `og:locale` is checked against the
 *     page's own locale, which is the half nobody looks at.
 *   - **Hebrew copy on an English page.** Two case studies shipped a Hebrew
 *     `<title>` on /en before `titleEn` existed. A codepoint range catches the
 *     next one without anyone reading 21 pages.
 *   - **`<html lang>` and `dir`.** One attribute per page, trivially checkable,
 *     and the whole i18n story rests on them.
 */

const origin = (process.argv[2] ?? 'http://localhost:4523').replace(/\/$/, '')

const TITLE = { min: 30, max: 60 }
const DESCRIPTION = { min: 120, max: 158 }

/** The one host this site may ever point at. Taken from the sitemap, not typed. */
let CANONICAL_ORIGIN = ''

/** Any Hebrew letter. Used only to catch Hebrew copy on an /en page. */
const HEBREW = /[\u0590-\u05FF]/

const sitemapXml = await (await fetch(`${origin}/sitemap.xml`)).text()
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (urls.length === 0) {
  console.error(`No URLs in ${origin}/sitemap.xml`)
  process.exit(1)
}
const sitemapPaths = new Set(urls.map((u) => new URL(u).pathname.replace(/\/$/, '') || '/'))
CANONICAL_ORIGIN = new URL(urls[0]).origin

/*
 * Every URL the sitemap publishes must be on the canonical origin. Search
 * Console is reporting four host variants as "page with redirect", and the
 * first question about those is always whether the site is advertising one.
 */
for (const url of urls) {
  if (new URL(url).origin !== CANONICAL_ORIGIN) {
    console.error(`Sitemap mixes origins: ${url} is not on ${CANONICAL_ORIGIN}`)
    process.exit(1)
  }
}

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

  // ── the document element ───────────────────────────────────────────────
  const htmlTag = (html.match(/<html\b[^>]*>/) ?? [''])[0]
  const lang = (htmlTag.match(/\blang="([^"]*)"/) ?? [])[1] ?? ''
  const dir = (htmlTag.match(/\bdir="([^"]*)"/) ?? [])[1] ?? ''
  const locale = path.split('/')[1]
  if (lang !== locale) fail.push(`html lang="${lang}" on a /${locale} page`)
  const wantDir = locale === 'he' ? 'rtl' : 'ltr'
  if (dir !== wantDir) fail.push(`html dir="${dir}", want "${wantDir}"`)

  // Hebrew copy on an English page. The reverse is not checked: a Hebrew page
  // legitimately carries Latin brand and technology names.
  if (locale === 'en') {
    if (HEBREW.test(title)) fail.push('Hebrew characters in the English <title>')
    if (HEBREW.test(descriptions[0] ?? '')) fail.push('Hebrew characters in the English description')
  }

  // ── canonical ──────────────────────────────────────────────────────────
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1])
  if (canonicals.length !== 1) fail.push(`${canonicals.length} canonical tags`)
  else if (!/^https?:\/\//.test(canonicals[0])) fail.push('canonical is not absolute')
  else if (new URL(canonicals[0]).pathname !== path)
    fail.push(`canonical points at ${new URL(canonicals[0]).pathname}`)
  // The host, which the path check above cannot see. A canonical on the www
  // host or on http would hand Google the variant it is already reporting as
  // a redirect.
  else if (new URL(canonicals[0]).origin !== CANONICAL_ORIGIN)
    fail.push(`canonical origin is ${new URL(canonicals[0]).origin}`)

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
  for (const [, code, href] of alternates) {
    if (new URL(href).origin !== CANONICAL_ORIGIN)
      fail.push(`hreflang ${code} origin is ${new URL(href).origin}`)
  }

  // ── Open Graph and Twitter ─────────────────────────────────────────────
  const meta = (property) =>
    decode(
      (html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`)) ?? [])[1] ??
        (html.match(new RegExp(`<meta name="${property}" content="([^"]*)"`)) ?? [])[1] ??
        '',
    )
  const ogTitle = meta('og:title')
  const ogDescription = meta('og:description')
  const ogImage = meta('og:image')
  const ogUrl = meta('og:url')
  const ogLocale = meta('og:locale')
  const twitterCard = meta('twitter:card')
  const twitterImage = meta('twitter:image')

  if (!ogTitle) fail.push('no og:title')
  if (!ogDescription) fail.push('no og:description')
  if (!ogImage) fail.push('no og:image')
  if (!twitterCard) fail.push('no twitter:card')
  if (!twitterImage) fail.push('no twitter:image')
  if (ogUrl && ogUrl !== canonicals[0]) fail.push(`og:url (${ogUrl}) is not the canonical`)
  const wantLocale = locale === 'he' ? 'he_IL' : 'en_US'
  if (ogLocale !== wantLocale) fail.push(`og:locale "${ogLocale}", want "${wantLocale}"`)
  /*
   * The share card has to be the page's own, not the site-wide one, on every
   * route that generates one. Six pages once inherited the homepage's whole
   * openGraph block including its image; the homepage and the two indexes
   * legitimately use the locale card.
   */
  if (ogImage && /\/(blog|portfolio)\/[^/]+$/.test(path)) {
    const expected = `${CANONICAL_ORIGIN}${path}/opengraph-image`
    if (ogImage !== expected) fail.push(`og:image is ${ogImage}, want the page's own card`)
  }

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
  /*
   * Intrinsic dimensions, so the browser reserves the box before the bytes
   * arrive. `next/image` emits them, or emits `fill` with a sized parent -
   * which sets neither attribute and is correct, so a filled image is
   * exempted rather than reported. An <img> with no dimensions and no fill is
   * layout shift waiting for a slow connection.
   */
  const noBox = imgs.filter(
    (tag) =>
      !(/\bwidth=/.test(tag) && /\bheight=/.test(tag)) &&
      !/position:\s*absolute/.test(tag) &&
      !/\bsizes=/.test(tag),
  )
  if (noBox.length > 0) warn.push(`${noBox.length} img without width/height`)

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
  rows.push({
    path,
    title: title.length,
    desc: descriptions[0]?.length ?? 0,
    fail,
    warn,
    titleText: title,
    descText: descriptions[0] ?? '',
    alternates: alternates.map(([, code, href]) => [code.toLowerCase(), href]),
  })
}

// ── Second pass: what one page cannot show ──────────────────────────────────

const byPath = new Map(rows.map((row) => [row.path, row]))

/** Groups of pages sharing one string, for whichever field. */
function duplicates(field) {
  const seen = new Map()
  for (const row of rows) {
    const value = row[field]
    if (!value) continue
    if (!seen.has(value)) seen.set(value, [])
    seen.get(value).push(row.path)
  }
  return [...seen.entries()].filter(([, paths]) => paths.length > 1)
}

const duplicateTitles = duplicates('titleText')
const duplicateDescriptions = duplicates('descText')

for (const [value, paths] of duplicateTitles) {
  for (const path of paths) {
    byPath.get(path).fail.push(`duplicate <title> shared with ${paths.length - 1} other page(s)`)
  }
  console.log(`\n  DUPLICATE TITLE on ${paths.join(', ')}\n    "${value}"`)
}
for (const [value, paths] of duplicateDescriptions) {
  for (const path of paths) {
    byPath.get(path).fail.push(`duplicate description shared with ${paths.length - 1} other page(s)`)
  }
  console.log(`\n  DUPLICATE DESCRIPTION on ${paths.join(', ')}\n    "${value.slice(0, 90)}"`)
}

/*
 * Reciprocity in the sense Google means it: B must name A as A's locale.
 * A one-way annotation is ignored outright, and the first pass could only see
 * half of the pair.
 */
for (const row of rows) {
  for (const [code, href] of row.alternates) {
    if (code === 'x-default') continue
    const target = new URL(href).pathname
    if (target === row.path) continue
    const other = byPath.get(target)
    if (!other) {
      row.fail.push(`hreflang ${code} points at ${target}, which is not in the sitemap`)
      continue
    }
    const back = other.alternates.find(([c]) => c === row.path.split('/')[1])
    if (!back || new URL(back[1]).pathname !== row.path) {
      row.fail.push(`hreflang ${code} is not reciprocated by ${target}`)
    }
  }
}

failures = rows.filter((row) => row.fail.length > 0).length
warnings = rows.filter((row) => row.fail.length === 0 && row.warn.length > 0).length

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
  `\n${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} page(s) with failures, ${warnings} with warnings`,
)
console.log(
  `  ${rows.length} pages - ${duplicateTitles.length} duplicate title group(s), ` +
    `${duplicateDescriptions.length} duplicate description group(s), ` +
    `${rows.filter((r) => r.title === 0).length} missing title(s), ` +
    `${rows.filter((r) => r.desc === 0).length} missing description(s)\n`,
)
process.exit(failures === 0 ? 0 : 1)
