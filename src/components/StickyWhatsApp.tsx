'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

/**
 * Mobile-only floating WhatsApp button.
 *
 * Appears once the visitor has scrolled past the hero — showing it immediately
 * would compete with the hero's own call to action — and hides again over the
 * contact section, where the form is already the primary action.
 */
export default function StickyWhatsApp({ message, label }: { message: string; label: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const contact = document.getElementById('contact')

    const update = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.8

      let overContact = false
      if (contact) {
        const rect = contact.getBoundingClientRect()
        overContact = rect.top < window.innerHeight && rect.bottom > 0
      }

      setVisible(pastHero && !overContact)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <a
      href={getWhatsAppURL(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-analytics="whatsapp:sticky-mobile"
      className={`fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-black text-white shadow-[0_8px_28px_rgba(17,17,17,0.35)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-95 md:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  )
}
