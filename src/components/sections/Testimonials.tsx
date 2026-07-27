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
    <section
      aria-labelledby="testimonials-heading"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center lg:mb-16">
          <h2
            id="testimonials-heading"
            className="text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl lg:text-[52px] lg:leading-[1.1]"
          >
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-steel sm:text-[17px]">
            {dict.section_subtitle}
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col rounded-[24px] border border-brand-border bg-brand-cream p-7 shadow-soft sm:rounded-[28px] sm:p-8"
            >
              <Quote
                className="h-7 w-7 flex-shrink-0 text-brand-charcoal/15 rtl:-scale-x-100"
                aria-hidden="true"
              />

              <blockquote className="mt-5 flex-1 text-[16px] leading-[1.75] text-brand-charcoal">
                {testimonial.quote[lang]}
              </blockquote>

              <figcaption className="mt-7 flex items-center gap-4 border-t border-brand-border pt-6">
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
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-bold text-brand-charcoal shadow-soft"
                    aria-hidden="true"
                  >
                    {testimonial.name.charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold text-brand-charcoal">
                    {testimonial.name}
                  </span>
                  <span className="block text-[13px] text-brand-steel">
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
