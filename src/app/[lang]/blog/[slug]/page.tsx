import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import { getInternalArticles, getArticleBySlug, readingMinutes } from '@/content/articles'
import { getProjects, projectTitle } from '@/content/projects'
import { mdxPosts } from '@/content/generated/posts'
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
 * Two body dialects share this page. Articles typed in articles.ts stay
 * paragraphs + `## ` headings. The MDX posts under content/blog/ - read-only
 * source of record - additionally use **bold**, `inline code`, [links](...),
 * `- ` lists, `> ` quotes and ```fenced code```. renderBody() covers the
 * union; anything outside it renders as literal text, visibly, rather than
 * silently vanishing - the honest failure mode for a hand-rolled renderer.
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

  const base = pageMetadata({
    lang,
    path: `blog/${slug}`,
    title: article.title[lang],
    description: article.description[lang],
    type: 'article',
  })

  /*
   * The MDX extension: keywords, the og:title/og:description overrides, and
   * real article timestamps. Spread ONTO the base rather than rebuilt, so the
   * canonical/hreflang/image handling stays pageMetadata's alone - that
   * helper exists because three pages built this object by hand and all
   * three got it wrong in different ways.
   */
  const mdx = mdxPosts.find((post) => post.slug === slug)
  if (!mdx) return base

  const social = mdx.ogTitle[lang].includes('PROPEL')
    ? mdx.ogTitle[lang]
    : `${mdx.ogTitle[lang]} | PROPEL`

  return {
    ...base,
    ...(mdx.keywords[lang].length ? { keywords: mdx.keywords[lang] } : {}),
    openGraph: {
      ...base.openGraph,
      title: social,
      description: mdx.ogDescription[lang],
      type: 'article',
      publishedTime: mdx.date,
      modifiedTime: mdx.updated ?? mdx.date,
    },
    twitter: {
      ...base.twitter,
      title: social,
      description: mdx.ogDescription[lang],
    },
  }
}

/*
 * Inline markdown: **bold**, `code`, [text](href). Recursive descent on the
 * earliest match, so `**bold with \`code\` inside**` nests correctly - the six
 * MDX files do exactly that. No dangerouslySetInnerHTML anywhere: everything
 * lands in the DOM as text nodes through React, so nothing in a content file
 * can become markup.
 *
 * `code` gets dir=ltr + bdi isolation via the .article-body CSS: `|| 14` or
 * `httpOnly` inside a Hebrew sentence otherwise throws its punctuation to the
 * wrong side - README section 5's exact warning.
 */
// Numbered groups, not named - the project's tsconfig target predates the
// ES2018 regex features. 2: **bold**, 4: `code`, 6+7: [label](href).
const INLINE = /(\*\*([^*]+)\*\*)|(`([^`\n]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let rest = text
  let i = 0
  while (rest) {
    const m = rest.match(INLINE)
    if (!m || m.index === undefined) {
      out.push(rest)
      break
    }
    if (m.index > 0) out.push(rest.slice(0, m.index))
    const g = { bold: m[2], code: m[4], label: m[6], href: m[7] }
    const key = `${keyBase}-${i++}`
    if (g.bold !== undefined) {
      out.push(<strong key={key}>{renderInline(g.bold, key)}</strong>)
    } else if (g.code !== undefined) {
      out.push(<code key={key}>{g.code}</code>)
    } else if (g.label !== undefined && g.href !== undefined) {
      // Internal links go through <Link>; external ones open elsewhere and
      // carry the security rel, same policy as BlogGrid's source cards.
      /*
       * The MDX files link their closing CTA to /he/contact and /en/contact.
       * No such route exists - the site's contact target is the homepage
       * anchor, the same one the footer uses - so the one conversion link in
       * every article body landed on the localised 404. The files are
       * read-only source of record, and where a link points is a routing
       * concern, so the mapping lives here with the rest of the routing
       * decisions. If a real /contact page is ever built, delete this and the
       * links start meaning what they say.
       */
      const href =
        g.href !== undefined && /^\/(he|en)\/contact$/.test(g.href)
          ? g.href.replace('/contact', '#contact')
          : g.href
      out.push(
        g.href.startsWith('/') ? (
          <Link key={key} href={href as string} className="article-link">
            {renderInline(g.label, key)}
          </Link>
        ) : (
          <a
            key={key}
            href={g.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="article-link"
          >
            {renderInline(g.label, key)}
          </a>
        ),
      )
    }
    rest = rest.slice(m.index + m[0].length)
  }
  return out
}

/**
 * Block-level markdown, the union of both body dialects. Fenced code first
 * (its content is literal and may contain blank lines), then per-block:
 * `## ` heading with the clause numbering, `- ` list, `> ` quote, paragraph.
 */
function renderBody(body: string, codeLabel: string) {
  let clause = 1
  const nodes: React.ReactNode[] = []

  // Fenced code blocks are extracted before the blank-line split - a blank
  // line inside ``` is code, not a paragraph boundary.
  const segments = body.split(/^```[a-z]*\n?([\s\S]*?)^```\s*$/m)

  segments.forEach((segment, si) => {
    if (si % 2 === 1) {
      /*
       * Odd segments are fence contents, verbatim. tabIndex, not a browser
       * intervention: the block scrolls horizontally on phones, and Chrome
       * and Firefox make overflow containers focusable on their own - Safari
       * does not, which left a keyboard-only Safari reader unable to reach
       * the clipped end of the line the article is about. The role and the
       * localised label are what stop the focus stop from announcing itself
       * as a wall of raw code.
       */
      nodes.push(
        <pre key={`f${si}`} tabIndex={0} role="region" aria-label={codeLabel}>
          <code>{segment.replace(/\n$/, '')}</code>
        </pre>,
      )
      return
    }
    segment
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .forEach((block, bi) => {
        const key = `s${si}b${bi}`
        // A thematic break, not a paragraph that says "---". Every article
        // closes with one before its CTA; rendering it literally shipped a
        // junk paragraph at the most conversion-critical spot on the page.
        if (/^-{3,}$/.test(block)) {
          nodes.push(<hr key={key} aria-hidden="true" className="mt-10 border-t border-brand-line" />)
          return
        }
        if (block.startsWith('## ')) {
          clause += 1
          nodes.push(
            <h2 key={key} className="mt-12 text-brand-ink">
              <span className="clause" aria-hidden="true">
                {String(clause).padStart(2, '0')}
              </span>
              {/* The WordPress article numbers its own headings "1." to "5.".
                  Next to the injected clause number that read "02 · 1." - two
                  sequences, off by one, on five consecutive headings. The
                  clause system owns numbering site-wide, so an authored
                  leading ordinal yields to it. */}
              {renderInline(block.slice(3).replace(/^\d+\.\s*/, ''), key)}
            </h2>,
          )
          return
        }
        if (/^[-*] /m.test(block) && block.split('\n').every((l) => /^[-*] /.test(l.trim()))) {
          nodes.push(
            <ul key={key} className="mt-5">
              {block.split('\n').map((line, li) => (
                <li key={li}>{renderInline(line.trim().replace(/^[-*] /, ''), `${key}-${li}`)}</li>
              ))}
            </ul>,
          )
          return
        }
        if (block.startsWith('> ')) {
          const quote = block
            .split('\n')
            .map((line) => line.replace(/^>\s?/, ''))
            .join(' ')
          nodes.push(<blockquote key={key}>{renderInline(quote, key)}</blockquote>)
          return
        }
        nodes.push(
          <p key={key} className="mt-5 text-[1.0625rem] leading-[1.8] text-brand-ink">
            {renderInline(block, key)}
          </p>,
        )
      })
  })

  return nodes
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()

  const article = getArticleBySlug(slug)
  if (!article || !('body' in article)) notFound()

  // The MDX extras - FAQ, keywords, updated, related posts. Undefined for
  // articles typed directly in articles.ts.
  const mdx = mdxPosts.find((post) => post.slug === slug)

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
          dateModified: mdx?.updated ?? undefined,
          keywords: mdx?.keywords[lang],
        })}
      />
      {/* FAQPage only when the visible FAQ section below renders - schema
          without matching visible content is treated as a violation. */}
      {mdx && mdx.faq[lang].length > 0 && (
        <JsonLd
          schema={faqSchema(mdx.faq[lang].map(({ q, a }) => ({ question: q, answer: a })))}
        />
      )}
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
          /*
           * flex + w-fit, not inline-flex: the eyebrow after it is also
           * inline-level, so the two shared one line box - at 390px the topic
           * label wrapped around the back link, and the mb-10 on the first of
           * two elements sharing a line did nothing.
           */
          className="mb-10 flex w-fit items-center gap-2 text-sm font-medium text-brand-slate transition-colors hover:text-brand-ink"
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
          {/*
            The attribute stays machine-readable; the text is for a person.
            This printed the raw `2026-08-18` while the card that links here
            printed "18 באוג׳ 2026" - the same date in two formats, one of them
            not a date any reader writes. Same formatter as BlogGrid, so the
            card and the page it opens cannot drift again.
            No `dir` override: the formatted Hebrew string starts with a strong
            Hebrew character and an ISO string does not, so a hardcoded ltr was
            right for the old value and wrong for this one.
          */}
          <time dateTime={article.date}>
            {new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC',
            }).format(new Date(article.date))}
          </time>
          {/* Computed from the body, never typed - a stated reading time that
              does not match the article is the first promise the page breaks. */}
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          {minutes === 1
            ? dict.blog.reading_time_one
            : dict.blog.reading_time.replace('{n}', String(minutes))}
          {/* Shown only when it differs from the publication date: it feeds
              dateModified in the schema, and a visible claim should back it. */}
          {mdx?.updated && mdx.updated !== article.date && (
            <>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              {dict.blog.updated_label}{' '}
              <time dateTime={mdx.updated}>
                {new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                }).format(new Date(mdx.updated))}
              </time>
            </>
          )}
        </p>

        <h1 className="max-w-2xl">{article.title[lang]}</h1>
        <p className="lead mt-6">{article.excerpt[lang]}</p>

        <div className="article-body mt-4">
          {renderBody(article.body[lang], dict.blog.code_sample)}
        </div>

        {/*
          The FAQ, visible. README section 3's one unbreakable rule: answers
          must exist as page text, not only inside the FAQPage schema - Google
          treats structured data with no visible counterpart as a violation.
          Real h3/p content in the document, found by find-in-page.
        */}
        {mdx && mdx.faq[lang].length > 0 && (
          <section aria-labelledby="article-faq" className="mt-14 border-t border-brand-line pt-10">
            <h2 id="article-faq" className="text-brand-ink">
              {/* The next clause after the body's last heading - a same-scale
                  h2 that dropped out of the numbering read as an omission, not
                  a distinction. +2: the count is headings, clauses start at
                  the eyebrow's 01. */}
              <span className="clause" aria-hidden="true">
                {String((article.body[lang].match(/^## /gm) ?? []).length + 2).padStart(2, '0')}
              </span>
              {dict.blog.faq_title}
            </h2>
            {/* The answers keep the article's 68ch measure - these are the
                paragraphs a snippet-seeking reader lands on, and they were
                the only prose on the page running the container's full 768px. */}
            <div className="article-measure">
              {mdx.faq[lang].map(({ q, a }, index) => (
                <div key={index} className="mt-8">
                  <h3 className="text-[1.125rem] font-bold leading-snug text-brand-ink">{q}</h3>
                  <p className="mt-3 text-[1.0625rem] leading-[1.8] text-brand-ink">{a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cross-links between the posts themselves - the `related` field. */}
        {mdx && mdx.related.length > 0 && (
          <nav aria-labelledby="article-more" className="mt-14 border-t border-brand-line pt-10">
            <h2
              id="article-more"
              className="text-xs font-bold uppercase tracking-[0.2em] text-brand-slate"
            >
              {dict.blog.more_articles_title}
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {mdx.related.flatMap((relatedSlug) => {
                const relatedPost = mdxPosts.find((post) => post.slug === relatedSlug)
                if (!relatedPost) return []
                return [
                  <li key={relatedSlug}>
                    <Link
                      href={`/${lang}/blog/${relatedSlug}`}
                      className="card flex flex-wrap items-baseline gap-3 p-5"
                    >
                      <ArrowRight
                        className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-brand-ink">
                        {relatedPost.title[lang]}
                      </span>
                      <span className="body-text">{relatedPost.description[lang]}</span>
                    </Link>
                  </li>,
                ]
              })}
            </ul>
          </nav>
        )}

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
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
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
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
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
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
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
