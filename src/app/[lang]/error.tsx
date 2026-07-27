'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { errorCopy, localeFromPathname } from '@/lib/errorMessages'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: Props) {
  const pathname = usePathname()
  const copy = errorCopy[localeFromPathname(pathname)]

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-[16px] leading-[1.75] text-brand-steel">{copy.body}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center rounded-full bg-brand-black px-8 py-4 text-[15px] font-semibold tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,17,17,0.28)]"
        >
          {copy.cta}
        </button>
      </div>
    </section>
  )
}
