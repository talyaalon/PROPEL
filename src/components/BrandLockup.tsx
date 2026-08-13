import Image from 'next/image'
import Logo from '@/components/Logo'
import { getLogoSrc } from '@/lib/brandAssets'
import type { Locale } from '@/lib/i18n'

/**
 * The brand panel on the right of the hero.
 *
 * Uses the real artwork when it is present in /public and falls back to the
 * code-drawn lockup when it is not, so a missing file yields the fallback
 * rather than a broken image.
 *
 * The artwork has a transparent background, so it sits directly on the paper
 * band with no blending trick. It was supplied as an SVG wrapping an embedded
 * raster — no vector paths — so it is rasterised, trimmed of its transparent
 * margin and stored as WebP, which is both tighter and a third of the size.
 */

type Props = {
  lang: Locale
  tagline: string
}

export default function BrandLockup({ lang, tagline }: Props) {
  const artwork = getLogoSrc(lang)

  return (
    <div className="flex items-center justify-center">
      {artwork ? (
        <span
          /*
           * `min-w-0`: an inline-flex child of a flex container keeps
           * `min-width: auto`, so the plate could not shrink below the logo's
           * intrinsic width and set a 348px floor on a 320px screen at 200%
           * text - the same shape as the unbreakable email address.
           */
          className="logo-plate inline-flex w-full min-w-0 max-w-[400px] justify-center"
        >
          <Image
            src={artwork}
            alt={`PROPEL - ${tagline}`}
            width={1200}
            height={377}
            priority
            // The slot is capped at 400px by `max-w-[400px]`, so 44vw made Next
            // serve w=640 for a 380px box - 14.7KB of above-fold bytes for nothing.
            sizes="(min-width: 1024px) 400px, 90vw"
            className="h-auto w-full"
          />
        </span>
      ) : (
        <div className="flex w-full max-w-[380px] items-center justify-center px-6 py-10">
          <Logo tagline={tagline} className="text-[3.25rem] sm:text-[3.875rem]" />
        </div>
      )}
    </div>
  )
}
