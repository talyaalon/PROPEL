/**
 * Fails the build if a phone number that is not the business's reaches the
 * rendered output.
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

const ROOTS = ['.next/server/app', '.next/static', 'public']
const EXTENSIONS = new Set(['.html', '.js', '.json', '.rsc', '.txt', '.xml'])

function walk(dir) {
  let files = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return files // A root that does not exist is not a failure; `public` may be absent.
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) files = files.concat(walk(full))
    else if (EXTENSIONS.has(extname(full))) files.push(full)
  }
  return files
}

const offenders = new Map() // normalised number -> Set of files

for (const file of ROOTS.flatMap(walk)) {
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

console.log(`[contact] ok - ${rawMatch[1]} is the only phone number in the build`)
