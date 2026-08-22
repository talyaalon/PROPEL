/**
 * A frontmatter reader for `content/blog/*.mdx`, written rather than installed.
 *
 * WHY THIS IS JAVASCRIPT AND LIVES UNDER scripts/
 * Parsing is a build-time concern here, not a runtime one. `src/middleware.ts`
 * imports `sitePaths()`, which needs every article slug, and middleware runs on
 * the edge runtime where `node:fs` does not exist. So the posts are read once
 * at build time and code-generated into a plain data module that middleware,
 * the sitemap and the pages can all import. Keeping the implementation in one
 * .mjs file means there is exactly one of it - a parallel copy in TypeScript
 * for the site to import would be the "two places to look for an article" that
 * src/content/_ARTICLE_TEMPLATE.md already warns against.
 *
 * WHY NOT gray-matter + a YAML engine
 * The surface these files actually use is tiny and completely regular. All six
 * were scanned before a line of this was written:
 *
 *   comments (`# ...`)                              6
 *   key: "double-quoted string"                    78
 *   key: 6            (integer)                     6
 *   key: false        (boolean)                     6
 *   key:              (opens a block)              18
 *     - "string"      (string list)                40
 *     - q: "..."      (list of mappings)           18
 *       a: "..."      (nested key, indent 4)       18
 *
 * and nothing else: no block scalars, no flow collections, no anchors, no
 * aliases, no single quotes, no escapes, no tabs, no unquoted scalars.
 *
 * A general YAML parser accepts a large language and will guess at inputs
 * nobody intended. This accepts exactly the language above and THROWS on
 * everything else, naming the file and the line. That matters more than usual
 * because the MDX files are read-only source of record: if one ever grows a
 * construct this does not cover, the build must stop and say so rather than
 * silently drop a field and ship an article with no FAQ.
 *
 * Two of the six titles carry a colon inside the quoted value ("WordPress or
 * Custom Code: What You Actually Pay..."), which is the case a naive
 * `line.split(':')` gets wrong. Quoting is honoured: the key ends at the first
 * colon and the remainder is taken whole.
 */

const DELIMITER = '---'

export class FrontmatterError extends Error {
  constructor(message, file, line) {
    super(`${file}:${line} - ${message}`)
    this.name = 'FrontmatterError'
    this.file = file
    this.line = line
  }
}

/** `"..."` -> string, `6` -> number, `true` -> boolean. Nothing else. */
function readScalar(raw, file, lineNo) {
  const value = raw.trim()

  if (value.startsWith('"')) {
    if (value.length < 2 || !value.endsWith('"')) {
      throw new FrontmatterError(
        `a double-quoted value must open and close on the same line, got ${JSON.stringify(value)}`,
        file,
        lineNo
      )
    }
    const inner = value.slice(1, -1)
    if (inner.includes('\\')) {
      throw new FrontmatterError(
        'backslash escapes are not supported in frontmatter values',
        file,
        lineNo
      )
    }
    if (inner.includes('"')) {
      throw new FrontmatterError(
        'a double-quoted value may not contain an unescaped quote',
        file,
        lineNo
      )
    }
    return inner
  }

  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+$/.test(value)) return Number(value)

  throw new FrontmatterError(
    `unsupported value ${JSON.stringify(value)} - quote it, or use an integer or true/false`,
    file,
    lineNo
  )
}

/**
 * Splits a source file into its frontmatter data and its body.
 * The body is returned verbatim so a later renderer sees what the author wrote.
 */
export function splitFrontmatter(source, file = '<unknown>') {
  // Editors on Windows save CRLF; normalise for parsing only.
  const text = source.replace(/\r\n/g, '\n')

  if (!text.startsWith(DELIMITER + '\n')) {
    throw new FrontmatterError('file does not open with a --- frontmatter block', file, 1)
  }

  const closing = text.indexOf('\n' + DELIMITER, DELIMITER.length)
  if (closing === -1) {
    throw new FrontmatterError('frontmatter block is never closed with ---', file, 1)
  }

  const block = text.slice(DELIMITER.length + 1, closing)
  const body = text.slice(closing + 1 + DELIMITER.length)

  const data = {}

  // The block a bare `key:` opened, and what its first item proved it to hold.
  let openKey = null
  let openKind = 'unknown'

  const lines = block.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // +2: line 1 is the opening ---, and i is zero-based.
    const lineNo = i + 2

    if (line.trim() === '') continue
    if (line.trimStart().startsWith('#')) continue
    if (line.includes('\t')) {
      throw new FrontmatterError('tab character in frontmatter - use spaces', file, lineNo)
    }

    const indent = line.length - line.trimStart().length
    const trimmed = line.trim()

    // ── a list item ──────────────────────────────────────────────────────────
    if (trimmed.startsWith('- ')) {
      if (openKey === null) {
        throw new FrontmatterError('list item outside of any key', file, lineNo)
      }
      const item = trimmed.slice(2).trim()
      const asMapping = item.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/)

      if (asMapping) {
        if (openKind === 'strings') {
          throw new FrontmatterError(`"${openKey}" mixes plain items and mappings`, file, lineNo)
        }
        openKind = 'mappings'
        const key = asMapping[1]
        const value = readScalar(asMapping[2], file, lineNo)
        if (typeof value !== 'string') {
          throw new FrontmatterError(`"${key}" in a list must be a quoted string`, file, lineNo)
        }
        data[openKey].push({ [key]: value })
        continue
      }

      if (openKind === 'mappings') {
        throw new FrontmatterError(`"${openKey}" mixes mappings and plain items`, file, lineNo)
      }
      openKind = 'strings'
      const value = readScalar(item, file, lineNo)
      if (typeof value !== 'string') {
        throw new FrontmatterError(`"${openKey}" must be a list of quoted strings`, file, lineNo)
      }
      data[openKey].push(value)
      continue
    }

    const pair = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/)
    if (!pair) {
      throw new FrontmatterError(`cannot parse ${JSON.stringify(line)}`, file, lineNo)
    }
    const key = pair[1]
    const rest = pair[2]

    // ── a key nested under the current list's last mapping ───────────────────
    if (indent > 0) {
      if (openKey === null || openKind !== 'mappings') {
        throw new FrontmatterError(`indented key "${key}" does not belong to a list`, file, lineNo)
      }
      const list = data[openKey]
      const last = list[list.length - 1]
      if (!last) {
        throw new FrontmatterError(`indented key "${key}" has no list item above it`, file, lineNo)
      }
      const value = readScalar(rest, file, lineNo)
      if (typeof value !== 'string') {
        throw new FrontmatterError(`"${key}" must be a quoted string`, file, lineNo)
      }
      if (key in last) {
        throw new FrontmatterError(`duplicate key "${key}" in the same list item`, file, lineNo)
      }
      last[key] = value
      continue
    }

    // ── a top-level key ──────────────────────────────────────────────────────
    if (key in data) {
      throw new FrontmatterError(`duplicate key "${key}"`, file, lineNo)
    }

    if (rest.trim() === '') {
      // Opens a block. Strings or mappings is decided by the first item.
      data[key] = []
      openKey = key
      openKind = 'unknown'
      continue
    }

    data[key] = readScalar(rest, file, lineNo)
    openKey = null
    openKind = 'unknown'
  }

  return { data, body }
}
