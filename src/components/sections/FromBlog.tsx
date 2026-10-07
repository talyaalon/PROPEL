import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { getInternalArticles, readingMinutes, type ArticleTopic } from '@/content/articles'

/**
 * The three newest articles, on the homepage.
 *
 * The homepage had NO link to any article. Not one: the navigation and the
 * footer carried `/blog`, and the articles themselves were reachable only from
 * the blog index, from each other and from two service pages. So the page
 * every visitor and every crawler lands on first passed none of its authority
 * to the pages written to earn search traffic, and a visitor evaluating whether
 * we know the subject had nothing on the first screen to read.
 *
 * `scripts/inlinks.mjs` counts links from inside another page's `<main>`
 * separately from chrome links for exactly this reason - a footer link to
 * `/blog` satisfied the total while the editorial count stayed at zero.
 *
 * Internal articles only. The blog index also carries a shelf of recommended
 * outbound resources, and those are useful there and actively wrong here: a
 * homepage block whose job is showing what we know should not spend a card
 * sending the reader to web.dev.
 */

type BlogDict = {
  home_eyebrow: string
  home_title: string
  home_subtitle: string
  home_view_all: string
  read_more: string
  reading_time: string
  reading_time_one: string
  topics: Record<ArticleTopic, string>
}

/** How many cards. Three fits the grid at every width and is the whole list today. */
const COUNT = 3

export default function FromBlog({
  lang,
  dict,
  clause,
}: {
  lang: Locale
  dict: BlogDict
  clause?: string
}) {
  // Already sorted newest first by `getArticles`, and already filtered of
  // drafts with the same production gate the routes and the sitemap use.
  const posts = getInternalArticles().slice(0, COUNT)

  // Nothing published is not a state today, but a section heading over an
  // empty grid is how the blog index used to read on a production deploy.
  if (posts.length === 0) return null

  return (
    <section id="from-blog" aria-labelledby="from-blog-heading" className="section">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 lg:mb-14">
          <p className="eyebrow mb-6">
            {clause && (
              <span className="clause" aria-hidden="true">
                {clause}
              </span>
            )}
            {dict.home_eyebrow}
          </p>
          <h2 id="from-blog-heading" className="max-w-3xl text-brand-ink">
            {dict.home_title}
          </h2>
          <p className="lead mt-5 max-w-2xl">{dict.home_subtitle}</p>
        </div>

        <ul className="grid gap-5 sm:gap-6 lg:grid-cols-3">
          {posts.map((post) => {
            const minutes = readingMinutes(post, lang)
            return (
              /* min-w-0 on the grid item: a card in a three-column grid is
                 sized from its content's min-content width, and these titles
                 carry Latin tokens. The recurring trap. */
              <li key={post.slug} className="card flex min-w-0 flex-col p-6">
                <p className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-slate">
                  {dict.topics[post.topic]}
                  <span className="mx-2" aria-hidden="true">
                    ·
                  </span>
                  {/* Hebrew needs the singular form - "1 דקות" is not a thing.
                      Same rule as the article page and the blog grid. */}
                  {minutes === 1
                    ? dict.reading_time_one
                    : dict.reading_time.replace('{n}', String(minutes))}
                </p>

                {/* The title is the link, and the only one on the card.
                    A second "read more" link to the same URL costs a tab stop
                    per card for one destination and splits the anchor text -
                    the same correction the services hub cards took. */}
                <h3 className="mt-3 text-[1.125rem] font-bold leading-snug text-brand-ink">
                  <Link
                    href={`/${lang}/blog/${post.slug}`}
                    className="group/post inline-flex items-baseline gap-2 transition-colors duration-300 hover:text-brand-accent"
                  >
                    <span className="min-w-0 [overflow-wrap:anywhere]">{post.title[lang]}</span>
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 self-center text-brand-accent transition-transform duration-300 group-hover/post:translate-x-1 rtl:-scale-x-100 rtl:group-hover/post:-translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </h3>

                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-brand-slate [overflow-wrap:anywhere]">
                  {post.excerpt[lang]}
                </p>
              </li>
            )
          })}
        </ul>

        <div className="mt-10 flex justify-center lg:mt-14">
          <Link
            href={`/${lang}/blog`}
            className="group/all inline-flex items-center gap-2 py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-300 hover:text-brand-ink"
          >
            {dict.home_view_all}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1 rtl:-scale-x-100 rtl:group-hover/all:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
