import Image from 'next/image'
import { Quote } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { testimonials } from '@/content/testimonials'

type TestimonialsDict = {
  section_title: string
  section_subtitle: string
}

type Props = {
  lang: Locale
  dict: TestimonialsDict
}

export default function Testimonials({ lang, dict }: Props) {
  // Renders nothing until there are real quotes to show.
  if (testimonials.length === 0) return null

  return (
    <section aria-labelledby="testimonials-heading" className="section">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center lg:mb-16">
          <h2
            id="testimonials-heading"
            className="text-brand-ink lg:text-[3.25rem] lg:leading-[1.1]"
          >
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-slate sm:text-[1.0625rem]">
            {dict.section_subtitle}
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col border border-brand-line bg-brand-surface p-7 sm:p-8"
            >
              <Quote
                className="h-7 w-7 flex-shrink-0 text-brand-slate rtl:-scale-x-100"
                aria-hidden="true"
              />

              <blockquote className="mt-5 flex-1 text-[1rem] leading-[1.75] text-brand-ink">
                {testimonial.quote[lang]}
              </blockquote>

              <figcaption className="mt-7 flex items-center gap-4 border-t border-brand-line pt-6">
                {testimonial.photo ? (
                  <Image
                    src={testimonial.photo}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-panel text-[0.875rem] font-bold text-brand-ink "
                    aria-hidden="true"
                  >
                    {testimonial.name.charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[0.875rem] font-bold text-brand-ink">
                    {testimonial.name}
                  </span>
                  <span className="block text-[0.8125rem] text-brand-slate">
                    {testimonial.role[lang]}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
