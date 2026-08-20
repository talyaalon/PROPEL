import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { articleSchema, breadcrumbSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import { getInternalArticles, getArticleBySlug, readingMinutes } from '@/content/articles'
import { getProjects, projectTitle } from '@/content/projects'
import { getServicePage } from '@/content/services'

/**
 * An original article - the blog's reason to rank.
 *
 * The audit's verdict on the blog as it stood: a page whose title promises
 * articles and whose body contains none, "a title/content mismatch Google
 * resolves by ranking neither." Each of these pages is a new indexable URL
 * that can hold a query the homepage cannot, and links a service page and a
 * case study with anchor text we choose.
 *
 * The body model is deliberately poor: paragraphs and `## ` headings, nothing
 * else. An article that needs more should argue for it in articles.ts first.
 */

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getInternalArticles().map((article) => ({ lang, slug: article.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLocale(lang)) return {}
  const article = getArticleBySlug(slug)
  if (!article || !('description' in article)) return {}

  return pageMetadata({
    lang,
    path: `blog/${slug}`,
    title: article.title[lang],
    description: article.description[lang],
    type: 'article',
  })
}

/** Paragraphs and `## ` headings, with the headings joining the clause count. */
function renderBody(body: string) {
  let clause = 1
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith('## ')) {
        clause += 1
        return (
          <h2 key={index} className="mt-12 text-brand-ink">
            <span className="clause" aria-hidden="true">
              {String(clause).padStart(2, '0')}
            </span>
            {block.slice(3)}
          </h2>
        )
      }
      return (
        <p key={index} className="mt-5 text-[1.0625rem] leading-[1.8] text-brand-ink">
          {block}
        </p>
      )
    })
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()

  const article = getArticleBySlug(slug)
  if (!article || !('body' in article)) notFound()

  const dict = await getDictionary(lang)
  const isRtl = lang === 'he'
  const BackArrow = isRtl ? ArrowRight : ArrowLeft

  // Hebrew needs a singular form: "1 דקות" is not a thing.
  const minutes = readingMinutes(article, lang)

  const relatedProjects = getProjects().filter((project) =>
    (article.relatedProjects ?? []).includes(project.slug),
  )
  // 'migration' predates the service-page content file and keeps its own
  // route; the article template resolves it from the dictionary instead.
  const relatedService = article.relatedService ? getServicePage(article.relatedService) : undefined
  const relatedMigration = article.relatedService === 'migration'

  return (
    <article className="section">
      <JsonLd
        schema={articleSchema({
          lang,
          slug,
          headline: article.title[lang],
          description: article.description[lang],
          datePublished: article.date,
        })}
      />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: dict.blog.title, url: `${siteConfig.url}/${lang}/blog` },
          { name: article.title[lang], url: `${siteConfig.url}/${lang}/blog/${slug}` },
        ])}
      />

      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${lang}/blog`}
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-slate transition-colors hover:text-brand-ink"
        >
          <BackArrow className="h-4 w-4" aria-hidden="true" />
          {dict.blog.back_to_blog}
        </Link>

        {/* The date is NOT inside the eyebrow: .eyebrow is inline-flex, so
            its children share one unwrappable row - topic + date overflowed
            the viewport at 320px/200%. Two lines, each free to fit. */}
        <p className="eyebrow mb-2">
          <span className="clause" aria-hidden="true">
            01
          </span>
          {dict.blog.topics[article.topic]}
        </p>
        <p className="mb-6 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-slate">
          <time dateTime={article.date} dir="ltr">
            {article.date}
          </time>
          {/* Computed from the body, never typed - a stated reading time that
              does not match the article is the first promise the page breaks. */}
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          {minutes === 1
            ? dict.blog.reading_time_one
            : dict.blog.reading_time.replace('{n}', String(minutes))}
        </p>

        <h1 className="max-w-2xl">{article.title[lang]}</h1>
        <p className="lead mt-6">{article.excerpt[lang]}</p>

        <div className="mt-4">{renderBody(article.body[lang])}</div>

        {/* The internal links this article exists to carry: the service page
            it feeds, and the shipped work that backs its argument. */}
        {(relatedMigration || relatedService || relatedProjects.length > 0) && (
          <div className="mt-14 border-t border-brand-line pt-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-slate">
              {dict.blog.related_title}
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {relatedMigration && (
                <li>
                  <Link
                    href={`/${lang}/services/migration`}
                    className="card flex flex-wrap items-baseline gap-3 p-5"
                  >
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 -rotate-90 text-brand-accent rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-brand-ink">{dict.migration.h1}</span>
                    <span className="body-text">{dict.migration.intro}</span>
                  </Link>
                </li>
              )}
              {relatedService && (
                <li>
                  <Link
                    href={`/${lang}/services/${relatedService.slug}`}
                    className="card flex flex-wrap items-baseline gap-3 p-5"
                  >
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 -rotate-90 text-brand-accent rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-brand-ink">
                      {relatedService.title[lang]}
                    </span>
                    <span className="body-text">{relatedService.intro[lang]}</span>
                  </Link>
                </li>
              )}
              {relatedProjects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/${lang}/portfolio/${project.slug}`}
                    className="card flex flex-wrap items-baseline gap-3 p-5"
                  >
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 -rotate-90 text-brand-accent rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-brand-ink">
                      {projectTitle(project, lang)}
                    </span>
                    <span className="body-text">{project.summary[lang]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <a
          href={getWhatsAppURL(dict.hero.whatsapp_message)}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics={`whatsapp:article-${slug}`}
          className="btn mt-12 inline-flex"
        >
          <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
          {dict.hero.cta_primary}
        </a>
      </div>
    </article>
  )
}
