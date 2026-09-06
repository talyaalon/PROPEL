import { locales, isLocale } from '@/lib/i18n'
import { getProjects, getProjectBySlug, projectTitle } from '@/content/projects'
import { shareCard, shareCardContentType, shareCardSize } from '@/lib/shareCard'

/**
 * The per-case-study link-preview card.
 *
 * A case study pasted into a WhatsApp group showed the generic brand image -
 * the strongest sales asset on the site sharing as an anonymous rectangle, on
 * a site whose main distribution channel is exactly that paste. The articles
 * have had their own card for weeks; the case studies did not.
 *
 * The headline follows the page's own H1 rule, so the card and the page cannot
 * disagree: the client's problem where one has been written, and the brand
 * name plus the trade where it has not.
 *
 * The middleware lets this through as a nested metadata leaf under a known
 * parent path, the same way it does for the articles.
 */

export const size = shareCardSize
export const contentType = shareCardContentType
export const alt = 'PROPEL'

export function generateStaticParams() {
  return locales.flatMap((lang) => getProjects().map((project) => ({ lang, slug: project.slug })))
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const locale = isLocale(lang) ? lang : 'he'
  const project = getProjectBySlug(slug)

  const name = project ? projectTitle(project, locale) : 'PROPEL'
  const trade = project?.titleTag?.[locale]

  return shareCard({
    lang: locale,
    eyebrow: locale === 'he' ? 'מקרה בוחן' : 'CASE STUDY',
    title: project?.headline?.[locale] ?? (trade ? `${name} - ${trade}` : name),
  })
}
