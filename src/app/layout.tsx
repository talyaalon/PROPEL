import type { Metadata } from 'next'
import { Assistant, DM_Sans, Raleway } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-assistant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-raleway',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PROPEL',
  description: 'B2B Web Development & Business Automation Agency',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const locale = (headersList.get('x-locale') as 'he' | 'en') || 'he'
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${assistant.variable} ${dmSans.variable} ${raleway.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
