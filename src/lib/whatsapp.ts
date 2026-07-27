import { WHATSAPP_PHONE } from './data'

/**
 * Generates a wa.me deep-link with a pre-filled message.
 * Pass any translated message string — the caller is responsible for locale.
 */
export function getWhatsAppURL(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
