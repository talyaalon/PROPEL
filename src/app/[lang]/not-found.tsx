'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { notFoundCopy, localeFromPathname } from '@/lib/errorMessages'

export default function NotFound() {
  const pathname = usePathname()
  const lang = localeFromPathname(pathname)
  const copy = notFoundCopy[lang]

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-[96px] font-black leading-none tracking-tight text-brand-slate sm:text-[128px]">
          404
        </p>
        <h1 className="mt-2 text-brand-ink">{copy.title}</h1>
        <p className="mt-4 text-[16px] leading-[1.75] text-brand-slate">{copy.body}</p>
        <Link href={`/${lang}`} className="mt-8 inline-flex items-center rounded-full btn">
          {copy.cta}
        </Link>
      </div>
    </section>
  )
}
