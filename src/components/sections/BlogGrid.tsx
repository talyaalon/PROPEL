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
  const visible = active === 'all' ? articles : articles.filter((a) => a.topic === active)

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))

  return (
    <>
      {topics.length > 1 && (
        <FilterChips
          label={dict.filter_label}
          status={
            visible.length === 1
              ? dict.filter_status_one
              : dict.filter_status.replace('{n}', String(visible.length))
          }
          active={active}
          onChange={setActive}
          options={[
            { value: 'all' as const, label: dict.all_label },
            ...topics.map((topic) => ({ value: topic, label: dict.topics[topic] })),
          ]}
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {visible.map((article) => {
          const external = isExternal(article)
          const href = external ? article.externalUrl : `/${lang}/blog/${article.slug}`

          const body = (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="tag">{dict.topics[article.topic]}</span>
                {external && (
                  <span className="font-display text-[0.6875rem] uppercase tracking-[.06em] text-brand-slate">
                    {article.source}
                  </span>
                )}
              </div>

              <h2 className="mb-3">{article.title[lang]}</h2>

              <p className="mb-6 flex-1 text-[0.875rem] leading-relaxed text-brand-slate">
                {article.excerpt[lang]}
              </p>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-brand-line pt-4">
                <span className="inline-flex items-center gap-1.5 font-display text-[0.8125rem] font-bold uppercase tracking-[.08em] text-brand-accent">
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

          // External resources leave the site, so they are plain anchors with
          // the security rel and an out-arrow; our own posts route internally.
          return external ? (
            <a
              key={article.externalUrl}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
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
        })}
      </div>

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
          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-brand-slate">
            {dict.related_body}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/${lang}/portfolio/${project.slug}`}
                  className="group flex items-baseline gap-3 text-[0.9375rem] text-brand-ink transition-colors duration-200 hover:text-brand-accent"
                >
                  <ArrowUpRight
                    className="h-4 w-4 flex-shrink-0 -rotate-90 text-brand-accent rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                  <span className="font-semibold">{project.title}</span>
                  <span className="text-[0.8125rem] text-brand-slate">{project.summary[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </>
  )
}
