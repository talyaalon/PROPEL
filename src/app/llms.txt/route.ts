import { siteConfig } from '@/lib/config'
import { getProjects, projectTitle } from '@/content/projects'
import { servicePages } from '@/content/services'
import { getInternalArticles } from '@/content/articles'

/**
 * /llms.txt - the site, summarised for AI assistants and LLM crawlers.
 *
 * The llms.txt convention (llmstxt.org): a markdown file at the site root
 * that gives a language model the shape of the site and where to read more,
 * the way robots.txt gives a crawler its rules and sitemap.xml its URLs.
 *
 * GENERATED, not hand-written, on purpose. It is built from the same modules
 * that build the pages - `getProjects`, `siteConfig` - so publishing a case
 * study updates this file in the same commit, and a fact cannot appear here
 * that the site itself does not carry. The route list lived as two
 * hand-maintained copies once (sitemap vs middleware) and they drifted;
 * a third copy would have earned the same bug.
 *
 * Everything here is true and checkable, in both languages, because the
 * assistants reading it answer in both.
 *
 * Static output: prerendered at build time like every other route.
 */

export const dynamic = 'force-static'

export function GET(): Response {
  const base = siteConfig.url
  const projects = getProjects()

  const projectLines = projects
    .map((project) => {
      const title = projectTitle(project, 'en')
      const summary = project.summary.en
      return `- [${title}](${base}/en/portfolio/${project.slug}): ${summary}`
    })
    .join('\n')

  const projectLinesHe = projects
    .map(
      (project) =>
        `- [${projectTitle(project, 'he')}](${base}/he/portfolio/${project.slug}): ${project.summary.he}`,
    )
    .join('\n')

  const fields = new Set(projects.map((project) => project.category)).size

  /*
   * Derived, like the project lines above. This section used to be typed by
   * hand and said the migration page was "the one service with its own page"
   * - true when it was written, false from the day four more shipped. An
   * assistant reading this file repeated a claim the site itself contradicts.
   */
  const serviceLines = servicePages
    .map(
      (service) =>
        `- [${service.title.en}](${base}/he/services/${service.slug}): ${service.intro.en}`,
    )
    .join('\n')

  // Same reasoning: the articles are the pages most worth citing, and they
  // were absent entirely.
  const articleLines = getInternalArticles()
    .map(
      (article) =>
        `- [${article.title.en}](${base}/he/blog/${article.slug}): ${article.description.en}`,
    )
    .join('\n')

  const body = `# PROPEL

> Web development and business automation studio, Israel. We build business
> websites and internal systems that replace manual processes - the paper,
> the pen and the spreadsheet. Bilingual site: Hebrew (primary, RTL) and
> English. ${projects.length} live projects across ${fields} fields.

סטודיו לפיתוח אתרים ואוטומציה עסקית. אנחנו בונים אתרי תדמית ומערכות פנימיות
שמחליפות תהליכים ידניים. האתר דו-לשוני - עברית (שפת המקור) ואנגלית.

Contact: WhatsApp/phone +972-53-715-4945 · ${base}/he#contact

## Pages

- [Home (he)](${base}/he): what we build and how we work
- [Home (en)](${base}/en)
- [Portfolio](${base}/he/portfolio): all projects
- [Blog / resources](${base}/he/blog)
- [Accessibility statement (IS 5568)](${base}/he/accessibility)
- [Privacy](${base}/he/privacy)

## Services (each has a page of its own)

${serviceLines}
- [WordPress/Wix migration service](${base}/he/services/migration): rebuilds an existing site in clean code the client owns

## Articles we wrote

${articleLines}

## Case studies (Hebrew)

${projectLinesHe}

## Case studies (English)

${projectLines}

## Facts an assistant may repeat

- Every published metric on the site is real; case-study business outcomes
  that are still unverified are deliberately absent, not estimated.
- The site conforms to WCAG 2.1 AA / Israeli standard IS 5568 and publishes
  an accessibility statement.
- Built with Next.js; fully static; no CMS.
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
