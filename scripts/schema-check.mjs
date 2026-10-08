/**
 * Structured-data inventory and conformance, per page, on the served HTML.
 *
 * `seo-audit.mjs` checks that every JSON-LD block PARSES and that no page
 * carries two FAQPage blocks. That is the floor. This answers the questions a
 * reviewer actually asks: which @types does each page declare, does each type
 * carry the fields schema.org marks required and the ones Google documents as
 * required for a rich result, and does every @id reference resolve to a node
 * the site actually defines.
 *
 * Run against a serving origin:
 *   npm run audit:schema -- https://propel.co.il
 *   node scripts/schema-check.mjs http://localhost:4480
 */
const origin = (process.argv[2] ?? 'http://localhost:4480').replace(/\/$/, '')

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

/**
 * Per @type: fields that must be present, and fields Google documents as
 * recommended. Absence of a required field is a FAIL; a missing recommended
 * field is reported so the gap is visible rather than guessed at.
 */
const RULES = {
  ProfessionalService: {
    required: ['name', 'url'],
    recommended: ['logo', 'image', 'description', 'telephone', 'areaServed', 'sameAs', 'priceRange'],
  },
  WebSite: { required: ['name', 'url'], recommended: ['inLanguage', 'publisher', 'alternateName'] },
  Service: {
    required: ['name', 'description'],
    recommended: ['provider', 'serviceType', 'areaServed', 'url'],
  },
  Article: {
    // Google's Article docs: headline is required; dates and author are
    // "recommended" but are what actually produce the rich result.
    required: ['headline'],
    recommended: ['datePublished', 'dateModified', 'author', 'publisher', 'image', 'inLanguage'],
  },
  FAQPage: { required: ['mainEntity'], recommended: [] },
  BreadcrumbList: { required: ['itemListElement'], recommended: [] },
  CollectionPage: { required: ['name'], recommended: ['isPartOf', 'inLanguage', 'hasPart'] },
  ContactPage: { required: ['name'], recommended: ['isPartOf', 'mainEntity', 'inLanguage'] },
  CreativeWork: {
    required: ['name'],
    recommended: ['description', 'creator', 'url', 'inLanguage', 'keywords', 'image'],
  },
}

const sitemapXml = await (await fetch(`${origin}/sitemap.xml`)).text()
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

const definedIds = new Set()
const referencedIds = new Map()
const typeCount = new Map()
const problems = []
const perPage = []

for (const url of urls) {
  const path = new URL(url).pathname
  const html = await (await fetch(`${origin}${path}`)).text()
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  const types = []

  for (const [, raw] of blocks) {
    let node
    try {
      node = JSON.parse(decode(raw))
    } catch (error) {
      problems.push(`${path}: JSON-LD will not parse - ${error.message.slice(0, 50)}`)
      continue
    }
    const type = node['@type']
    types.push(type)
    typeCount.set(type, (typeCount.get(type) ?? 0) + 1)

    if (node['@id']) definedIds.add(node['@id'])
    // Every nested { '@id': x } with no '@type' beside it is a reference.
    const walk = (value) => {
      if (Array.isArray(value)) return value.forEach(walk)
      if (!value || typeof value !== 'object') return
      if (value['@id'] && !value['@type'] && Object.keys(value).length === 1) {
        if (!referencedIds.has(value['@id'])) referencedIds.set(value['@id'], new Set())
        referencedIds.get(value['@id']).add(path)
      }
      Object.values(value).forEach(walk)
    }
    for (const [key, value] of Object.entries(node)) if (key !== '@id') walk(value)

    const rule = RULES[type]
    if (!rule) {
      problems.push(`${path}: ${type} has no rule in this script - add one or drop the type`)
      continue
    }
    for (const field of rule.required) {
      if (node[field] === undefined || node[field] === null || node[field] === '')
        problems.push(`${path}: ${type} is missing REQUIRED "${field}"`)
    }
    const missing = rule.recommended.filter((f) => node[f] === undefined)
    if (missing.length) perPage.push({ path, type, missing })

    // A FAQPage whose questions are not visible on the page is a violation.
    if (type === 'FAQPage') {
      const questions = (node.mainEntity ?? []).map((q) => q.name)
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
      const hidden = questions.filter((q) => !text.includes(q))
      if (hidden.length)
        problems.push(
          `${path}: FAQPage declares ${hidden.length} question(s) with no visible text, e.g. "${hidden[0].slice(0, 50)}"`,
        )
    }
  }
  if (types.length === 0) problems.push(`${path}: no JSON-LD at all`)
}

console.log(`\nStructured data, ${urls.length} pages from ${origin}\n`)
console.log('  @type instances across the site:')
for (const [type, n] of [...typeCount.entries()].sort((a, b) => b[1] - a[1]))
  console.log(`    ${String(n).padStart(3)}  ${type}`)

console.log('\n  @id references:')
for (const [id, paths] of referencedIds) {
  const ok = definedIds.has(id)
  console.log(`    ${ok ? 'resolves' : 'DANGLING'}  ${id}  (referenced on ${paths.size} page(s))`)
  if (!ok) problems.push(`@id ${id} is referenced on ${paths.size} page(s) and never defined`)
}

if (perPage.length) {
  console.log('\n  recommended fields absent (not failures):')
  const grouped = new Map()
  for (const row of perPage) {
    const key = `${row.type}: ${row.missing.join(', ')}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(row.path)
  }
  for (const [key, paths] of grouped)
    console.log(`    ${key}\n       on ${paths.length} page(s), e.g. ${paths[0]}`)
}

console.log(`\n${problems.length === 0 ? 'PASS' : 'FAIL'}: ${problems.length} problem(s)`)
for (const p of problems) console.log(`  - ${p}`)
console.log('')
process.exit(problems.length === 0 ? 0 : 1)
