/**
 * Which case study is missing which narrative section.
 *
 * A Search Console audit on 2026-09-13 found that eight of the nine real
 * non-indexed URLs on the site were /portfolio pages. The cause was not
 * technical: `hagorer2` and `cnafim-lauf` carried 93 and 91 words inside
 * `<main>`, roughly half of it the CTA and service blocks that repeat verbatim
 * on all five case studies. They have no `challenge`, no `solution`, no `flow`
 * and no `changed` - their only section heading is "01 Technologies".
 *
 * Nobody noticed because nothing looks at it. TypeScript cannot: every
 * narrative field on `Project` is optional, and it has to stay optional,
 * because a project genuinely starts life as a slug and a summary and the
 * alternative is either a build that fails on honest work-in-progress or five
 * fields stuffed with placeholder text, which is worse than empty.
 *
 * So this reports rather than enforces. A thin case study is a content debt,
 * not a programming error, and the build must keep working so unrelated fixes
 * can ship while the copy is still being written. `content/portfolio/_TODO.md`
 * is the companion: this says what is missing, that says how to fill it.
 *
 * It reads the source TEXT rather than importing the module, because the
 * content file is TypeScript and the repo has no runtime TS loader and is not
 * getting one for a reporting script. The parse is deliberately rigid and
 * fails loudly if the file's shape changes, rather than quietly reporting that
 * everything is fine.
 *
 *   node scripts/check-portfolio.mjs [--strict]
 *
 * `--strict` exits non-zero when something is missing. Off by default.
 */
import { readFileSync } from 'node:fs'

const STRICT = process.argv.includes('--strict')
const FILE = 'src/content/projects.ts'

const source = readFileSync(FILE, 'utf8')

/*
 * Each project object opens at exactly this indentation inside the array. The
 * count is checked against every `slug:` in the file, so a project declared
 * some other way is a parse failure and not a silent omission.
 */
const chunks = source.split(/\n    slug: '/).slice(1)
const declaredSlugs = (source.match(/\n    slug: '/g) ?? []).length

if (chunks.length === 0 || chunks.length !== declaredSlugs) {
  console.error(
    `[portfolio] cannot parse ${FILE}: found ${chunks.length} project bodies for ` +
      `${declaredSlugs} slug declarations. The file's shape changed - fix this script.`,
  )
  process.exit(1)
}

/** The narrative fields, in the order the case study renders them. */
const SECTIONS = [
  { field: 'headline', label: 'headline (the h1)' },
  { field: 'challenge', label: 'challenge (what was stuck)' },
  { field: 'solution', label: 'solution (what we built)' },
  { field: 'flow', label: 'flow (the process)' },
  { field: 'changed', label: 'changed (what changed)' },
]

const projects = chunks.map((chunk) => {
  const slug = chunk.slice(0, chunk.indexOf("'"))
  // The object ends at the first dedented closing brace of the array element.
  const end = chunk.indexOf('\n  },')
  const body = end > -1 ? chunk.slice(0, end) : chunk

  /*
   * Declared is not the same as rendered, and the difference is the whole
   * point of this script.
   *
   * `withoutPending` in the content module drops every line still carrying the
   * PENDING marker before a project leaves it, so a `changed` array whose every
   * entry is a pending metric is stripped to undefined and its heading never
   * appears on the page. `bom-recipes` and `air-manage` are both in that state:
   * they declare the section, render nothing, and the first version of this
   * script called them complete. A check that reports a blank section as
   * written is worse than no check.
   */
  const declares = (field) => new RegExp(`\\n    ${field}:`).test(`\n${body}`)

  const survivesStripping = (field) => {
    const at = body.search(new RegExp(`\\n    ${field}:`))
    if (at === -1) return false
    // The field's own block, up to the next key at the same indentation.
    const rest = body.slice(at + 1)
    const nextKey = rest.search(/\n    [a-zA-Z]+[?]?:/)
    const block = nextKey === -1 ? rest : rest.slice(0, nextKey)
    // Every locale line carrying the marker means nothing survives the strip.
    const localeLines = block.match(/\n\s*(he|en):/g) ?? []
    if (localeLines.length === 0) return true
    const marked = (block.match(/PENDING/g) ?? []).length
    return marked < localeLines.length
  }

  const missing = SECTIONS.filter((section) => {
    if (!declares(section.field)) return true
    // Only the metric-bearing sections can be emptied by the strip.
    if (section.field === 'changed') return !survivesStripping(section.field)
    return false
  }).map((section) =>
    declares(section.field) ? `${section.field} (written but all PENDING, renders nothing)` : section.field,
  )

  /*
   * Prose length, roughly. Counts the text inside quoted strings only, so
   * field names, slugs and class names do not inflate it. It is an indicator
   * for "is there a story here", not a substitute for measuring the built page
   * with scripts/seo-audit.mjs.
   */
  const quoted = body.match(/'(?:[^'\\]|\\.){12,}'/g) ?? []
  const words = quoted.join(' ').split(/\s+/).filter(Boolean).length

  /*
   * The marker is a const in the content file, not a literal string, so inside
   * a project it reads `metric: PENDING`, or is interpolated into a sentence
   * as a template expression. Matching the literal "TODO(metric)" instead
   * finds only the const declaration at the top of the file and reports a
   * confident zero for every project, which is how this was written first.
   *
   * Counted as markers rather than metrics: one sentence can carry two.
   */
  const pending = (body.match(/\bPENDING\b/g) ?? []).length

  return { slug, missing, words, pending }
})

const width = Math.max(...projects.map((p) => p.slug.length))
console.log(`\nCase study narrative, ${projects.length} projects in ${FILE}\n`)
console.log(`  ${'project'.padEnd(width)}  ${'prose'.padStart(5)}  sections`)

for (const project of projects) {
  const state =
    project.missing.length === 0
      ? 'complete'
      : `MISSING ${project.missing.join(', ')}`
  const metric = project.pending > 0 ? `  (${project.pending} metric still TODO)` : ''
  console.log(
    `  ${project.slug.padEnd(width)}  ${String(project.words).padStart(5)}  ${state}${metric}`,
  )
}

const incomplete = projects.filter((p) => p.missing.length > 0)
const pendingMetrics = projects.reduce((sum, p) => sum + p.pending, 0)

console.log(
  `\n${incomplete.length} project(s) missing a narrative section, ` +
    `${pendingMetrics} metric(s) still TODO.`,
)
if (incomplete.length > 0) {
  console.log(`See content/portfolio/_TODO.md for what to write and how long.\n`)
} else {
  console.log('')
}

process.exit(STRICT && incomplete.length > 0 ? 1 : 0)
