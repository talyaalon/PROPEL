/**
 * content/blog/{he,en}/*.mdx  ->  src/content/generated/posts.ts
 *
 * Build-time code generation, not a runtime loader, for one hard reason:
 * `src/middleware.ts` imports `sitePaths()`, which must know every article
 * slug, and middleware runs on the edge runtime where `node:fs` does not
 * exist. Generating a plain data module lets the middleware, the sitemap, the
 * pages and the blog index all import the same object with no filesystem
 * access anywhere.
 *
 * The MDX files are READ-ONLY source of record - the owner's rule. Everything
 * here treats them that way: any inconsistency is reported as an error that
 * stops the build, never patched in place.
 *
 * Cross-file rules enforced beyond the per-file schema:
 *  - every slug exists in BOTH languages (README section 1: no orphan pages)
 *  - the directory a file sits in matches its `lang` field when present
 *  - the `slug` field matches the filename
 *  - `related` slugs point at posts that exist
 *  - he/en pairs agree on date, updated, draft and readingTime - these feed
 *    hreflang'd metadata, and a pair that disagrees ships two contradictory
 *    signals for the same logical article
 *  - the minimal-frontmatter fixture still validates (the compatibility rule)
 *
 * One SEO judgment call, made visible here rather than buried: README section
 * 6 forbids linking the anonymised branch-leakage article to the J-Cafe case
 * study - the pairing would undo the anonymisation. The generator enforces it
 * as a build error so a future `related` edit cannot recreate the link by
 * accident.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { splitFrontmatter } from './frontmatter.mjs'
import { validateFrontmatter, validateMinimal } from './schema.mjs'

const ROOT = process.cwd()
const CONTENT = join(ROOT, 'content', 'blog')
const OUT_DIR = join(ROOT, 'src', 'content', 'generated')
const OUT = join(OUT_DIR, 'posts.ts')

const errors = []

// ── 0. the compatibility fixture ─────────────────────────────────────────────
const minimal = validateMinimal()
if (!minimal.ok) errors.push(`minimal fixture no longer validates: ${minimal.detail}`)

// ── 1. read and validate every file ──────────────────────────────────────────
const posts = { he: new Map(), en: new Map() }

for (const lang of ['he', 'en']) {
  const dir = join(CONTENT, lang)
  if (!existsSync(dir)) continue
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort()) {
    const rel = `content/blog/${lang}/${name}`
    let parsed
    try {
      parsed = splitFrontmatter(readFileSync(join(dir, name), 'utf8'), rel)
    } catch (e) {
      errors.push(e.message)
      continue
    }
    const result = validateFrontmatter(parsed.data, rel)
    if (!result.ok) {
      errors.push(...result.errors)
      continue
    }
    const fm = result.value

    const fromName = name.replace(/\.mdx$/, '')
    if (fm.slug !== fromName) {
      errors.push(`${rel}: slug "${fm.slug}" does not match the filename "${fromName}"`)
    }
    if (fm.lang !== undefined && fm.lang !== lang) {
      errors.push(`${rel}: lang "${fm.lang}" contradicts the ${lang}/ directory it sits in`)
    }
    posts[lang].set(fm.slug, { fm, body: parsed.body })
  }
}

// ── 2. pairing ───────────────────────────────────────────────────────────────
const heSlugs = new Set(posts.he.keys())
const enSlugs = new Set(posts.en.keys())
for (const slug of heSlugs) {
  if (!enSlugs.has(slug)) errors.push(`he/${slug} has no English counterpart - orphan page`)
}
for (const slug of enSlugs) {
  if (!heSlugs.has(slug)) errors.push(`en/${slug} has no Hebrew counterpart - orphan page`)
}
const paired = [...heSlugs].filter((s) => enSlugs.has(s)).sort()

// ── 3. pair agreement ────────────────────────────────────────────────────────
for (const slug of paired) {
  const he = posts.he.get(slug).fm
  const en = posts.en.get(slug).fm
  // NOT readingTime: the page derives reading time from the body it renders
  // (the two languages legitimately differ), so a pair-agreement rule here
  // guarded a number nothing displays. The per-file schema still validates it.
  for (const field of ['date', 'updated', 'draft']) {
    const a = he[field]
    const b = en[field]
    if (String(a) !== String(b)) {
      errors.push(
        `pair "${slug}" disagrees on ${field}: he=${JSON.stringify(a)} en=${JSON.stringify(b)} - ` +
          'the pair is one logical article behind hreflang and must carry one value'
      )
    }
  }
  const heRel = [...he.related].sort().join(',')
  const enRel = [...en.related].sort().join(',')
  if (heRel !== enRel) {
    errors.push(`pair "${slug}" disagrees on related: he=[${heRel}] en=[${enRel}]`)
  }
  if (he.faq.length !== en.faq.length) {
    errors.push(
      `pair "${slug}" has ${he.faq.length} FAQ entries in Hebrew and ${en.faq.length} in English`
    )
  }
}

// ── 4. related integrity ─────────────────────────────────────────────────────
for (const lang of ['he', 'en']) {
  for (const [slug, { fm }] of posts[lang]) {
    for (const rel of fm.related) {
      if (!posts[lang].has(rel)) {
        errors.push(`${lang}/${slug}: related "${rel}" does not exist`)
      }
      if (rel === slug) errors.push(`${lang}/${slug}: related points at itself`)
    }
  }
}

// ── 5. the anonymisation rule (README section 6) ─────────────────────────────
// The branch-leakage article is published anonymised. Placing it next to the
// J-Cafe case study - a multi-branch restaurant chain - makes the connection
// for the reader. No generated output may pair them.
/*
 * category -> topic. The blog filters by the existing ArticleTopic enum; the
 * MDX files carry a free-text category. The category renders on the chip
 * exactly as written (the dictionary labels for 'engineering' ARE the file
 * strings) - this map only decides which filter bucket the post joins.
 * An unknown category fails the build with instructions, because a silently
 * unmapped post would vanish from the filter without anyone noticing.
 */
const CATEGORY_TO_TOPIC = {
  'Engineering & Performance': 'engineering',
  'בנייה וביצועים': 'engineering',
}

/*
 * The map's OUTPUTS are validated too. A typo'd topic value here would pass
 * the generator (it only rejects unknown categories), pass tsc (articles.ts
 * casts), and then render an empty chip while getUsedTopics silently drops
 * the post from every filter - the exact vanishing this map's comment claims
 * to prevent. Must match articleTopics in src/content/articles.ts.
 */
const KNOWN_TOPICS = new Set(['web', 'seo', 'automation', 'ecommerce', 'engineering'])
for (const [category, topic] of Object.entries(CATEGORY_TO_TOPIC)) {
  if (!KNOWN_TOPICS.has(topic)) {
    errors.push(
      `CATEGORY_TO_TOPIC maps ${JSON.stringify(category)} to unknown topic ` +
        `${JSON.stringify(topic)} - not in articleTopics`
    )
  }
}

for (const slug of paired) {
  const he = posts.he.get(slug).fm
  const en = posts.en.get(slug).fm
  const heTopic = CATEGORY_TO_TOPIC[he.category]
  const enTopic = CATEGORY_TO_TOPIC[en.category]
  if (!heTopic) {
    errors.push(
      `he/${slug}: unknown category ${JSON.stringify(he.category)} - add it to ` +
        'CATEGORY_TO_TOPIC in scripts/blog/generate.mjs and to blog.topics in both dictionaries'
    )
  }
  if (!enTopic) {
    errors.push(
      `en/${slug}: unknown category ${JSON.stringify(en.category)} - add it to ` +
        'CATEGORY_TO_TOPIC in scripts/blog/generate.mjs and to blog.topics in both dictionaries'
    )
  }
  if (heTopic && enTopic && heTopic !== enTopic) {
    errors.push(`pair "${slug}": categories map to different topics (${heTopic} vs ${enTopic})`)
  }
}

const ANON = 'branch-leakage-case-study'
const JCAFE = 'jcafe-kosher'
for (const lang of ['he', 'en']) {
  const anon = posts[lang].get(ANON)
  if (anon) {
    const text = JSON.stringify(anon.fm) + anon.body
    if (text.toLowerCase().includes(JCAFE) || /j-?cafe/i.test(text)) {
      errors.push(
        `${lang}/${ANON}: mentions J-Cafe - README section 6 forbids connecting the ` +
          'anonymised article to the case study it anonymises'
      )
    }
  }
}

// ── stop on any error ────────────────────────────────────────────────────────
if (errors.length) {
  console.error('[blog] generation FAILED - the MDX files are read-only, so fix nothing silently:')
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

// ── 6. emit ──────────────────────────────────────────────────────────────────
const records = paired.map((slug) => {
  const he = posts.he.get(slug)
  const en = posts.en.get(slug)
  // readingTime, author and category are validated per file but not emitted:
  // reading time is derived from the body at render, the JSON-LD author is
  // the /#organization entity, and category's only job was the topic above.
  // Dead data in an emitted record reads as a promise someone will try to keep.
  return {
    slug,
    topic: CATEGORY_TO_TOPIC[he.fm.category],
    // Pair-agreed scalars, validated identical above.
    date: he.fm.date,
    updated: he.fm.updated ?? null,
    draft: he.fm.draft,
    related: he.fm.related,
    title: { he: he.fm.title, en: en.fm.title },
    description: { he: he.fm.description, en: en.fm.description },
    keywords: { he: he.fm.keywords, en: en.fm.keywords },
    ogTitle: { he: he.fm.ogTitle ?? he.fm.title, en: en.fm.ogTitle ?? en.fm.title },
    ogDescription: {
      he: he.fm.ogDescription ?? he.fm.description,
      en: en.fm.ogDescription ?? en.fm.description,
    },
    faq: { he: he.fm.faq, en: en.fm.faq },
    body: { he: he.body, en: en.body },
  }
})

const banner = `/**
 * GENERATED - do not edit. \`node scripts/blog/generate.mjs\` rebuilds it from
 * content/blog/{he,en}/*.mdx, which are the read-only source of record.
 *
 * Why generated: src/middleware.ts needs every slug via sitePaths() and runs
 * on the edge runtime, which has no filesystem. This module is plain data,
 * importable everywhere. prebuild runs the generator, so it cannot go stale
 * in CI; a locally stale copy changes nothing on a deploy.
 */
import type { Locale } from '@/lib/i18n'

type PerLocale<T> = Record<Locale, T>

export type MdxFaqEntry = { q: string; a: string }

export type MdxPost = {
  slug: string
  /** The filter bucket. The chip label is the category string itself. */
  topic: string
  date: string
  updated: string | null
  draft: boolean
  related: string[]
  title: PerLocale<string>
  description: PerLocale<string>
  keywords: PerLocale<string[]>
  ogTitle: PerLocale<string>
  ogDescription: PerLocale<string>
  faq: PerLocale<MdxFaqEntry[]>
  body: PerLocale<string>
}

export const mdxPosts: MdxPost[] = `

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, banner + JSON.stringify(records, null, 2) + '\n', 'utf8')

console.log(
  `[blog] ${records.length} paired posts -> src/content/generated/posts.ts ` +
    `(${records.filter((r) => !r.draft).length} live, ${records.filter((r) => r.draft).length} draft); ` +
    `minimal fixture: ${minimal.detail}`
)
