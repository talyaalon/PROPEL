import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { getProjects } from '@/content/projects'
import { pageMetadata } from '@/lib/pageMetadata'
import { faqSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import Reveal from '@/components/Reveal'
import Hero from '@/components/sections/Hero'
import TrustedBy from '@/components/sections/TrustedBy'
import Services from '@/components/sections/Services'
import Process from '@/components/sections/Process'
import Portfolio from '@/components/sections/Portfolio'
import Testimonials from '@/components/sections/Testimonials'
import About from '@/components/sections/About'
import Faq from '@/components/sections/Faq'
import Contact from '@/components/sections/Contact'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = await getDictionary(lang)

  /*
   * Through the shared helper like every other route. The homepage was the one
   * page that still wrote its own metadata with no `openGraph` block, and it
   * looked correct only because the layout it inherits from happens to be the
   * homepage's own. Any layout-level change would have broken it silently,
   * which is the exact failure the helper exists to prevent.
   */
  return pageMetadata({
    lang,
    path: '',
    title: dict.meta.title,
    description: dict.meta.description,
  })
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  /*
   * Clause numbers, computed where section visibility is known. They were
   * hardcoded inside each component, which held only until a section could
   * vanish: Portfolio hides itself when no project is published, and the
   * document would have read 01, 02, 04 - a numbered document with a missing
   * clause. Testimonials renders nothing today and is deliberately
   * unnumbered; give it a number here the day it has content.
   */
  // The same condition Portfolio uses to hide itself.
  const hasProjects = getProjects().length > 0

  const clauses = (() => {
    let n = 0
    const next = () => String(++n).padStart(2, '0')
    return {
      services: next(),
      process: next(),
      portfolio: hasProjects ? next() : '',
      about: next(),
      faq: next(),
      contact: next(),
    }
  })()

  return (
    <>
      {/* The organization node moved to the layout - every page carries it now,
          because every page's schema references its @id. What stays here is
          the FAQ, which only exists on this page. */}
      <JsonLd schema={faqSchema(dict.faq.items)} />

      {/* Order follows the questions a prospect asks, in the order they ask them:
 what do you do → how does it work → prove it → who are you → what about
 … → how do I start.

 The hero is deliberately not wrapped in Reveal: it is above the fold,
 it already has its own entrance animation, and it is the LCP element. */}
      <Hero lang={lang} dict={dict.hero} />
      <TrustedBy label={dict.trusted_by} />

      <Reveal>
        <Services lang={lang} dict={dict.services} clause={clauses.services} />
      </Reveal>
      <Reveal>
        <Process dict={dict.process} clause={clauses.process} />
      </Reveal>
      <Reveal>
        <Portfolio lang={lang} dict={dict.portfolio} clause={clauses.portfolio} />
      </Reveal>
      <Reveal>
        <Testimonials lang={lang} dict={dict.testimonials} />
      </Reveal>
      <Reveal>
        <About dict={dict.about} clause={clauses.about} />
      </Reveal>
      <Reveal>
        <Faq dict={dict.faq} clause={clauses.faq} />
      </Reveal>
      <Reveal>
        <Contact lang={lang} dict={dict.contact} clause={clauses.contact} />
      </Reveal>
    </>
  )
}
