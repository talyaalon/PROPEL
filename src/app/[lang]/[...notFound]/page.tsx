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
 * **The cost, stated plainly: this responds 200, not 404.** `noindex` below
 * keeps it out of search, which is the part that would otherwise matter. A
 * genuine 404 status would need `<html>` to move above the locale segment, and
 * that trade - every English page served as `lang="he"` - is far worse than a
 * soft 404 on a page nobody should reach.
 */

type Props = {
  params: Promise<{ lang: string }>
}

export const dynamicParams = true

export function generateStaticParams() {
  // One prerendered path per locale so the segment exists in the build; every
  // other path under it renders on demand.
  return locales.map((lang) => ({ lang, notFound: ['404'] }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}

  return {
    title: notFoundCopy[lang].title,
    // It answers 200, so this is what keeps it out of the index.
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
