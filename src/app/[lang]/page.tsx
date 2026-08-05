import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { professionalServiceSchema, faqSchema } from '@/lib/schema'
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

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: {
        he: `${siteConfig.url}/he`,
        en: `${siteConfig.url}/en`,
        // Tells Google which version to serve to visitors it has no match for
        'x-default': `${siteConfig.url}/he`,
      },
    },
  }
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <>
      <JsonLd schema={professionalServiceSchema(lang, dict.meta.description)} />
      <JsonLd schema={faqSchema(dict.faq.items)} />

      {/* Order follows the questions a prospect asks, in the order they ask them:
 what do you do → how does it work → prove it → who are you → what about
 … → how do I start.

 The hero is deliberately not wrapped in Reveal: it is above the fold,
 it already has its own entrance animation, and it is the LCP element. */}
      <Hero lang={lang} dict={dict.hero} />
      <TrustedBy label={dict.trusted_by} />

      <Reveal>
        <Services dict={dict.services} />
      </Reveal>
      <Reveal>
        <Process dict={dict.process} />
      </Reveal>
      <Reveal>
        <Portfolio lang={lang} dict={dict.portfolio} />
      </Reveal>
      <Reveal>
        <Testimonials lang={lang} dict={dict.testimonials} />
      </Reveal>
      <Reveal>
        <About dict={dict.about} />
      </Reveal>
      <Reveal>
        <Faq dict={dict.faq} />
      </Reveal>
      <Reveal>
        <Contact lang={lang} dict={dict.contact} />
      </Reveal>
    </>
  )
}
