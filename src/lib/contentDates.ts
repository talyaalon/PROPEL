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
 */

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
      result = iso.length > 0 ? iso : undefined
    } catch {
      result = undefined
    }
  }

  cache.set(file, result)
  return result
}
