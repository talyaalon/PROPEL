import type { ReactNode } from 'react'
import type { Locale } from '../../../middleware'
import { getDictionary } from '@/lib/getDictionary'
import Navigation from '@/components/Navigation'
import Footer from '@/components/sections/Footer'

type Props = {
  children: ReactNode
  params: Promise<{ lang: Locale }>
}

export async function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }]
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <>
      <Navigation lang={lang} dict={dict.nav} />
      <main>{children}</main>
      <Footer lang={lang} dict={dict.footer} />
    </>
  )
}
