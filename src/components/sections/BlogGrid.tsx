'use client'

import { useState } from 'react'
import Link from 'next/link'
import FilterChips from '@/components/FilterChips'
import { ArrowUpRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { isExternal, type Article, type ArticleTopic } from '@/content/articles'

type BlogDict = {
  all_label: string
  filter_label: string
  filter_status: string
  filter_status_one: string
  related_title: string
  related_body: string
  topics: Record<ArticleTopic, string>
  read_more: string
  external_note: string
  sources_title: string
  sources_body: string
}

type Props = {
  lang: Locale
  dict: BlogDict
  articles: Article[]
  topics: ArticleTopic[]
  /** Resolved on the server - three case studies to link back to. */
  projects: { slug: string; title: string; summary: Record<Locale, string> }[]
}

export default function BlogGrid({ lang, dict, articles, topics, projects }: Props) {
  const [active, setActive] = useState<ArticleTopic | 'all'>('all')

  /*
   * Ours first, theirs after - and in a section of their own.
   *
   * The page promised "articles" and was six outbound links. Every one is
   * genuinely useful and they stay, but as a shelf of references under the
   * writing rather than in place of it: the grid a visitor reads first is now
   * the one that can rank, and an outbound link is not competing with it for
   * the same row.
   */
  const own = articles.filter((a) => !isExternal(a))
  const sources = articles.filter(isExternal)

  const filtered = (list: Article[]) =>
    active === 'all' ? list : list.filter((a) => a.topic === active)
  const visible = filtered(own)
  const visibleSources = filtered(sources)

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))

  /*
   * One card renderer for both groups. It was inline in a single map;
   * splitting the list in two would otherwise have duplicated forty lines
   * of markup, and the two copies would have drifted.
   */
  const card = (article: Article) => {
    const external = isExternal(article)
    const href = external ? article.externalUrl : `/${lang}/blog/${article.slug}`

    const body = (
      <>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="tag">{dict.topics[article.topic]}</span>
          {external && (
            <span className="font-display text-[0.75rem] uppercase tracking-[.06em] text-brand-slate">
              {article.source}
            </span>
          )}
        </div>

        <h2 className="mb-3">{article.title[lang]}</h2>

        <p className="mb-6 flex-1 text-[0.875rem] leading-relaxed text-brand-slate">
          {article.excerpt[lang]}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-brand-line pt-4">
          <span className="inline-flex items-center gap-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent">
            {dict.read_more}
            {external && (
              <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
            )}
          </span>
          <time dateTime={article.date} className="text-[0.75rem] text-brand-slate">
            {formatDate(article.date)}
          </time>
        </div>
      </>
    )

    const className = 'card flex flex-col'

    /*
     * External resources leave the site, so they are plain anchors with
     * the security rel and an out-arrow; our own posts route internally.
     *
     * `nofollow` on top of that. These six point at web.dev, Google,
     * NN/g, gov.il, Next.js and schema.org - six of the highest-authority
     * domains on the web - from a page that is a curated reading list
     * rather than commentary. Passing link equity to them earns nothing
     * and costs what little this site has. The links stay: they are
     * genuinely useful, and that is the point of the page.
     */
    return external ? (
      <a
        key={article.externalUrl}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        data-analytics={`article:${article.source}`}
        className={className}
      >
        <span className="sr-only">{dict.external_note}</span>
        {body}
      </a>
    ) : (
      <Link key={article.slug} href={href} className={className}>
        {body}
      </Link>
    )
  }

  return (
    <>
      {topics.length > 1 && (
        <FilterChips
          label={dict.filter_label}
          status={
            visible.length + visibleSources.length === 1
              ? dict.filter_status_one
              : dict.filter_status.replace('{n}', String(visible.length + visibleSources.length))
          }
          active={active}
          onChange={setActive}
          options={[
            { value: 'all' as const, label: dict.all_label },
            ...topics.map((topic) => ({ value: topic, label: dict.topics[topic] })),
          ]}
        />
      )}

      {/* Ours. This is the grid the page exists for. */}
      {visible.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{visible.map(card)}</div>
      )}

      {/* Theirs - a reference shelf beneath the writing rather than instead of
          it. Same card, its own heading, so nothing here reads as ours. */}
      {visibleSources.length > 0 && (
        <section
          className={visible.length > 0 ? 'mt-14 border-t border-brand-line pt-10' : ''}
          aria-labelledby="blog-sources"
        >
          <h2 id="blog-sources" className="text-brand-ink lg:text-[1.75rem]">
            {dict.sources_title}
          </h2>
          <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-brand-slate">
            {dict.sources_body}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleSources.map(card)}
          </div>
        </section>
      )}

      {/*
        The blog links out to six high-authority domains and, until this, to
        nothing of its own - so it spent link equity and earned none. These
        three point back at the work the articles are about. It is also the
        only route by which a visitor who arrived on the blog from search
        reaches a case study without going via the homepage.
      */}
      {projects.length > 0 && (
        <aside className="mt-16 border-t border-brand-line pt-10" aria-labelledby="blog-work">
          <h2 id="blog-work" className="text-brand-ink lg:text-[1.75rem]">
            {dict.related_title}
          </h2>
          <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-brand-slate">
            {dict.related_body}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/${lang}/portfolio/${project.slug}`}
                  className="group flex items-baseline gap-3 text-[1rem] text-brand-ink transition-colors duration-200 hover:text-brand-accent"
                >
                  <ArrowUpRight
                    className="h-4 w-4 flex-shrink-0 -rotate-90 text-brand-accent rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                  <span className="font-semibold">{project.title}</span>
                  <span className="text-[0.875rem] text-brand-slate">{project.summary[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </>
  )
}
