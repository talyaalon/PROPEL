'use server'

import { siteConfig } from '@/lib/config'

/**
 * Contact form handler.
 *
 * Delivers through Resend's REST API directly — no SDK, so the project gains no
 * new dependency. When no API key is configured (local development) the
 * submission is logged to the server console instead of silently vanishing.
 */

/** Field values echoed back so a validation error does not wipe the form. */
export type ContactValues = {
  name: string
  business: string
  phone: string
  email: string
  budget: string
  message: string
}

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      reason: 'required' | 'email' | 'contact' | 'send' | 'rate'
      /** Which control to mark invalid and move focus to. */
      field?: keyof ContactValues
      values: ContactValues
    }

/** Longest accepted value per field, to bound what reaches the mail body. */
const MAX = { name: 120, business: 120, phone: 40, email: 160, budget: 60, message: 4000 } as const

/**
 * Newlines in a value that ends up in a mail header would let a submission
 * append headers of its own. Resend most likely sanitises, but a header we
 * build is a header we are responsible for.
 */
const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim()

/**
 * Rate limiting, in memory.
 *
 * Deliberately simple: this is one serverless instance's view of the world, so
 * it will not stop a distributed flood. It does stop the realistic case — one
 * script hammering the endpoint — which today would issue an unbounded number
 * of live Resend calls. A shared store (Upstash, Redis) is the upgrade when
 * traffic justifies it.
 */
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 3
const recent = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(key, hits)

  // Keep the map from growing without bound across a long-lived instance.
  if (recent.size > 500) {
    for (const [k, v] of recent) if (v.every((t) => now - t > WINDOW_MS)) recent.delete(k)
  }

  return hits.length > MAX_PER_WINDOW
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: a real person never fills a field they cannot see. Return success
  // so the bot has no signal that it was caught.
  if (formData.get('company_website')) return { status: 'success' }

  const read = (key: keyof ContactValues) =>
    String(formData.get(key) ?? '')
      .trim()
      .slice(0, MAX[key])

  const values: ContactValues = {
    name: singleLine(read('name')),
    business: singleLine(read('business')),
    phone: singleLine(read('phone')),
    email: singleLine(read('email')),
    budget: singleLine(read('budget')),
    message: read('message'),
  }

  const { name, business, phone, email, budget, message } = values

  // Every error path carries `values`, so the form re-renders with what the
  // visitor typed. A single validation slip used to empty the whole form.
  const fail = (
    reason: 'required' | 'email' | 'contact' | 'send' | 'rate',
    field?: keyof ContactValues,
  ) => ({ status: 'error', reason, field, values }) as const

  if (!name) return fail('required', 'name')
  if (!message) return fail('required', 'message')
  if (!phone && !email) return fail('contact', 'phone')
  if (email && !EMAIL_PATTERN.test(email)) return fail('email', 'email')

  if (isRateLimited(email || phone || name)) return fail('rate')

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
      '[PROPEL contact] RESEND_API_KEY or CONTACT_INBOX_EMAIL is not set - logging the submission instead of sending it:\n' +
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
        subject: `פנייה חדשה מהאתר - ${name}${business ? ` (${business})` : ''}`,
        text: body,
      }),
    })

    if (!response.ok) {
      console.error('[PROPEL contact] Resend rejected the request:', await response.text())
      return fail('send')
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[PROPEL contact] Failed to send:', error)
    return fail('send')
  }
}
