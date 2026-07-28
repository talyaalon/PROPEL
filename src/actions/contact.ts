'use server'

import { siteConfig } from '@/lib/config'

/**
 * Contact form handler.
 *
 * Delivers through Resend's REST API directly — no SDK, so the project gains no
 * new dependency. When no API key is configured (local development) the
 * submission is logged to the server console instead of silently vanishing.
 */

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reason: 'required' | 'email' | 'contact' | 'send' }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: a real person never fills a field they cannot see. Return success
  // so the bot has no signal that it was caught.
  if (formData.get('company_website')) return { status: 'success' }

  const name = String(formData.get('name') ?? '').trim()
  const business = String(formData.get('business') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || !message) return { status: 'error', reason: 'required' }
  if (!phone && !email) return { status: 'error', reason: 'contact' }
  if (email && !EMAIL_PATTERN.test(email)) return { status: 'error', reason: 'email' }

  const lines = [
    `Name:      ${name}`,
    business && `Business:  ${business}`,
    phone && `Phone:     ${phone}`,
    email && `Email:     ${email}`,
    budget && `Budget:    ${budget}`,
    '',
    message,
  ].filter(Boolean)

  const body = lines.join('\n')
  const apiKey = process.env.RESEND_API_KEY
  const inbox = siteConfig.inboxEmail

  if (!apiKey || !inbox) {
    console.warn(
      '[PROPEL contact] RESEND_API_KEY or CONTACT_INBOX_EMAIL is not set — logging the submission instead of sending it:\n' +
        body,
    )
    return { status: 'success' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'PROPEL <onboarding@resend.dev>',
        to: [inbox],
        // So hitting reply in the inbox answers the prospect directly
        reply_to: email || undefined,
        subject: `פנייה חדשה מהאתר — ${name}${business ? ` (${business})` : ''}`,
        text: body,
      }),
    })

    if (!response.ok) {
      console.error('[PROPEL contact] Resend rejected the request:', await response.text())
      return { status: 'error', reason: 'send' }
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[PROPEL contact] Failed to send:', error)
    return { status: 'error', reason: 'send' }
  }
}
