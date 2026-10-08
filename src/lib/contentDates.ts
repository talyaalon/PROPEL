import { execFileSync } from 'node:child_process'

/**
 * When the content behind a page last actually changed, from git.
 *
 * `sitemap.ts` used to omit `lastModified` for everything except the three
 * articles, and the reasoning was sound: it had been `new Date()`, which told
 * Google on every deploy that the privacy policy had changed, and a timestamp
 * that is always "now" teaches a crawler to ignore the field. A file mtime is
 * no better - on a CI checkout it is the clone time, which is the same lie in
 * a new hat.
 *
 * A git commit date is neither. "The file that produces this page last changed
 * in this commit, on this date" is a true statement about the content, and it
 * is exactly what `lastmod` is defined to mean.
 *
 * Two guards, because a wrong date here is worse than no date:
 *
 *  - **Shallow clones.** `git log -1 -- <file>` on a clone with no history
 *    returns the single commit it has for every file, which would hand every
 *    URL the deploy date. If the repository is shallow this module reports
 *    nothing at all and the sitemap falls back to the dates it can prove.
 *  - **No git.** Any failure - not a repository, binary missing, file never
 *    committed - returns undefined rather than a guess.
 *
 * Memoised: the sitemap asks for the same handful of files once per locale,
 * and this runs at build time inside the Next build process.
 *
 * ── Every date comes back as UTC, and that is not cosmetic ───────────────────
 *
 * `git log --format=%cI` emits the committer's own offset, frozen at commit
 * time. The owner commits from a machine on Asia/Bangkok, so every one of the
 * sitemap's 42 `lastmod` values shipped as `+07:00` - a Thailand offset on an
 * Israeli business's sitemap, which is confusing to read and was flagged in a
 * Search Console review.
 *
 * Worse than confusing, it was unstable. `%cI` is the offset of whoever made
 * the commit, so the same commit produces `+07:00` here and would produce a
 * different string for a commit made from Israel - and `--date=iso-strict-local`,
 * the obvious alternative, reads the BUILD machine's `TZ` instead, which means
 * a local build and a Netlify build would disagree about the same commit.
 * Google's requirement for `lastmod` is that it be consistently and verifiably
 * accurate; a field whose text depends on who committed or where it was built
 * fails the "consistently" half even when the instant it names is right.
 *
 * Normalising in JavaScript rather than through `TZ` is what makes the output
 * depend on nothing but the commit itself.
 */

/**
 * A git ISO timestamp as UTC, seconds precision: `2026-10-07T07:53:21Z`.
 *
 * Milliseconds are dropped because the commit never had any - `.000Z` would be
 * three digits of invented precision in a public file. An unparseable input is
 * returned untouched rather than turned into `Invalid Date`: a date this
 * module cannot normalise is still a date git vouched for, and the guards in
 * this file exist to prefer no answer over a wrong one.
 */
function toUtc(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

const cache = new Map<string, string | undefined>()

let repositoryIsUsable: boolean | null = null

function canUseGit(): boolean {
  if (repositoryIsUsable !== null) return repositoryIsUsable

  try {
    const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    repositoryIsUsable = shallow === 'false'
  } catch {
    repositoryIsUsable = false
  }

  /*
   * Say so, once, in the build log. Degrading to "no lastmod" is the correct
   * behaviour, but it is also invisible: the build stays green, the sitemap
   * stays valid, and the only symptom is 36 missing elements nobody reads. If
   * Netlify's clone turns out to be shallow, this line is what says so on the
   * first deploy instead of leaving the feature quietly inert.
   */
  if (!repositoryIsUsable) {
    console.warn(
      '[contentDates] git history unavailable (shallow clone or no git) - ' +
        'sitemap lastmod omitted for every path except the articles',
    )
  }

  return repositoryIsUsable
}

/**
 * ISO date of the last commit that touched `file`, or undefined when that
 * cannot be established honestly.
 *
 * @param file Repository-relative path, e.g. `src/content/projects.ts`.
 */
export function lastContentChange(file: string): string | undefined {
  if (cache.has(file)) return cache.get(file)

  let result: string | undefined

  if (canUseGit()) {
    try {
      const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      // An empty string means the file has no commits - a new file in a dirty
      // tree, typically. Not an error, just nothing to report.
      result = iso.length > 0 ? toUtc(iso) : undefined
    } catch {
      result = undefined
    }
  }

  cache.set(file, result)
  return result
}
