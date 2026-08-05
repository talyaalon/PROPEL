'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { normalise, validate, type ContactField, type ContactValues } from '@/lib/contactValidation'
import { getWhatsAppURL } from '@/lib/whatsapp'
import type { Locale } from '@/lib/i18n'

/**
 * The contact form, submitting to Netlify Forms.
 *
 * It used to be a React Server Action calling Resend. Netlify captures
 * submissions itself and emails them on, which removes the third-party account,
 * the API key and the whole class of "the key is missing so the enquiry went to
 * a log file" failure - and it keeps every submission in the Netlify dashboard,
 * so a notification email that bounces is not a lost lead.
 *
 * The cost is that Netlify's form detection runs over static files at deploy
 * time and cannot see anything React renders. So the browser posts to
 * `public/__forms.html`, which exists purely to be detected, and the field
 * names there have to match the ones below exactly.
 *
 * Validation therefore runs here rather than on a server. A bot posting
 * directly at the endpoint bypasses it; Netlify's spam filter and the honeypot
 * are what handle that, not this component.
 */

export type ContactDict = {
  name_label: string
  business_label: string
  phone_label: string
  email_label: string
  budget_label: string
  budget_placeholder: string
  budget_options: string[]
  message_label: string
  message_placeholder: string
  optional: string
  submit: string
  sending: string
  success_title: string
  success_body: string
  error: string
  required_error: string
  email_error: string
  contact_error: string
  privacy_note: string
  privacy_link: string
  or_whatsapp: string
  whatsapp_message: string
}

type Props = {
  lang: Locale
  dict: ContactDict
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success' }
  | { kind: 'error'; reason: 'required' | 'email' | 'contact' | 'send'; field?: ContactField }

export default function ContactForm({ lang, dict }: Props) {
  const [state, setState] = useState<Status>({ kind: 'idle' })
  // Held in state rather than read back off the DOM, so a failed submit
  // re-renders with everything the visitor typed still in place.
  const [values, setValues] = useState<Partial<ContactValues>>({})
  const errorRef = useRef<HTMLParagraphElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const invalidField = state.kind === 'error' ? state.field : undefined

  /*
   * Both outcomes replace or precede content without moving focus, so neither
   * is announced and the reading position is lost. Sending focus to the message
   * is what makes the result perceivable rather than merely visible.
   */
  useEffect(() => {
    if (state.kind === 'error') errorRef.current?.focus()
    if (state.kind === 'success') successRef.current?.focus()
  }, [state])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    // A real person never fills a field they cannot see. Silently succeed, so
    // the bot gets no signal that it was caught.
    if (data.get('company_website')) {
      setState({ kind: 'success' })
      return
    }

    const raw = Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v)]))
    const clean = normalise(raw)
    setValues(clean)

    const problem = validate(clean)
    if (problem) {
      setState({ kind: 'error', reason: problem.reason, field: problem.field })
      return
    }

    setState({ kind: 'sending' })
    try {
      const body = new URLSearchParams({
        'form-name': 'contact',
        ...clean,
        // Tells the notification which side of the site the enquiry came from.
        locale: lang,
      })

      /*
       * This always fails with 405 under `next start` locally, and that is not
       * a bug to chase: nothing is listening for a POST to a static file. On
       * Netlify the edge intercepts the request before it reaches the file,
       * stores the submission and sends the notification. The only place to
       * verify the success path is a real deploy.
       */
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!response.ok) throw new Error(`Netlify Forms returned ${response.status}`)
      setState({ kind: 'success' })
      form.reset()
    } catch (error) {
      console.error('[PROPEL contact] submission failed:', error)
      setState({ kind: 'error', reason: 'send' })
    }
  }

  if (state.kind === 'success') {
    return (
      <div
        ref={successRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className="card p-8 text-center outline-none sm:p-12"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" />
        <h3 className="mt-5 text-[1.25rem] font-bold text-brand-ink">{dict.success_title}</h3>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-[1.75] text-brand-slate">
          {dict.success_body}
        </p>
        <a
          href={getWhatsAppURL(dict.whatsapp_message)}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp:contact-success"
          className="mt-7 inline-flex items-center gap-2.5 rounded-full btn"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    )
  }

  const errorMessage =
    state.kind === 'error'
      ? {
          required: dict.required_error,
          email: dict.email_error,
          contact: dict.contact_error,
          send: dict.error,
        }[state.reason]
      : null

  return (
    <form
      ref={formRef}
      name="contact"
      method="POST"
      data-netlify="true"
      onSubmit={onSubmit}
      className="card p-6 sm:p-8"
      noValidate
    >
      <input type="hidden" name="form-name" value="contact" />
      {errorMessage && (
        <p
          ref={errorRef}
          id="contact-error"
          role="alert"
          tabIndex={-1}
          className="mb-6 border border-brand-accent bg-brand-accent/10 px-4 py-3 text-[0.875rem] text-brand-accent outline-none"
        >
          {errorMessage}
        </p>
      )}

      {/* Honeypot - hidden from people, irresistible to bots */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          name="name"
          label={dict.name_label}
          required
          autoComplete="name"
          defaultValue={values?.name}
          invalid={invalidField === 'name'}
        />
        <Field
          id="business"
          name="business"
          label={dict.business_label}
          hint={dict.optional}
          autoComplete="organization"
          defaultValue={values?.business}
          invalid={invalidField === 'business'}
        />
        <Field
          id="phone"
          name="phone"
          type="tel"
          label={dict.phone_label}
          autoComplete="tel"
          dir="ltr"
          defaultValue={values?.phone}
          invalid={invalidField === 'phone'}
        />
        <Field
          id="email"
          name="email"
          type="email"
          label={dict.email_label}
          autoComplete="email"
          dir="ltr"
          defaultValue={values?.email}
          invalid={invalidField === 'email'}
        />

        <div className="sm:col-span-2">
          <Label htmlFor="budget" text={dict.budget_label} hint={dict.optional} />
          <select
            id="budget"
            name="budget"
            defaultValue={values?.budget ?? ''}
            className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-[0.9375rem] text-brand-ink transition-colors duration-200 focus:border-brand-ink focus:bg-brand-panel"
          >
            <option value="" disabled>
              {dict.budget_placeholder}
            </option>
            {dict.budget_options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="message" text={dict.message_label} required />
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            defaultValue={values?.message}
            aria-invalid={invalidField === 'message' || undefined}
            aria-describedby={invalidField === 'message' ? 'contact-error' : undefined}
            placeholder={dict.message_placeholder}
            className="w-full resize-y rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-[0.9375rem] leading-relaxed text-brand-ink transition-colors duration-200 placeholder:text-brand-slate focus:border-brand-ink focus:bg-brand-panel"
          />
        </div>
      </div>

      <SubmitButton dict={dict} pending={state.kind === 'sending'} />

      <p className="mt-4 text-[0.75rem] leading-relaxed text-brand-slate">
        {dict.privacy_note}{' '}
        <Link
          href={`/${lang}/privacy`}
          className="underline underline-offset-2 hover:text-brand-ink"
        >
          {dict.privacy_link}
        </Link>
        .
      </p>
    </form>
  )
}

// ── Pieces ────────────────────────────────────────────────────────────────────

function SubmitButton({ dict, pending }: { dict: ContactDict; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      data-analytics="contact:submit"
      className="mt-7 w-full rounded-full btn"
    >
      {pending ? dict.sending : dict.submit}
    </button>
  )
}

function Label({
  htmlFor,
  text,
  required,
  hint,
}: {
  htmlFor: string
  text: string
  required?: boolean
  hint?: string
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[0.8125rem] font-medium text-brand-ink">
      {text}
      {required && (
        <span className="text-brand-accent" aria-hidden="true">
          {' '}
          *
        </span>
      )}
      {hint && <span className="font-normal text-brand-slate"> ({hint})</span>}
    </label>
  )
}

function Field({
  id,
  name,
  label,
  type = 'text',
  required,
  hint,
  autoComplete,
  dir,
  defaultValue,
  invalid,
}: {
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
  hint?: string
  autoComplete?: string
  dir?: 'ltr' | 'rtl'
  defaultValue?: string
  /** Marks this control as the one the error message refers to. */
  invalid?: boolean
}) {
  return (
    <div>
      <Label htmlFor={id} text={label} required={required} hint={hint} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        dir={dir}
        defaultValue={defaultValue}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'contact-error' : undefined}
        className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-[0.9375rem] text-brand-ink transition-colors duration-200 placeholder:text-brand-slate focus:border-brand-ink focus:bg-brand-panel"
      />
    </div>
  )
}
