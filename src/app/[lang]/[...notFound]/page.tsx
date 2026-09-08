import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { notFoundCopy } from '@/lib/errorMessages'

/**
 * Every path under a locale that matches no real route.
 *
 * Without this, `/he/nope` matched nothing and Next fell through to its own
 * built-in error page - which lives outside every layout in this project. A
 * Hebrew visitor following a stale link got an English page with **no `lang`
 * and no `dir`**, no stylesheet, no navigation, no footer and no accessibility
 * menu, styled with a hardcoded `border-right` for LTR. That is 3.1.1 Language
 * of Page, Level A.
 *
 * Three approaches were tried before this one, and it is worth recording why
 * they do not work here:
 *
 *  - A root `app/not-found.tsx` rendering its own `<html lang>`. With no
 *    `app/layout.tsx` above it, Next wraps it in a generated default layout and
 *    the document element it renders never reaches the response.
 *  - This same catch-all calling `notFound()`. That resolves to the *global*
 *    boundary, not `[lang]/not-found.tsx` - the prerendered output is
 *    `<html id="__next_error__">` with no locale on it.
 *  - Moving `<html>` into a real root layout. A root layout cannot read
 *    `[lang]`, so English would be served as Hebrew.
 *
 * So the page renders the not-found content itself, inside the locale layout,
 * which is what makes it a Hebrew page for a Hebrew visitor.
 *
 * The status comes from somewhere else. A page cannot set its own, so this
 * one is prerendered once per locale at `/{locale}/page-not-found`, and
 * `src/middleware.ts` fetches it and re-sends it under the visitor's URL with
 * a real 404 - see `notFoundResponse` there for the five ways that failed.
 * Visited at its own address it answers 200: it is `noindex` and in no
 * sitemap, nothing links to it, and nothing indexes it.
 */

type Props = {
  params: Promise<{ lang: string }>
}

export const dynamicParams = true

export function generateStaticParams() {
  // One prerendered path per locale, the one the middleware fetches. Nothing
  // else under this segment is ever rendered on demand - `[lang]/layout.tsx`
  // sets `dynamicParams = false` and that gates the subtree - so this address
  // is the whole point of the file.
  return locales.map((lang) => ({ lang, notFound: ['page-not-found'] }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}

  const copy = notFoundCopy[lang]

  return {
    title: copy.title,
    /*
     * Its own description and share card, not the layout's.
     *
     * Setting only `title` left this page inheriting the homepage's
     * description, `og:title` and `og:url` - so a dead link pasted into
     * WhatsApp previewed as the homepage, and this was the one duplicate meta
     * description across all 45 responses. That is the exact defect
     * `pageMetadata` was written to stop; this route predates it and never
     * used it.
     */
    description: copy.body,
    openGraph: {
      title: copy.title,
      description: copy.body,
      type: 'website',
      siteName: 'PROPEL',
      locale: lang === 'he' ? 'he_IL' : 'en_US',
      // No `url`: there is no canonical address for "whatever you typed".
      url: undefined,
    },
    twitter: { title: copy.title, description: copy.body },
    // At its own address it answers 200; re-sent by the middleware it answers
    // 404. Either way this is what keeps it out of the index.
    robots: { index: false, follow: true },
  }
}

export default async function NotFoundCatchAll({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const copy = notFoundCopy[lang]

  return (
    <section className="section flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-lg text-center">
        {/* `min(6rem, 20vw)`: 6rem doubles to 192px under the menu's 200% text
            setting, and the "404" then measured 348px wide in a 320px viewport -
            14px of sideways scroll on the one page whose predecessor was
            deleted for accessibility failures. The vw term never wins at 100%
            (20vw at 320 is 64px only where the rem term has already doubled),
            so nothing changes visually except where it was broken. The global
            heading clamp cannot cover this - `.num` on a <p> is outside it.
            `length:` is not decoration: `min()` is ambiguous to Tailwind
            (colour or size?), and without the hint the whole utility
            compiles to nothing - silently. `npm run audit -- css` caught it. */}
        <p
          className="num text-[length:min(6rem,20vw)] leading-none sm:text-[length:min(8rem,25vw)]"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="mt-2 text-brand-ink">{copy.title}</h1>
        <p className="mt-4 text-[1rem] leading-[1.75] text-brand-slate">{copy.body}</p>

        <Link href={`/${lang}`} className="btn mt-8 inline-flex items-center">
          {copy.cta}
        </Link>
      </div>
    </section>
  )
}
