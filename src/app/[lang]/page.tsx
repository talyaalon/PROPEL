import type { Metadata } from 'next'
import type { Locale } from '../../../middleware'
import { getDictionary } from '@/lib/getDictionary'
import { SITE_URL } from '@/lib/data'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import Portfolio from '@/components/sections/Portfolio'
import About from '@/components/sections/About'

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        he: `${SITE_URL}/he`,
        en: `${SITE_URL}/en`,
      },
    },
  }
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <>
      <Hero lang={lang} dict={dict.hero} stats={dict.stats} />
      <Services lang={lang} dict={dict.services} />
      <Portfolio lang={lang} dict={dict.portfolio} />
      <About lang={lang} dict={dict.about} />
    </>
  )
}
