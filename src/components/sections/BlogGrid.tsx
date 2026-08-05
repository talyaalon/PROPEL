'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { isExternal, type Article, type ArticleTopic } from '@/content/articles'

type BlogDict = {
  all_label: string
  topics: Record<ArticleTopic, string>
  read_more: string
  external_note: string
}

type Props = {
  lang: Locale
  dict: BlogDict
  articles: Article[]
  topics: ArticleTopic[]
}

export default function BlogGrid({ lang, dict, articles, topics }: Props) {
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
        <div className="mb-10 flex flex-wrap gap-2" role="group">
          <Chip
            label={dict.all_label}
            isActive={active === 'all'}
            onClick={() => setActive('all')}
          />
          {topics.map((topic) => (
            <Chip
              key={topic}
              label={dict.topics[topic]}
              isActive={active === topic}
              onClick={() => setActive(topic)}
            />
          ))}
        </div>
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
    </>
  )
}

function Chip({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`border px-4 py-2 font-display text-[0.75rem] font-semibold uppercase tracking-[.06em] transition-all duration-200 ease-smooth ${
        isActive
          ? 'border-brand-accent bg-brand-accent text-brand-surface'
          : 'border-brand-line bg-brand-panel text-brand-slate hover:border-brand-accent hover:text-brand-accent'
      }`}
    >
      {label}
    </button>
  )
}
