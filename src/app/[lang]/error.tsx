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
        <h1 className="text-brand-ink">{copy.title}</h1>
        <p className="mt-4 text-[1rem] leading-[1.75] text-brand-slate">{copy.body}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center rounded-full btn"
        >
          {copy.cta}
        </button>
      </div>
    </section>
  )
}
