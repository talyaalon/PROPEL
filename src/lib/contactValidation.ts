/**
 * Contact form validation.
 *
 * Extracted from the server action it used to live in, because the form now
 * submits to Netlify Forms from the browser rather than through a React Server
 * Action - so these rules have to run on the client.
 *
 * That is a real trade-off and worth stating plainly: a bot posting directly at
 * the Netlify endpoint bypasses every rule here. What stops that is Netlify's
 * own spam filtering plus the honeypot field, not this file. These rules exist
 * to help a person who mistyped, not to defend the endpoint.
 */

export type ContactValues = {
  name: string
  business: string
  phone: string
  email: string
  budget: string
  message: string
}

export type ContactField = keyof ContactValues

export type ValidationError = {
  reason: 'required' | 'email' | 'contact'
  field: ContactField
}

/** Longest accepted value per field, so nothing unbounded reaches the inbox. */
export const MAX: Record<ContactField, number> = {
  name: 120,
  business: 120,
  phone: 40,
  email: 160,
  budget: 60,
  message: 4000,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Newlines in a value that ends up in a mail header would let a submission
 * append headers of its own. Netlify builds the notification, not us, but a
 * value we send is a value we are responsible for.
 */
const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim()

export function normalise(raw: Record<string, string>): ContactValues {
  const read = (key: ContactField) => (raw[key] ?? '').trim().slice(0, MAX[key])

  return {
    name: singleLine(read('name')),
    business: singleLine(read('business')),
    phone: singleLine(read('phone')),
    email: singleLine(read('email')),
    budget: singleLine(read('budget')),
    message: read('message'),
  }
}

/** The first problem, or null. Order matters - it decides which field is focused. */
export function validate(values: ContactValues): ValidationError | null {
  if (!values.name) return { reason: 'required', field: 'name' }
  if (!values.message) return { reason: 'required', field: 'message' }
  if (!values.phone && !values.email) return { reason: 'contact', field: 'phone' }
  if (values.email && !EMAIL_PATTERN.test(values.email)) return { reason: 'email', field: 'email' }
  return null
}
