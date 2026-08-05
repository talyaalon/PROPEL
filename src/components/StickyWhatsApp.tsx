'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

/**
 * Mobile-only floating WhatsApp button.
 *
 * Appears once the visitor has scrolled past the hero - showing it immediately
 * would compete with the hero's own call to action - and hides again over the
 * contact section, where the form is already the primary action.
 */
export default function StickyWhatsApp({ message, label }: { message: string; label: string }) {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  /*
   * Keyed on the pathname, and `#contact` is resolved inside the handler rather
   * than captured once.
   *
   * This component is mounted in the root layout, so it never unmounts on a
   * client-side navigation and the effect used to run exactly once per document.
   * Two ordinary journeys broke it:
   *
   *  - Home -> a project page -> home. The captured node is detached by then.
   *    `getBoundingClientRect()` on a detached node returns all zeros, so
   *    `rect.bottom > 0` is false forever and the button never hides.
   *  - Landing on /blog from search, then clicking the logo. There is no
   *    `#contact` on the blog, so `contact` was null for the rest of the
   *    session - no back-navigation needed.
   *
   * In both cases the button sat over the contact form's full-width submit
   * button, which is the one place it exists to avoid: the visitor taps
   * WhatsApp instead of Send.
   *
   * The overlap is observed rather than measured. The previous version called
   * `getBoundingClientRect()` inside the scroll handler - one forced synchronous
   * layout per scroll event, the only layout thrash in the codebase.
   */
  useEffect(() => {
    let overContact = false
    let pastHero = false

    const apply = () => setVisible(pastHero && !overContact)

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.8
      apply()
    }

    const contact = document.getElementById('contact')
    const observer = contact
      ? new IntersectionObserver(([entry]) => {
          overContact = entry.isIntersecting
          apply()
        })
      : null
    if (contact && observer) observer.observe(contact)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return (
    <a
      href={getWhatsAppURL(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-analytics="whatsapp:sticky-mobile"
      /*
       * `inert` while hidden. `pointer-events: none` stops the mouse but not the
       * keyboard: at `opacity: 0` this was still the last tab stop on the page,
       * and since the element is transparent so is its focus ring - the
       * indicator simply vanished (2.4.7 Focus Visible).
       */
      inert={!visible}
      className={`fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent text-brand-surface transition-all duration-300 ease-smooth active:scale-95 md:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  )
}
