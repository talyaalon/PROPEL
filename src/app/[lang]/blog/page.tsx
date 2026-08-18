import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { pageMetadata } from '@/lib/pageMetadata'
import { getArticles, getUsedTopics } from '@/content/articles'
import { getProjects, projectTitle } from '@/content/projects'
import BlogGrid from '@/components/sections/BlogGrid'

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = await getDictionary(lang)

  return pageMetadata({
    lang,
    path: 'blog',
    title: dict.blog.meta_title,
    description: dict.blog.meta_description,
  })
}

export default async function BlogPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <section className="section" aria-labelledby="blog-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 lg:mb-16">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              01
            </span>
            {dict.blog.eyebrow}
          </p>
          <h1 id="blog-heading" className="max-w-3xl">
            {dict.blog.title}
          </h1>
          <p className="lead mt-5 max-w-2xl">{dict.blog.subtitle}</p>
        </div>

        <BlogGrid
          lang={lang}
          dict={dict.blog}
          articles={getArticles()}
          topics={getUsedTopics()}
          // The three with a public URL - the ones a reader can actually go
          // and look at. Air Manage and BOM sit behind a login.
          projects={getProjects()
            .filter((project) => project.screens)
            .slice(0, 3)
            .map((project) => ({
              slug: project.slug,
              title: projectTitle(project, lang),
              summary: project.summary,
            }))}
        />
      </div>
    </section>
  )
}
