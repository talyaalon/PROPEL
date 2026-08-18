/**
 * Fails the build on anything that must not reach a browser: a phone number
 * that is not the business's, or a placeholder marker for content we do not
 * have yet.
 *
 * This exists because the wrong number shipped. For three deploys the site
 * served `050-515-4143` on every `tel:` link and `+972537154945` on every
 * WhatsApp link - two different numbers on the same page, so a visitor who
 * tapped "call" and a visitor who tapped WhatsApp reached different places.
 * Nothing caught it, because each half was independently well-formed.
 *
 * A unit test on `config.ts` would not have caught it either: the code was
 * correct and a stale environment variable in the deploy dashboard overrode it.
 * The only check that would have fired is one that reads what was actually
 * built - which is what this does.
 *
 * Runs as `postbuild`, so it guards local builds and the deploy identically.
 *
 *   node scripts/check-contact.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

/*
 * Read the expected number out of the source rather than restating it, so this
 * check cannot itself drift from the value it is guarding.
 */
const configSource = readFileSync('src/lib/config.ts', 'utf8')
const rawMatch = configSource.match(/const PHONE_RAW = '([^']+)'/)

if (!rawMatch) {
  console.error(
    '[contact] Could not find `const PHONE_RAW` in src/lib/config.ts.\n' +
      '  This check reads the number from the source so the two cannot disagree.\n' +
      '  If the constant was renamed, update the pattern here to match.',
  )
  process.exit(1)
}

const canonicalDigits = rawMatch[1].replace(/\D/g, '') // 0537154945
const national = canonicalDigits.replace(/^0/, '') // 537154945

/*
 * Israeli mobile numbers, in every shape a page can carry them: local with a
 * leading zero (`053-715-4945`, `0537154945`), or international with or without
 * a `+` and with 972 in place of the zero. Separators are optional throughout
 * because `tel:` strips them and display copy does not.
 */
const PHONE_PATTERN = /(?:\+?972[-\s.]?|0)5\d(?:[-\s.]?\d){7}/g

/*
 * Only what actually reaches a browser.
 *
 * `.next/server/app` holds two different kinds of thing. The prerendered
 * `.html`, `.rsc`, `.txt` and `.xml` files are the response a visitor gets and
 * must be clean. The `.js` files beside them are compiled server handlers that
 * never leave the machine - and they legitimately contain every fallback and
 * sentinel in the source, including `REPLACE-ME.invalid`. Scanning those would
 * fail the build on a string that is doing its job, which is how a check earns
 * the reputation that gets it deleted.
 *
 * `.next/static` and `public` are served verbatim, so everything there counts.
 */
const OUTPUT_EXTENSIONS = new Set(['.html', '.rsc', '.txt', '.xml', '.json'])
const ROOTS = [
  { dir: '.next/server/app', extensions: OUTPUT_EXTENSIONS },
  { dir: '.next/static', extensions: null }, // null = every file
  { dir: 'public', extensions: null },
]

function walk(dir, extensions) {
  let files = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return files // A root that does not exist is not a failure; `public` may be absent.
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) files = files.concat(walk(full, extensions))
    else if (!extensions || extensions.has(extname(full))) files.push(full)
  }
  return files
}

/** Every file a visitor could receive, scanned once. */
const outputFiles = ROOTS.flatMap((root) => walk(root.dir, root.extensions))

const offenders = new Map() // normalised number -> Set of files

for (const file of outputFiles) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.match(PHONE_PATTERN) ?? []) {
    const digits = match.replace(/\D/g, '')
    // Normalise every shape to the national form before comparing, so
    // `+972-53-715-4945` and `0537154945` are recognised as the same number.
    const normalised = digits.replace(/^972/, '').replace(/^0/, '')
    if (normalised === national) continue
    if (!offenders.has(normalised)) offenders.set(normalised, new Set())
    offenders.get(normalised).add(file)
  }
}

/*
 * Placeholder markers that must never reach a browser.
 *
 * `TODO(metric)` marks a number we have not been given yet. Filtering it at
 * render time was not enough: the portfolio grid is a client component, so the
 * projects handed to it are serialised into the RSC payload and the client
 * bundle whole. The marker turned up in nine build artefacts as data that was
 * correctly never displayed but was still shipped and visible in view-source.
 * `getProjects` strips it now, and this makes sure it stays stripped.
 */
const PLACEHOLDER_MARKERS = ['TODO(metric)', 'TODO(i18n)', 'REPLACE-ME.invalid']
const placeholderHits = new Map()

for (const file of outputFiles) {
  const text = readFileSync(file, 'utf8')
  const lowered = text.toLowerCase()
  for (const marker of PLACEHOLDER_MARKERS) {
    // Case-insensitive: `new URL(...).hostname` lowercases its input, and the
    // lowercased placeholder walked straight past an exact-case check.
    if (!lowered.includes(marker.toLowerCase())) continue
    if (!placeholderHits.has(marker)) placeholderHits.set(marker, new Set())
    placeholderHits.get(marker).add(file)
  }
}

if (placeholderHits.size > 0) {
  console.error(`\n[contact] A placeholder marker reached the build.\n`)
  for (const [marker, files] of placeholderHits) {
    console.error(`  ${marker}  in ${files.size} file(s):`)
    for (const file of [...files].slice(0, 5)) console.error(`      ${file}`)
    if (files.size > 5) console.error(`      ... and ${files.size - 5} more`)
  }
  console.error(
    `\n  These mark content we do not have yet and must never ship. Note that` +
      `\n  not rendering one is not enough - data passed to a client component` +
      `\n  is serialised into the page whether it is displayed or not. Strip it` +
      `\n  in the content module instead, the way \`getProjects\` does.\n`,
  )
  process.exit(1)
}

if (offenders.size > 0) {
  console.error(`\n[contact] A phone number that is not the business's reached the build.\n`)
  for (const [number, files] of offenders) {
    console.error(`  0${number}  found in ${files.size} file(s):`)
    for (const file of [...files].slice(0, 5)) console.error(`      ${file}`)
    if (files.size > 5) console.error(`      ... and ${files.size - 5} more`)
  }
  console.error(
    `\n  The only number this site may publish is ${rawMatch[1]}, from` +
      `\n  \`PHONE_RAW\` in src/lib/config.ts. Every displayed, dialled and` +
      `\n  WhatsApp form is derived from it.\n` +
      `\n  If you are changing the business's number, change it there.` +
      `\n  If you did not expect this, something is building a number itself` +
      `\n  instead of reading siteConfig - that is the bug.\n`,
  )
  process.exit(1)
}

console.log(
  `[contact] ok - ${rawMatch[1]} is the only phone number in the build, no placeholders leaked`,
)
