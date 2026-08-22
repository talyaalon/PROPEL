/**
 * The post frontmatter contract, as README-PUBLISHING.md section 2 defines it.
 *
 * The README writes it in zod. This is the same contract without the
 * dependency - same fields, same bounds, same defaults, same optionality -
 * spelled out longhand so the error messages can name the file, the field and
 * the bound that failed.
 *
 * The rule the extension had to satisfy: the seven original fields stay
 * required, and every field added since is OPTIONAL with a default. A file
 * carrying only the seven still validates. `validateMinimal()` proves that on
 * every build, because "optional with a default" is the kind of claim that is
 * easy to write and easy to break later.
 */

export const DEFAULT_AUTHOR = 'PROPEL'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SLUG = /^[a-z0-9-]+$/

/**
 * A real calendar check, not just the shape: `2026-02-31` matches the README's
 * regex and is not a day. The date reaches `datePublished` in the Article
 * schema and `lastModified` in the sitemap, so a date that only looks like one
 * is a bad signal shipped to Google, not a display bug someone would notice.
 */
function isRealDate(value) {
  if (!ISO_DATE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  if (m < 1 || m > 12 || d < 1) return false
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function validateFrontmatter(data, file = '<unknown>') {
  const errors = []
  const at = (msg) => errors.push(`${file}: ${msg}`)

  const str = (key, required) => {
    const raw = data[key]
    if (raw === undefined) {
      if (required) at(`"${key}" is required`)
      return undefined
    }
    if (typeof raw !== 'string') {
      at(`"${key}" must be a string, got ${typeof raw}`)
      return undefined
    }
    return raw
  }

  const bounded = (key, value, min, max) => {
    if (value === undefined) return
    // Count code points: Hebrew is BMP so this equals .length here, but an
    // emoji in a title would otherwise count twice against the limit.
    const n = [...value].length
    if (n < min) at(`"${key}" is ${n} characters, the minimum is ${min}`)
    if (n > max) at(`"${key}" is ${n} characters, the maximum is ${max}`)
  }

  const list = (key) => {
    const raw = data[key]
    if (raw === undefined) return []
    if (!Array.isArray(raw)) {
      at(`"${key}" must be a list`)
      return []
    }
    const out = []
    raw.forEach((item, i) => {
      if (typeof item !== 'string') at(`"${key}[${i}]" must be a string`)
      else out.push(item)
    })
    return out
  }

  // ── the required seven ─────────────────────────────────────────────────────
  const title = str('title', true)
  bounded('title', title, 1, 70)

  const description = str('description', true)
  bounded('description', description, 50, 160)

  const date = str('date', true)
  if (date !== undefined && !isRealDate(date)) {
    at(`"date" must be a real YYYY-MM-DD date, got ${JSON.stringify(date)}`)
  }

  const category = str('category', true)
  if (category !== undefined && category.trim() === '') at('"category" must not be empty')

  const slug = str('slug', true)
  if (slug !== undefined && !SLUG.test(slug)) {
    at(`"slug" must be lowercase kebab-case, got ${JSON.stringify(slug)}`)
  }

  const readingTimeRaw = data.readingTime
  let readingTime = 0
  if (readingTimeRaw === undefined) at('"readingTime" is required')
  else if (typeof readingTimeRaw !== 'number' || !Number.isInteger(readingTimeRaw)) {
    at('"readingTime" must be an integer')
  } else if (readingTimeRaw <= 0) at('"readingTime" must be positive')
  else readingTime = readingTimeRaw

  const draftRaw = data.draft
  let draft = true
  if (draftRaw === undefined) at('"draft" is required')
  else if (typeof draftRaw !== 'boolean') at('"draft" must be true or false')
  else draft = draftRaw

  // ── the optional extension, defaults filled here ───────────────────────────
  const author = str('author', false) ?? DEFAULT_AUTHOR

  const updated = str('updated', false)
  if (updated !== undefined && !isRealDate(updated)) {
    at(`"updated" must be a real YYYY-MM-DD date, got ${JSON.stringify(updated)}`)
  }
  if (updated !== undefined && date !== undefined && isRealDate(date) && isRealDate(updated)) {
    if (updated < date) at(`"updated" (${updated}) is before "date" (${date})`)
  }

  const langRaw = str('lang', false)
  let lang
  if (langRaw !== undefined) {
    if (langRaw !== 'he' && langRaw !== 'en') at(`"lang" must be "he" or "en", got "${langRaw}"`)
    else lang = langRaw
  }

  const keywords = list('keywords')
  const related = list('related')

  const ogTitle = str('ogTitle', false)
  bounded('ogTitle', ogTitle, 1, 60)

  const ogDescription = str('ogDescription', false)
  bounded('ogDescription', ogDescription, 1, 110)

  // faq: a list of { q, a }, both required on every entry
  const faqRaw = data.faq
  const faq = []
  if (faqRaw !== undefined) {
    if (!Array.isArray(faqRaw)) at('"faq" must be a list')
    else {
      faqRaw.forEach((entry, i) => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
          at(`"faq[${i}]" must be a mapping with q and a`)
          return
        }
        const q = entry.q
        const a = entry.a
        if (typeof q !== 'string' || q.trim() === '') at(`"faq[${i}].q" is required`)
        if (typeof a !== 'string' || a.trim() === '') at(`"faq[${i}].a" is required`)
        const extra = Object.keys(entry).filter((k) => k !== 'q' && k !== 'a')
        if (extra.length) at(`"faq[${i}]" has unexpected keys: ${extra.join(', ')}`)
        if (typeof q === 'string' && typeof a === 'string') faq.push({ q, a })
      })
    }
  }

  // An unknown key is a typo far more often than an intention, and a silently
  // ignored `keyword:` would cost a field nobody notices is missing.
  const KNOWN = new Set([
    'title', 'description', 'date', 'category', 'slug', 'readingTime', 'draft',
    'author', 'updated', 'lang', 'keywords', 'ogTitle', 'ogDescription', 'related', 'faq',
  ])
  for (const key of Object.keys(data)) {
    if (!KNOWN.has(key)) at(`unknown field "${key}"`)
  }

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    value: {
      title, description, date, category, slug, readingTime, draft,
      author, updated, lang, keywords, ogTitle, ogDescription, related, faq,
    },
  }
}

/**
 * The backwards-compatibility guarantee, executable: the seven original fields
 * alone must validate, and every extension field must come back defaulted.
 * The generator runs this on every build, so a change that quietly makes a new
 * field required fails the build, not the next article someone writes.
 */
export function validateMinimal() {
  const minimal = {
    title: 'A minimal post',
    description: 'x'.repeat(60),
    date: '2026-01-01',
    category: 'Engineering & Performance',
    slug: 'a-minimal-post',
    readingTime: 4,
    draft: true,
  }
  const result = validateFrontmatter(minimal, '<minimal fixture>')
  if (!result.ok) return { ok: false, detail: result.errors.join('; ') }

  const v = result.value
  const problems = []
  if (v.author !== DEFAULT_AUTHOR) problems.push(`author default is ${JSON.stringify(v.author)}`)
  if (v.keywords.length !== 0) problems.push('keywords default is not []')
  if (v.related.length !== 0) problems.push('related default is not []')
  if (v.faq.length !== 0) problems.push('faq default is not []')
  if (v.updated !== undefined) problems.push('updated should stay undefined')
  if (v.lang !== undefined) problems.push('lang should stay undefined')
  if (v.ogTitle !== undefined) problems.push('ogTitle should stay undefined')
  if (v.ogDescription !== undefined) problems.push('ogDescription should stay undefined')

  return problems.length
    ? { ok: false, detail: problems.join('; ') }
    : { ok: true, detail: 'seven required fields validate; eight optional fields defaulted' }
}
