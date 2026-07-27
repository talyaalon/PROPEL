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
        <p className="font-raleway text-[96px] font-black leading-none tracking-tight text-brand-charcoal/10 sm:text-[128px]">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-[16px] leading-[1.75] text-brand-steel">{copy.body}</p>
        <Link
          href={`/${lang}`}
          className="mt-8 inline-flex items-center rounded-full bg-brand-black px-8 py-4 text-[15px] font-semibold tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,17,17,0.28)]"
        >
          {copy.cta}
        </Link>
      </div>
    </section>
  )
}
